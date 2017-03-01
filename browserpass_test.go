package browserpass

import (
	"strings"
	"testing"
)

func TestParseLogin(t *testing.T) {
	r := strings.NewReader("password\n\nfoo\nlogin: bar")

	login, err := parseLogin(r)
	if err != nil {
		t.Fatal(err)
	}

	if login.Password != "password" {
		t.Errorf("Password is %s, expected %s", login.Password, "password")
	}
	if login.Username != "bar" {
		t.Errorf("Username is %s, expected %s", login.Username, "bar")
	}
}
