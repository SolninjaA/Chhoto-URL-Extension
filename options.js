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
 * @file This file handles the logic behind the options page
 * @copyright Solomon Tech 2025
 */


// Use JavaScript's "strict" mode
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";

// Get elements, and define a variable for them
const hostKeyEle = document.getElementById("host");
const apiKeyEle = document.getElementById("key");
const AllowHttpEle = document.getElementById("allow-http");
const AllowHttpsEle = document.getElementById("allow-https");
const AllowFileEle = document.getElementById("allow-file");
const AllowFtpEle = document.getElementById("allow-ftp");
const messageEle = document.getElementById("message");
const generateWithTitleEle = document.getElementById("generate-with-title");
const titleWordLimitLabelEle = document.getElementById("title-word-limit-label");
const titleWordLimitEle = document.getElementById("title-word-limit");
const message2Ele = document.getElementById("message2");

// Get the browser storage
const browserStorage = browser.storage.local;

/*
 * Event Listeners
 */

// Chhoto URL host
hostKeyEle.oninput = (event) => {
  if (event.type === "click") {
    event.preventDefault();
  }

  // Get the Chhoto URL host
  const chhotoHost = hostKeyEle.value.replace(/\/$/, '');

  // Catch the exception from the URL constructor
  // (this always activates because as the user begins typing, the URL is invalid)
  try {
    const url = new URL(chhotoHost);
    // If a non-HTTPS protocol is selected.
    if (url.protocol !== "https:") {
      throw new Error("Non-HTTPS protocol is selected.");
    };

    // Save the host
    browserStorage.set({ chhotoHost });

    // Remove the "warning" class
    messageEle.classList.remove("warning");
  } catch (err) {
    // If the URL is NOT invalid because of a TypeError
    if (err.name !== "TypeError") {
      messageEle.classList.add("warning");
    // Else, remove warning
    } else {
      messageEle.classList.remove("warning");
    };

  };

};

// Chhoto URL API key
apiKeyEle.oninput = (event) => {
  if (event.type === "click") {
    event.preventDefault();
  };

  // Get the Chhoto URL API key
  const chhotoKey = apiKeyEle.value;

  browserStorage.set({ chhotoKey });
};

// Allowed protocols
const allowProtocolsMapping = [
  [AllowHttpEle, "http:"],
  [AllowHttpsEle, "https:"],
  [AllowFileEle, "file:"],
  [AllowFtpEle, "ftp:"],
];

for (const [ele, protocol] of allowProtocolsMapping) {
  ele.onclick = () => {
    // Get allowedProtocols
    browserStorage.get("allowedProtocols").then(({ allowedProtocols }) => {
      // New set
      allowedProtocols = new Set(allowedProtocols);
      if (ele.checked) {
        allowedProtocols.add(protocol);
      } else {
        allowedProtocols.delete(protocol);
      }
      // Save to browser storage
      browserStorage.set({ allowedProtocols: Array(...allowedProtocols) });
    });
  };
}

/*
 * URL Generation Options
 */

// Generate with title
generateWithTitleEle.onclick = () => {
  browserStorage.get("generateWithTitle").then(({ generateWithTitle }) => {
    // Get value
    generateWithTitle = generateWithTitleEle.checked;

    // Set default display option
    let display = "none";

    // If generateWithTitle is true
    if (generateWithTitle) {
      // Reassign variable
      display = "block";
    }

    // Set display and save
    titleWordLimitLabelEle.style.display = display;
    browserStorage.set({ generateWithTitle });
  });
};

// Title character limit
titleWordLimitEle.oninput = (event) => {
  if (event.type === "click") {
    event.preventDefault();
  };

  // Get the inputted value
  const titleWordLimit = titleWordLimitEle.value;

  // If the inputted value is not a number (NaN)
  if (isNaN(titleWordLimit)) {
    message2Ele.classList.add("warning");
  } else {
    message2Ele.classList.remove("warning");
    browserStorage.set({ titleWordLimit });
  };
}

function setCurrentChoice({ chhotoHost, chhotoKey, allowedProtocols, generateWithTitle, titleWordLimit }) {
  hostKeyEle.value = chhotoHost || "";
  apiKeyEle.value = chhotoKey || "";

  // If "allowedProtocols" doesn't exist, set default protocols
  // If the user deselects every protocol, this does not activate
  // since the value would be empty, not undefined.
  //
  // In other words, this only gets activated when there is absolutely no data
  // regarding "allowedProtocols".
  if (!allowedProtocols) {
    allowedProtocols = allowProtocolsMapping.flatMap(([_, protocol]) => protocol);
    browserStorage.set({ allowedProtocols: allowedProtocols });
  }

  // If generateWithTitle is undefined, set the default value
  if (generateWithTitle === undefined) {
    generateWithTitle = false;
    browserStorage.set({ generateWithTitle: generateWithTitle });
  }

  // If titleWordLimit is undefined, set the default value
  if (titleWordLimit === undefined) {
    titleWordLimit = "0";
    browserStorage.set({ titleWordLimit: titleWordLimit });
  }

  // Initialize a list of protocols that are allowed if unset. This needs
  // to be synced with the initialization code in background.js#validateURL.
  allowedProtocols = new Set(allowedProtocols);

  AllowHttpEle.checked = allowedProtocols.has("http:");
  AllowHttpsEle.checked = allowedProtocols.has("https:");
  AllowFileEle.checked = allowedProtocols.has("file:");
  AllowFtpEle.checked = allowedProtocols.has("ftp:");

  generateWithTitleEle.checked = generateWithTitle;

  // Set default display
  let display = "none";

  // If generateWithTitle is true, reassign variable
  if (generateWithTitle === true) {
    display = "block";
  }

  // Save
  titleWordLimitLabelEle.style.display = display;
  titleWordLimitEle.value = titleWordLimit || "0";

}

browserStorage.get().then(setCurrentChoice, (error) => {
  console.log(`Error: ${error}`);
});
