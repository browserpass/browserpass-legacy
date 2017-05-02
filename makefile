SHELL := /usr/bin/env bash
CHROME := `which google-chrome 2>/dev/null || which google-chrome-stable 2>/dev/null || which chrome 2>/dev/null`

.PHONY: empty
empty:

.PHONY: chrome
chrome:
	$(CHROME) --pack-extension=./chrome --pack-extension-key=./chrome-browserpass.pem
	mv chrome.crx chrome-browserpass.crx

.PHONY: firefox
firefox:
	cp chrome/{*.html,*.css,*.js,*.png,*.svg} firefox/

.PHONY: js
js: chrome/script.browserify.js
	browserify chrome/script.browserify.js -o chrome/script.js

.PHONY: static-files
static-files: chrome/host.json firefox/host.json
	cp chrome/host.json chrome-host.json
	cp firefox/host.json firefox-host.json
	cp chrome/policy.json chrome-policy.json

browserpass-linux64: cmd/browserpass/main.go
	env GOOS=linux GOARCH=amd64 go build -o $@ ./cmd/browserpass

browserpass-darwinx64: cmd/browserpass/main.go
	env GOOS=darwin GOARCH=amd64 go build -o $@ ./cmd/browserpass

browserpass-openbsd64: browserpass.go
	env GOOS=openbsd GOARCH=amd64 go build -o $@ ./cmd/browserpass

.PHONY: static-files chrome firefox
release: static-files chrome firefox browserpass-linux64 browserpass-darwinx64 browserpass-openbsd64
	mkdir -p release
	zip -jFS "release/chrome" chrome/* chrome-browserpass.crx
	zip -jFS "release/firefox" firefox/*
	zip -FS "release/browserpass-linux64" browserpass-linux64 *-host.json chrome-browserpass.crx install.sh chrome-policy.json README.md LICENSE
	zip -FS "release/browserpass-darwinx64" browserpass-darwinx64 *-host.json chrome-browserpass.crx install.sh README.md LICENSE
	zip -FS "release/browserpass-openbsd64" browserpass-openbsd64 *-host.json chrome-browserpass.crx install.sh README.md LICENSE
