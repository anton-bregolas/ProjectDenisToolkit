/* #ProjectDenis: Search Scripts */

import { showPopoverHandler } from '../dm-popovers/dm-popovers.js';
import { toolkitMode, addMultiEventListeners } from '../../modules/dm-toolkit.js';
import { searchSection, fetchDataJsons, tracksJson, colsJson, tunesJson } from '../../modules/dm-app.js';
import { toggleAriaExpanded, groupRemoveTabIndex, groupAddTabIndex, addAriaHidden, removeAriaHidden } from '../../modules/aria-tools.js';

// Define Search input and output elements

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
const searchTimeoutValue = 150;
let searchTimeout;

// Define stop words for multi-word search

const stopWordsList = ["a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "from", "if", "in", "into", "is", "it", "no", "not", "of", "on", "or", "such", "that", "the", "their", "then", "there", "these", "they", "this", "to", "was", "will", "with"];

// Define total item counters

export const tracksCounter = document.querySelector('.dm-tracks-counter');
export const colsCounter = document.querySelector('.dm-cols-counter');
export const tunesCounter = document.querySelector('.dm-tunes-counter');

// Process search input and pass on value to showSearchMatches

async function searchDatabaseHandler() {

  let searchValue = searchInput.value.trim();

  if (searchValue.length < minSearchLength) {

    searchResultsDiv.textContent = "";

    searchResultsCounter.textContent = "";

    return;
  }

  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {

    searchResultsDiv.textContent = "";
   
    const searchKeyword = searchValue.toLowerCase();

    doMultiWordSearch(searchKeyword);

    searchResultsCounter.textContent = `Found ${searchResultsDiv.children.length} items`;

  }, searchTimeoutValue);
}

// Try searching for a phrase and then each keyword separately

async function doMultiWordSearch(keyword) {

  showSearchMatches(keyword);

  console.log(`PD Search Engine:\n\nFound ${searchResultsDiv.children.length} result(s) by keyword search`);

  let searchMultiWord = keyword.split(' ');

  if (searchMultiWord.length > 1) {

    for (let i = 0; i < searchMultiWord.length; i++) {

      if (stopWordsList.includes(searchMultiWord[i])) {

        console.log(`PD Search Engine:\n\n"${searchMultiWord[i]}" found in search stop list`);
      }

      // console.warn(`Doing search #${i + 1}`);

      if (!stopWordsList.includes(searchMultiWord[i])) {

        showSearchMatches(searchMultiWord[i]);
      }
    }
  }
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

  let filteredResults = 0;

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
          let colRefNo = searchJson[i].colrefno;

          searchItemType.textContent = `Found In: Col. ${keyObj[jsonKey]}`;
          searchItemName.textContent = colName;
          searchItemRefno.textContent = `${colRefNo} | ${searchJson[i].refcode}`;
  
          searchItem.setAttribute("title", colName);
          searchItem.setAttribute("data-colrefno", colRefNo);
        }

        if (dataTypeSelected === "tunes") {

          let tuneName = searchJson[i].tunename;
          let tuneRef = searchJson[i].tuneref;
                    
          if (jsonKey === "altnames") {

            console.warn(jsonKey);

            console.warn(searchJson[i][jsonKey]);

            const altNamesArr = searchJson[i][jsonKey].split(" / ");

            console.warn(altNamesArr);

            tuneName = altNamesArr.find(altname => altname.toLowerCase().includes(keyword));

            console.warn(tuneName);
          }

          tuneName = `${tuneName} (${searchJson[i].tunetype})`;

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

        if (isDuplicateResult(searchResultsDiv, searchItem)) {

          filteredResults++
        }

        if (!isDuplicateResult(searchResultsDiv, searchItem)) {

          searchResultsDiv.append(searchItem);
        }
      }
    }
  });

  console.log(`PD Search Engine:\n\nFound ${searchResultsDiv.children.length} result(s) by split word search`);

  if (filteredResults > 0) {
    console.log(`PD Search Engine:\n\nFiltered out ${filteredResults} result(s)`);
  }
}

// Check if the next search result is a duplicate of an already found item

function isDuplicateResult(resultsDiv, newItem) {

  const searchResults = resultsDiv.children;

  for (let i = 0; i < searchResults.length; i++) {

      if (searchResults[i].isEqualNode(newItem)) {

          return true;
      }
  }

  return false;
}

// Modify search results when search radio value changes

function searchRadioHandler() {

  let searchValue = searchInput.value.trim();

  searchResultsDiv.textContent = "";
  
  if (!searchValue || searchValue.length < minSearchLength) {

    searchResultsCounter.textContent = "";

    return;
  }

  if (searchValue) {

      doMultiWordSearch(searchValue.toLowerCase());

      searchResultsCounter.textContent = searchResultsDiv.children.length === 1? `Found 1 item` : 
        `Found ${searchResultsDiv.children.length} items`;

      if (searchResultsDiv.lastElementChild) {

        autoExpandSearchResults();
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

  removeAriaHidden(searchResultsSection);
  toggleAriaExpanded(searchInput);
  searchResultsSection.setAttribute("aria-label", "Search Results Expanded");
  searchResultsSection.classList.add("unwrapped");

  removeAriaHidden(searchResultsWrapper);
  toggleAriaExpanded(searchResultsWrapper);

  groupRemoveTabIndex(searchResultsGroup, "-1");

  setTimeout(() => {
    searchResultsGroup.classList.add("scrollable");
  }, 250);
}

// Automatically collapse expandable search result region

export function autoCollapseSearchResults() {

  if (!searchResultsSection.classList.contains("unwrapped")) {

    return;
  }

  toggleAriaExpanded(searchInput);

  searchResultsSection.setAttribute("aria-label", "Search Results Collapsed");
  searchResultsSection.classList.remove("unwrapped");
  addAriaHidden(searchResultsSection);

  toggleAriaExpanded(searchResultsWrapper);
  addAriaHidden(searchResultsWrapper);

  groupAddTabIndex(searchResultsGroup, "-1");

  setTimeout(() => {
    searchResultsGroup.classList.remove("scrollable");
  }, 150);
}

// Trigger wrapping or unwrapping of expandable search result region

function toggleExpandSearchResults(event) {

  let closestWrapper = event.target.closest(".dm-btn-search-wrap");
   
  toggleAriaExpanded(searchInput);

  if (closestWrapper.getAttribute("aria-expanded") === "true") {

    toggleAriaExpanded(closestWrapper);

    searchResultsSection.classList.remove("unwrapped");

    searchResultsSection.setAttribute("aria-label", "Search Results Collapsed");

    setTimeout(() => {
      searchResultsGroup.classList.remove("scrollable");
    }, 150);

    addAriaHidden(closestWrapper);

    addAriaHidden(searchResultsSection);

    groupAddTabIndex(searchResultsGroup, "-1");
    
    return;
  }

  toggleAriaExpanded(closestWrapper);

  removeAriaHidden(closestWrapper);

  removeAriaHidden(searchResultsSection);

  groupRemoveTabIndex(searchResultsGroup, "-1");

  searchResultsSection.setAttribute("aria-label", "Search Results Expanded");

  searchResultsSection.classList.add("unwrapped");

  setTimeout(() => {
    searchResultsGroup.classList.add("scrollable");
  }, 250);
}

// Collapse search results retion if clicked outside of Search section

export function searchInputSoftClose(event) {

  // console.warn(event.relatedTarget);

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