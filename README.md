<div align="left">
    <img align="left" src="icons/chhoto-url-48.png">
    <h1>Chhoto URL Extension</h1>
</div>

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

### Ensure `site_url` and `port` are correct
In order for the Chhoto URL server to properly output the correct shortend URLs, and for this extension to do the same, the `site_url` and `port` environment variables must be properly set.

If your server is not located at `http://localhost`, make sure to set the `site_url` environment variable in the Chhoto URL server configuration. This value cannot be surrounded by quotes.

If your server's port is not `4567`, make sure to set the `port` environment variable in the Chhoto URL server configuration. This value cannot be surrounded by quotes.

Example configuration:
```yaml
environment:
    - site_url=https://chhoto-url.example.com
    - port=443
```

## Installation
<a href="https://addons.mozilla.org/en-US/firefox/addon/chhoto-url/" target="_blank"><img alt="Firefox icon" src="https://imgur.com/ihXsdDO.png" width="64" height="64"></a>

Once you have installed the extension, either through an extension store (see icons above) or [from source](#installing-from-source), you must configure the extension.

### Firefox
1. Right-click on the Chhoto URL extension icon (![Chhoto URL extension icon](icons/chhoto-url-16.png)). If the extension is not pinned, the Chhoto URL extension icon will be under this highlighted icon:

![Firefox generic extension icon](https://raw.githubusercontent.com/SolninjaA/Chhoto-URL-Extension/888138e93ba31bd4eabcb9ea3f261d4381520e9b/generic-extension-icon-firefox.png)

2. Select "Manage Extension"
3. Select "Preferences"
4. Configure the settings under `Instance URL`, `API Key`, and `Protocol Filters`

### Chromium-based browsers
1. **(if the extension is not pinned)** Click on the icon that is most similar to the highlighted icon in this image:

![Chromium generic extension icon](https://raw.githubusercontent.com/SolninjaA/Chhoto-URL-Extension/888138e93ba31bd4eabcb9ea3f261d4381520e9b/generic-extension-icon-chromium.png)

2. **(if the extension is not pinned)** Click on the pin icon next to the Chhoto URL extension icon
3. Right-click on the Chhoto URL extension icon (![Chhoto URL extension icon](icons/chhoto-url-16.png))
4. Select "Options"
5. Configure the settings under `Instance URL`, `API Key`, and `Protocol Filters`

## Usage
When the Chhoto URL extension icon is clicked, the current page's URL will be shortened. The shortened link will be copied to the clipboard.

Alternatively, from v1.2.0 and onwards, you may right-click anywhere on a website or on the extension's icon (![Chhoto URL extension icon](icons/chhoto-url-16.png)), and click "Manually generate a Chhoto URL". This button will open a popup, allowing users to manually generate a shortened URL.

![Context menu icon](https://raw.githubusercontent.com/SolninjaA/Chhoto-URL-Extension/refs/heads/main/context-menu-button.png)

## Privacy and Security
This extension only communicates to the Chhoto URL server instance you configure. All of the extension's data is stored locally in your local browser storage. The API key is kept in plaintext.

### Extension Permissions
| Permission                        | Required so that the extension can...                                           |
|-----------------------------------|---------------------------------------------------------------------------------|
| [`activeTab`][tabs-api]           | Get the active tab's URL                                                        |
| [`notifications`][notif-api]      | Inform users if generating the shortened link was successful or not.            |
| [`clipboardWrite`][clipboard-api] | Copy the shortened link to your clipboard.                                      |
| [`storage`][storage-api]          | Save the extension settings in your local browser storage.                      |
| [`https://*/*`][host-permission]  | Contact the configured Chhoto URL server instance.                              |
| [`contextMenus`][context-menus]   | Add an item (which opens a popup for manual URL generation) to the context menu |

## Installing from source
1. Run `git clone https://github.com/SolninjaA/Chhoto-URL-Extension.git`
2. Install the extension (see below for how to install the extension on common browsers)

### Installing from source on Firefox
1. Visit `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Navigate to the cloned repository folder
4. Select the `manifest.json` file
5. Click "Open"

### Installing from source on Brave
1. Visit `brave://extensions`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Navigate to the cloned repository folder
5. Click "Select"

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/DarioDarko"><img src="https://avatars.githubusercontent.com/u/154679092?v=4?s=100" width="100px;" alt="DarioDarko"/><br /><sub><b>DarioDarko</b></sub></a><br /><a href="https://github.com/SolninjaA/Chhoto-URL-Extension/commits?author=DarioDarko" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## Acknowledgements
This project was inspired by and modified from Edward Shen's [Shlink extension][shlink-extension]. Modifications include:
1. Rewriting the backend code to contact a Chhoto URL server, rather than a Shlink server.
2. Changing the appearance of the `options.html` page.
3. Removing options which were either not possible to implement (because of the Chhoto URL server's limitations), or were not practical.
4. Optimizing code where possible.
5. Et cetera

## Information
| Syncing from (main repository)                        | Syncing to                                            | Syncing every |
| ----------------------------------------------------- | ----------------------------------------------------- | ------------- |
| https://github.com/SolninjaA/Chhoto-URL-Extension     | https://git.solomon.tech/solomon/Chhoto-URL-Extension | 8 hours       |

[chhoto-github]: https://github.com/SinTan1729/chhoto-url
[install-instructions]: https://github.com/SinTan1729/chhoto-url#usage
[tabs-api]: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs
[notif-api]: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/notifications
[clipboard-api]: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/clipboard
[storage-api]: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage
[host-permission]: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/permissions#host_permissions
[context-menus]: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/menus
[shlink-extension]: https://github.com/edward-shen/shlink
