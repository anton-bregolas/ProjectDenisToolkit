/* #ProjectDenis: Search Scripts */

import { toolkitMode, addMultiEventListeners } from '../../modules/dm-toolkit.js';
import { fetchDataJsons, tracksJson, colsJson, tunesJson } from '../../modules/dm-app.js';
import { showPopoverHandler } from '../dm-popovers/dm-popovers.js';
import { toggleAriaExpanded, toggleTabIndex } from '../../modules/aria-tools.js';

// Define Search input and output elements

export const searchSection = document.querySelector('#dm-search');
export const searchInput = document.querySelector('#dm-search-input');
export const searchRadioGroup = document.querySelector('#dm-search-data-select');
export const searchResultsSection = document.querySelector('#dm-search-results');
export const searchResultsDiv = document.querySelector('.dm-search-results-container');

// Define search result template and result item sections

const searchItemTemplate = document.querySelector('.dm-template-search-item');
const searchResultsItems = document.querySelectorAll('.dm-btn-search-item');
const searchResultsGroup = document.querySelector('.dm-search-results-group');
const searchResultsWrapper = document.querySelector('.dm-btn-search-wrap');
const searchResultsCounter = document.querySelector('#dm-search-results-found');

// Define variable affecting search input behavior

const minSearchLength = 2;
const searchTimeoutValue = 100;
let searchTimeout;

// Process search input and pass on value to showSearchMatches

async function searchDatabaseHandler() {

  let searchValue = searchInput.value.trim();

  if (searchValue.length < minSearchLength) {

    searchResultsDiv.textContent = "";

    return;
  }

  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {

    searchResultsDiv.textContent = "";
   
    const searchKeyword = searchValue.toLowerCase();

    showSearchMatches(searchKeyword);

  }, searchTimeoutValue);
}

// Filter Tune Data and display items matching the search input

async function showSearchMatches(keyword) {

  const dataTypeSelected = document.querySelector('input[name="search-data-type"]:checked').value;

  const colSearchKeys = [
    {"colname": "Name"}, 
    {"source": "Source"}, 
    {"performers": "Performers"},
    {"refcode": "Ref. Code"}, 
    {"pubcode": "Pub. Code"}, 
    {"colrefno": "Ref. No."},
    {"recyear": "Rec. Year"},
    {"pubyear": "Pub. Year"},
    {"colnotes": "Notes [1]"}, 
    {"colnotes2": "Notes [2]"}, 
    {"colnotes3": "Notes [3]"},
    {"coltype": "Type"}];

  const tuneSearchKeys = [
    {"tunename": "Name"},
    {"altnames": "Alt. Name"},
    {"tunetype": "Type"},
    {"tuneref": "Col. Ref"}
  ];

  const trackSearchKeys = [
    {"tunename": "Name"},
    {"altnames": "Alt. Name"},
    {"performers": "Performers"}, 
    {"tunetype": "Type"},
    {"refno": "Ref. No."},
    {"tuneref": "Col. Ref."},
    {"recyear": "Rec. Year"},
    {"pubyear": "Pub. Year"},
    {"tracknotes": "Notes"},
    {"category": "Category"}
  ];

  let searchKeys = dataTypeSelected === "cols" ? colSearchKeys : 
    dataTypeSelected === "tunes"? tuneSearchKeys : trackSearchKeys;

  let searchJson = dataTypeSelected === "cols" ? colsJson : 
    dataTypeSelected === "tunes"? tunesJson : tracksJson;

  searchKeys.forEach(keyObj => {

    for(let i = 0; i < searchJson.length; i++) {

      const jsonKey = Object.keys(keyObj)[0];

      if (searchJson[i][jsonKey].toLowerCase().includes(keyword)) {

        const searchItem = searchItemTemplate.content.cloneNode(true).children[0];
        const searchItemType = searchItem.querySelector('.dm-search-item-type');
        const searchItemName = searchItem.querySelector('.dm-search-item-name');
        const searchItemRefno = searchItem.querySelector('.dm-search-item-refno');

        if (dataTypeSelected === "cols") {

          let colName = searchJson[i].colname;
          let colRefNo = searchJson[i].colrefno

          searchItemType.textContent = `Found In: Col. ${keyObj[jsonKey]}`;
          searchItemName.textContent = colName;
          searchItemRefno.textContent = `${colRefNo} | ${searchJson[i].refcode}`;
  
          searchItem.setAttribute("title", colName);
          searchItem.setAttribute("data-colrefno", colRefNo);
        }

        if (dataTypeSelected === "tunes") {

          let tuneName = `${searchJson[i].tunename} (${searchJson[i].tunetype})`;
          let tuneRef = searchJson[i].tuneref;

          searchItemType.textContent = `Found In: Tune ${keyObj[jsonKey]}`;
          searchItemName.textContent = tuneName;
          searchItemRefno.textContent = tuneRef;
  
          searchItem.setAttribute("title", tuneName);
          searchItem.setAttribute("data-tuneref", tuneRef);
        }

        if (dataTypeSelected === "tracks") {

          let trackName = `${searchJson[i].tunename} (${searchJson[i].tunetype})`;
          let trackRefNo = searchJson[i].refno;

          searchItemType.textContent = `Found In: Track ${keyObj[jsonKey]}`
          searchItemName.textContent = trackName;
          searchItemRefno.textContent = `No. ${trackRefNo}`;
  
          searchItem.setAttribute("title", trackName);
          searchItem.setAttribute("data-refno", trackRefNo);
        }

        searchResultsDiv.append(searchItem);
      }
    }
  });
}

// Modify search results when search radio value changes

function searchRadioHandler() {

  let searchValue = searchInput.value.trim();

  if (searchValue) {

    if (searchValue.length < minSearchLength) {

      return;
    }

      searchResultsDiv.textContent = "";

      showSearchMatches(searchValue.toLowerCase());

      if (searchResultsDiv.lastElementChild) {

        autoExpandSearchResults();

      } else {

        autoCollapseSearchResults();
      }
  }
}

// Modify search section when input gains or loses focus

function searchFocusHandler(event) {

  if (event.type === "focus") {

    searchResultsSection.classList.add("outlined");
  }

  if (event.type === "blur") {

    searchResultsSection.classList.remove("outlined");
  }
}

// Automatically unwrap expandable search result region

function autoExpandSearchResults() {

  if (searchResultsSection.classList.contains("unwrapped")) {

    return;
  }

  searchResultsSection.classList.add("unwrapped");

  toggleAriaExpanded(searchResultsWrapper);

  if (searchResultsDiv.lastElementChild && searchResultsDiv.lastElementChild.hasAttribute("tabindex")) {

    toggleTabIndex(searchResultsDiv);
  }

  setTimeout(() => {
    searchResultsGroup.classList.add("scrollable");
  }, 250);
}

// Automatically collapse expandable search result region

export function autoCollapseSearchResults() {

  if (!searchResultsSection.classList.contains("unwrapped")) {

    return;
  }

  searchResultsSection.classList.remove("unwrapped");

  // searchResultsGroup.classList.remove("scrollable");

  toggleAriaExpanded(searchResultsWrapper);

  if (searchResultsDiv.lastElementChild) {

    toggleTabIndex(searchResultsDiv);
  }

  setTimeout(() => {
    searchResultsGroup.classList.remove("scrollable");
  }, 150);
}

// Trigger wrapping or unwrapping of expandable search result region

function toggleExpandSearchResults(event) {

  let closestWrapper = event.target.closest(".dm-btn-search-wrap");
   
  toggleTabIndex(searchResultsDiv);

  if (closestWrapper.getAttribute("aria-expanded") === "true") {

    searchResultsSection.classList.remove("unwrapped");

    // searchResultsGroup.classList.remove("scrollable");
    
    toggleAriaExpanded(closestWrapper);

    setTimeout(() => {
      searchResultsGroup.classList.remove("scrollable");
    }, 150);
    
    return;
  }

  searchResultsSection.classList.add("unwrapped");
  toggleAriaExpanded(closestWrapper);

  setTimeout(() => {
    searchResultsGroup.classList.add("scrollable");
  }, 250);
}

// Collapse search results retion if clicked outside of Search section

export function searchInputSoftClose(event) {

  console.warn(event.relatedTarget);

  if (searchSection.contains(event.relatedTarget)) {

    return;
  }

  autoCollapseSearchResults();
}

// Add event listeners to the search elements

export function initSearch() {

  searchInput.addEventListener('focus', autoExpandSearchResults);

  searchInput.addEventListener('blur', searchInputSoftClose);
 
  searchInput.addEventListener('input', searchDatabaseHandler);

  searchResultsDiv.addEventListener('click', showPopoverHandler);

  searchRadioGroup.addEventListener('change', searchRadioHandler);

  searchResultsWrapper.addEventListener('click', toggleExpandSearchResults);
}