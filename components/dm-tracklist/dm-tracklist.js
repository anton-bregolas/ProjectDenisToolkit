/* #ProjectDenis: Tracklist Scripts */

import { colsDiv, tracksDiv, tunesDiv, validateJson, clearOutput,
  generateTunelistBtn, generateColsListBtn, generateTracklistBtn } from '../../modules/dm-toolkit.js';
import { showColPopover, showTrackPopover, trackCardPopover } from '../dm-popovers/dm-popovers.js';
import { tunelistDiv, colsListDiv, dialogsDiv, tunelistDialog, colsListDialog } from '../dm-modals/dm-modals.js';
import { toggleAriaHidden, toggleTabIndex, setAriaLabel } from '../../modules/aria-tools.js';
import { tunesJsonLink, tracksJsonLink, colsJsonLink, fetchData } from '../../modules/dm-app.js';

export const tracklistDiv = document.querySelector('#dm-tracklist');
export const tracklistOutput = document.querySelector('#dm-tracklist-output');
export const tracklistHeaders = document.querySelectorAll('.dm-tracklist-header-item');

// Create TrackList populated with Tracklist items

export async function generateTracklist(tracksJson, isCustomSorted) {

  tracklistDiv.textContent = "";

  let colsJson = await validateJson(colsDiv.textContent);

  if (colsJson.length === 0) {

    colsJson = await fetchData(colsJsonLink, "json");
  }

  let firstTrackNo = tracksJson[0].refno;
  let colNo = Math.floor(firstTrackNo / 1000) * 1000;
  let sortOrder = tracklistDiv.dataset.sortedby.split("-")[1];

  tracksJson.forEach(trackObject  => {

    const trackRefNo = trackObject.refno;
    const trackNo = trackObject.trackno;
    const trackTuneRef = trackObject.tuneref;
    const trackTuneName = trackObject.tunename;
    const trackTuneType = trackObject.tunetype;
    const trackPubYear = trackObject.pubyear;
    const trackRecYear = trackObject.recyear;
    const trackPerformers = trackObject.performers;

    if (isCustomSorted !== 1) {

      // Create collection header row

      if (trackRefNo === tracksJson[0].refno || 
          (sortOrder === "ascending" && trackRefNo > colNo + 1000) || 
          (sortOrder === "descending" && trackRefNo < colNo)) {

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
          colHeadRow.setAttribute("data-refno", colRefNo);
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
    
  let trackRefNo = this.dataset.refno;
  const parentDiv = this.parentElement;
  const trackIdItem = document.getElementById(trackRefNo);
  let parentDialog;

  if (tracklistDiv.children.length === 0 || !trackIdItem) {

    const tracksOutput = tracksDiv.textContent;

    let tracksJson = await validateJson(tracksOutput);

    if (tracksJson.length === 0) {

      tracksJson = await fetchData(tracksJsonLink, "json");
    }

    console.log(`Generating Tracklist...`);
    tracklistHeaders.forEach(header => header.removeAttribute("data-order"));
    tracklistDiv.setAttribute("data-sortedby", "refno-ascending");
    tracklistDiv.setAttribute("aria-label", "Tracklist sorted by refno in ascending order");
    await generateTracklist(tracksJson);
    tracklistHeaders[0].setAttribute("data-order", "ascending");
  }

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

// Sort Tracklist by the value of the Tracklist column clicked

async function sortTracklistByThis() {

  const sortValue = this.dataset.value;
  let tracklistIsSortedBy = tracklistDiv.dataset.sortedby;
  let sortedArray = [];

  let tracksJson = await validateJson(tracksDiv.textContent);

  if (tracksJson.length === 0) {

    tracksJson = await fetchData(tracksJsonLink, "json");
  }

  // Sort Tracks Array depending on the sorting value and order
  
  if (tracklistIsSortedBy !== `${sortValue}-ascending`) {

    if (sortValue.startsWith("refno") || sortValue.startsWith("trackno")) {

      sortedArray = tracksJson.sort((a, b) => a[sortValue] - b[sortValue]);

    } else if (sortValue.startsWith("tuneref")) {

      sortedArray = tracksJson.sort((a, b) => {

        let colRefA = a[sortValue].split(" # ")[0];
        let colRefB = b[sortValue].split(" # ")[0];
        let colRefANo = a[sortValue].split(" # ")[1];
        let colRefBNo = b[sortValue].split(" # ")[1];

        if (colRefA === colRefB && colRefANo && colRefBNo) {

          return colRefANo.trim() - colRefBNo.trim();
        }
        
          return a[sortValue].localeCompare(b[sortValue]);
      });

    } else {

       sortedArray = tracksJson.sort((a, b) => a[sortValue].localeCompare(b[sortValue]));
    }

    tracklistHeaders.forEach(header => header.removeAttribute("data-order"));
    tracklistDiv.setAttribute("data-sortedby", `${sortValue}-ascending`);
    tracklistDiv.setAttribute("aria-label", `Tracklist sorted by ${sortValue} in ascending order`);
    this.setAttribute("data-order", "ascending");
  } 
  
  if (tracklistIsSortedBy === `${sortValue}-ascending`) {

    if (sortValue.startsWith("refno") || sortValue.startsWith("trackno")) {

      sortedArray = tracksJson.sort((a, b) => b[sortValue] - a[sortValue]);

    } else if (sortValue.startsWith("tuneref")) {

      sortedArray = tracksJson.sort((a, b) => {

        let colRefA = a[sortValue].split(" # ")[0];
        let colRefB = b[sortValue].split(" # ")[0];
        let colRefANo = a[sortValue].split(" # ")[1];
        let colRefBNo = b[sortValue].split(" # ")[1];

        if (colRefA === colRefB && colRefANo && colRefBNo) {

          return colRefBNo.trim() - colRefANo.trim();
        }
        
          return b[sortValue].localeCompare(a[sortValue]);
      });

    } else {

       sortedArray = tracksJson.sort((a, b) => b[sortValue].localeCompare(a[sortValue]));
    }

    tracklistHeaders.forEach(header => header.removeAttribute("data-order"));
    tracklistDiv.setAttribute("data-sortedby", `${sortValue}-descending`);
    tracklistDiv.setAttribute("aria-label", `Tracklist sorted by ${sortValue} in descending order`);
    this.setAttribute("data-order", "descending");
  }

  // Re-generate Tracklist (with or without collection headers)
  
  return sortValue.startsWith("refno")? generateTracklist(sortedArray) : generateTracklist(sortedArray, 1);
}

// Add event listeners to Tracklist buttons

export function initTracklist() {

  tracklistHeaders.forEach(headerBtn => {

    headerBtn.addEventListener('click', sortTracklistByThis);
  });
}