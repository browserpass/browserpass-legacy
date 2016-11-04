chrome-gopass
=======

chrome-gopass is a Chrome extension for [zx2c4's pass](https://www.passwordstore.org/), a UNIX based password manager.

![Gopass in the Chrome menu](https://github.com/dannyvankooten/chrome-gopass/raw/master/assets/menu-expanded.png)

It uses a native binary written in Golang to do the interfacing with your password store. Communication between the binary and the Chrome extension is done through [native messaging](https://developer.chrome.com/extensions/nativeMessaging).

# Install

1. Download the [latest release package](https://github.com/dannyvankooten/chrome-gopass/releases) for your operating system.
1. Extract to where you would like to install the binary.
1. Run `./install.sh` to install the native messaging host. This is required to allow the Chrome extension to communicate with the binary. Run with `sudo` for a system-wide installation.
1. Install the extension in Chrome by dragging the `chrome-gopass.crx` file into the [Chrome Extensions](chrome://extensions) (`chrome://extensions`) page.

**Note for Windows users:** please [follow these instructions for installing the native messaging host](https://developer.chrome.com/extensions/nativeMessaging#native-messaging-host-location).

# Usage

Click the lock icon or use **Ctrl + M** to fill & submit your login info for the current site. If you have multiple logins for the current site, the extension shows you a list to choose from.

# License

MIT Licensed.
