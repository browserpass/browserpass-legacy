chrome-gopass
=======

chrome-gopass is a Chrome extension for [zx2c4's pass](https://www.passwordstore.org/), a UNIX based password manager. It retrieves your decrypted passwords for the current domain and allows you to auto-fill login forms.

![Gopass in the Chrome menu](https://github.com/dannyvankooten/chrome-gopass/raw/master/assets/menu-expanded.png)

It uses a native binary written in Golang to do the interfacing with your password store. Communication between the binary and the Chrome extension is done through [native messaging](https://developer.chrome.com/extensions/nativeMessaging).

## Requirements

- UNIX, like pass itself. Prebuilt binaries for OSX (Darwin) and Linux are available.
- Your `pass` passwords need to be in the following format: `~/.password-store/DOMAIN/USERNAME`.

## Installation

1. Download the [latest release package](https://github.com/dannyvankooten/chrome-gopass/releases) for your operating system.
1. Extract to where you would like to have the binary.
1. Run `./install.sh` to install the native messaging host. This is required to allow the Chrome extension to communicate with the binary. Run with `sudo` for a system-wide installation.
1. Install the extension in Chrome by dragging the `chrome-gopass.crx` file into the [Chrome Extensions](chrome://extensions) (`chrome://extensions`) page.

## Usage

Click the lock icon or use **Ctrl + M** to fill & submit your login info for the current site. If you have multiple logins for the current site, the extension shows you a list to choose from.

## License

MIT Licensed.
