///////////////////////////////////////////////////////////////////////
// #ProjectDenis App
///////////////////////////////////////////////////////////////////////

import { initSearch, tracksCounter, colsCounter, tunesCounter } from '../components/dm-search/dm-search.js';
import { toolkitMode, initToolkitButtons, parserSection, splitterSection } from './dm-toolkit.js';
import { initModals } from '../components/dm-modals/dm-modals.js';
import { initPopovers } from '../components/dm-popovers/dm-popovers.js';
import { initTracklist } from '../components/dm-tracklist/dm-tracklist.js';

// Define App sections

const appLauncherSection = document.querySelector('.dm-launch');
export const searchSection = document.querySelector('#dm-search');
export const exploreSection = document.querySelector('#dm-explore');
export const discoverSection = document.querySelector('#dm-discover');

// Tune Database links

export const tunesJsonLink = "https://raw.githubusercontent.com/anton-bregolas/ProjectDenisToolkit/main/data/tunes.json";
export const tracksJsonLink = "https://raw.githubusercontent.com/anton-bregolas/ProjectDenisToolkit/main/data/tracks.json";
export const colsJsonLink = "https://raw.githubusercontent.com/anton-bregolas/ProjectDenisToolkit/main/data/collections.json";

// Custom Data JSONs

export let colsJson = [];
export let tunesJson = [];
export let tracksJson = [];

// Update Custom Data JSON

export function updateData(newData, dataType) {

  if (dataType == "cols") {

    colsJson = newData;
    console.log("PD App:\n\nCollections JSON updated.");
    // console.log(colsJson);
  }

  if (dataType == "tunes") {

    tunesJson = newData;
    console.log("PD App:\n\nTunes JSON updated.");
    // console.log(tunesJson);
  }

  if (dataType == "tracks") {

    tracksJson = newData;
    console.log("PD App:\n\nTracks JSON updated.");
    // console.log(tracksJson);
  }
}

// Clear Data JSONs

export function clearData() {

  colsJson = [];
  tunesJson = [];
  tracksJson = [];

  console.log("PD App:\n\nTune Data cleared!")
}

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

      console.log("PD App:\n\nFetching Tune data...");

      data = await response.json();

    } else if (type === "text") {

      data = await response.text();

    } else {

      errorMessage = "Invalid data type passed to Fetch!";

      throw new Error(errorMessage);
    }

    return data;

  } catch (error) {

    let thrownErrorMessage = error.message === "Failed to fetch"? "Network error, check your connection!" :
    error.message || "Fetching data failed, try again!";

    console.error(`PD App:\n\nError fetching Tune data:\n\n` + thrownErrorMessage);

    throw new Error(error);
  }
}

// Fetch all Data JSONs, assign them to Custom JSONs

export async function fetchDataJsons() {

  try {

    const [colsJsonData, tunesJsonData, tracksJsonData] =     
    await Promise.all([fetchData(colsJsonLink, "json"), fetchData(tunesJsonLink, "json"), fetchData(tracksJsonLink, "json")]);

    colsJson = colsJsonData;
    tunesJson = tunesJsonData;
    tracksJson = tracksJsonData;

  } catch (error) {

    throw new Error(`Error fetching Data JSONs!\n\n${error.message}`);
  }
}

// Launch app sequence: Fetch all Data JSONs, assign them to Custom JSONs, reveal app menu

export async function launchAppSequence() {

  if (toolkitMode === 0) {

    try {

      await fetchDataJsons();

      console.log("PD App:\n\nTune Data successfully fetched and assigned to Data JSONs");
    
    } catch (error) {

      console.warn(`PD App:\n\nLaunching app sequence failed. Details:\n\n${error.message}`);
    }
  }

  tracksCounter.textContent = tracksJson.length;
  colsCounter.textContent = colsJson.length;
  tunesCounter.textContent = tunesJson.length;

  searchSection.removeAttribute("hidden");
  exploreSection.removeAttribute("hidden");
  discoverSection.removeAttribute("hidden");
  appLauncherSection.setAttribute("hidden", "");

  if (toolkitMode > 0) {

    parserSection.removeAttribute("hidden");
    splitterSection.removeAttribute("hidden");
    parserSection.scrollIntoView();
  }
}

///////////////////////////////////////////////
// Initialize necessary functions on page load
//////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
  
    initToolkitButtons();
    initSearch();
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
