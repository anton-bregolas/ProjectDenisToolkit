/* #ProjectDenis: Modal Dialogs Scripts */

import { doDataCheckup, tracksJson, colsJson, tunesJson, refsJson, getInfoFromDataType, statusBars,
         generateTunelistBtn, generateColsListBtn, generateTracklistBtn, generateRefListBtn, generateLinkListBtn,
         openCollectionsBtn, openTracklistBtn, openTunelistBtn, exploreSection} from '../../modules/dm-app.js';
import { tracklistDiv, tracklistOutput, generateTracklist, tracklistHeaders } from '../dm-tracklist/dm-tracklist.js';         
import { toggleAriaExpanded, toggleAriaHidden, addAriaHidden, removeAriaHidden, setAriaLabel } from '../../modules/aria-tools.js';
import { showPopoverHandler } from '../dm-popovers/dm-popovers.js';

export const tunelistDiv = document.querySelector('#dm-tunelist');
export const colsListDiv = document.querySelector('#dm-collist');
export const refsListDiv = document.querySelector('#dm-references');
export const refsListLinksDiv = document.querySelector('#dm-reflinks');
const refsListRefsTable = document.querySelector('#dm-references-table');
const refsListLinksTable = document.querySelector('#dm-links-table');
export const dialogsDiv = document.querySelector('#dm-dialogs');
export const allDialogLists = document.querySelectorAll('.dm-modal-list');
export const tunelistDialog = document.querySelector('#dm-modal-list-tunes');
export const colsListDialog = document.querySelector('#dm-modal-list-cols');
export const refsListDialog = document.querySelector('#dm-modal-list-references');
export const generatorDivs = document.querySelectorAll('.generator-container');
const closeTunelistBtn = document.querySelector('#dm-btn-tunelist-close');
const closeColsListBtn = document.querySelector('#dm-btn-colslist-close');
const closeRefsListBtn = document.querySelector('#dm-btn-references-close');

// Initialize elements in Generator button containers of main app sections

function initGeneratorDivs() {

  generatorDivs.forEach(genDiv => {
    
    genDiv.addEventListener('click', generatorDivHandler);

  });  
}

// Handle clicks in Generator button container

function generatorDivHandler(event) {

  const thisGenBtn = event.target.closest('[data-generates]');

  if (thisGenBtn) {

    generateHandler(thisGenBtn);
  }
}

// Launch List Generator function depending on the button pressed

export async function generateHandler(thisGenBtn) {

  const genBtn = thisGenBtn;
  const genDataInfo = getInfoFromDataType(genBtn.dataset.generates);
  const parentJson = genDataInfo[0];
  const listName = genDataInfo[1];
  const itemName = listName.toLowerCase();

  const checkData = await doDataCheckup(
        parentJson === "colsJson"? colsJson : 
        parentJson === "tunesJson"? tunesJson :
        parentJson === "refsJson"? refsJson :
        tracksJson
    );

  if (checkData === 0) {

    return;
  }

  let parentDialog;
  let parentDialogDiv;

  if (genBtn === generateTunelistBtn || genBtn === openTunelistBtn) {

    parentDialog = tunelistDialog;
    parentDialogDiv = tunelistDiv;
  }

  if (genBtn === generateColsListBtn || genBtn === openCollectionsBtn) {

    parentDialog = colsListDialog;
    parentDialogDiv = colsListDiv;
  }

  if (genBtn === generateTracklistBtn || genBtn === openTracklistBtn) {

    parentDialogDiv = tracklistDiv;
  }

  if (genBtn === generateRefListBtn || genBtn === generateLinkListBtn) {

    parentDialog = refsListDialog;
    parentDialogDiv = refsListDiv;
  }

  if (parentDialogDiv.children.length > 0 && genBtn !== generateTracklistBtn && genBtn !== openTracklistBtn) {

    console.log(`PD App:\n\n${listName} list found, opening dialog`);
  }

  if (parentDialogDiv.children.length === 0) {

    try {

      console.log(`PD App:\n\nGenerating list of ${itemName}...`);

      if (genBtn === generateTunelistBtn || genBtn === openTunelistBtn) {

        generateTunelist(tunesJson);
      }

      if (genBtn === generateColsListBtn || genBtn === openCollectionsBtn) {

        generateColsList(colsJson);
      }

      if (genBtn === generateTracklistBtn || genBtn === openTracklistBtn) {

        tracklistDiv.setAttribute("data-sortedby", "refno-ascending");
        tracklistHeaders.forEach(header => header.removeAttribute("aria-sort"));
        await generateTracklist(tracksJson);
        tracklistHeaders[0].setAttribute("aria-sort", "ascending");
        tracklistDiv.setAttribute("aria-label", "Tracklist sorted by: refno; order: ascending");
      }

      if (genBtn === generateRefListBtn || genBtn === generateLinkListBtn) {

        generateRefsList(refsJson);
      }

    } catch (error) {

      console.warn(`PD App:\n\n Failed to generate list, details: `+ error);
      return;
    }
  } 

  if (genBtn === openTracklistBtn) {

    exploreSection.scrollIntoView();
    generateTracklistBtn.focus();
  }

  if (genBtn === generateTracklistBtn || genBtn === openTracklistBtn) {

    if (genBtn === openTracklistBtn && !tracklistOutput.classList.contains("hidden")) {

      return;
    }
  
    console.log(`PD App:\n\nTracklist toggled`);

    tracklistOutput.classList.toggle("hidden");

    toggleAriaExpanded(generateTracklistBtn);

    toggleAriaHidden(tracklistOutput);

    return;
  }

  showDialogsDiv();
  removeAriaHidden(parentDialog);
  parentDialog.showModal();

  if (genBtn === generateRefListBtn) {

    refsListRefsTable.scrollIntoView();
  }

  if (genBtn === generateLinkListBtn) {

    refsListLinksTable.scrollIntoView();
    refsListLinksTable.querySelector('.dm-btn-ref-open[aria-label="ITMA: Click to show more links."]').focus();
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
      colRowCont.textContent = i === 0? colRefText : i === 2? colSourceText : "";

      if (i === 1) {

        const colNameArr = colName.split(" : ");

        colNameArr.forEach(nameLine => {

          const colNameSpan = document.createElement("span");
          colNameSpan.textContent = nameLine;
  
          if (colNameArr.indexOf(nameLine) < colNameArr.length - 1) {
  
            const lineBreak = document.createElement("br");
            colNameSpan.appendChild(lineBreak);
          }

          colRowCont.appendChild(colNameSpan);
        });
      }
      
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

    if (refItemNo > "499") {

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
        refRowBtn.setAttribute("title", `${refItemCode}: Click to show more links.`);
        setAriaLabel(refRowBtn, `${refItemCode}: Click to show more links.`)
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

          const refLinkWrapper = document.createElement("div");
          refLinkWrapper.classList.add("link-wrapper-block");

          refLinkWrapper.appendChild(refContAction);
          refLinkWrapper.appendChild(refContLink);
          refItemCont.appendChild(refLinkWrapper);
          refItem.appendChild(refItemCont);

          if (refType === "archive") {

            const refItemCont2 = document.createElement("p");
            refItemCont2.classList.add("dm-collist-text");

            const refLinkWrapper2 = document.createElement("div");
            refLinkWrapper2.classList.add("link-wrapper-block");

            const refContAction2 = document.createElement("span");
            refContAction2.classList.add("dm-reflist-action");

            const refItemSeparator = document.createElement("br");

            refContAction2.textContent = "Visit: ";
            refContDetails.textContent = refFullName.split(" | ")[1];

            refItemCont2.appendChild(refContAction2);
            refItemCont2.appendChild(refContDetails);
            
            refLinkWrapper2.appendChild(refContAction2);
            refLinkWrapper2.appendChild(refContDetails);

            refItemCont.appendChild(refLinkWrapper2);

            refItem.appendChild(refItemSeparator);
            refItem.appendChild(refItemCont2);
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

  console.log(`PD App:\n\nReference list generated, references total: ${refsJson.length}`);
}

// Close dialog window depending on the button pressed

export function closeDialogHandler() {

  allDialogLists.forEach(modalDialog => {

    if (modalDialog.open) {

      modalDialog.close();
      addAriaHidden(modalDialog);
      hideDialogsDiv();
    
      statusBars.forEach(bar => {

        bar.textContent = "Dialog window was closed";
    
        setTimeout(() => {
          bar.textContent = "";
        }, 3000);
      });
    }
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

  initGeneratorDivs();
  
  [closeTunelistBtn, closeColsListBtn, closeRefsListBtn].forEach(btn => {

    btn.addEventListener('click', closeDialogHandler);
  });

  [colsListDiv, refsListDiv, refsListLinksDiv].forEach(list => {

    list.addEventListener('click', showPopoverHandler);
  });
  
  allDialogLists.forEach(dialog => {

    dialog.addEventListener('cancel', hideDialogsDiv);
  });
}