package main

import (
	"bufio"
	"bytes"
	"encoding/binary"
	"encoding/json"
	"errors"
	"github.com/mattn/go-zglob"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
)

// PwStoreDir is the passwordstore root directory
var PwStoreDir string

// Login represents a single pass login
type Login struct {
	Username string `json:"u"`
	Password string `json:"p"`
}

func main() {
	var err error
	log.SetPrefix("[Browserpass] ")

	PwStoreDir, err = getPasswordStoreDir()
	checkError(err)

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
			checkError(err)
		default:
			checkError(errors.New("Invalid action"))
		}

		binary.Write(os.Stdout, binary.LittleEndian, uint32(len(jsonResponse)))
		_, err = os.Stdout.Write(jsonResponse)
		checkError(err)
	}
}

// get absolute path to password store
func getPasswordStoreDir() (string, error) {
	var dir = os.Getenv("PASSWORD_STORE_DIR")

	if dir == "" {
		dir = os.Getenv("HOME") + "/.password-store"
	}

	// follow symlinks
	dir, err := filepath.EvalSymlinks(dir)
	if err != nil {
		return "", err
	}

	return strings.TrimSuffix(dir, "/"), nil
}

// search password store for logins matching search string
func getLogins(domain string) []string {
	// first, search for DOMAIN/USERNAME.gpg
	// then, search for DOMAIN.gpg
	matches, err := zglob.Glob(PwStoreDir + "/**/" + domain + "*/*.gpg")
	checkError(err)
	matches2, err := zglob.Glob(PwStoreDir + "/**/" + domain + "*.gpg")
	checkError(err)
	matches = append(matches, matches2...)

	entries := make([]string, 0)

	for _, file := range matches {
		file = strings.Replace(file, PwStoreDir, "", 1)
		file = strings.TrimPrefix(file, "/")
		file = strings.TrimSuffix(file, ".gpg")
		entries = append(entries, file)
	}

	return entries
}

// read contents of password file using `pass` command
func readPassFile(file string) ([]byte, error) {
	file = PwStoreDir + "/" + file + ".gpg"

	// assume gpg1
	gpgbin := "gpg"
	opts := []string{"--decrypt", "--yes"}

	// check if we can use gpg2 bin
	which := exec.Command("which", "gpg2")
	err := which.Run()
	if err == nil {
		gpgbin = "gpg2"
		opts = append(opts, []string{"--use-agent", "--batch"}...)
	}

	// append file to decrypt
	opts = append(opts, file)

	// run gpg command with opts
	out, err := exec.Command(gpgbin, opts...).CombinedOutput()
	if err != nil {
		return nil, errors.New(string(out))
	}

	return out, nil
}

// parse login details
func parseLogin(b []byte) *Login {
	login := Login{}

	// read first line (the password)
	scanner := bufio.NewScanner(bytes.NewReader(b))
	scanner.Scan()
	login.Password = scanner.Text()

	re := regexp.MustCompile("(?i)^(login|username|user):")

	// keep reading file for string in "login:", "username:" or "user:" format (case insensitive).
	for scanner.Scan() {
		line := scanner.Text()
		replaced := re.ReplaceAllString(line, "")
		if len(replaced) != len(line) {
			login.Username = strings.TrimSpace(replaced)
		}
	}

	return &login
}

// get login details from frile
func getLoginFromFile(file string) *Login {
	b, err := readPassFile(file)
	checkError(err)

	login := parseLogin(b)

	// if username is empty at this point, assume filename is username
	if login.Username == "" && strings.Count(file, "/") >= 1 {
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
