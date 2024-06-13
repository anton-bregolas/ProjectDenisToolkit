/* #ProjectDenis: Modal Dialogs Scripts */

import { colsDiv, tracksDiv, tunesDiv, validateJson } from '../../modules/dm-toolkit.js';
import { showTunePopover, showColPopover } from '../dm-popovers/dm-popovers.js';
import { toggleAriaHidden, toggleTabIndex, setAriaLabel } from '../../modules/aria-tools.js';

export const tunelistDiv = document.querySelector('#dm-tunelist');
export const colsListDiv = document.querySelector('#dm-collist');
const dialogsDiv = document.querySelector('#dm-dialogs');
const tunelistDialog = document.querySelector('#dm-modal-list-tunes');
const colsListDialog = document.querySelector('#dm-modal-list-cols');

// Create Tunelist modal dialog populated with Tune items

async function generateTunelist(tunesJson) {

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

async function generateColsList(colsJson) {

  colsListDiv.textContent = "";

  colsJson.forEach(colObject  => {

    const colRefNo = colObject.colrefno;
    const colRefCode = colObject.refcode;

    const colAltNameSpan = document.createElement("span");
    const colNameSpan = document.createElement("span");
    const colItem = document.createElement("button");
    const colItemWrapper = document.createElement("div");

    colAltNameSpan.classList.add("dm-tunelist-item-alttitle");
    colNameSpan.classList.add("dm-tunelist-item-title");
    colItem.classList.add("dm-tunelist-item");
    colItemWrapper.classList.add("dm-tunelist-item-wrapper");

    colAltNameSpan.textContent = colRefNo;
    colNameSpan.textContent = colRefCode;

    colItem.appendChild(colNameSpan);
    colItem.appendChild(colAltNameSpan);
    colItem.setAttribute("data-colref", colRefCode);
    colItem.addEventListener('click', showColPopover);
    colItemWrapper.appendChild(colItem);
    colsListDiv.appendChild(colItemWrapper);
  });

  console.log(`Collections list generated, collections total: ${colsJson.length}`);
}

// Add event listeners to Tunelist buttons

export function initModals() {

  const generateTunelistBtn = document.querySelector('#dm-btn-generate-tunelist');
  const generateColsListBtn = document.querySelector('#dm-btn-generate-collections');
  const closeTunelistBtn = document.querySelector('#dm-btn-tunelist-close');
  const closeColsListBtn = document.querySelector('#dm-btn-colslist-close');

  generateTunelistBtn.addEventListener('click', async () => {

    const tunesCounter = tunesDiv.previousElementSibling;

    const tunesOutput = tunesDiv.textContent;
    let tunesJson = await validateJson(tunesOutput);
    
    if (Array.isArray(tunesJson) && tunesJson.length > 0) {

      if (!tunelistDiv.children.length > 0) {

        console.log("Generating list of tunes...");

        await generateTunelist(tunesJson);
  
      } else {

        console.log(`Tunelist found, tunes total: ${tunesJson.length}`);
      }

      dialogsDiv.classList.toggle("hidden");
      toggleAriaHidden(tunelistDialog);
      tunelistDialog.showModal();
      return;

    } else {

      console.warn("No tunes found!")
      tunesCounter.focus({ focusVisible: true });
    }
  });

  generateColsListBtn.addEventListener('click', async () => {

    const colsCounter = colsDiv.previousElementSibling;

    const colsOutput = colsDiv.textContent;
    let colsJson = await validateJson(colsOutput);
    
    if (Array.isArray(colsJson) && colsJson.length > 0) {

      if (!colsListDiv.children.length > 0) {

        console.log("Generating list of collections...");

        await generateColsList(colsJson);
  
      } else {

        console.log(`Collections list found, collections total: ${colsJson.length}`);
      }

      dialogsDiv.classList.toggle("hidden");
      toggleAriaHidden(colsListDialog);
      colsListDialog.showModal();
      return;

    } else {

      console.warn("No collections found!")
      colsCounter.focus({ focusVisible: true });
    }
  });

  closeTunelistBtn.addEventListener('click', () => {

    tunelistDialog.close();
    dialogsDiv.classList.toggle("hidden");
    toggleAriaHidden(tunelistDialog);
  });

  closeColsListBtn.addEventListener('click', () => {

    colsListDialog.close();
    dialogsDiv.classList.toggle("hidden");
    toggleAriaHidden(colsListDialog);
  });
}