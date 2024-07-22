///////////////////////////////////////////////////////////////////////
// #ProjectDenis App: Toolkit Edition
///////////////////////////////////////////////////////////////////////

import { initSearch, tracksCounter, colsCounter, tunesCounter } from '../components/dm-search/dm-search.js';
import { toolkitMode, initToolkitButtons, parserSection, splitterSection } from './dm-toolkit.js';
import { addAriaHidden, removeAriaHidden, setAriaLabel, toggleTabIndex } from './aria-tools.js';
import { initModals, generateHandler } from '../components/dm-modals/dm-modals.js';
import { initPopovers, helpCardPopover } from '../components/dm-popovers/dm-popovers.js';
import { initTracklist } from '../components/dm-tracklist/dm-tracklist.js';

// Tune Database links

export const tunesJsonLink = "https://raw.githubusercontent.com/anton-bregolas/ProjectDenisToolkit/main/data/tunes.json";
export const tracksJsonLink = "https://raw.githubusercontent.com/anton-bregolas/ProjectDenisToolkit/main/data/tracks.json";
export const colsJsonLink = "https://raw.githubusercontent.com/anton-bregolas/ProjectDenisToolkit/main/data/collections.json";
export const refsJsonLink = "https://raw.githubusercontent.com/anton-bregolas/ProjectDenisToolkit/main/data/references.json";
export const helperJsonLink = "https://raw.githubusercontent.com/anton-bregolas/ProjectDenisToolkit/main/data/helper.json";

// Define App sections

export const appLauncherSection = document.querySelector('.dm-launch');
const mainHeaderSection = document.querySelector('.header-main');
export const searchSection = document.querySelector('#dm-search');
export const exploreSection = document.querySelector('#dm-explore');
export const discoverSection = document.querySelector('#dm-discover');
export const footerSection = document.querySelector('.dm-footer');
export const navMenuToggleBtn = document.querySelector('#main-nav-btn');

// Define Header App buttons

export const openCollectionsBtn = document.querySelector('#collections-header-btn');
export const openTracklistBtn = document.querySelector('#tracklist-header-btn');
export const openTunelistBtn = document.querySelector('#tunelist-header-btn');

// Define Main Page Nav and Theme buttons

export const allAppBtn = document.querySelectorAll('.app-btn'); 
export const allLinkBtn = document.querySelectorAll('.link-btn');
export const allThemeBtn = document.querySelectorAll('.theme-btn');
export const themeToggleBtn = document.getElementById('theme-toggle-btn');

// Define Generator buttons

export const startExploringBtn = document.querySelector('#dm-btn-start-exploring');
export const generateTunelistBtn = document.querySelector('#dm-btn-generate-tunelist');
export const generateColsListBtn = document.querySelector('#dm-btn-generate-collections');
export const generateTracklistBtn = document.querySelector('#dm-btn-generate-tracklist');
export const generateRefListBtn = document.querySelector('#dm-btn-generate-reflist');
export const generateLinkListBtn = document.querySelector('#dm-btn-generate-linklist');

// Define Generator button groups

export const allGenerateTunelistBtn = document.querySelectorAll('[data-generates="tunes"]');
export const allGenerateColsListBtn = document.querySelectorAll('[data-generates="cols"]');
export const allGenerateTracklistBtn = document.querySelectorAll('[data-generates="tracks"]');

// Define App Helper elements

export const mainAppHelper = document.querySelector('#dm-helper-main');
export const appHelperContainer = document.querySelector('.dm-helper-container');
export const appHelperBtn = document.querySelector('.dm-btn-helper');
export const allAppHelperPics = document.querySelectorAll('.dm-helper-image');

// Define status bars for screenreaders

export const statusBars = document.querySelectorAll('.dm-status-bar');

// Set starting Guided Help Tour variable value

export let showWelcomeMessage = 1;

////////////////////////////////
// Fetch Tune DB data functions
///////////////////////////////

// Custom Data JSONs

export const colsJson = [];
export const tunesJson = [];
export const tracksJson = [];
export const refsJson = [];
export const helperJson = [];

// Clear Data JSONs

export function clearData() {

  colsJson.length = 0;
  tunesJson.length = 0;
  tracksJson.length = 0;
  refsJson.length = 0;

  console.log("PD App:\n\nTune DB data cleared!")
}

// Make a Tune data fetch request then return JSON or text or handle errors

export async function fetchData(url, type) {

  try {

    const response = await fetch(url);

    let data;

    if (!response.ok) {

      throw new Error("Failed to fetch data from Tune DB", { cause: response });
    }

    if (type === "json") {

      // console.log("Fetching data from Tune DB...");

      data = await response.json();

    } else if (type === "text") {

      data = await response.text();

    } else {

      throw new Error("Invalid data type passed to Fetch!");
    }

    return data;

  } catch (error) {

    throw new Error(`[PD App]\n\n` + error + `\n\nHTTP error code: ` + error.cause?.status);
  }
}

// Fetch all Tune Data JSONs

export async function fetchDataJsons() {

  try {

    return Promise.all([
      fetchData(colsJsonLink, "json"), 
      fetchData(tunesJsonLink, "json"), 
      fetchData(tracksJsonLink, "json"), 
      fetchData(refsJsonLink, "json"),
      fetchData(helperJsonLink, "json")
    ]);

  } catch (error) {

    throw (error);
  }
}

// Push new Tune Data to Custom JSONs after fetching Tune DB data

export async function updateDataJsons() {

  try {

    console.log("PD App:\n\nFetching data from Tune DB...");

    const [colsJsonData, tunesJsonData, tracksJsonData, refsJsonData, helperJsonData] =     
    await fetchDataJsons();

    updateData(colsJson, colsJsonData);
    updateData(tunesJson, tunesJsonData);
    updateData(tracksJson, tracksJsonData);
    updateData(refsJson, refsJsonData);
    updateData(helperJson, helperJsonData);
    
    tracksCounter.textContent = tracksJson.length;
    colsCounter.textContent = colsJson.length;
    tunesCounter.textContent = tunesJson.length;

    return [colsJson.length, tunesJson.length, tracksJson.length, refsJson.length, helperJson.length];

  } catch (error) {

    throw (error);
  }
}

// Get Tune Data JSON's variable name, name of its elements and position in length array returned by updateDataJsons using jsonType

export function getInfoFromDataType(jsonType) {

  let parentJson;
  let dataIndex;
  let dataName = jsonType;

  switch (jsonType) {
    case "col":
    case "cols":
    case "colsJson":
    case "collections":
      parentJson = "colsJson";
      dataName = "Collections";
      dataIndex = 0;
      break;

    case "tune":
    case "tunes":
    case "tunesJson":
      parentJson = "tunesJson";
      dataName = "Tunes"
      dataIndex = 1;
      break;

    case "track":
    case "tracks":
    case "tracksJson":
      parentJson = "tracksJson";
      dataName = "Tracks"
      dataIndex = 2;
      break;

    case "ref":
    case "refs":
    case "refsJson":
    case "references":
      parentJson = "refsJson";
      dataName = "References";
      dataIndex = 3;
      break;     

    case "help":
    case "helper":
      parentJson = "helperJson";
      dataName = "Helper";
      dataIndex = 4;
      break;   
  
    default:
      dataName = "Tune DB";
      break;
  }

  return [parentJson, dataName, dataIndex];
}

// Check if Tune Data JSON contains data, updateDataJsons if it doesn't

export async function doDataCheckup(parentJson, dataType) {

  if (parentJson.length > 0) {

    return parentJson.length;
  }

  const jsonInfo = dataType? getInfoFromDataType(dataType) : ["allJson", "Tune DB", 2];
  const jsonDataName = jsonInfo[1];
  const jsonDataIndex = jsonInfo[2];

  if (parentJson.length === 0 || !Array.isArray(parentJson)) {

    console.warn(`PD App:\n\nNo data found in ${jsonDataName}!`);

    if (toolkitMode > 0) {

      return 0;
    }

    try {

      const jsonUpdate = await updateDataJsons();

      const newDataSize = jsonUpdate[jsonDataIndex];

      return newDataSize;

    } catch (error) {

      console.warn(error);

      return 0;
    }
  }
}

// Update Custom Tune Data JSON

export async function updateData(dataJson, newData) {

  dataJson.length = 0;

  dataJson.push(...newData);

  console.log(`PD App:\n\n${getInfoFromDataType(dataJson)[1]} Data updated`);
}

///////////////////////////////////
// Various Data handling functions
//////////////////////////////////

// Checks if an object is empty

export function isObjectEmpty(obj) {

  for(let i in obj) {

      return false;
  }

  return true;
}

//////////////////////////////////
// App launcher section functions
/////////////////////////////////

// Add event listeners to Launch app section buttons

function initLaunchButtons() {

  startExploringBtn.addEventListener("click", launchAppSequence);
}

// Launch app sequence: Check if help tour is needed, fetch all Data JSONs, update Custom JSONs, reveal app menu

async function launchAppSequence() {

  if (toolkitMode === 0) {

    try {

      await launchAppFetch();

    } catch (error) {

      console.warn(`PD App:\n\nLaunching app sequence failed. Details:\n\n${error.message}`);
    }
  }

  if (+helpCardPopover.dataset.welcome === 1 && +helpCardPopover.dataset.stage === 0 && !localStorage.getItem("user-skip-welcome-msg")) {

    helpCardPopover.showPopover();

    return;
  }

  launchAppReveal();
}

// Fetch Tune DB data and reveal main page sections

async function launchAppFetch() {

  if (toolkitMode === 0) {

    try {

      const tuneDataSize = await updateDataJsons();

      if (tuneDataSize[2] > 0) {

        console.log("PD App:\n\nTune DB data successfully fetched and pushed to data JSONs");
      }

    } catch (error) {

      throw error;
    }
  }
}

// Reveal hidden Main Page sections, hide App Launcher section and Helper (if not on guided tour)

async function launchAppReveal() {

  searchSection.removeAttribute("hidden");
  exploreSection.removeAttribute("hidden");
  discoverSection.removeAttribute("hidden");
  footerSection.removeAttribute("hidden");
  appLauncherSection.setAttribute("hidden", "");

  allLinkBtn.forEach(linkBtn => {

    linkBtn.classList.add("hidden");
  });

  allAppBtn.forEach(appBtn => {

    appBtn.classList.remove("hidden");
  });

  if (toolkitMode > 0) {

    parserSection.removeAttribute("hidden");
    splitterSection.removeAttribute("hidden");
    parserSection.scrollIntoView();
  }
  
  if (+helpCardPopover.dataset.stage === 0) {

    hideAppHelper();
  }
}

/////////////////////////////////////////
// App Header Generator button functions
////////////////////////////////////////

// Initialize App Main Page Header

function initHeaderButtons() {

  mainHeaderSection.addEventListener('click', mainHeaderHandler);
}

// Handle clicks on Open / Generate buttons in main page header

function mainHeaderHandler(event) {

  const appGenBtn = event.target.closest('[data-generates]');

  if (appGenBtn) {

    generateHandler(appGenBtn);
  }
}

////////////////////////////////////
// App color theme change functions
///////////////////////////////////

// Switch to new color theme, remember theme setting, update button set and helpers

export function toggleColorTheme(newColorTheme) {

  let currentThemeLabel;
  
  document.body.classList.value = newColorTheme;

  toggleAppHelpers(newColorTheme);

  localStorage.setItem("user-color-theme", newColorTheme);

  allThemeBtn.forEach(btn => {

    if (btn.getAttribute("data-theme") === newColorTheme) {

      btn.classList.add("hidden");

      currentThemeLabel = btn.title;

    } else if (btn.classList.contains("hidden")) {

      btn.classList.remove("hidden");
    }
  });

  setAriaLabel(themeToggleBtn, `${currentThemeLabel} is on. Select color theme.`);

  console.log(`PD App:\n\n${currentThemeLabel} is on`);
}

// Very serious and not at all whimsical Helper images toggle handler function

function toggleAppHelpers(currentColorTheme) {

  const appropriatelyDressedAppHelper = document.querySelector(`#dm-helper-${currentColorTheme}`);

  allAppHelperPics.forEach(helper => {
    
    if (helper === appropriatelyDressedAppHelper) {

      if (helper.hasAttribute("hidden")) {

        helper.removeAttribute("hidden");
      }

    } else {

      if (!helper.hasAttribute("hidden")) {
          
        helper.setAttribute("hidden", "");
      }
    }
  });
}

//////////////////////////////////////
// App Helper and Help Menu Functions
/////////////////////////////////////

// Initialize App Helpers

function initAppHelpers() {

  appHelperContainer.addEventListener('click', appHelperHandler);

  allAppHelperPics.forEach(helper => {

    const helperImg = helper.querySelector('img');

    if (helperImg.complete) {

      helper.classList.add("active");
    
    } else {

      helperImg.addEventListener('load', handleHelperSlowLoad);
      helperImg.addEventListener('error', handleHelperSlowLoad);
    }
  });

  showAppHelper();
}

// Make sure the Helper images don't appear before fully loading by making them visible on load

function handleHelperSlowLoad(event) {

  const helperImg = event.target;
  const helperPicture = helperImg.parentElement;

  if (event.type === "error") {
    console.warn(`PD Helper:\n\nFailed to load Helper image within picture #` + helperPicture.id);
    return;
  }

  helperPicture.classList.add("active");
	helperImg.removeEventListener('load', handleHelperSlowLoad);
  helperImg.removeEventListener('error', handleHelperSlowLoad);
}

// Show or hide popover when Helper is clicked

export function appHelperHandler(event) {
  
  const helperBtn = event.target.closest('.dm-btn-helper');

  if (helperBtn) {

    if (helpCardPopover.matches(':popover-open')) {

      helpCardPopover.hidePopover();
  
      return;
    }
  
    helpCardPopover.showPopover();
  }
}

// Show App Helper, slide in to full size

export function showAppHelper() {

  appHelperContainer.classList.add("expanded");
  removeAriaHidden(mainAppHelper);
  appHelperBtn.setAttribute("tabindex", "0");
}

// Hide App Helper, slide out to below the bottom of the page

export function hideAppHelper() {

  appHelperContainer.classList.remove("expanded");
  addAriaHidden(mainAppHelper);
  toggleTabIndex(mainAppHelper);
  appHelperBtn.setAttribute("tabindex", "-1");
}

/////////////////////////////////////////////////
// Apply user color theme right before page load
////////////////////////////////////////////////

(() => {

  const userColorTheme = localStorage.getItem("user-color-theme");

  if (userColorTheme) {

    toggleColorTheme(userColorTheme);

    toggleAppHelpers(userColorTheme);

    console.log(`PD App:\n\nUser color theme retrieved`);
  }
})();

///////////////////////////////////////////////
// Initialize necessary functions on page load
//////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
  
  showAppHelper();
  initLaunchButtons();
  initHeaderButtons();
  initToolkitButtons();
  initSearch();
  initModals();
  initPopovers();
  initTracklist();
  initAppHelpers();
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
