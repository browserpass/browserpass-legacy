Browserpass
=======

Browserpass is a Chrome & Firefox extension for [zx2c4's pass](https://www.passwordstore.org/), a UNIX based password manager. It retrieves your decrypted passwords for the current domain and allows you to auto-fill login forms. If you have multiple logins for the current site, the extension shows you a list of usernames to choose from.

![Browserpass in the Chrome menu](https://github.com/dannyvankooten/browserpass/raw/master/assets/example.gif)

It uses a [native binary written in Golang](https://github.com/dannyvankooten/browserpass/blob/master/browserpass.go) to do the interfacing with your password store. Secure communication between the binary and the browser extension is handled through [native messaging](https://developer.chrome.com/extensions/nativeMessaging).

## Requirements

- A recent version of Chrome, Chromium or Firefox 50+.
- Pass (on UNIX)
- Your password store needs to have the following directory structure: `~/.password-store/DOMAIN/USERNAME`.

```
~/.password-store
  /twitter.com
    /username.gpg
    /another.gpg
  /website.com
    /username.gpg
```

## Installation

Start out by downloading the [latest release package](https://github.com/dannyvankooten/browserpass/releases) for your operating system. Prebuilt binaries for 64-bit OSX & Linux are available.

#### Installing the host application

1. Extract the package to where you would like to have the binary.
1. Run `./install.sh` to install the native messaging host. This is required to allow the browser extension to communicate with Pass. If you want a system-wide installation, run the script with `sudo`.

#### Installing the Chrome extension

1. Install the extension in Chrome by dragging the `chrome-browserpass.crx` file into the [Chrome Extensions](chrome://extensions) (`chrome://extensions`) page.

#### Installing the Firefox extension

The Firefox extension requires Firefox 50, which is currently in beta.

1. [Download firefox.zip from the latest release](https://github.com/dannyvankooten/browserpass/releases)
1. Go to `about:debugging#addons` and click **Load Temporary Add-on**. Select any file from the extracted package.

## Usage

Click the lock icon or use **Ctrl + M** to fill & submit your login info for the current site.

## License

MIT Licensed.
