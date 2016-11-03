package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

func main() {
	http.HandleFunc("/password", getPasswordHandler)
	log.Fatal(http.ListenAndServe("localhost:3131", nil))
}

func getPasswordHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("%s: %s\n", r.Method, r.URL.RequestURI())

	domain := r.URL.Query().Get("domain")
	matches, _ := filepath.Glob(os.Getenv("HOME") + "/.password-store/" + domain + "/*.gpg")

	if len(matches) == 1 {
		_, file := filepath.Split(matches[0])
		username := strings.TrimSuffix(file, filepath.Ext(file))
		password, err := getPassword(domain, username)
		checkError(err)

		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		json.NewEncoder(w).Encode(map[string]string{
			"p": password,
			"u": username,
		})
	}
}

// run pass to get decrypted file content
func getPassword(domain string, username string) (string, error) {
	var out bytes.Buffer
	cmd := exec.Command("pass", domain+"/"+username)
	cmd.Stdout = &out
	err := cmd.Run()
	if err != nil {
		return "", err
	}

	// read first line (password)
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
