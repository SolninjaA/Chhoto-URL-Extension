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
 * @file This file actually creates a shortened link. "options.js" is only for the options page - this file handles the main extension functionality
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
 * @returns {!URL}
 */
function validateURL(url) {
  return browser.storage.local.get("allowedProtocols").then(({ allowedProtocols }) => {
    // Initialize a list of protocols that are allowed if unset.
    // This needs to be synced with the initialization code in options.js.
    console.log(allowedProtocols);
    if (allowedProtocols === undefined) {
      allowedProtocols = new Set();
      allowedProtocols.add("http:");
      allowedProtocols.add("https:");
      allowedProtocols.add("ftp:");
      allowedProtocols.add("file:");
      browser.storage.local.set({ allowedProtocols });
    }

    // If no protocols are set, allow every protocol
    if (allowedProtocols.size > 0 && !allowedProtocols.has(url.protocol)) {
      return Promise.reject(new Error(`The current page's protocol (${url.protocol}) is unsupported.`));
    }

    // Return URL
    return Promise.resolve(url);
  });
}

/**
 * Parses the URL outputted in the previous function, and gets the full link (i.e. URI included).
 *
 * @param {!URL} url
 * @returns {!Promise<ChhotoRequest, Error>}
 * If all the data was obtained, return ChhotoRequest.
 * Else, return an error
 */
function generateChhotoRequest(url) {
  return browser.storage.local.get().then((data) => {
    // If the user didn't specify an API key
    if (!data.chhotoKey) {
      return Promise.reject(new Error(
        "Missing API Key. Please configure the Chhoto URL extension by navigating to Settings > Extensions & Themes > Chhoto URL > Preferences."
      ));
    }
    // If the user didn't specify an API key or a host
    if (!data.chhotoKey || !data.chhotoHost) {
      return Promise.reject(new Error("Please configure the Chhoto URL extension by navigating to Settings > Extensions & Themes > Chhoto URL > Preferences."));
    }
    data.longUrl = url.href;

    // Return
    return Promise.resolve(data);
  });
}

/**
 * Fetches a response from the Chhoto URL instance using the provided arguments.
 *
 * @param {!ChhotoRequest} chhotoRequest An object containing all the variables
 * needed to request a shortened link from a Chhoto URL instance.
 * @returns {!ChhotoResponse} The HTTP response from the Chhoto URL instance.
 */
function requestChhoto(chhotoRequest) {
  const headers = new Headers();
  headers.append("accept", "application/json");
  headers.append("Content-Type", "application/json");
  // This has been pushed to the main branch of Chhoto URL!
  headers.append("Chhoto-Api-Key", chhotoRequest.chhotoKey);

  // Return output of fetch
  return fetch(new Request(
    `${chhotoRequest.chhotoHost}/api/new`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        shortlink: "",
        longlink: chhotoRequest.longUrl,
      }),
    },
  // Add the HTTP status code to the response
  )).then(r => r.json().then(data => ({status: r.status, json: data})))
    // If there was an error
    .catch(err => {
      // Change the error message, if there was a NetworkError
      if (err.message === "NetworkError when attempting to fetch resource.") {
        err.message = "Failed to access the Chhoto URL instance. Is the instance online?"
      };

      // Return error
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
  browser.tabs
    .query({ active: true, currentWindow: true })
    .then(tabData => validateURL(new URL(tabData[0].url)))
    .then(generateChhotoRequest)
    .then(requestChhoto)
    .then(validateChhotoResponse)
    .then(copyLinkToClipboard)
    .then(notifySuccess)
    .catch(notifyError);
}

// When the extension icon is clicked, call the function above
browser.browserAction.onClicked.addListener(generateChhoto);
