package gopass

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

var PwStoreDir string

type Login struct {
	Username string `json:"u"`
	Password string `json:"p"`
}

func main() {
	PwStoreDir = getPasswordStoreDir()

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

		logins := getLogins(data["domain"])
		jsonResponse, err := json.Marshal(logins)
		checkError(err)

		binary.Write(os.Stdout, binary.LittleEndian, uint32(len(jsonResponse)))
		_, err = os.Stdout.Write(jsonResponse)
		checkError(err)
	}
}

func getPasswordStoreDir() string {
	var dir = os.Getenv("PASSWORD_STORE_DIR")

	if dir == "" {
		dir = os.Getenv("HOME") + "/.password-store/"
	}

	return dir
}

func getLogins(domain string) []Login {
	matches, _ := filepath.Glob(PwStoreDir + domain + "*/*.gpg")
	logins := make([]Login, 0)

	for _, file := range matches {
		dir, filename := filepath.Split(file)
		dir = filepath.Base(dir)

		username := strings.TrimSuffix(filename, filepath.Ext(filename))
		password := getPassword(dir + "/" + username)

		login := Login{
			Username: username,
			Password: password,
		}

		logins = append(logins, login)
	}

	return logins
}

// runs pass to get decrypted file content
func getPassword(file string) string {
	var out bytes.Buffer
	cmd := exec.Command("pass", file)
	cmd.Stdout = &out
	err := cmd.Run()
	if err != nil {
		return ""
	}

	// read first line (the password)
	scanner := bufio.NewScanner(&out)
	scanner.Scan()
	password := scanner.Text()
	return password
}

func checkError(err error) {
	if err != nil {
		log.Fatal(err)
	}
}
