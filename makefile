all:
	mv chrome.crx chrome-gopass.crx

gopass: gopass.go
	go build

gopass-linux64: chrome-gopass.crx com.dannyvankooten.gopass.json install.sh LICENSE README.md
	env GOOS=linux GOARCH=amd64 go build -o "$@"
	zip "release/$@" "$@" $^

gopass-darwinx64: chrome-gopass.crx com.dannyvankooten.gopass.json install.sh LICENSE README.md
	env GOOS=darwin GOARCH=amd64 go build -o "$@"
	zip "release/$@" "$@" $^

gopass-windowsx64: chrome-gopass.crx com.dannyvankooten.gopass.json install.sh LICENSE README.md
	env GOOS=windows GOARCH=amd64 go build -o "$@.exe"
	zip "release/$@" "$@.exe" $^

release: gopass-linux64 gopass-darwinx64 gopass-windowsx64
