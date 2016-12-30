package main

import (
	"bufio"
	"bytes"
	"encoding/binary"
	"encoding/json"
	"errors"
	"log"
	"os"
	"os/exec"
	"strings"
	"path/filepath"
	"github.com/mattn/go-zglob"
)

var PwStoreDir string

type Login struct {
	Username string `json:"u"`
	Password string `json:"p"`
}

func main() {
	PwStoreDir = getPasswordStoreDir()

	// listen for stdin
	for {
		// get message length, 4 bytes
		var data map[string]string
		var length uint32
		var jsonResponse []byte
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

		switch data["action"] {
		case "search":
			entries := getLogins(data["domain"])
			jsonResponse, err = json.Marshal(entries)
			checkError(err)
		case "get":
			login := getLoginFromFile(data["entry"])
			jsonResponse, err = json.Marshal(login)
		default:
			checkError(errors.New("Invalid action"))
		}

		binary.Write(os.Stdout, binary.LittleEndian, uint32(len(jsonResponse)))
		_, err = os.Stdout.Write(jsonResponse)
		checkError(err)
	}
}

// get absolute path to password store
func getPasswordStoreDir() string {
	var dir = os.Getenv("PASSWORD_STORE_DIR")

	if dir == "" {
		dir = os.Getenv("HOME") + "/.password-store/"
	}

	return dir
}

// search password store for logins matching search string
func getLogins(domain string) []string {
	// first, search for DOMAIN/USERNAME.gpg
	// then, search for DOMAIN.gpg
	matches, _ := zglob.Glob(PwStoreDir + "**/"+ domain + "*/*.gpg")
	matches2, _ := zglob.Glob(PwStoreDir + "**/"+ domain + "*.gpg")
	matches = append(matches, matches2...)

	entries := make([]string, 0)

	for _, file := range matches {
		file = strings.TrimSuffix(strings.Replace(file, PwStoreDir, "", 1), ".gpg")
		entries = append(entries, file)
	}

	return entries
}

// read contents of password file using `pass` command
func readPassFile(file string) *bytes.Buffer {
	var out bytes.Buffer
	cmd := exec.Command("pass", file)
	cmd.Stdout = &out
	err := cmd.Run()
	checkError(err)
	return &out
}

// parse login details
func parseLogin(b *bytes.Buffer) *Login {
	login := Login{}

	// read first line (the password)
	scanner := bufio.NewScanner(b)
	scanner.Scan()
	login.Password = scanner.Text()

	// keep reading file for string in "login:" or "username:" format.
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "login:") || strings.HasPrefix(line, "username:") || strings.HasPrefix(line, "user:"){
			login.Username = line
			login.Username = strings.TrimLeft(login.Username, "login:")
			login.Username = strings.TrimLeft(login.Username, "username:")
			login.Username = strings.TrimLeft(login.Username, "user:")
			login.Username = strings.TrimSpace(login.Username)
		}
	}

	return &login
}

// get login details from frile
func getLoginFromFile(file string) *Login {
	b := readPassFile(file)
	login := parseLogin(b)

	// if username is empty at this point, assume filename is username
	if login.Username == "" {
		login.Username = filepath.Base(file)
	}

	return login
}

// write errors to log & quit
func checkError(err error) {
	if err != nil {
		log.Fatal(err)
	}
}
