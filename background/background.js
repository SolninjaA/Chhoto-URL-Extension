/*
 * An unofficial extension for easy link shortening using the Chhoto URL API.
 * Copyright (C) 2025 Solomon Tech
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
*/


/**
 * File Overview
 * @file This file actually creates a shortened link. "options.js" is only for the options page, "popup.js" calles this script to generate a shortened link - this file handles the main extension functionality
 * @copyright Solomon Tech 2025
 */


// Use JavaScript's "strict" mode
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";

/*
 * Type Definitions
 */

/**
 * @typedef ChhotoRequest
 * @type {object}
 * @property {string[]} allowedProtocols The protocols which are allowed when creating a shortened link. If all are disabled, every protocol is allowed.
 * @property {string} chhotoHost The location of the Chhoto URL instance.
 * @property {string} chhotoKey The API key to communicate with a Chhoto URL instance with.
 * @property {string} longUrl The requested URL to shorten.
 * @property {string} title The title of the website
 */

/**
 * This is a subset of the full API response from Chhoto URL.
 * If the server returns an error instead, the response is slightly different.
 *
 * @see {@link https://github.com/SinTan1729/chhoto-url?tab=readme-ov-file#instructions-for-cli-usage} for more information.
 * @typedef ChhotoResponse
 * @type {object}
 * @property {number} status
 * @property {{success: boolean, error: boolean, shorturl: string}} json
 * @property {string} requestedLink The link that tried to be created. This only activates, and is only accurate, if the generateWithTitle option is enabled.
 */

/**
 * The JSON data obtained from the ChhotoResponse data (see above).
 * If the server returns an error instead, the response is slightly different.
 *
 * @typedef ChhotoJSON
 * @type {object}
 * @property {boolean} success
 * @property {boolean} error
 * @property {string} shorturl
 */

/*
 * Functions - in order from first executed to last executed by generateChhoto()
 */

/**
 * Validates the URL, as in, checks if the protocol is allowed.
 *
 * @param {!URL} url
 * @param {!string} title
 * @param {!string} type
 * @returns {!Promise<[URL, string, string], Error>}
 */
function validateURL(url, title, type) {
  return browser.storage.local.get("allowedProtocols").then(({ allowedProtocols }) => {
    // Initialize a list of protocols that are allowed if unset.
    // This needs to be synced with the initialization code in options.js.
    if (allowedProtocols === undefined) {
      allowedProtocols = new Set();
      allowedProtocols.add("http:");
      allowedProtocols.add("https:");
      allowedProtocols.add("ftp:");
      allowedProtocols.add("file:");
      browser.storage.local.set({ allowedProtocols: Array(...allowedProtocols) });
    } else {
      allowedProtocols = new Set(allowedProtocols);
    }

    // If no protocols are set, allow every protocol
    if (allowedProtocols.size > 0 && !allowedProtocols.has(url.protocol)) {
      return Promise.reject(new Error(`The current page's protocol (${url.protocol}) is unsupported.`));
    }

    // Return URL and title
    return Promise.resolve([url, title, type]);
  });
}

/**
 * Parses the URL outputted in the previous function, and gets the full link (i.e. URI included).
 *
 * @param {[!URL, string, string]} url - Holds long URL
 *                                 title - Title of the website
 *                                 type - Holds the type of the request. If this is "background", the function was called from this script.
 *                                 If this is "popup", the function was called from the popup script.
 * @returns {!Promise<ChhotoRequest, Error>}
 * If all the data was obtained, return ChhotoRequest.
 * Else, return an error
 */
function generateChhotoRequest([url, title, type]) {
  return browser.storage.local.get().then((data) => {
    // If the user didn't specify an API key or a host
    if (!data.chhotoHost) {
      return Promise.reject(new Error(
        "Missing Chhoto URL host. Please configure the Chhoto URL extension. See https://git.solomon.tech/solomon/Chhoto-URL-Extension#installation for more information."
      ));
    }

    // If the user didn't specify an API key
    if (!data.chhotoKey) {
      return Promise.reject(new Error(
        "Missing API Key. Please configure the Chhoto URL extension. See https://git.solomon.tech/solomon/Chhoto-URL-Extension#installation for more information."
      ));
    }


    // Set URL and title
    data.longUrl = url.href;

    // If the request type is popup
    if (type === "popup") {
      data.title = title;
    // Normal type (i.e. generated by clicking on the extension icon once)
    } else {
      // Make the title an empty string by default
      // This will create a randomly generated string if sent to the Chhoto URL server
      data.title = "";
    }

    // If "generateWithTitle" is true
    if (data.generateWithTitle) {
      // Get the configured word limit
      let wordLimit = data.titleWordLimit;

      // Format title name
      // Replace all occurences of ' - ' to '-'
      // Replace all occurences of ' ' to '-'
      // Replace all characters except for 'a-z', '0-9', '-' and '_' with ''
      let titleName = title.toLowerCase().replace(/ - /g, '-').replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');

      // If the wordLimit is not 0, and thus limited
      // If the type of the request does not equal "popup" (the word limit is always unlimited if it's generated from the popup page)
      if (wordLimit !== "0" && type !== "popup") {
        // Limit the length of the short URL to the configured number
        titleName = titleName.split('-', wordLimit).join('-');
      }

      // Set the title
      data.title = titleName;
    };

    // Return
    return Promise.resolve(data);
  });
}

/**
 * Fetches a response from the Chhoto URL instance using the provided arguments.
 *
 * @param {!ChhotoRequest} chhotoRequest An object containing all the variables
 * needed to request a shortened link from a Chhoto URL instance.
 * @returns {!Promise<ChhotoResponse, Error>} The HTTP response from the Chhoto URL instance, or an error
 */
function requestChhoto(chhotoRequest) {
  const headers = new Headers();
  headers.append("accept", "application/json");
  headers.append("Content-Type", "application/json");
  // This has been pushed to the main branch of Chhoto URL!
  headers.append("X-API-Key", chhotoRequest.chhotoKey);

  // Return output of fetch
  return fetch(new Request(
    `${chhotoRequest.chhotoHost}/api/new`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        shortlink: chhotoRequest.title,
        longlink: chhotoRequest.longUrl,
      }),
    },
    // Add the HTTP status code, and requestedLink (see ChhotoResponse in type definitions for details) to the response
  )).then(r => r.json().then(data => ({ status: r.status, json: data, requestedLink: `${chhotoRequest.chhotoHost}/${chhotoRequest.title}` })))
  // If there was a HTTP error
  // This does not activate if the Chhoto server returns a JSON response with an error
    .catch(err => {
      // Change the error message, if there was a NetworkError
      if (err.message === "NetworkError when attempting to fetch resource.") {
        err.message = "Failed to access the Chhoto URL instance. Is the instance online?"
      };

      return Promise.reject(new Error(
        `Error: ${err.message}`
      ));
    });
}

/**
 * Checks if the HTTP response was valid.
 *
 * @param {!ChhotoResponse} httpResp The response from the Chhoto URL instance from
 * requesting a shortened link.
 * @returns {!Promise<ChhotoJSON, Error>} An object containing the server
 * response if the server responded successfully, or an error describing the
 * HTTP error code returned by the server.
 */
function validateChhotoResponse(httpResp) {
  // Rather than check the HTTP status code, check the response of the Chhoto URL instance.
  if (httpResp.json.success) {
    return httpResp.json;
  } else {
    if (httpResp.status === 409) {
      const json = {
        success: true,
        error: false,
        shorturl: httpResp.requestedLink,
      }
      return json;
    }

    return Promise.reject(new Error(
      `Error (${httpResp.status}): ${httpResp.json.reason}.`
    ));
  }
}

/**
 * Copies the returned shortened link to the clipboard.
 *
 * @param {!ChhotoJSON} chhotoResp The JSON response from a Chhoto URL instance.
 * @returns {!Promise<ChhotoJSON, Error>} `ChhotoJSON`, unmodified, on
 * success, or an error indicating that we failed to copy to the clipboard.
 */
function copyLinkToClipboard(chhotoResp) {
  // Chrome requires this hacky workaround :(
  if (typeof chrome !== "undefined") {
    const prevSelected = document.activeElement;
    const tempEle = document.createElement("input");
    document.body.appendChild(tempEle);
    tempEle.value = chhotoResp.shorturl;
    tempEle.select();
    document.execCommand('copy');
    document.body.removeChild(tempEle);
    // Depending on what was previously selected, we might not be able to select the text.
    if (prevSelected?.select) {
      prevSelected.select();
    }
    return Promise.resolve(chhotoResp);
  } else {
    return navigator.clipboard
      .writeText(chhotoResp.shorturl)
      .then(
        () => Promise.resolve(chhotoResp),
        (e) => Promise.reject(new Error(`Failed to copy to clipboard. ${e.message}`))
      );
  }
}

/**
 * Generates a success notification.
 *
 * @param {!ChhotoJSON} result A successful Chhoto URL response.
 * @returns {null}
 */
function notifySuccess(result) {
  browser.notifications.create({
    type: "basic",
    title: "Shortened link copied!",
    iconUrl: "icons/chhoto-url-64.png",
    message: `${result.shorturl} was copied to your clipboard.`,
  });
}

/**
 * Generates an error notification.
 *
 * @param {!Error} error An error with a message to notify users with.
 * @returns {null}
 */
function notifyError(error) {
  browser.notifications.create({
    type: "basic",
    title: "Failed to create a shortened link.",
    iconUrl: "icons/chhoto-url-64.png",
    message: error.message,
  });
}


/**
 * Main function for generating a shortened link.
 */
function generateChhoto() {
  // Define the type of the request
  const type = "background";

  // Call functions
  browser.tabs
         .query({ active: true, currentWindow: true })
         .then(tabData => validateURL(new URL(tabData[0].url), tabData[0].title), type)
         .then(generateChhotoRequest)
         .then(requestChhoto)
         .then(validateChhotoResponse)
         .then(copyLinkToClipboard)
         .then(notifySuccess)
         .catch(notifyError);
}

/**
 * Function to generate a shortened link via the popup script (popup.js)
 */
function popupGenerateChhoto(url, title) {
  validateURL(url, title, "popup")
    .then(generateChhotoRequest)
    .then(requestChhoto)
    .then(validateChhotoResponse)
    .then(copyLinkToClipboard)
    .then(notifySuccess)
    .catch(notifyError);
};

// When the extension icon is clicked, call the function above
browser.browserAction.onClicked.addListener(generateChhoto);

// Create a context menu
browser.contextMenus.create({
  title: "Manually generate a Chhoto URL",
  contexts: ["all"]
});

// Run code when the context menu is clicked
browser.contextMenus.onClicked.addListener( (info) => {
  browser.windows.create({url: `/popup/popup.html?url=${info.pageUrl}`, type: "popup"});
});
