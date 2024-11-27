/* #ProjectDenis: Search Scripts */

import { showPopoverHandler } from '../dm-popovers/dm-popovers.js';
import { searchSection, tracksJson, colsJson, tunesJson } from '../../modules/dm-app.js';
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

const minSearchLength = 3;
const searchTimeoutValue = 150;
let searchTimeout;

// Define stop words for multi-word search

const stopWordsList = ["a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "from", "if", "in", "into", "is", "it", "no", "not", "of", "on", "or", "such", "that", "the", "their", "then", "there", "these", "they", "this", "to", "was", "will", "with"];

// Define total item counters

export const tracksCounter = document.querySelector('.dm-tracks-counter');
export const colsCounter = document.querySelector('.dm-cols-counter');
export const tunesCounter = document.querySelector('.dm-tunes-counter');

// Process search string: replace capital letters with lower case, latinize diactritics 

export function processString(string) {
  
  return string.toLowerCase().replace(/[\u2018\u2019\u0060\u00B4]/g, `'`).normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

// Process search input and pass on value to getSearchMatches

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
   
    doMultiWordSearch(searchValue);

  }, searchTimeoutValue);
}

// Call getSearchMatches for each valid keyword to asynchronously search and print results

async function asyncSearchFor(keyword) {

  if (!stopWordsList.includes(keyword) && keyword.length >= minSearchLength) {

      const matchesCount = await getSearchMatches(keyword);
        
      console.log(`PD Search Engine:\n\nFound ${matchesCount} more unique result(s) by Split Search for "${keyword}"`);

      return matchesCount;
  }

  return 0;
}

// Try searching for a phrase and then each keyword separately, count search results

async function doMultiWordSearch(keyword) {

  let exactSearchCounter = 0;
  let splitSearchCounter = 0;
  let totalSearchCounter;

  exactSearchCounter = await getSearchMatches(keyword);

  console.log(`PD Search Engine:\n\nFound ${exactSearchCounter} result(s) by Exact Search for "${keyword}"`);

  if (exactSearchCounter > 0) {

    const resultsSeparator = document.createElement("div");
    resultsSeparator.classList.add("dm-search-results-separator");
    resultsSeparator.setAttribute("data-resultsgroup", "exact-matches");

    const resultsSeparatorText = document.createElement("p");
    resultsSeparatorText.textContent = "Exact matches found";
    resultsSeparator.append(resultsSeparatorText);

    searchResultsDiv.prepend(resultsSeparator);
  }
  
  let searchSplitKeyword = keyword.split(' ');

  if (searchSplitKeyword.length > 1) {

    const multiResultsSeparator = document.createElement("div");
    multiResultsSeparator.classList.add("dm-search-results-separator");
    multiResultsSeparator.setAttribute("data-resultsgroup", "partial-matches");

    const multiResultsSeparatorText = document.createElement("p");
    multiResultsSeparatorText.textContent = "Partial matches found";
    multiResultsSeparator.append(multiResultsSeparatorText);

    searchResultsDiv.append(multiResultsSeparator);

    try {

      const asyncSearchResults = searchSplitKeyword.map(keyword => asyncSearchFor(keyword));

        const matchesCountArr = await Promise.all(asyncSearchResults);

        splitSearchCounter = matchesCountArr.reduce((sum, count) => sum + count, 0);
        
    } catch (error) {

      console.warn(`PD Search Engine:\n\n Split search failed, details:\n\n`, error);
    }

    if (splitSearchCounter === 0) {

      multiResultsSeparator.setAttribute("style", "display: none");
    }
  }

  totalSearchCounter = exactSearchCounter + splitSearchCounter;

  searchResultsCounter.textContent = totalSearchCounter === 1? `Found 1 item` : `Found ${totalSearchCounter} items`;
}

// Filter Tune Data and display items matching the search input, return the total number of items shown

async function getSearchMatches(keyword) {

  const filteredKeyword = processString(keyword);

  const dataTypeSelected = document.querySelector('input[name="search-data-type"]:checked').value;

  const colSearchKeys = [
    {"colname": "name"}, 
    {"source": "source"}, 
    {"performers": "performers"},
    {"refcode": "ref. code"}, 
    {"pubcode": "pub. code"}, 
    {"colrefno": "ref. no."},
    {"recyear": "rec. year"},
    {"pubyear": "pub. year"},
    {"colnotes": "notes [1]"}, 
    {"colnotes2": "notes [2]"}, 
    {"colnotes3": "notes [3]"},
    {"coltype": "type"}];

  const tuneSearchKeys = [
    {"tunename": "name"},
    {"altnames": "alt. name"},
    {"tunetype": "type"},
    {"tuneref": "col. ref"}
  ];

  const trackSearchKeys = [
    {"tunename": "name"},
    {"altnames": "alt. name"},
    {"performers": "performers"}, 
    {"tunetype": "type"},
    {"refno": "ref. no."},
    {"tuneref": "col. ref."},
    {"recyear": "rec. year"},
    {"pubyear": "pub. year"},
    {"tracknotes": "notes"},
    {"category": "category"}
  ];

  let searchKeys = dataTypeSelected === "cols" ? colSearchKeys : 
    dataTypeSelected === "tunes"? tuneSearchKeys : trackSearchKeys;

  let searchJson = dataTypeSelected === "cols" ? colsJson : 
    dataTypeSelected === "tunes"? tunesJson : tracksJson;

  let foundResults = 0;
  let filteredResults = 0;
  let resultsShown;

  searchKeys.forEach(keyObj => {

    for(let i = 0; i < searchJson.length; i++) {

      const jsonKey = Object.keys(keyObj)[0];

      if (processString(searchJson[i][jsonKey]).includes(filteredKeyword)) {

        foundResults++;

        const searchItem = searchItemTemplate.content.cloneNode(true).children[0];
        const searchItemType = searchItem.querySelector('.dm-search-item-type');
        const searchItemName = searchItem.querySelector('.dm-search-item-name');
        const searchItemRefno = searchItem.querySelector('.dm-search-item-refno');

        searchItem.setAttribute("data-type", jsonKey);

        if (jsonKey === "tunename" || jsonKey === "altnames" || jsonKey === "colname") {
          searchItemType.setAttribute("data-type", "name");
        }

        if (dataTypeSelected === "cols") {

          let colName = searchJson[i].colname;
          let colRefNo = searchJson[i].colrefno;

          searchItemType.textContent = `col. ${keyObj[jsonKey]}`;
          searchItemName.textContent = colName;
          searchItemRefno.textContent = `${colRefNo} | ${searchJson[i].refcode}`;
  
          searchItem.setAttribute("title", colName);
          searchItem.setAttribute("data-colrefno", colRefNo);
        }

        if (dataTypeSelected === "tunes") {

          let tuneName = searchJson[i].tunename;
          let tuneRef = searchJson[i].tuneref;
                    
          if (jsonKey === "altnames") {

            const altNamesArr = searchJson[i][jsonKey].split(" / ");
            tuneName = altNamesArr.find(altname => processString(altname).includes(filteredKeyword));
          }

          tuneName = `${tuneName} (${searchJson[i].tunetype})`;

          searchItemType.textContent = `tune ${keyObj[jsonKey]}`;
          searchItemName.textContent = tuneName;
          searchItemRefno.textContent = tuneRef;
  
          searchItem.setAttribute("title", tuneName);
          searchItem.setAttribute("data-tuneref", tuneRef);
        }

        if (dataTypeSelected === "tracks") {

          let trackName = searchJson[i].tunename;
          let trackRefNo = searchJson[i].refno;

          if (jsonKey === "altnames") {

            const altNamesArr = searchJson[i][jsonKey].split(" / ");
            trackName = altNamesArr.find(altname => processString(altname).includes(filteredKeyword));
          }          

          trackName = `${trackName} (${searchJson[i].tunetype})`;

          searchItemType.textContent = `track ${keyObj[jsonKey]}`
          searchItemName.textContent = trackName;
          searchItemRefno.textContent = `No. ${trackRefNo}`;
  
          searchItem.setAttribute("title", trackName);
          searchItem.setAttribute("data-refno", trackRefNo);
        }

        if (isDuplicateResult(searchResultsDiv, searchItem)) {

          filteredResults++;
          return;
        }

        if (!isDuplicateResult(searchResultsDiv, searchItem)) {

          searchItemType.textContent = `“${keyword}”: ` + searchItemType.textContent;
          searchResultsDiv.append(searchItem);
        }
      }
    }
  });

  resultsShown = foundResults - filteredResults;

  // if (filteredResults > 0) {
  //   console.log(`PD Search Engine:\n\nFiltered out ${filteredResults} result(s) when searching for "${keyword}"`);
  // }

  return resultsShown;
}

// Check if the next search result is a duplicate of an already found item

function isDuplicateResult(resultsDiv, newItem) {

  const searchResults = resultsDiv.children;

  for (let i = 0; i < searchResults.length; i++) {

    // Clone and filter search object to ensure same objects with different parts of keyword displayed don't pass

    const filteredObject = searchResults[i].cloneNode(true);

    const typeSpan = filteredObject.firstElementChild;

    typeSpan.textContent = typeSpan.textContent.split('”: ')[1];

      if (filteredObject.isEqualNode(newItem)) {

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

      doMultiWordSearch(searchValue);

      if (searchResultsDiv.lastElementChild) {

        autoExpandSearchResults();
      }
  }
}

// Return the number of search results based on the length of searchResultsDiv, excluding the separator(s) from the count

function countSearchResults() {

  const resultsTotalLength = searchResultsDiv.children.length;

  const separatorsLength = [...document.getElementsByClassName("dm-search-results-separator")].length;

  return resultsTotalLength - separatorsLength;
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