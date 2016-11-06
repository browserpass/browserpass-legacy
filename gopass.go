package main

import (
	"bufio"
	"bytes"
	"encoding/binary"
	"encoding/json"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

func main() {
	// set logging
	f, err := os.OpenFile("debug.log", os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	checkError(err)
	defer f.Close()
	log.SetOutput(f)

	// listen for stdin
	for {
		// get message length, 4 bytes
		var data map[string]string
		var length uint32
		err := binary.Read(os.Stdin, binary.LittleEndian, &length)
		if err != nil {
			break
		}

		input := make([]byte, length)
		_, err = os.Stdin.Read(input)
		if err != nil {
			break
		}

		err = json.Unmarshal(input, &data)
		checkError(err)

		usernames := getUsernames(data["domain"])
		results := make([]map[string]string, 0)

		for _, username := range usernames {
			password, _ := getPassword(data["domain"], username)
			results = append(results, map[string]string{
				"u": username,
				"p": password,
			})
		}

		jsonResponse, err := json.Marshal(results)
		checkError(err)
		binary.Write(os.Stdout, binary.LittleEndian, uint32(len(jsonResponse)))
		_, err = os.Stdout.Write(jsonResponse)
		checkError(err)
	}
}

// get list of usernames for the domain
func getUsernames(domain string) []string {
	matches, _ := filepath.Glob(os.Getenv("HOME") + "/.password-store/" + domain + "*/*.gpg")
	usernames := make([]string, 0)

	for _, file := range matches {
		_, filename := filepath.Split(file)
		username := strings.TrimSuffix(filename, filepath.Ext(filename))
		usernames = append(usernames, username)
	}

	return usernames
}

// runs pass to get decrypted file content
func getPassword(domain string, username string) (string, error) {
	var out bytes.Buffer
	cmd := exec.Command("pass", domain+"/"+username)
	cmd.Stdout = &out
	err := cmd.Run()
	if err != nil {
		return "", err
	}

	// read first line (the password)
	scanner := bufio.NewScanner(&out)
	scanner.Scan()
	password := scanner.Text()
	return password, nil
}

func checkError(err error) {
	if err != nil {
		log.Fatal(err)
	}
}
