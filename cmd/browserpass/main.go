package main

import (
	"flag"
	"fmt"
	"io"
	"log"
	"os"

	"github.com/dannyvankooten/browserpass"
	"github.com/dannyvankooten/browserpass/pass"
	"github.com/dannyvankooten/browserpass/protector"
)

const VERSION = "2.0.17"

func main() {
	protector.Protect("stdio rpath proc exec getpw")
	log.SetPrefix("[Browserpass] ")

	showVersion := flag.Bool("v", false, "print version and exit")
	flag.Parse()
	if *showVersion {
		fmt.Println("Browserpass host app version:", VERSION)
		os.Exit(0)
	}

	s, err := pass.NewDefaultStore()
	if err != nil {
		log.Fatal(err)
	}

	if err := browserpass.Run(os.Stdin, os.Stdout, s); err != nil && err != io.EOF {
		log.Fatal(err)
	}
}
