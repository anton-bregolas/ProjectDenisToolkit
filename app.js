///////////////////////////////////////////////////////////////////////
// #ProjectDenis Toolkit
//
// TSV to JSON Parser v.1.1
// JSON Splitter v.1.0
///////////////////////////////////////////////////////////////////////

const colHeaderKeys = ["colrefno", "trackstotal", "colname", "pubcode", "source", "refcode", "coltype", "recyear", "pubyear", "recyearfrom", "recyearto", "performers", "colnotes", "colnotes2", "colnotes3", "srclink", "dgslink", "tsolink", "itilink", "rmtlink", "strlink"];
const trackKeys = ["refno", "trackno", "tunename", "tunetype", "altnames", "tuneref", "category", "recyear", "pubyear", "recyearfrom", "recyearto", "performers", "transcriptlink", "refsettinglink", "tracknotes"];
const inputDiv = document.getElementById("inputString");
const outputDiv = document.getElementById('output');
const colsDiv = document.getElementById('cols-output');
const tracksDiv = document.getElementById('tracks-output');
const tunesDiv = document.getElementById('tunes-output');

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

function displayWarning(message) {

    if (message) {

        outputDiv.innerText = `Error! ${message}`;
        return;
    }

    outputDiv.innerText = "Invalid input!\n\n- Collection header strings should begin with reference numbers divisible by 1000\n\n- Track strings should begin with individual track reference numbers and must not contain decimal points";
}

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
        outputDiv.innerText = JSON.stringify(result, null, 2);
    }
}

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

async function parseFromFile() {

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt, .tsv';

    try {

        fileInput.onchange = async function() {

            const file = this.files[0];

            try {

                const fileContent = await readFileContent(file);
    
                const lines = fileContent.split('\n').filter(line => line.trim() !== '');

                outputDiv.textContent = '';
    
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

function clearOutput() {

    inputDiv.value = "";
    outputDiv.textContent = "";
    colsDiv.textContent = "";
    tracksDiv.textContent = "";
    tunesDiv.textContent = "";
}

function parseTabSeparatedString(line, keys) {

    const values = line.trim().split('\t');
    const obj = {};

    keys.forEach((key, index) => {

        obj[key] = values[index] && values[index].trim() !== "N/A" ? values[index].trim() : "";
    });

    return obj;
}

function filterOutput(mixedJson) {

    if (Array.isArray(mixedJson) || mixedJson.length > 0) {

        let collectionsArr = [];
        let tracksArr = [];
        let tunesArr = [];

        collectionsArr = mixedJson.filter(obj => checkObjectType(obj, "colrefno"));
        tracksArr = mixedJson.filter(obj => checkObjectType(obj, "refno"));
        
        if (tracksArr.length > 0) {
        
            createTuneList(tracksArr).then(result => {
                tunesArr.push(...result);
                colsDiv.innerText = JSON.stringify(collectionsArr, null, 2);
                tracksDiv.innerText = JSON.stringify(tracksArr, null, 2);
                tunesDiv.innerText = JSON.stringify(tunesArr, null, 2);
                return;
            });

        } else if (collectionsArr.length > 0) {

            colsDiv.innerText = JSON.stringify(collectionsArr, null, 2);
            tracksDiv.innerText = "No tracks data found in JSON.";
            tunesDiv.innerText = "No tune data found in JSON.";
            return;
        }
    }

    colsDiv.innerText = "No collections data found in JSON.";
    tracksDiv.innerText = "No tracks data found in JSON.";
    tunesDiv.innerText = "No tune data found in JSON.";
}

async function createTuneList(tracks) {

    try {

        let tunesMap = new Map();

        tracks.forEach(track => {

            const { tuneref, tunename, tunetype, altnames, refno, transcriptlink, refsettinglink } = track;

            if (!tunesMap.has(tuneref)) {

                tunesMap.set(tuneref, { tuneref, tunename, tunetype, altnames, refno, transcriptlink, refsettinglink });

            } else {

                const existingTune = tunesMap.get(tuneref);
                existingTune.refno += `, ${refno}`;
                
                if (transcriptlink) {

                    if (existingTune.transcriptlink) {

                        existingTune.transcriptlink += `, ${transcriptlink}`;

                    } else {
                        
                        existingTune.transcriptlink = transcriptlink;
                    }
                }

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

document.addEventListener("DOMContentLoaded", () => {

    const parseSingleStringBtn = document.getElementById("parseSingleString");
    const parseFromFileBtn = document.getElementById("parseFromFile");
    const saveOutputFileBtn = document.getElementById("saveOutputFile");
    const clearOutputBtn = document.getElementById("clearOutput");

    const splitMixedJsonBtn = document.getElementById("splitMixedJson");
    const getCollectionsBtn = document.getElementById("getCollections");
    const getTracksBtn = document.getElementById("getTracks");
    const getTunesBtn = document.getElementById("getTunes");

    const allBtn = document.querySelectorAll(".btn");
    const themeBtn = document.querySelector('.n-theme-btn');
    const sunIcon = themeBtn.querySelector('.n-theme-icon-sun');
    const moonIcon = themeBtn.querySelector('.n-theme-icon-moon');

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
                btn.classList.add('hovered');
                let btnText = btn.querySelector('.btn-text');
                let btnIcon = btn.querySelector('.btn-icon');
                btnText?.classList.add('enlarged');
                btnIcon?.classList.add('enlarged');
            });
        });
    });

    ['mouseout', 'focusout'].forEach(event => {
        allBtn.forEach(btn => {
            btn.addEventListener(event, () => {
                btn.classList.remove('hovered');
                let btnText = btn.querySelector('.btn-text');
                let btnIcon = btn.querySelector('.btn-icon');
                btnText?.classList.remove('enlarged');
                btnIcon?.classList.remove('enlarged');
            });
        });
    });

    // Light / dark theme toggle button

    themeBtn.addEventListener('click', () => {
    
        let ariaLabel = document.body.classList.contains("light")? "Dark theme is on" : "Light theme is on";

        themeBtn.setAttribute("aria-label", ariaLabel);
        document.body.classList.toggle("light");
        sunIcon.classList.toggle("hidden");
        moonIcon.classList.toggle("displayed");
    });
});

