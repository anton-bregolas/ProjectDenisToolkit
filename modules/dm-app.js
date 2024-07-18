///////////////////////////////////////////////////////////////////////
// #ProjectDenis App
///////////////////////////////////////////////////////////////////////

import { initSearch, tracksCounter, colsCounter, tunesCounter } from '../components/dm-search/dm-search.js';
import { toolkitMode, initToolkitButtons, parserSection, splitterSection, allThemeBtn, themeToggleBtn } from './dm-toolkit.js';
import { initModals } from '../components/dm-modals/dm-modals.js';
import { initPopovers } from '../components/dm-popovers/dm-popovers.js';
import { initTracklist } from '../components/dm-tracklist/dm-tracklist.js';

// Define App sections

const appLauncherSection = document.querySelector('.dm-launch');
export const searchSection = document.querySelector('#dm-search');
export const exploreSection = document.querySelector('#dm-explore');
export const discoverSection = document.querySelector('#dm-discover');
const footerSection = document.querySelector('.dm-footer');

// Tune Database links

export const tunesJsonLink = "https://raw.githubusercontent.com/anton-bregolas/ProjectDenisToolkit/main/data/tunes.json";
export const tracksJsonLink = "https://raw.githubusercontent.com/anton-bregolas/ProjectDenisToolkit/main/data/tracks.json";
export const colsJsonLink = "https://raw.githubusercontent.com/anton-bregolas/ProjectDenisToolkit/main/data/collections.json";
export const refsJsonLink = "https://raw.githubusercontent.com/anton-bregolas/ProjectDenisToolkit/main/data/references.json";

// Custom Data JSONs

export let colsJson = [];
export let tunesJson = [];
export let tracksJson = [];
export let refsJson = [];

// Update Custom Data JSON

export async function updateData(newData, dataType) {

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

  if (dataType = "refs") {

    refsJson = newData;
    console.log("PD App:\n\nReferences JSON updated.");
  }
}

// Clear Data JSONs

export function clearData() {

  colsJson = [];
  tunesJson = [];
  tracksJson = [];
  refsJson = [];

  console.log("PD App:\n\nTune DB data cleared!")
}

// Check if Data JSON contains data, fetchDataJsons if it doesn't

export async function doDataCheckup(jsonType) {

  let parentJson;
  let dataIndex;
  let dataName = jsonType;

  switch (jsonType) {
    case "cols":
    case "collections":
      parentJson = colsJson;
      dataIndex = 0;
      dataName = "collections";
      break;

    case "tunes":
      parentJson = tunesJson;
      dataIndex = 1;
      break;

    case "tracks":
      parentJson = tracksJson;
      dataIndex = 2;
      break;

    case "refs":
    case "references":
      parentJson = refsJson;
      dataIndex = 3;
      dataName = "references";
      break;     
  
    default:
      console.warn("PD App:\n\nData checkup type is invalid");
      return;
  }

  const jsonName = dataName[0].toUpperCase() + jsonType.slice(1);

  if (parentJson.length === 0 || !Array.isArray(parentJson)) {

    console.warn(`PD App:\n\nNo data found in ${jsonName} JSON!`);

    if (toolkitMode > 0) {

      return;
    }

    try {

      const jsonUpdate = await fetchDataJsons();

      const newDataSize = jsonUpdate[dataIndex];

      if (newDataSize > 0) {

        console.log(`PD App:\n\n${jsonName} updated, new data count: ${newDataSize}`);
      }

      return newDataSize;

    } catch (error) {

      console.warn(error);
    }
  }

  return parentJson.length;
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

      console.log("PD App:\n\nFetching data from Tune DB...");

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

    console.error(`PD App:\n\nError fetching data from Tune DB:\n\n` + thrownErrorMessage);

    throw new Error(error);
  }
}

// Fetch all Data JSONs, assign them to Custom JSONs

export async function fetchDataJsons() {

  try {

    const [colsJsonData, tunesJsonData, tracksJsonData, refsJsonData] =     
    await Promise.all([fetchData(colsJsonLink, "json"), fetchData(tunesJsonLink, "json"), fetchData(tracksJsonLink, "json"), fetchData(refsJsonLink, "json")]);

    colsJson = colsJsonData;
    tunesJson = tunesJsonData;
    tracksJson = tracksJsonData;
    refsJson = refsJsonData;

    return [colsJson.length, tunesJson.length, tracksJson.length, refsJson.length];

  } catch (error) {

    console.warn(error);

    return[0, 0, 0, 0];
  }
}

// Launch app sequence: Fetch all Data JSONs, assign them to Custom JSONs, reveal app menu

export async function launchAppSequence() {

  if (toolkitMode === 0) {

    try {

      const tuneDataSize = await fetchDataJsons();

      if (tuneDataSize[2] > 0) {

        console.log("PD App:\n\nTune DB data successfully fetched and assigned to data JSONs");
      }

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
  footerSection.removeAttribute("hidden");
  appLauncherSection.setAttribute("hidden", "");

  if (toolkitMode > 0) {

    parserSection.removeAttribute("hidden");
    splitterSection.removeAttribute("hidden");
    parserSection.scrollIntoView();
  }
}

/////////////////////////////////////////////////
// Apply user color theme right before page load
////////////////////////////////////////////////

(() => {

  const userColorTheme = localStorage.getItem("user-color-theme");
  let currentThemeLabel;

  if (userColorTheme) {

    document.body.classList.value = userColorTheme;

    allThemeBtn.forEach(btn => {

      if (btn.getAttribute("data-theme") === userColorTheme) {

        btn.classList.add("hidden");
        currentThemeLabel = btn.title;

      } else if (btn.classList.contains("hidden")) {

        btn.classList.remove("hidden");
      }
    });

    themeToggleBtn.setAttribute("aria-label", `Select color theme. ${currentThemeLabel} theme is on`);

    console.log(`PD App:\n\nUser color theme retrieved, ${currentThemeLabel} is on`);
  }
})();

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
