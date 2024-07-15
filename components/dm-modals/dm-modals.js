/* #ProjectDenis: Modal Dialogs Scripts */

import { toolkitMode, statusBars, generateTunelistBtn, generateColsListBtn, generateTracklistBtn, generateRefListBtn, generateLinkListBtn } from '../../modules/dm-toolkit.js';
import { tracklistDiv, tracklistOutput, generateTracklist, tracklistHeaders } from '../dm-tracklist/dm-tracklist.js';         
import { toggleAriaExpanded, toggleAriaHidden, addAriaHidden, removeAriaHidden, setAriaLabel } from '../../modules/aria-tools.js';
import { fetchDataJsons, tracksJson, colsJson, tunesJson, refsJson } from '../../modules/dm-app.js';
import { showPopoverHandler } from '../dm-popovers/dm-popovers.js';

export const tunelistDiv = document.querySelector('#dm-tunelist');
export const colsListDiv = document.querySelector('#dm-collist');
export const refsListDiv = document.querySelector('#dm-references');
export const refsListLinksDiv = document.querySelector('#dm-reflinks');
const refsListRefsHeader = document.querySelector('#dm-reflist-header');
const refsListLinksHeader = document.querySelector('#dm-linkslist-header');
export const dialogsDiv = document.querySelector('#dm-dialogs');
export const allDialogLists = document.querySelectorAll('.dm-modal-list');
export const tunelistDialog = document.querySelector('#dm-modal-list-tunes');
export const colsListDialog = document.querySelector('#dm-modal-list-cols');
export const refsListDialog = document.querySelector('#dm-modal-list-references');
const closeTunelistBtn = document.querySelector('#dm-btn-tunelist-close');
const closeColsListBtn = document.querySelector('#dm-btn-colslist-close');
const closeRefsListBtn = document.querySelector('#dm-btn-references-close');

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

  if (genBtn === generateRefListBtn || genBtn === generateLinkListBtn) {

    parentJson = refsJson;
    parentDialog = refsListDialog;
    parentDialogDiv = refsListDiv;
    listName = "References ";
    itemName = "references";
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

        if (genBtn === generateRefListBtn || genBtn === generateLinkListBtn) {

          generateRefsList(parentJson);
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

        if (genBtn === generateRefListBtn) {

          refsListRefsHeader.scrollIntoView();
        }

        if (genBtn === generateLinkListBtn) {

          refsListLinksHeader.scrollIntoView();
        }

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
    let colRefText = `${colRefNo} | ${colRefCode}`;
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

// Create References List modal dialog populated with References and Links items

export async function generateRefsList(refsJson) {

  refsListDiv.textContent = "";
  refsListLinksDiv.textContent = "";

  refsJson.forEach(refObject  => {

    const refItemNo = refObject.refitemno;
    const refItemCode = refObject.refitemcode;
    const refShortName = refObject.refshortname;
    const refFullName = refObject.reffullname;
    const refType = refObject.reftype;
    const refPubYear = refObject.refpubyear;
    const refSearchLink = refObject.refitemlink;

    if (refItemNo === "501") {

      const refRow = document.createElement("tr");
      refRow.classList.add("dm-collist-row");
    }

    const refRow = document.createElement("tr");
    refRow.classList.add("dm-collist-row");

    for (let i = 0; i < 3; i++) {

      const refItem = document.createElement("td");
      refItem.classList.add("dm-collist-item");

      const refItemCont = document.createElement("p");
      refItemCont.classList.add("dm-collist-text");

      if (i === 0) {

        const refRowBtn = document.createElement("button");
        refRowBtn.classList.add("dm-btn-ref-open");
        refRowBtn.setAttribute("title", `Show Links for ${refItemCode}`);
        setAriaLabel(refRowBtn, `Show Links for ${refItemCode}`)
        refRowBtn.textContent = refItemCode;
        refItem.appendChild(refRowBtn);
      }

      if (i === 1) {

        refItemCont.textContent = refShortName;
        refItem.appendChild(refItemCont);
      }

      if (i === 2) {

        const refContAction = document.createElement("span");
        refContAction.classList.add("dm-reflist-action");
        const refContDetails = document.createElement("span");
        refContDetails.classList.add("dm-reflist-details");
        
        if (refType === "collection") {

          refContAction.textContent = "Cite: ";
          refContDetails.textContent = refFullName;
          refItemCont.appendChild(refContAction);
          refItemCont.appendChild(refContDetails);
          refItem.appendChild(refItemCont);
        }

        if (refItemNo > 500 && refItemNo < 1000) {

          refContAction.textContent = refItemNo < 700? "Search: " : "Visit: ";

          const refContLink = document.createElement("a");
          refContLink.textContent = refFullName.split(" | ")[0];
          refContLink.setAttribute("href", refSearchLink);
          refContLink.setAttribute("target", "_blank");

          if (refType === "archive") {

            const refItemCont2 = document.createElement("p");
            refItemCont2.classList.add("dm-collist-text");

            const refContAction2 = document.createElement("span");
            refContAction2.classList.add("dm-reflist-action");

            const refItemSeparator = document.createElement("br");

            refContAction2.textContent = "Visit: ";
            refContDetails.textContent = refFullName.split(" | ")[1];

            refItemCont.appendChild(refContAction);
            refItemCont.appendChild(refContLink);
            refItemCont2.appendChild(refContAction2);
            refItemCont2.appendChild(refContDetails);

            refItem.appendChild(refItemCont);
            refItem.appendChild(refItemSeparator);
            refItem.appendChild(refItemCont2);
          }

          if (refType === "tunedb" || refType === "website") {

            refItemCont.appendChild(refContAction);
            refItemCont.appendChild(refContLink);
            refItem.appendChild(refItemCont);
          }
        }
      }
      
      refRow.appendChild(refItem);
      refRow.setAttribute("data-refno", refItemNo);
    }

    if (refItemNo < 500) {

      refsListDiv.appendChild(refRow);
    }

    if (refItemNo > 500 && refItemNo < 1000) {

      refsListLinksDiv.appendChild(refRow);
    }
  });

  console.log(`PD App:\n\nReferences list generated, references total: ${refsJson.length}`);
}

// Close dialog window depending on the button pressed

function closeDialogHandler() {

  let parentDialog = this === closeTunelistBtn? tunelistDialog : this === closeColsListBtn? colsListDialog : refsListDialog;

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

  [generateTunelistBtn, generateColsListBtn, generateTracklistBtn, 
    generateRefListBtn, generateLinkListBtn].forEach(genBtn => {

    genBtn.addEventListener('click', generateHandler);
  });
  
  [closeTunelistBtn, closeColsListBtn, closeRefsListBtn].forEach(btn => {

    btn.addEventListener('click', closeDialogHandler);
  });

  colsListDiv.addEventListener('click', showPopoverHandler);

  allDialogLists.forEach(dialog => {

    dialog.addEventListener('cancel', hideDialogsDiv);
  });
}