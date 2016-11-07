SHELL := /bin/bash

.PHONY: empty
empty:

.PHONY: firefox
firefox: chrome/*
	cp chrome/{*.html,*.css,*.js,*.png,*.svg} firefox/

.PHONY: static-files
static-files: chrome/host.json firefox/host.json
	mv chrome.crx chrome-gopass.crx 2>/dev/null || :
	cp chrome/host.json chrome-host.json
	cp firefox/host.json firefox-host.json

gopass-linux64: gopass.go
	env GOOS=linux GOARCH=amd64 go build -o $@

gopass-darwinx64: gopass.go
	env GOOS=darwin GOARCH=amd64 go build -o $@

.PHONY: static-files
release: static-files gopass-linux64 gopass-darwinx64
	zip -jFS "release/gopass-linux64" gopass-linux64 *-host.json chrome-gopass.crx install.sh README.md LICENSE
	zip -jFS "release/gopass-darwinx64" gopass-darwinx64 *-host.json chrome-gopass.crx install.sh README.md LICENSE
