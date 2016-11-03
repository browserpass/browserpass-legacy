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

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	domain := r.URL.Query().Get("domain")
	matches, _ := filepath.Glob(os.Getenv("HOME") + "/.password-store/" + domain + "/*.gpg")
	results := make([]map[string]string, 0)

	for _, file := range matches {
		_, filename := filepath.Split(file)
		username := strings.TrimSuffix(filename, filepath.Ext(filename))
		password, err := getPassword(domain, username)
		checkError(err)
		results = append(results, map[string]string{
			"u": username,
			"p": password,
		})
	}

	json.NewEncoder(w).Encode(results)
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
