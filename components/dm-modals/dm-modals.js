/* #ProjectDenis: Modal Dialogs Scripts */

import { colsDiv, tracksDiv, tunesDiv, validateJson, generateTunelistBtn, generateColsListBtn, generateTracklistBtn } from '../../modules/dm-toolkit.js';
import { showTunePopover, showColPopover } from '../dm-popovers/dm-popovers.js';
import { tracklistDiv, tracklistOutput, generateTracklist, tracklistHeaders } from '../dm-tracklist/dm-tracklist.js';         
import { toggleAriaHidden, toggleTabIndex, setAriaLabel } from '../../modules/aria-tools.js';
import { tunesJsonLink, tracksJsonLink, colsJsonLink, fetchData } from '../../modules/dm-app.js';

export const tunelistDiv = document.querySelector('#dm-tunelist');
export const colsListDiv = document.querySelector('#dm-collist');
export const dialogsDiv = document.querySelector('#dm-dialogs');
export const tunelistDialog = document.querySelector('#dm-modal-list-tunes');
export const colsListDialog = document.querySelector('#dm-modal-list-cols');
const closeTunelistBtn = document.querySelector('#dm-btn-tunelist-close');
const closeColsListBtn = document.querySelector('#dm-btn-colslist-close');

// Launch List Generator function depending on the button pressed

export async function generateHandler() {

  const genBtn = this;

  let parentDialog;
  let parentDialogDiv;
  let parentDiv;
  let listName;
  let itemName;

  if (genBtn === generateTunelistBtn) {

    parentDialog = tunelistDialog;
    parentDialogDiv = tunelistDiv;
    parentDiv = tunesDiv;
    listName = "Tune";
    itemName = "tunes";
  }

  if (genBtn === generateColsListBtn) {

    parentDialog = colsListDialog;
    parentDialogDiv = colsListDiv;
    parentDiv = colsDiv;
    listName = "Collections ";
    itemName = "collections";
  }

  if (genBtn === generateTracklistBtn) {

    parentDialogDiv = tracklistDiv;
    parentDiv = tracksDiv;
    listName = "Track";
    itemName = "tracks";
  }

  const counterDiv = parentDiv.previousElementSibling;
  const jsonData = parentDiv.textContent;
  let parentJson = await validateJson(jsonData);

  if (parentJson.length === 0) {

    parentJson = parentDiv === tunesDiv? await fetchData(tunesJsonLink, "json") :

                 parentDiv === colsDiv? await fetchData(colsJsonLink, "json") :

                 await fetchData(tracksJsonLink, "json");
  }

  if (Array.isArray(parentJson) && parentJson.length > 0) {

      if (!parentDialogDiv.children.length > 0) {

        console.log(`Generating list of ${itemName}...`);

        if (genBtn === generateTunelistBtn) {

          generateTunelist(parentJson);
        }
  
        if (genBtn === generateColsListBtn) {
  
          generateColsList(parentJson);
        }
  
        if (genBtn === generateTracklistBtn) {
  
          tracklistDiv.setAttribute("data-sortedby", "refno-ascending");
          tracklistHeaders.forEach(header => header.removeAttribute("data-order"));
          await generateTracklist(parentJson);
          tracklistHeaders[0].setAttribute("data-order", "ascending");
          tracklistDiv.setAttribute("aria-label", "Tracklist sorted by refno in ascending order");
        }

      } else {

        console.log(`${listName}list found, ${itemName} total: ${parentJson.length}`);
      }

      if (genBtn === generateTracklistBtn) {

        tracklistOutput.classList.toggle("hidden");
        toggleAriaHidden(tracklistOutput);
        return;
          
      } else {

        dialogsDiv.classList.toggle("hidden");
        toggleAriaHidden(dialogsDiv);
        toggleAriaHidden(parentDialog);
        parentDialog.showModal();
        return;
      }  
  }  

    console.warn(`No ${itemName} found!`)
    counterDiv.focus({ focusVisible: true });
}

// Create Tunelist modal dialog populated with Tune items

export async function generateTunelist(tunesJson) {

  tunelistDiv.textContent = "";

  tunesJson.forEach(tune => {

    const tuneRef = tune.tuneref;
    const tuneName = tune.tunename;
    const tuneType = tune.tunetype;
    const tuneAltName = tune.altnames.split(" / ")[0];

    const tuneAltNameSpan = document.createElement("span");
    const tuneNameSpan = document.createElement("span");
    const tuneItem = document.createElement("button");
    const tuneItemWrapper = document.createElement("div");

    tuneAltNameSpan.classList.add("dm-tunelist-item-alttitle");
    tuneNameSpan.classList.add("dm-tunelist-item-title");
    tuneItem.classList.add("dm-tunelist-item");
    tuneItemWrapper.classList.add("dm-tunelist-item-wrapper");

    tuneAltNameSpan.textContent = tuneAltName !== ""? `${tuneAltName} (${tuneType})` : 
                                  `(${tuneType})`;

    tuneNameSpan.textContent = tuneName.endsWith(", The")? tuneName.slice(0, -5) : 
                               tuneName.endsWith(", A")? tuneName.slice(0, -3) : 
                               tuneName.endsWith(")")? tuneName.split(" (")[0] : 
                               tuneName;

    tuneItem.appendChild(tuneNameSpan);
    tuneItem.appendChild(tuneAltNameSpan);
    tuneItem.setAttribute("data-tuneref", tuneRef);
    tuneItem.addEventListener('click', showTunePopover);
    tuneItemWrapper.appendChild(tuneItem);
    tunelistDiv.appendChild(tuneItemWrapper);
  });

  console.log(`Tunelist generated, tunes total: ${tunesJson.length}`);
}

// Create Collection List modal dialog populated with Collection items

export async function generateColsList(colsJson) {

  colsListDiv.textContent = "";

  colsJson.forEach(colObject  => {

    const colRefNo = colObject.colrefno;
    const colRefCode = colObject.refcode;
    const colName = colObject.colname;
    const colSource = colObject.source;
    const colPubCode = colObject.pubcode;
    const colPubYear = colObject.pubyear;
    const colRecYear = colObject.recyear;

    let colYear = colPubYear && colRecYear? `${colPubYear}. Recorded in ${colRecYear}` : 
                  colPubYear && !colRecYear? `${colPubYear}. Recording date unknown` : 
                  colRecYear? `Recorded in ${colRecYear}` : "Recording date unknown";
    let colSourceRef = colPubCode? `, ${colPubCode}` : "";
    let colRefText = `${colRefNo} / ${colRefCode}`;
    let colSourceText = colPubYear? `${colSource}${colSourceRef}, ${colYear}` : `${colSource}${colSourceRef}. ${colYear}`;

    const colRow = document.createElement("div");
    colRow.classList.add("dm-collist-row");

    for (let i = 0; i < 3; i++) {

      const colItem = document.createElement("div");
      colItem.classList.add("dm-collist-item");

      const colRowCont = i === 0? document.createElement("button") : document.createElement("p");
      const colRowContClass = i === 0? "dm-btn-col-open" : "dm-collist-text";

      if (i === 0) {
        colRowCont.setAttribute("title", "Show Collection Card");
      }

      colRowCont.classList.add(colRowContClass);
      colRowCont.textContent = i === 0? colRefText : i === 1? colName : colSourceText;
      
      colItem.appendChild(colRowCont);
      colRow.appendChild(colItem);
      colRow.setAttribute("data-refno", colRefNo);
      colRow.addEventListener('click', showColPopover);
    }

    colsListDiv.appendChild(colRow);
  });

  console.log(`Collections list generated, collections total: ${colsJson.length}`);
}

// Close dialog window depending on the button pressed

function closeDialogHandler() {

  let parentDialog = this === closeTunelistBtn? tunelistDialog : colsListDialog;

  parentDialog.close();
  toggleAriaHidden(parentDialog);
  dialogsDiv.classList.toggle("hidden");
  toggleAriaHidden(dialogsDiv);
}

// Add event listeners to Tunelist buttons

export function initModals() {

  [generateTunelistBtn, generateColsListBtn, generateTracklistBtn].forEach(genBtn => {

    genBtn.addEventListener('click', generateHandler);
  });
  
  [closeTunelistBtn, closeColsListBtn].forEach(btn => {

    btn.addEventListener('click', closeDialogHandler);
  });
}