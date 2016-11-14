package main

import (
	"os"
	"testing"
	"bytes"
)

func TestGetLogins(t *testing.T) {
	domain := "this-most-definitely-does-not-exist"
	logins := getLogins(domain)

	if len(logins) > 0 {
		t.Errorf("%s yielded results, but it should not", domain)
	}
}

func TestGetPasswordStoreDir(t *testing.T) {
	var home, expected, actual string
	home = os.Getenv("HOME")

	// default directory
	os.Setenv("PASSWORD_STORE_DIR", "")
	expected = home + "/.password-store/"
	actual = getPasswordStoreDir()
	if expected != actual {
		t.Errorf("%s does not match %s", expected, actual)
	}

	// custom directory
	expected = "/my/custom/dir"
	os.Setenv("PASSWORD_STORE_DIR", expected)
	actual = getPasswordStoreDir()
	if expected != actual {
		t.Errorf("%s does not match %s", expected, actual)
	}

}

func TestParseLogin(t *testing.T) {
	var b = bytes.NewBufferString("password\n\nfoo\nlogin: bar")
	login := parseLogin(b)

	if( login.Password != "password" ) {
		t.Errorf("Password is %s, expected %s", login.Password, "password")
	}

	if( login.Username != "bar" ) {
		t.Errorf("Username is %s, expected %s", login.Username, "bar")
	}
}
