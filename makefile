extension: 
	mv chrome.crx chrome-gopass.crx

gopass: gopass.go
	go build

gopass-linux64: chrome-gopass.crx com.dannyvankooten.gopass.json install.sh LICENSE README.md
	env GOOS=linux GOARCH=amd64 go build -o "$@"
	zip "release/$@" "$@" $^

gopass-darwinx64: chrome-gopass.crx com.dannyvankooten.gopass.json install.sh LICENSE README.md
	env GOOS=darwin GOARCH=amd64 go build -o "$@"
	zip "release/$@" "$@" $^

release: gopass-linux64 gopass-darwinx64
