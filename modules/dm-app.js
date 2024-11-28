///////////////////////////////////////////////////////////////////////////
// #ProjectDenis App :: Toolkit Edition :: PD App v.1.1.0 :: Toolkit v.3.3
//////////////////////////////////////////////////////////////////////////

import { toolkitMode, initToolkitButtons, parserSection, splitterSection } from './dm-toolkit.js';
import { appHelperHandler, helpCardPopover, showHelpPopover, 
         quitHelpTour, showAppHelper, hideAppHelper } from '../components/dm-helper/dm-helper.js'
import { initSearch, tracksCounter, colsCounter, tunesCounter, searchInput } from '../components/dm-search/dm-search.js';
import { initModals, generateHandler, closeDialogHandler } from '../components/dm-modals/dm-modals.js';
import { initPopovers, updateBannerPopover } from '../components/dm-popovers/dm-popovers.js';
import { initTracklist } from '../components/dm-tracklist/dm-tracklist.js';
import { setAriaLabel } from './aria-tools.js';

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
export const appNavMenu = document.querySelector('.dm-nav-menu');
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
      fetchData(refsJsonLink, "json")
    ]);

  } catch (error) {

    throw (error);
  }
}

// Push new Tune Data to Custom JSONs after fetching Tune DB data

export async function updateDataJsons() {

  try {

    console.log("PD App:\n\nFetching data from Tune DB...");

    const [colsJsonData, tunesJsonData, tracksJsonData, refsJsonData] =     
    await fetchDataJsons();

    updateData(colsJson, colsJsonData);
    updateData(tunesJson, tunesJsonData);
    updateData(tracksJson, tracksJsonData);
    updateData(refsJson, refsJsonData);
    
    tracksCounter.textContent = tracksJson.length;
    colsCounter.textContent = colsJson.length;
    tunesCounter.textContent = tunesJson.length;

    return [colsJson.length, tunesJson.length, tracksJson.length, refsJson.length];

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
    case "helperJson":
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

  if (parentJson === helperJson) {

    try {
      
      let helperJsonData = await fetchData(helperJsonLink, "json");

      console.log("PD App:\n\nFetching App Helper data...");
      
      updateData(helperJson, helperJsonData);
  
      return helperJson.length;

    } catch (error) {

      console.warn(error);

      return 0;
    }
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

  let jsonType = dataJson === helperJson? "Helper data" : "Tune DB";

  dataJson.length = 0;

  dataJson.push(...newData);

  console.log(`PD App:\n\n${jsonType} updated`);
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
  startExploringBtn.focus();
}

// Launch app sequence: Check if help tour is needed, fetch all Data JSONs, update Custom JSONs, reveal app menu

export async function launchAppSequence() {

  if (+helpCardPopover.dataset.welcome === 1 && +helpCardPopover.dataset.stage === 0 && !localStorage.getItem("user-skip-welcome-msg")) {

    showHelpPopover();

    return;
  }

  if (toolkitMode === 0) {

    try {

      await launchAppFetch();

    } catch (error) {

      console.warn(`PD App:\n\nLaunching app sequence failed. Details:\n\n${error.message}`);
    }
  }

  if (+helpCardPopover.dataset.stage === 20) {

    quitHelpTour();
  }

  launchAppReveal();

  if (+helpCardPopover.dataset.stage === 1 || +helpCardPopover.dataset.stage === 21) {

    appHelperBtn.focus();
  }
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

function launchAppReveal() {

  searchSection.removeAttribute("hidden");
  exploreSection.removeAttribute("hidden");
  discoverSection.removeAttribute("hidden");
  footerSection.removeAttribute("hidden");
  appNavMenu.removeAttribute("hidden");
  appLauncherSection.setAttribute("hidden", "");

  allLinkBtn.forEach(linkBtn => {

    if (linkBtn.classList.contains("dm-btn-start-menu")) {

      linkBtn.classList.add("hidden");
    }
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

  if (!localStorage.getItem("user-notification-seen")) {
    
    updateBannerPopover.showPopover();
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

///////////////////////////////////
// App Keyboard Shortcuts Handling
//////////////////////////////////

// Add global event listener to allow keyboard shortcuts

function initShortcuts() {

  window.addEventListener('keydown', handleNavShortcuts);
}

// Handle shortcuts depending on section currently open

function handleNavShortcuts(event) {

  const shortcutBaseKeys = ["F1", "F2", "F3"];

  shortcutBaseKeys.forEach(key => {

    if (event.altKey && event.key === key) {

      closeDialogHandler();

      switch (key) {

        case "F1":
          appHelperBtn.click();
          break;

        case "F2":
          navMenuToggleBtn.click();
          break;

        case "F3":
          searchInput.focus();
          break;
      
        default:
          break;
      }
    }
  });
}

////////////////////////////////////
// App color theme change functions
///////////////////////////////////

// Switch to new color theme, remember theme setting, update button set and helpers

export function toggleColorTheme(newColorTheme) {

  let currentThemeLabel;
  
  document.body.classList.value = newColorTheme;

  toggleAppHelpersLook(newColorTheme);

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

function toggleAppHelpersLook(currentColorTheme) {

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
// App Helper Images Load Functions
/////////////////////////////////////

// Initialize App Helper Images, handle slow loading

function initAppHelperImages() {

  appHelperContainer.addEventListener('click', appHelperHandler);

  allAppHelperPics.forEach(helper => {

    const helperImg = helper.querySelector('img');

    if (helperImg.complete) {

      showAppHelper();
    
    } else {

      helperImg.addEventListener('load', handleHelperSlowLoad);
      helperImg.addEventListener('error', handleHelperSlowLoad);
    }
  });
}

// Make sure the Helper images don't appear before fully loading by making them visible on load

function handleHelperSlowLoad(event) {

  const helperImg = event.target;
  const helperPicture = helperImg.parentElement;

  if (event.type === "error") {
    console.warn(`PD Helper:\n\nFailed to load Helper image within picture #` + helperPicture.id);
    return;
  }

  showAppHelper();

	helperImg.removeEventListener('load', handleHelperSlowLoad);
  helperImg.removeEventListener('error', handleHelperSlowLoad);
}

//////////////////////////////////////////////////////////////////////////////////
// Apply user color theme before page load, set app edition version if none found
/////////////////////////////////////////////////////////////////////////////////

(() => {

  const userColorTheme = localStorage.getItem("user-color-theme");
  const userEditionVer = localStorage.getItem("user-app-edition");

  if (userColorTheme && +userEditionVer >= 1.1) {

    toggleColorTheme(userColorTheme);

    toggleAppHelpersLook(userColorTheme);

    console.log(`PD App:\n\nUser color theme retrieved`);
  }

  if (+userEditionVer < 1.1) {

    toggleColorTheme("papsofanu");

    toggleAppHelpersLook("papsofanu");

    localStorage.setItem("user-app-edition", 1.1);

    localStorage.removeItem("user-notification-seen");

    console.log(`PD App:\n\nApp edition and color theme updated`);
  }
})();

///////////////////////////////////////////////
// Initialize necessary functions on page load
//////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
  
  initAppHelperImages();
  initLaunchButtons();
  initHeaderButtons();
  initToolkitButtons();
  initSearch();
  initModals();
  initPopovers();
  initTracklist();
  initShortcuts();
});

//////////////////////////////////////////
// Register service worker on window load
/////////////////////////////////////////

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log(`PD Service Worker:\n\n` + `Registered with scope:\n` + registration.scope);
      })
      .catch((error) => {
        console.error(`PD Service Worker:\n\n` + `Registration failed!\n` + error);
      });
  });
}
