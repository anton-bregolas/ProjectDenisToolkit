///////////////////////////////////////////////////////////////////////
// #ProjectDenis Toolkit v.2.9
//
// App Launcher v.1.3
// Search Engine v.1.4
// List Generator v.2.2
// TSV to JSON Parser v.2.2
// JSON Splitter v.2.1
///////////////////////////////////////////////////////////////////////

import { tracksCounter, colsCounter, tunesCounter } from '../components/dm-search/dm-search.js';
import { tracklistDiv, tracklistOutput } from '../components/dm-tracklist/dm-tracklist.js'
import { tunelistDiv, colsListDiv } from '../components/dm-modals/dm-modals.js';
import { themePickerPopover } from '../components/dm-popovers/dm-popovers.js';
import { toggleAriaExpanded, toggleTabIndex, setAriaLabel, addAriaHidden } from './aria-tools.js';
import { doDataCheckup, updateData, clearData, launchAppSequence, tracksJson, colsJson, tunesJson } from './dm-app.js';

// Define global variable that if > 0 turns off initial fetching of Tune Data JSONs

export let toolkitMode = 0;

// Define keys in track and collection header objects

const colHeaderKeys = ["colrefno", "trackstotal", "colname", "pubcode", "source", "refcode", "coltype", "recyear", "pubyear", "recyearfrom", "recyearto", "performers", "colnotes", "colnotes2", "colnotes3", "srclink", "dgslink", "tsolink", "itilink", "rmtlink", "strlink"];
const trackKeys = ["refno", "trackno", "tunename", "tunetype", "altnames", "tuneref", "category", "recyear", "pubyear", "recyearfrom", "recyearto", "performers", "transcriptlink", "refsettinglink", "tracknotes"];

// Define keys in reflist and linklist objects

const refListKeys = ["refitemno", "refitemcode", "refpubyear", "refshortname", "reffullname", "reftype", "refdetails1", "refdetailslink1", "refdetails2", "refdetailslink2", "refdetails3", "refdetailslink3", "refdetails4", "refdetailslink4", "refdetails5", "refdetailslink5"];
const linkListKeys = ["refitemno","refitemlink", "refitemcode", "refshortname", "reffullname", "reftype", "refdetails1", "refdetailslink1", "refdetails2", "refdetailslink2", "refdetails3", "refdetailslink3", "refdetails4", "refdetailslink4", "refdetails5", "refdetailslink5"];

// Define Toolkit input and output fields

export const parserInputDiv = document.getElementById('inputString');
export const parserOutputDiv = document.getElementById('output');

export const splitterColsDiv = document.getElementById('splitter-cols-output');
export const splitterTracksDiv = document.getElementById('splitter-tracks-output');
export const splitterTunesDiv = document.getElementById('splitter-tunes-output');

// Define Toolkit Sections

export const generatorSection = document.querySelector('.dm-generator');
export const parserSection = document.querySelector('.dm-parser');
export const splitterSection = document.querySelector('.dm-splitter');

// Define Header buttons

export const allThemeBtn = document.querySelectorAll('.theme-btn');
export const themeToggleBtn = document.getElementById('theme-toggle-btn');

// Define Generator buttons

export const startExploringBtn = document.querySelector('#dm-btn-start-exploring');
export const generateTunelistBtn = document.querySelector('#dm-btn-generate-tunelist');
export const generateColsListBtn = document.querySelector('#dm-btn-generate-collections');
export const generateTracklistBtn = document.querySelector('#dm-btn-generate-tracklist');
export const generateRefListBtn = document.querySelector('#dm-btn-generate-reflist');
export const generateLinkListBtn = document.querySelector('#dm-btn-generate-linklist');

// Define Parser buttons

const parseSingleStringBtn = document.getElementById("parseSingleString");
const parseFromFileBtn = document.getElementById("parseFromFile");
const saveOutputFileBtn = document.getElementById("saveOutputFile");
const clearOutputBtn = document.getElementById("clearOutput");

// Define Splitter buttons

const splitMixedJsonBtn = document.getElementById("splitMixedJson");
const getCollectionsBtn = document.getElementById("getCollections");
const getTracksBtn = document.getElementById("getTracks");
const getTunesBtn = document.getElementById("getTunes");
const splitterColsCounter = document.getElementById("splitter-cols-counter");
const splitterTracksCounter = document.getElementById("splitter-tracks-counter");
const splitterTunesCounter = document.getElementById("splitter-tunes-counter");

// Define status bars for screenreaders

export const statusBars = document.querySelectorAll('.dm-status-bar');

// Check if a line in a raw tsv file is a track or a collection header (= 1000s)

function checkStringType(line) {

    const firstValue = line.trim().split('\t')[0];
    const numberValue = Number(firstValue);

    if (!isNaN(numberValue) && !firstValue.includes('.')) {

        if (numberValue % 1000 === 0 && numberValue !== 0) {

            return colHeaderKeys;

        } else if (numberValue > 1000) {

            return trackKeys;
        
        } else if (numberValue > 500) {

            return linkListKeys;

        } else if (numberValue > 100){

            return refListKeys;
        }
    }

    return null;
}

// Checks if an object is empty

export function isObjectEmpty(obj) {

    for(let i in obj) {

        return false;
    }

    return true;
}

// Check if an object is a valid track/collection or reflist object and contains a reference number

function checkObjectType(obj, key) {

    if (obj[key]) {

        const refNo = parseInt(obj[key]);

        if (!isNaN(refNo)) {

            if (refNo > 999) {

                if (key === "colrefno" && refNo % 1000 === 0) {

                    return true;

                } else if (key === "refno" && refNo % 1 === 0) {
                    
                    return true;
                }
            }

            if (refNo < 1000) {

                if (key === "tunerefs" && refNo < 500) {

                    return true;

                } else if (key === "linkrefs" && refNo > 500) {
                    
                    return true;
                }
            }
        }
    }

    return false;
}

// Display console warning if no usable lines are found

function displayWarning(message) {

    if (message) {

        parserOutputDiv.innerText = `Error! ${message}`;
        return;
    }

    parserOutputDiv.innerText = "Invalid input!\n\n- Collection header strings should begin with reference numbers divisible by 1000\n\n- Track strings should begin with individual track reference numbers > 1000 and must not contain decimal points\n\n- Reference list strings should begin with numbers < 1000  and must not contain decimal points";
}

// Convert a single tsv line into a track/collection object via parseTabSeparatedString, print the result to output

function parseSingleString() {

    const inputString = document.getElementById("inputString").value;

    if (inputString.trim() !== '') {

        const keysToUse = checkStringType(inputString);

        if (!keysToUse) {

            displayWarning();
            return;
        }

        clearOutput();
        const result = parseTabSeparatedString(inputString, keysToUse);
        const resultOutput = JSON.stringify(result, null, 2);
        parserOutputDiv.innerText = resultOutput;

        const resultArray = `[${resultOutput}]`;
        filterOutput(JSON.parse(resultArray));
    }
}

// Read an imported file as text file

async function readFileContent(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = (event) => {

            resolve(event.target.result);
        };

        reader.onerror = (error) => {

            reject(error);
        };

        reader.readAsText(file);
    });
}

// Convert an imported tsv file into a JSON array of track/collection objects, print the result to output

async function parseFromFile() {

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt, .tsv';

    try {

        fileInput.onchange = async function() {

            console.log("JSON Parser:\n\nParsing TSV file...");

            const file = this.files[0];

            try {

                const fileContent = await readFileContent(file);
    
                const lines = fileContent.split('\n').filter(line => line.trim() !== '');

                clearOutput();
    
                const resultArray = [];
    
                lines.forEach(line => {
    
                    const keysToUse = checkStringType(line);
    
                    if (!keysToUse) {

                        return;
                    }
    
                    resultArray.push(parseTabSeparatedString(line, keysToUse));
                });
    
                if (resultArray.length > 0) {
    
                    let mixedJsonOutput = JSON.stringify(resultArray, null, 2);
                    parserOutputDiv.innerText = mixedJsonOutput;
                    filterOutput(JSON.parse(mixedJsonOutput));
    
                } else {
    
                    displayWarning();
                    return;
                }

            } catch (error) {
                console.error('JSON Parser:\n\nError reading file content:', error);
                displayWarning(error.message);
            }}
        
        fileInput.click();

    } catch (error) {

        console.error("JSON Parser:\n\nparseFromFile sequence failed!");
        displayWarning(error.message);
    }
}

// Split an imported JSON file into collections, tracks and tunes JSONs via filterOutput

async function splitMixedJson() {

    try {

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';

        fileInput.addEventListener('change', async (event) => {

            const jsonImport = event.target.files[0];

            if (jsonImport) {

                const fileContent = await readFileContent(jsonImport);
                const jsonData = JSON.parse(fileContent);
                filterOutput(jsonData);

            } else {

                console.error("JSON Splitter:\n\nError! No JSON file selected.");
                displayWarning(error.message);
            }
        });

        fileInput.click();

    } catch (error) {

        console.error("JSON Splitter:\n\nError! splitMixedJson sequense failed.");
        displayWarning(error.message);
    }
}

// Save output content as a JSON file

function saveOutputFile(outputname, filename) {

    const outputContent = document.getElementById(outputname).textContent;
    const blob = new Blob([outputContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Disable Generate Tunelist and Collections buttons

export function disableGenButtons() {

    generateTunelistBtn.setAttribute("disabled", "");
    generateColsListBtn.setAttribute("disabled", "");
}

// Clear all output and input fields as well as counters

export function clearOutput() {

    // toolkitMode = 0;
    parserInputDiv.value = "";
    parserOutputDiv.textContent = "Data cleared.";
    splitterColsDiv.textContent = "Data cleared.";
    splitterTracksDiv.textContent = "Data cleared.";
    splitterTunesDiv.textContent = "Data cleared.";
    splitterColsCounter.firstElementChild.textContent = "0";
    splitterTracksCounter.firstElementChild.textContent = "0";
    splitterTunesCounter.firstElementChild.textContent = "0";
    tunelistDiv.textContent = ""; 
    colsListDiv.textContent = ""; 
    tracklistDiv.textContent = "";
    colsCounter.textContent = "0";
    tracksCounter.textContent = "0";
    tunesCounter.textContent = "0";
    clearData();

    if (!tracklistOutput.classList.contains("hidden")) {

        addAriaHidden(tracklistOutput);
        tracklistOutput.classList.add("hidden");
        toggleAriaExpanded(generateTracklistBtn);
    }
}

// Convert a tsv line into an object of specified type

function parseTabSeparatedString(line, keys) {

    const values = line.trim().split('\t');
    const obj = {};

    keys.forEach((key, index) => {

        obj[key] = values[index] && values[index].trim() !== "N/A" ? values[index].trim() : "";
    });

    return obj;
}

// Convert the contents of the main output into collections, tracks and tunes JSONs, print the results to respective outputs

async function filterOutput(mixedJson) {

    if (Array.isArray(mixedJson) || mixedJson.length > 0) {

        if (mixedJson[0]["refitemno"] || mixedJson[0]["linkitemno"]) {

            saveOutputFile("output", "references");
            return;
        }

        tunelistDiv.textContent = ""; 
        colsListDiv.textContent = ""; 
        tracklistDiv.textContent = "";
        clearData();

        let filteredColsJson = mixedJson.filter(obj => checkObjectType(obj, "colrefno"));
        let filteredTracksJson = mixedJson.filter(obj => checkObjectType(obj, "refno"));

        let updatedColsJson = await validateJson(filteredColsJson);
        let updatedTracksJson = await validateJson(filteredTracksJson);

        updateData(updatedColsJson, "cols");
        updateData(updatedTracksJson, "tracks");

        colsCounter.textContent = colsJson.length;
        tracksCounter.textContent = tracksJson.length;
        tunesCounter.textContent = "0";

        splitterColsCounter.firstElementChild.textContent = colsJson.length;
        splitterTracksCounter.firstElementChild.textContent = tracksJson.length;
        splitterTunesCounter.firstElementChild.textContent = "0";

        if (tracksJson.length > 0) {

            createTuneList(tracksJson).then(result => {

                updateData(result, "tunes");                

                splitterTunesCounter.firstElementChild.textContent = tunesJson.length;
                tunesCounter.textContent = tunesJson.length;

                splitterColsDiv.innerText = JSON.stringify(colsJson, null, 2);
                splitterTracksDiv.innerText = JSON.stringify(tracksJson, null, 2);
                splitterTunesDiv.innerText = JSON.stringify(tunesJson, null, 2);
                splitterSection.scrollIntoView();
                // toolkitMode = 1;
                return;
            });

        } else if (colsJson.length > 0) {

            splitterColsDiv.innerText = JSON.stringify(colsJson, null, 2);
            splitterTracksDiv.innerText = "No tracks data found in JSON.";
            splitterTunesDiv.innerText = "No tune data found in JSON.";
            splitterSection.scrollIntoView();
            // toolkitMode = 1;
            return;
        }
    }

    splitterColsDiv.innerText = "No collections data found in JSON.";
    splitterTracksDiv.innerText = "No tracks data found in JSON.";
    splitterTunesDiv.innerText = "No tune data found in JSON.";    
    // toolkitMode = 0;
}

// Filter down items to a unique comma-separated string of links removing duplicates

function filterMergeLinks(existingLinks, newLinks) {

    if (newLinks) {

        const newLinksArray = newLinks.split(/[\s,]+/).map(link => link.trim()).filter(link => link);

        if (existingLinks) {

            const linksSet = new Set(existingLinks.split(/[\s,]+/).map(link => link.trim()).filter(link => link));
            newLinksArray.forEach(link => linksSet.add(link));
            return Array.from(linksSet).join(", ");

        } else {

            return newLinksArray.join(", ");
        }
    }

    return existingLinks;
}

// Create a filtered down JSON of unique tunes from the tracks JSON

async function createTuneList(tracks) {

    try {

        let tunesMap = new Map();

        console.log("JSON Splitter:\n\nCreating Tunes JSON...");

        tracks.forEach(track => {

            let { tuneref, tunename, tunetype, altnames, refno, transcriptlink, refsettinglink } = track;

            if (tuneref == "???" || tuneref == "") {

                tuneref = `TMP # ${refno}`;
            }

            if (tunename == "") {

                tunename = `Untitled ${tunetype}`;
            }

            if (tunename.includes("(")) {

                tunename = tunename.split(" (")[0];
            }

            if (tunetype == "") {

                tunetype = `Other`;
            }

            if (!tunesMap.has(tuneref)) {

                tunesMap.set(tuneref, { tuneref, tunename, tunetype, altnames, refno, transcriptlink, refsettinglink });

            } else {

                const existingTune = tunesMap.get(tuneref);
                existingTune.refno += `, ${refno}`;

                existingTune.transcriptlink = filterMergeLinks(existingTune.transcriptlink, transcriptlink);
                existingTune.refsettinglink = filterMergeLinks(existingTune.refsettinglink, refsettinglink);

                tunesMap.set(tuneref, existingTune);
            }
        });

        const tunesArray = Array.from(tunesMap.values());
        return tunesArray.sort((a, b) => a.tunename.localeCompare(b.tunename));

    } catch (error) {

        console.error("JSON Splitter:\n\nError! createTuneList sequence failed.");
        displayWarning(error.message);
    }
}

// Check if text output can be safely parsed as JSON, return empty array if false

export async function validateJson(jsonInput) {

    let jsonOutput;
  
      try {
  
          jsonOutput = JSON.parse(JSON.stringify(jsonInput));
  
          if (jsonOutput && typeof jsonOutput === "object") {

              return jsonOutput;
          }
      }
  
      catch (error) { 

        console.warn(`JSON Validator:\n\n"${error.message}"\n\nReturning empty JSON.`);
      }

      return [];
}

// Add multiple event listeners to the element

export function addMultiEventListeners(element, events, handler) {

    events.forEach(event => element.addEventListener(event, handler));
}

// Add event listeners to Toolkit buttons

export async function initToolkitButtons() {

    startExploringBtn.addEventListener("click", launchAppSequence);

    parseSingleStringBtn.addEventListener("click", parseSingleString);
    parseFromFileBtn.addEventListener("click", parseFromFile);
    saveOutputFileBtn.addEventListener("click", () => saveOutputFile("output", "output"));
    clearOutputBtn.addEventListener("click", clearOutput);

    splitMixedJsonBtn.addEventListener("click", splitMixedJson);
    getCollectionsBtn.addEventListener("click", () => saveOutputFile("splitter-cols-output", "collections"));
    getTracksBtn.addEventListener("click", () => saveOutputFile("splitter-tracks-output", "tracks"));
    getTunesBtn.addEventListener("click", () => saveOutputFile("splitter-tunes-output", "tunes"));

    // Color theme toggle buttons

    allThemeBtn.forEach(btn => {

        btn.addEventListener('click', () => {

            if (btn === themeToggleBtn) {

                return;
            }

            themePickerPopover.hidePopover();
            document.body.classList.value = btn.dataset.theme;
            localStorage.setItem("user-color-theme", btn.dataset.theme);

            setAriaLabel(themeToggleBtn, `${btn.title} is on. Select color theme.`);

            allThemeBtn.forEach(btn => { 
                if (btn.classList.contains("hidden")) {
                    btn.classList.remove("hidden");
                }
            });

            btn.classList.add("hidden");

            themeToggleBtn.focus();
        });
     });

     [splitterColsCounter, splitterTracksCounter, splitterTunesCounter].forEach(counter => {

        counter.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
         })
     });
}
