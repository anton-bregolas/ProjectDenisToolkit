///////////////////////////////////////////////////////////////////////
// #ProjectDenis Toolkit
//
// #ProjectDenis TSV to JSON Parser v.1.0
///////////////////////////////////////////////////////////////////////

const colHeaderKeys = ["colrefno", "trackstotal", "colname", "pubcode", "source", "refcode", "coltype", "recyear", "pubyear", "recyearfrom", "recyearto", "performers", "colnotes", "colnotes2", "colnotes3", "srclink", "dgslink", "tsolink", "itilink", "rmtlink", "strlink"];
const trackKeys = ["refno", "trackno", "tunename", "tunetype", "altnames", "colref", "category", "recyear", "pubyear", "recyearfrom", "recyearto", "performers", "transcriptlink", "refsettinglink", "tracknotes"];
const inputDiv = document.getElementById("inputString");
const outputDiv = document.getElementById('output');

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

function displayWarning() {

    outputDiv.innerText = "Invalid input!\n\n- Collection header strings should begin with reference numbers divisible by 1000\n\n- Track strings should begin with individual track reference numbers and must not contain decimal points";
}


function parseSingleString() {

    const inputString = document.getElementById("inputString").value;
    outputDiv.textContent = "";

    if (inputString.trim() !== '') {

        const keysToUse = checkStringType(inputString);

        if (!keysToUse) {

            displayWarning();
            return;
        }

        const result = parseTabSeparatedString(inputString, keysToUse);
        outputDiv.innerText = JSON.stringify(result, null, 2);
    }
}

function parseFromFile() {

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt, .tsv';

    fileInput.onchange = function() {

        const file = this.files[0];
        const reader = new FileReader();

        reader.onload = function() {

            const lines = this.result.split('\n').filter(line => line.trim() !== '');
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

                outputDiv.innerText = JSON.stringify(resultArray, null, 2);

            } else {

                displayWarning();
                return;
            }
        };

        reader.readAsText(file);
    };

    fileInput.click();
}

function saveOutputFile() {

    const outputContent = document.getElementById("output").textContent;
    const blob = new Blob([outputContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = 'output.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function clearOutput() {

    document.getElementById("output").textContent = "";
    document.getElementById("inputString").value = "";
}

function parseTabSeparatedString(line, keys) {

    const values = line.trim().split('\t');
    const obj = {};

    keys.forEach((key, index) => {

        obj[key] = values[index] && values[index].trim() !== "N/A" ? values[index].trim() : "";
    });

    return obj;
}

document.addEventListener("DOMContentLoaded", function() {

    const parseSingleStringBtn = document.getElementById("parseSingleString");
    const parseFromFileBtn = document.getElementById("parseFromFile");
    const saveOutputFileBtn = document.getElementById("saveOutputFile");
    const clearOutputBtn = document.getElementById("clearOutput");

    const allBtn = document.querySelectorAll(".btn");
    const themeBtn = document.querySelector('.n-theme-btn');
    const sunIcon = themeBtn.querySelector('.n-theme-icon-sun');
    const moonIcon = themeBtn.querySelector('.n-theme-icon-moon');

    parseSingleStringBtn.addEventListener("click", parseSingleString);
    parseFromFileBtn.addEventListener("click", parseFromFile);
    saveOutputFileBtn.addEventListener("click", saveOutputFile);
    clearOutputBtn.addEventListener("click", clearOutput);

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

    inputString.focus();
});
