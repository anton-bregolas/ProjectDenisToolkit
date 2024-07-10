/* #ProjectDenis: Modal Dialogs Scripts */

import { toolkitMode, statusBars, generateTunelistBtn, generateColsListBtn, generateTracklistBtn } from '../../modules/dm-toolkit.js';
import { tracklistDiv, tracklistOutput, generateTracklist, tracklistHeaders } from '../dm-tracklist/dm-tracklist.js';         
import { toggleAriaExpanded, toggleAriaHidden, addAriaHidden, removeAriaHidden } from '../../modules/aria-tools.js';
import { fetchDataJsons, tracksJson, colsJson, tunesJson } from '../../modules/dm-app.js';
import { showPopoverHandler } from '../dm-popovers/dm-popovers.js';

export const tunelistDiv = document.querySelector('#dm-tunelist');
export const colsListDiv = document.querySelector('#dm-collist');
export const libraryDiv = document.querySelector('#dm-references');
export const dialogsDiv = document.querySelector('#dm-dialogs');
export const allDialogLists = document.querySelectorAll('.dm-modal-list');
export const tunelistDialog = document.querySelector('#dm-modal-list-tunes');
export const colsListDialog = document.querySelector('#dm-modal-list-cols');
const closeTunelistBtn = document.querySelector('#dm-btn-tunelist-close');
const closeColsListBtn = document.querySelector('#dm-btn-colslist-close');

// Launch List Generator function depending on the button pressed

export async function generateHandler() {

  const genBtn = this;

  let parentJson;
  let parentDialog;
  let parentDialogDiv;
  let listName;
  let itemName;

  if (genBtn === generateTunelistBtn) {

    parentJson = tunesJson;
    parentDialog = tunelistDialog;
    parentDialogDiv = tunelistDiv;
    listName = "Tune";
    itemName = "tunes";
  }

  if (genBtn === generateColsListBtn) {

    parentJson = colsJson;
    parentDialog = colsListDialog;
    parentDialogDiv = colsListDiv;
    listName = "Collections ";
    itemName = "collections";
  }

  if (genBtn === generateTracklistBtn) {

    parentJson = tracksJson;
    parentDialogDiv = tracklistDiv;
    listName = "Track";
    itemName = "tracks";
  }

  if (parentJson.length === 0) {

    console.warn(`PD List Generator:\n\nNo ${itemName} found in ${itemName[0].toUpperCase() + itemName.slice(1)} JSON!`);

    if (toolkitMode > 0) {

      return;
    }

    await fetchDataJsons();
  }

  if (Array.isArray(parentJson) && parentJson.length > 0) {

      if (!parentDialogDiv.children.length > 0) {

        console.log(`PD App:\n\nGenerating list of ${itemName}...`);

        if (genBtn === generateTunelistBtn) {

          generateTunelist(parentJson);
        }
  
        if (genBtn === generateColsListBtn) {
  
          generateColsList(parentJson);
        }
  
        if (genBtn === generateTracklistBtn) {
  
          tracklistDiv.setAttribute("data-sortedby", "refno-ascending");
          tracklistHeaders.forEach(header => header.removeAttribute("aria-sort"));
          await generateTracklist(parentJson);
          tracklistHeaders[0].setAttribute("aria-sort", "ascending");
          tracklistDiv.setAttribute("aria-label", "Tracklist sorted by: refno; order: ascending");
        }

      } else {

        console.log(`PD App:\n\n${listName}list found, ${itemName} total: ${parentJson.length}`);
      }

      if (genBtn === generateTracklistBtn) {

        tracklistOutput.classList.toggle("hidden");
        toggleAriaExpanded(generateTracklistBtn);
        toggleAriaHidden(tracklistOutput);
        return;
          
      } else {

        showDialogsDiv();
        removeAriaHidden(parentDialog);
        parentDialog.showModal();
        return;
      }  
  }  
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
    tuneItem.classList.add("dm-tunelist-item", "dm-btn-open-track");
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
    tuneItem.addEventListener('click', showPopoverHandler);
    tuneItemWrapper.appendChild(tuneItem);
    tunelistDiv.appendChild(tuneItemWrapper);
  });

  console.log(`PD App:\n\nTunelist generated, tunes total: ${tunesJson.length}`);
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

    const colRow = document.createElement("tr");
    colRow.classList.add("dm-collist-row");

    for (let i = 0; i < 3; i++) {

      const colItem = document.createElement("td");
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
    }

    colsListDiv.appendChild(colRow);
  });

  console.log(`PD App:\n\nCollections list generated, collections total: ${colsJson.length}`);
}

// Close dialog window depending on the button pressed

function closeDialogHandler() {

  let parentDialog = this === closeTunelistBtn? tunelistDialog : colsListDialog;

  parentDialog.close();
  addAriaHidden(parentDialog);
  hideDialogsDiv();

  statusBars.forEach(bar => {

    bar.textContent = "Dialog window was closed";

    setTimeout(() => {
      bar.textContent = "";
    }, 3000);
  });
}

// Hide Dialogs sections

export function hideDialogsDiv() {

  dialogsDiv.classList.add("hidden");
  addAriaHidden(dialogsDiv);
}

// Show Dialogs sections

export function showDialogsDiv() {
  dialogsDiv.classList.remove("hidden");
  removeAriaHidden(dialogsDiv);
}

// Add event listeners to Tunelist buttons, listen to Dialog close & cancel events

export function initModals() {

  [generateTunelistBtn, generateColsListBtn, generateTracklistBtn].forEach(genBtn => {

    genBtn.addEventListener('click', generateHandler);
  });
  
  [closeTunelistBtn, closeColsListBtn].forEach(btn => {

    btn.addEventListener('click', closeDialogHandler);
  });

  colsListDiv.addEventListener('click', showPopoverHandler);

  allDialogLists.forEach(dialog => {

    dialog.addEventListener('cancel', hideDialogsDiv);
  });
}