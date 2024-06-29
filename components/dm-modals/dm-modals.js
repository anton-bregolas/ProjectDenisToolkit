/* #ProjectDenis: Modal Dialogs Scripts */

import { colsDiv, tracksDiv, tunesDiv, validateJson, clearOutput,
         generateTunelistBtn, generateColsListBtn, generateTracklistBtn } from '../../modules/dm-toolkit.js';
import { showTunePopover, showColPopover, showTrackPopover, 
         tuneCardPopover, colCardPopover, trackCardPopover } from '../dm-popovers/dm-popovers.js';
import { toggleAriaHidden, toggleTabIndex, setAriaLabel } from '../../modules/aria-tools.js';
import { tunesJsonLink, tracksJsonLink, colsJsonLink, fetchData } from '../../modules/dm-app.js';

export const tunelistDiv = document.querySelector('#dm-tunelist');
export const colsListDiv = document.querySelector('#dm-collist');
export const tracklistDiv = document.querySelector('#dm-tracklist');
export const dialogsDiv = document.querySelector('#dm-dialogs');
export const tunelistDialog = document.querySelector('#dm-modal-list-tunes');
export const colsListDialog = document.querySelector('#dm-modal-list-cols');
export const tracklistOutput = document.querySelector('#dm-tracklist-output');
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
  
          generateTracklist(parentJson);
          // tracklistDiv.focus();
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

    let colYear = colPubYear? colPubYear : colRecYear? `Recorded in ${colRecYear}` : "Recording date unknown";
    let colSourceRef = colPubCode? ` / ${colPubCode}` : "";
    let colRefText = `${colRefNo} / ${colRefCode}`;
    let colSourceText = `${colSource}${colSourceRef} / ${colYear}`;

    const colRow = document.createElement("div");
    colRow.classList.add("dm-collist-row");

    for (let i = 0; i < 3; i++) {

      const colItem = document.createElement("div");
      colItem.classList.add("dm-collist-item");

      const colRowCont = i === 0? document.createElement("button") : document.createElement("p");
      const colRowContClass = i === 0? "dm-btn-col-open" : "dm-collist-text";

      if (i === 0) {
        colRowCont.setAttribute("title", "Show Collection Card");
        colRowCont.setAttribute("data-refno", colRefNo);
      }

      colRowCont.classList.add(colRowContClass);
      colRowCont.textContent = i === 0? colRefText : i === 1? colName : colSourceText;
      
      colItem.appendChild(colRowCont);
      colRow.appendChild(colItem);
      colRow.addEventListener('click', showColPopover);
    }

    colsListDiv.appendChild(colRow);
  });

  console.log(`Collections list generated, collections total: ${colsJson.length}`);
}

// Create TrackList populated with Tracklist items

export async function generateTracklist(tracksJson) {

  tracklistDiv.textContent = "";

  let colsJson = await validateJson(colsDiv.textContent);

  if (colsJson.length === 0) {

    colsJson = await fetchData(colsJsonLink, "json");
  }

  const headerRow = document.createElement("div");
  headerRow.classList.add("dm-tracklist-row", "dm-tracklist-header-row");
  headerRow.setAttribute("role", "row");

  const headerTextArr = ["Ref. No.", "Track No.", "Tune Title", "Tune Type", "Col. Ref.", "Year Rec.", "Year Pub.", "Performers"];

  headerTextArr.forEach(headertext => {

    let accessibleName;

    accessibleName = headertext === "Ref. No."? "Reference Number" :
                     headertext === "Track No."? "Track Number" :
                     headertext === "Tune Title"? "Tune Title" :
                     headertext === "Tune Type"? "Tune Type" :
                     headertext === "Col. Ref."? "Collection Reference" :
                     headertext === "Year Rec."? "Year Recorded" :
                     headertext === "Year Pub."? "Year Published" :
                     "Performers";

    const headerItem = document.createElement("div");
    headerItem.setAttribute("tabindex", 0);
    headerItem.classList.add("dm-tracklist-item", "dm-tracklist-header-item");
    headerItem.setAttribute("role", "columnheader");

    const headerItemCont = document.createElement("p");
    headerItemCont.textContent = headertext;
    headerItemCont.classList.add("dm-tracklist-text", "dm-tracklist-header-text");

    headerItem.appendChild(headerItemCont);
    headerRow.appendChild(headerItem);
    // headerRow.addEventListener('click', sortTracklistBy(headertext));
  });

  tracklistDiv.appendChild(headerRow);

  let firstTrackNo = tracksJson[0].refno;
  let colNo = Math.floor(firstTrackNo / 1000) * 1000;

  tracksJson.forEach(trackObject  => {

    const trackRefNo = trackObject.refno;
    const trackNo = trackObject.trackno;
    const trackTuneRef = trackObject.tuneref;
    const trackTuneName = trackObject.tunename;
    const trackTuneType = trackObject.tunetype;
    const trackPubYear = trackObject.pubyear;
    const trackRecYear = trackObject.recyear;
    const trackPerformers = trackObject.performers;

    // Create collection header row

    if (trackRefNo === tracksJson[0].refno || trackRefNo > colNo + 1000) {

      firstTrackNo = trackRefNo;

      if (trackRefNo === firstTrackNo) {

        colNo = Math.floor(trackRefNo / 1000) * 1000;

        const colObject = colsJson.find(col => col.colrefno == colNo);

        const colRefNo = colObject.colrefno;
        const colTracksNo = colObject.trackstotal;
        const colName = colObject.colname;
        const colRefCode = colObject.refcode;
        const colPubCode = colObject.pubcode;
        const colPubYear = colObject.pubyear;
        const colRecYear = colObject.recyear;
        const colPerformers = colObject.performers;

        const colHeadRow = document.createElement("div");
        colHeadRow.classList.add("dm-tracklist-row", "dm-tracklist-col-header-row");
        colHeadRow.setAttribute("role", "row");

        const colHeadTextArr = [colRefNo, colTracksNo, colName, colPubCode, colRefCode, colRecYear, colPubYear, colPerformers]; 
    
        colHeadTextArr.forEach(text => {

          const colHeadItem = document.createElement("div");
          colHeadItem.classList.add("dm-tracklist-item", "dm-tracklist-col-header-item");
          colHeadItem.setAttribute("role", "cell");

          if (text === colRefNo) {

            colHeadItem.id = colRefNo;
            colHeadItem.setAttribute("tabindex", 0);
          }

          if (text === colRecYear) {

            text = text.split("-").join("- ");
          }

          const colHeadItemCont = document.createElement("p");
          colHeadItemCont.textContent = text;
          colHeadItemCont.classList.add("dm-tracklist-text");
          colHeadItem.appendChild(colHeadItemCont);
          colHeadRow.appendChild(colHeadItem);
          colHeadRow.addEventListener('click', showColPopover);
        });
  
        tracklistDiv.appendChild(colHeadRow);
      }
    }

    // Create track row

    const trackRow = document.createElement("div");
    trackRow.classList.add("dm-tracklist-row");
    trackRow.setAttribute("role", "row");

    const trackTextArr = [trackRefNo, trackNo, trackTuneName, trackTuneType, trackTuneRef, trackRecYear, trackPubYear, trackPerformers];

    // const trackAccessibleName = `${trackRefNo} ${trackTuneName}`;

    trackTextArr.forEach(tracktext => {

      const trackItem = document.createElement("div");
      trackItem.classList.add("dm-tracklist-item");
      trackItem.setAttribute("role", "cell");

      const trackItemCont = tracktext === trackRefNo? document.createElement("button") : document.createElement("p");

      if (tracktext === trackRefNo) {

        trackItemCont.id = trackRefNo;
        trackItemCont.classList.add("dm-btn-tracklist-open");

      } else {

        trackItemCont.classList.add("dm-tracklist-text");
      }

      trackItemCont.textContent = tracktext;
      
      trackItem.appendChild(trackItemCont);
      trackRow.appendChild(trackItem);

      trackRow.addEventListener('click', showTrackPopover);
      // trackRow.setAttribute("aria-label", trackAccessibleName);
    });

    tracklistDiv.appendChild(trackRow);
  });

  generateTunelistBtn.removeAttribute("disabled");
  generateColsListBtn.removeAttribute("disabled");

  console.log(`Tracklist generated, tracks total: ${tracksJson.length}`);
}

// Focus on a specific Tracklist row

export async function focusOnTrack() {

  if (tracklistDiv.children.length === 0) {

    const tracksOutput = tracksDiv.textContent;

    let tracksJson = await validateJson(tracksOutput);

    if (tracksJson.length === 0) {

      tracksJson = await fetchData(tracksJsonLink, "json");
    }

    console.log(`Generating Tracklist...`);
    await generateTracklist(tracksJson);
  }
  
  let trackRefNo = this.dataset.refno;
  const parentDiv = this.parentElement;
  let parentDialog;

  if (parentDiv.classList.contains("track-grid-reflink")) {
    
    trackCardPopover.hidePopover();
    
  } else {

    parentDialog = parentDiv.classList.contains("tune-grid-refno-cont")? tunelistDialog :
                   parentDiv.classList.contains("col-grid-reflink")? colsListDialog : "";

    await parentDialog.close();
    toggleAriaHidden(parentDialog);
    dialogsDiv.classList.toggle("hidden");
    toggleAriaHidden(dialogsDiv);
  }

  if (tracklistOutput.classList.contains("hidden")) {

    tracklistOutput.classList.toggle("hidden");
    toggleAriaHidden(tracklistOutput);
  }

  document.getElementById(trackRefNo).focus();
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