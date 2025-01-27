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
 * @file This file handles the logic behind the popup page. This script will call a "background.js" function to generate a shortened URL.
 * @copyright Solomon Tech 2025
 */


// Use JavaScript's "strict" mode
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";

// Get elements
const closeEle = document.querySelector("#close");
const shortURLEle = document.querySelector("#shorturl");
const longURLEle = document.querySelector("#longurl");
const messageEle = document.querySelector("#message");
const message2Ele = document.querySelector("#message2");
const message3Ele = document.querySelector("#message3");
const generateEle = document.querySelector("#generate");

// Define values
let shorturl;
let longurl;

const requestParams = new URLSearchParams(window.location.search);
const requestValue = requestParams.get('url');

/**
 * Automatically insert the long URL, if enabled
 */

// If a URL was passed in the request
if (requestValue) {
  browser.storage.local.get().then(( data ) => {
    if (data.autoInsertPopup !== undefined && data.autoInsertPopup) {
      let allowedProtocols;
      // Initialize a list of protocols that are allowed if unset.
      if (data.allowedProtocols === undefined) {
        allowedProtocols = new Set();
        allowedProtocols.add("http:");
        allowedProtocols.add("https:");
        allowedProtocols.add("ftp:");
        allowedProtocols.add("file:");
        browser.storage.local.set({ allowedProtocols: Array(...allowedProtocols) });
      } else {
        allowedProtocols = data.allowedProtocols;
        allowedProtocols = new Set(allowedProtocols);
      }

      // Try and catch structure
      try {
        // Define the URL
        const url = new URL(requestValue);

        // Ensure the URL has a valid protocol
        if (allowedProtocols.size > 0 && !allowedProtocols.has(url.protocol)) {
          throw new Error("The URL is invalid");
        };

        ////// If anything beyond this point is trigerred, the URL protocol is valid. //////

        // Reassign the long url
        longURLEle.value = url;
        longurl = url;
      } catch (error) {
        console.log(`Error while auto inserting the long URL - ${error}`);
      };

    };

  });
};

// Close function
async function close() {
  try {
    const windowId = (await browser.windows.getCurrent()).id;
    await browser.windows.remove(windowId);
  } catch (error) {
    console.log("Closing failed:", error);
  }
}

// If the close button is clicked, close the window
closeEle.addEventListener('click', () => {
  close();
});

// When the short URL is inputted
shortURLEle.oninput = (event) => {
  if (event.type === "click") {
    event.preventDefault();
  };

  // If the short URL value is greater than 0 (i.e. not an empty string)
  if (shortURLEle.value.length > 0) {
    // Get the browser storage
    browser.storage.local.get().then((data) => {
      // Set the word limit
      const wordLimit = data.titleWordLimit;

      // Get the configured host
      const chhotoHost = data.chhotoHost;

      // Format the short URL
      // Replace all occurences of ' - ' to '-'
      // Replace all occurences of ' ' to '-'
      // Replace all characters except for 'a-z', '0-9', '-' and '_' with ''
      let shortURLText = shortURLEle.value.toLowerCase().replace(/ - /g, '-').replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');

      // If the wordLimit is not 0, and thus limited
      // And if the configured host is not undefined
      if (chhotoHost !== undefined) {
        // Inform the user
        messageEle.innerText = `The short URL will be generated as: ${chhotoHost}/${shortURLText}.`;
      } else {
        // If the configured host is undefined
        messageEle.innerText = "The Chhoto URL host has not been configured. Cannot generate shortened URL.";
      }

      // Set the short URL
      shorturl = shortURLText;

      // Show the message
      messageEle.classList.add("shown");
    });
  } else {
    // If the short URL is an empty string, hide the message
    messageEle.classList.remove("shown");
  }

};

// When the long URL is inputted
longURLEle.oninput = (event) => {
  if (event.type === "click") {
    event.preventDefault();
  };

  // If the long URL value is greater than 0 (i.e. not an empty string)
  if (longURLEle.value.length > 0) {
    // Get the allowed protocols
    browser.storage.local.get("allowedProtocols").then(({ allowedProtocols }) => {
      // Initialize a list of protocols that are allowed if unset.
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

      // Try and catch structure
      try {
        // Define the URL
        const url = new URL(longURLEle.value);

        // Ensure the URL has a valid protocol
        if (allowedProtocols.size > 0 && !allowedProtocols.has(url.protocol)) {
          throw new Error("The URL is invalid");
        };

        ////// If anything beyond this point is trigerred, the URL protocol is valid. //////

        // Reassign the long url
        longurl = url;

        // Remove any warning styles which may be active
        message2Ele.classList.remove("warning");
        longURLEle.style.color = "black";
      } catch {
        // If the URL is invalid, add warning styles
        message2Ele.classList.add("warning");
        longURLEle.style.color = "red";
      };


    });
  } else {
    // If the long URL is an empty string, hide the warning styling
    message2Ele.classList.remove("warning");
    longURLEle.style.color = "black";
  }
};

// Define the sendRequest function (which calls a background.js function to generate a shortened link)
function sendRequest(page) {
  page.popupGenerateChhoto(longurl, shorturl);
  close();
}

// If the generate button was clicked
generateEle.addEventListener("submit", (event) => {
  event.preventDefault();
  // Ensure both fields have been filled out, and the long URL is valid
  if ( shorturl !== undefined && longurl !== undefined && !message2Ele.classList.contains("warning") ) {

    // Remove the warning class
    message3Ele.classList.remove("warning");

    // Get the background page, and call the sendRequest function (which is in this script)
    const backgroundFunc = browser.runtime.getBackgroundPage();
    backgroundFunc.then(sendRequest);
  } else {
    // Add the warning class
    message3Ele.classList.add("warning");
  };
});
