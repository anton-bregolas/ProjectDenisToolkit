/* #ProjectDenis: Modal Dialogs Scripts */

import { colsDiv, tracksDiv, tunesDiv } from '../../modules/dm-toolkit.js';
import { showTunePopover } from '../dm-popovers/dm-popovers.js'
import { toggleAriaHidden } from '../../modules/aria-tools.js'

export const tunelistDiv = document.querySelector('#dm-tunelist');
const dialogsDiv = document.querySelector('#dm-dialogs');
const tunelistDialog = document.querySelector('#dm-modal-list-tunes');

// Check if text output can be safely parsed as JSON, return empty array if false

async function validateJson(jsonInput) {

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

    return "[]";
}

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
    // tuneItem.setAttribute("popovertarget", "dm-popover-card-tune");
    tuneItem.addEventListener('click', showTunePopover);
    tuneItemWrapper.appendChild(tuneItem);
    tunelistDiv.appendChild(tuneItemWrapper);
  });

  console.log(`Tunelist generated, tunes total: ${tunesJson.length}`);
}

export function initModals() {

  const generateTunelistBtn = document.querySelector('#dm-btn-generate-tunelist');
  const closeTunelistBtn = document.querySelector('#dm-btn-modal-close');

  generateTunelistBtn.addEventListener('click', async () => {

    const tunesOutput = tunesDiv.textContent;
    const tunesCounter = tunesDiv.previousElementSibling;
    
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

  closeTunelistBtn.addEventListener('click', () => {

    tunelistDialog.close();
    dialogsDiv.classList.toggle("hidden");
    toggleAriaHidden(tunelistDialog);
  });
}