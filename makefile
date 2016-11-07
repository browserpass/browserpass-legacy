SHELL := /bin/bash

.PHONY: empty
empty:

.PHONY: chrome
chrome:
	google-chrome --pack-extension=./chrome --pack-extension-key=./chrome-gopass.pem
	mv chrome.crx chrome-gopass.crx

.PHONY: firefox
firefox:
	cp chrome/{*.html,*.css,*.js,*.png,*.svg} firefox/

.PHONY: static-files
static-files: chrome/host.json firefox/host.json
	cp chrome/host.json chrome-host.json
	cp firefox/host.json firefox-host.json

gopass-linux64: gopass.go
	env GOOS=linux GOARCH=amd64 go build -o $@

gopass-darwinx64: gopass.go
	env GOOS=darwin GOARCH=amd64 go build -o $@

.PHONY: static-files chrome firefox
release: static-files chrome firefox gopass-linux64 gopass-darwinx64
	zip -jFS "release/chrome" chrome-gopass.crx
	zip -jFS "release/firefox" firefox/*
	zip -FS "release/gopass-linux64" gopass-linux64 *-host.json chrome-gopass.crx install.sh README.md LICENSE
	zip -FS "release/gopass-darwinx64" gopass-darwinx64 *-host.json chrome-gopass.crx install.sh README.md LICENSE
