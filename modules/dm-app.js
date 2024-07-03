///////////////////////////////////////////////////////////////////////
// #ProjectDenis App v.0.1
///////////////////////////////////////////////////////////////////////

import { generateTunelistBtn, 
         generateColsListBtn, 
         generateTracklistBtn,
         initToolkitButtons } from './dm-toolkit.js';

import { initModals } from '../components/dm-modals/dm-modals.js';
import { initPopovers } from '../components/dm-popovers/dm-popovers.js';
import { initTracklist } from '../components/dm-tracklist/dm-tracklist.js';

// Tune Database links

export const tunesJsonLink ="https://raw.githubusercontent.com/anton-bregolas/ProjectDenisToolkit/main/data/tunes.json";
export const tracksJsonLink = "https://raw.githubusercontent.com/anton-bregolas/ProjectDenisToolkit/main/data/tracks.json"
export const colsJsonLink = "https://raw.githubusercontent.com/anton-bregolas/ProjectDenisToolkit/main/data/collections.json"

// Make a Tune data fetch request then return JSON or text or handle errors

export async function fetchData(url, type) {

  try {

    const response = await fetch(url);

    let data;

    if (!response.ok) {

      let errorMessage;

      if ((response.status === 408)) {

        errorMessage = "You seem to be offline. Try using cached data";

      } else if (response.status < 500) {

        errorMessage = "Tune data not loading. Clear settings or use cached data";

      } else {

        errorMessage = "Tune database is offline. Looking for cached data...";
      }

      console.error("HTTP error code:", response.status);

      throw new Error(errorMessage);
    }

    if (type === "json") {

      console.log("Fetching Tune data...");

      data = await response.json();

    } else if (type === "text") {

      data = await response.text();

    } else {

      console.error("Invalid data type passed to Fetch!");
      throw error;
    }

    return data;

  } catch (error) {

    let errorMessage = error.message === "Failed to fetch"? "Network error, check your connection!" :
    error.message || "Fetching data failed, try again!";

    console.error(`Error fetching Tune data:\n\n` + errorMessage);
    // throw error;
  }
}

///////////////////////////////////////////////
// Initialize necessary functions on page load
//////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
  
    initToolkitButtons();
    initModals();
    initPopovers();
    initTracklist();
});

//////////////////////////////////////////
// Register service worker on window load
/////////////////////////////////////////

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((registration) => {
        console.log(`PD Service Worker:\n\n` + `Registered with scope:\n` + registration.scope);
      })
      .catch((error) => {
        console.error(`PD Service Worker:\n\n` + `Registration failed!\n` + error);
      });
  });
}
