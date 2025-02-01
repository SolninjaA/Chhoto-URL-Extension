/**
 * COPYRIGHT NOTICE
 * THIS FILE WAS INSPIRED FROM: https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/functional-samples/cookbook.offscreen-clipboard-write
 * THE BASE CODE IS LICENSED UNDER THE APACHE 2 LICENSE
 * (https://www.apache.org/licenses/LICENSE-2.0)
 */

// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * COPYRIGHT NOTICE
 * ALL PERSONAL **MODIFICATIONS** ARE LICENSED UNDER THE GNU GENEARL PUBLIC LICENSE VERSION 3
 * YOU MAY FIND THIS LICENSE IN THE "LICENSE.md" FILE.
 * IF NOT, SEE https://www.gnu.org/licenses
 * */

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

// Get element
const textEle = document.querySelector("#text");

// Function which actually copies the link
async function copy(link) {
  try {
    // If the link is not a string
    if (typeof link !== 'string') {
      // Return an error
      throw new TypeError(`The shortened URL's type must be a 'string', not "${typeof link}"`);
    }

    // Set the value of the text element
    textEle.value = link;

    // Select the element
    textEle.select();

    // Copy to the clipboard
    document.execCommand('copy');
  } finally {
    // Close the offscreen document
    window.close();
  }
};

// Ensures the message was meant for this message handler
async function handleMessages(message) {
  // Only activate if the received message was intended for the offscreen handler
  if (message.type === 'clipboard') {
    // Call the copy function and pass the link
    copy(message.link);
  } else {
    // Return, if the message wasn't intended for the offscreen handler
    return;
  };
};

// Listen for runtime messages
chrome.runtime.onMessage.addListener(handleMessages);
