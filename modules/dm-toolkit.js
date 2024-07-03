///////////////////////////////////////////////////////////////////////
// #ProjectDenis Toolkit v.2.4
//
// List Generator v.2.0
// TSV to JSON Parser v.2.0
// JSON Splitter v.2.0
///////////////////////////////////////////////////////////////////////

import { tracklistDiv, tracklistOutput } from '../components/dm-tracklist/dm-tracklist.js'
import { tunelistDiv, colsListDiv } from '../components/dm-modals/dm-modals.js';
import { themePickerPopover } from '../components/dm-popovers/dm-popovers.js';
import { toggleAriaExpanded, toggleAriaHidden, toggleTabIndex, setAriaLabel } from './aria-tools.js';
import { tunesJsonLink, tracksJsonLink, colsJsonLink, fetchData } from './dm-app.js';

// Define keys in track and collection header objects

const colHeaderKeys = ["colrefno", "trackstotal", "colname", "pubcode", "source", "refcode", "coltype", "recyear", "pubyear", "recyearfrom", "recyearto", "performers", "colnotes", "colnotes2", "colnotes3", "srclink", "dgslink", "tsolink", "itilink", "rmtlink", "strlink"];
const trackKeys = ["refno", "trackno", "tunename", "tunetype", "altnames", "tuneref", "category", "recyear", "pubyear", "recyearfrom", "recyearto", "performers", "transcriptlink", "refsettinglink", "tracknotes"];

// Define input and output fields

export const inputDiv = document.getElementById("inputString");
export const outputDiv = document.getElementById('output');
export const colsDiv = document.getElementById('cols-output');
export const tracksDiv = document.getElementById('tracks-output');
export const tunesDiv = document.getElementById('tunes-output');

// Define Generator buttons

export const generateTunelistBtn = document.querySelector('#dm-btn-generate-tunelist');
export const generateColsListBtn = document.querySelector('#dm-btn-generate-collections');
export const generateTracklistBtn = document.querySelector('#dm-btn-generate-tracklist');

// Check if a line in a raw tsv file is a track or a collection header (= 1000s)

function checkStringType(line) {

    const firstValue = line.trim().split('\t')[0];
    const numberValue = Number(firstValue);

    if (!isNaN(numberValue) && !firstValue.includes('.')) {

        if (numberValue % 1000 === 0 && numberValue !== 0) {

            return colHeaderKeys;

        } else {

            return trackKeys;
        }
    }

    return null;
}

// Check if an object is a valid track/collection object and contains a reference number

function checkObjectType(obj, key) {

    if (obj[key]) {

        const refNo = parseInt(obj[key]);

        if (!isNaN(refNo) && refNo > 999) {

            if (key === "colrefno" && refNo % 1000 === 0) {

                return true;

            } else if (key === "refno" && refNo % 1 === 0) {
                
                return true;
            }
        }
    }

    return false;
}

// Display console warning if no usable lines are found

function displayWarning(message) {

    if (message) {

        outputDiv.innerText = `Error! ${message}`;
        return;
    }

    outputDiv.innerText = "Invalid input!\n\n- Collection header strings should begin with reference numbers divisible by 1000\n\n- Track strings should begin with individual track reference numbers and must not contain decimal points";
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
        outputDiv.innerText = resultOutput;

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

            console.log("Parsing TSV file...");

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
                    outputDiv.innerText = mixedJsonOutput;
                    filterOutput(JSON.parse(mixedJsonOutput));
    
                } else {
    
                    displayWarning();
                    return;
                }

            } catch (error) {
                console.error('Error reading file content:', error);
                displayWarning(error.message);
            }}
        
        fileInput.click();

    } catch (error) {

        console.error("parseFromFile sequence failed!");
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

                console.error("Error! No JSON file selected.");
                displayWarning(error.message);
            }
        });

        fileInput.click();

    } catch (error) {

        console.error("Error! splitMixedJson sequense failed.");
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

    inputDiv.value = "";
    outputDiv.textContent = "";
    colsDiv.textContent = "";
    tracksDiv.textContent = "";
    tunesDiv.textContent = "";
    colsDiv.previousElementSibling.textContent = `Collections: 0`;
    tracksDiv.previousElementSibling.textContent = `Tracks: 0`;
    tunesDiv.previousElementSibling.textContent = `Tunes: 0`;
    tunelistDiv.textContent = ""; 
    colsListDiv.textContent = ""; 
    tracklistDiv.textContent = "";

    if (!tracklistOutput.classList.contains("hidden")) {

        tracklistOutput.classList.toggle("hidden");
        toggleAriaHidden(tracklistOutput);
        toggleAriaExpanded(generateTracklistBtn);
    }

    disableGenButtons();
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

function filterOutput(mixedJson) {

    if (Array.isArray(mixedJson) || mixedJson.length > 0) {

        let collectionsArr = [];
        let tracksArr = [];
        let tunesArr = [];

        collectionsArr = mixedJson.filter(obj => checkObjectType(obj, "colrefno"));
        tracksArr = mixedJson.filter(obj => checkObjectType(obj, "refno"));
        
        if (tracksArr.length > 0) {

            createTuneList(tracksArr).then(result => {

                tunelistDiv.textContent = "";
                console.log("Tunes JSON cleared...");

                tunesArr.push(...result);
                colsDiv.innerText = JSON.stringify(collectionsArr, null, 2);
                colsDiv.previousElementSibling.textContent = `Collections: ${collectionsArr.length}`;
                tracksDiv.innerText = JSON.stringify(tracksArr, null, 2);
                tracksDiv.previousElementSibling.textContent = `Tracks: ${tracksArr.length}`;
                tunesDiv.innerText = JSON.stringify(tunesArr, null, 2);
                tunesDiv.previousElementSibling.textContent = `Tunes: ${tunesArr.length}`;
                console.log("Tunes JSON created!");
                generateTracklistBtn.removeAttribute("disabled");
                generateTracklistBtn.focus();
                return;
            });

        } else if (collectionsArr.length > 0) {

            colsDiv.innerText = JSON.stringify(collectionsArr, null, 2);
            colsDiv.previousElementSibling.textContent = `Collections: ${collectionsArr.length}`;
            tracksDiv.innerText = "No tracks data found in JSON.";
            tracksDiv.previousElementSibling.textContent = `Tracks: 0`;
            tunesDiv.innerText = "No tune data found in JSON.";
            tunesDiv.previousElementSibling.textContent = `Tunes: 0`;
            generateTracklistBtn.removeAttribute("disabled");
            generateTracklistBtn.focus();
            return;
        }
    }

    colsDiv.innerText = "No collections data found in JSON.";
    colsDiv.previousElementSibling.textContent = `Collections: 0`;
    tracksDiv.innerText = "No tracks data found in JSON.";
    tracksDiv.previousElementSibling.textContent = `Tracks: 0`;
    tunesDiv.innerText = "No tune data found in JSON.";
    tunesDiv.previousElementSibling.textContent = `Tunes: 0`;
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

        console.log("Creating Tunes JSON...");

        tracks.forEach(track => {

            let { tuneref, tunename, tunetype, altnames, refno, transcriptlink, refsettinglink } = track;

            if (tuneref == "???" || tuneref == "") {

                tuneref = `TMP # ${refno}`;
            }

            if (tunetype == "") {

                tunetype = `Other`;
            }

            if (tunename == "") {

                tunename = `Untitled ${tunetype}`;
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

        console.error("Error! createTuneList sequence failed.");
        displayWarning(error.message);
    }
}

// Check if text output can be safely parsed as JSON, return empty array if false

export async function validateJson(jsonInput) {

    let jsonOutput;
  
      try {
  
          jsonOutput = JSON.parse(jsonInput);
  
          if (jsonOutput && typeof jsonOutput === "object") {

              return jsonOutput;
          }
      }
  
      catch (error) { 
  
        // console.warn(`JSON validator: "${error.message}"`);
      }

      return [];
}

// Add event listeners to Toolkit buttons

export async function initToolkitButtons() {

    const parseSingleStringBtn = document.getElementById("parseSingleString");
    const parseFromFileBtn = document.getElementById("parseFromFile");
    const saveOutputFileBtn = document.getElementById("saveOutputFile");
    const clearOutputBtn = document.getElementById("clearOutput");

    const splitMixedJsonBtn = document.getElementById("splitMixedJson");
    const getCollectionsBtn = document.getElementById("getCollections");
    const getTracksBtn = document.getElementById("getTracks");
    const getTunesBtn = document.getElementById("getTunes");
    const colsCounter = colsDiv.previousElementSibling;
    const tracksCounter = tracksDiv.previousElementSibling;
    const tunesCounter = tunesDiv.previousElementSibling;

    const allBtn = document.querySelectorAll(".btn");
    const allThemeBtn = document.querySelectorAll(".dm-btn-theme");
    const themeBtn = document.getElementById('theme-toggle-btn');

    parseSingleStringBtn.addEventListener("click", parseSingleString);
    parseFromFileBtn.addEventListener("click", parseFromFile);
    saveOutputFileBtn.addEventListener("click", () => saveOutputFile("output", "output"));
    clearOutputBtn.addEventListener("click", clearOutput);

    splitMixedJsonBtn.addEventListener("click", splitMixedJson);
    getCollectionsBtn.addEventListener("click", () => saveOutputFile("cols-output", "collections"));
    getTracksBtn.addEventListener("click", () => saveOutputFile("tracks-output", "tracks"));
    getTunesBtn.addEventListener("click", () => saveOutputFile("tunes-output", "tunes"));

    // Button animations

    ['mouseover', 'focusin'].forEach(event => {
        allBtn.forEach(btn => {
            btn.addEventListener(event, () => {                
                if (!btn.disabled) {
                    btn.classList.add('hovered');
                    let btnText = btn.querySelector('.btn-text');
                    let btnIcon = btn.querySelector('.btn-icon');
                    btnText?.classList.add('enlarged');
                    btnIcon?.classList.add('enlarged');
                }
            });
        });
    });

    ['mouseout', 'focusout'].forEach(event => {
        allBtn.forEach(btn => {
            btn.addEventListener(event, () => {
                if (!btn.disabled) {
                    btn.classList.remove('hovered');
                    let btnText = btn.querySelector('.btn-text');
                    let btnIcon = btn.querySelector('.btn-icon');
                    btnText?.classList.remove('enlarged');
                    btnIcon?.classList.remove('enlarged');
                }
            });
        });
    });

    // Color theme toggle buttons

    allThemeBtn.forEach(btn => {

        btn.addEventListener('click', () => {

            themePickerPopover.hidePopover();
            document.body.classList.value = btn.dataset.theme;

            setAriaLabel(themeBtn, `${btn.title} is on. Select color theme.`);

            allThemeBtn.forEach(btn => { 
                if (btn.classList.contains("hidden")) {
                    btn.classList.remove("hidden");
                }
            });

            btn.classList.add("hidden");

            themeBtn.focus();
        });
     });

     [colsCounter, tracksCounter, tunesCounter].forEach(counter => {

        counter.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
         })
     });

     const tunesOutput = tunelistDiv.textContent;
     const tunesJson = await validateJson(tunesOutput);

     if (tunesJson.length === 0) {

        disableGenButtons();
     }
}
