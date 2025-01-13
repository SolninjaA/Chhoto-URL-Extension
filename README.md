# Chhoto URL Extension
This extension allows for easy, shortened URL link generation using a [Chhoto URL server][chhoto-github].

## Requirements
### Chhoto URL server
In order to use this extension, a [Chhoto URL server][chhoto-github] is required. If you don't have one already, refer to the [installation instructions][install-instructions].

### Set the `api_key` environment variable
The `api_key` environment variable must be configured in the [Chhoto URL server][chhoto-github] configuration.

For example, using Docker Compose, you can add the `api_key` environment variable under `environment:` like so:
```yaml
environment:
    - api_key=SECURE_API_KEY
```

Alternatively, using Docker Run, you can add `-e api_key="SECURE_API_KEY" \` to the command arguments.

**Note:** The Chhoto URL server will output a warning if this is insecure, and a generated API key will be output. You may use that value if you can't think of a secure key, or you may generate an API key using your operating system's terminal.

For example, on Linux, you could generate an API key by running `tr -dc A-Za-z0-9 </dev/urandom | head -c 128`

## Installation
*This extension will be published to extension stores in the near future*

Once you have installed the extension, either through an extension store or [from source][install-from-source], you must configure the extension.

### Firefox
1. Right-click on the Chhoto URL extension icon (![Chhoto URL extension icon](icons/chhoto-url-16.png)). If the extension is not pinned, the Chhoto URL extension icon will be under this highlighted icon:

![Firefox generic extension icon](https://git.solomon.tech/solomon/Chhoto-URL-Extension/raw/branch/main/generic-extension-icon-firefox.png)

2. Select "Manage Extension"
3. Select "Preferences"
4. Configure the settings under `Instance URL`, `API Key`, and `Protocol Filters`

### Chromium-based browsers
1. **(if the extension is not pinned)** Click on the icon that is most similar to the highlighted icon in this image:

![Chromium generic extension icon](https://git.solomon.tech/solomon/Chhoto-URL-Extension/raw/branch/main/generic-extension-icon-chromium.png)

2. **(if the extension is not pinned)** Click on the pin icon next to the Chhoto URL extension icon
3. Right-click on the Chhoto URL extension icon (![Chhoto URL extension icon](icons/chhoto-url-16.png))
4. Select "Options"
5. Configure the settings under `Instance URL`, `API Key`, and `Protocol Filters`

## Usage
When the Chhoto URL extension icon is clicked, the current page's URL will be shortened. The shortened link will be copied to the clipboard.

## Privacy and Security
This extension only communicates to the Chhoto URL server instance you configure. All of the extension's data is stored locally in your local browser storage. The API key is kept in plaintext.

### Extension Permissions
| Permission                        | Required so that the extension can...                                |
| --------------------------------- | ---------------------------------------------------------------------|
| [`tabs`][tabs-api]                | Get the active tab's URL                                             |
| [`notifications`][notif-api]      | Inform users if generating the shortened link was successful or not. |
| [`clipboardWrite`][clipboard-api] | Copy the shortened link to your clipboard.                           |
| [`storage`][storage-api]          | Save the extension settings in your local browser storage.           |
| [`https://*/*`][host-permission]  | Contact the configured Chhoto URL server instance.                   |
| [`http://*/*`][host-permission]   | Contact the configured Chhoto URL server instance.                   |

## Installing from source
1. Run `git clone https://git.solomon.tech/solomon/Chhoto-URL-Extension.git`
2. Install the extension (see below for how to install the extension on common browsers)

### Installing from source on Firefox
1. Visit [`about:debugging#/runtime/this-firefox`][firefox-extension-page]
2. Click "Load Temporary Add-on..."
3. Navigate to the cloned repository folder
4. Select the `manifest.json` file
5. Click "Open"

### Installing from source on Brave
1. Visit [`brave://extensions`][brave-extension-page]
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Navigate to the cloned repository folder
5. Click "Select"

## Acknowledgements
This project was inspired by and modified from Edward Shen's [Shlink extension][shlink-extension]. Modifications include:
1. Rewriting the backend code to contact a Chhoto URL server, rather than a Shlink server.
2. Changing the appearance of the `options.html` page.
3. Removing options which were either not possible to implement (because of the Chhoto URL server's limitations), or were not practical.
4. Optimizing code where possible.
5. Et cetera

[chhoto-github]: https://github.com/SinTan1729/chhoto-url
[install-instructions]: https://github.com/SinTan1729/chhoto-url#usage
[install-from-source]: https://git.solomon.tech/solomon/Chhoto-URL-Extension#installing-from-source
[tabs-api]: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs
[notif-api]: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/notifications
[clipboard-api]: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/clipboard
[storage-api]: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage
[host-permission]: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/permissions#host_permissions
[firefox-extension-page]: about:debugging#/runtime/this-firefox
[brave-extension-page]: brave://extensions
[shlink-extension]: https://github.com/edward-shen/shlink