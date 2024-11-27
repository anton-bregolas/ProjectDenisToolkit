/* #ProjectDenis App Helper, Helper Popover & Guided Tour Scripts */

import { searchInput } from '../dm-search/dm-search.js'
import { focusOnTrack } from '../dm-tracklist/dm-tracklist.js';
import { helperJson, appHelperContainer, doDataCheckup, launchAppSequence, startExploringBtn, 
  appLauncherSection, generateTracklistBtn, generateColsListBtn, generateTunelistBtn,
  appHelperBtn, showWelcomeMessage } from '../../modules/dm-app.js';

export const helpCardPopover = document.querySelector('#dm-popover-help');
const helpCardMessage = helpCardPopover.querySelector('.dm-help-msg');
const helpCardOptions = helpCardPopover.querySelector('.dm-help-options');
const helpTourCheckbox = helpCardPopover.querySelector('#dm-help-tour-checkbox');
export const helpOKBtn = helpCardPopover.querySelector('.dm-btn-help-ok');
const helpSkipTourBtn = helpCardPopover.querySelector('.dm-btn-help-skip');
export const helpBackBtn = helpCardPopover.querySelector('.dm-btn-help-prev');
export const helpNextBtn = helpCardPopover.querySelector('.dm-btn-help-next');

////////////////////////////////////////////////////////////////////////////////////////////////////////
// General App Helper Functions
////////////////////////////////////////////////////////////////////////////////////////////////////////

// Show or hide popover when Helper is clicked

export function appHelperHandler(event) {
  
  const helperBtn = event.target.closest('.dm-btn-helper');

  if (helperBtn) {

    if (helpCardPopover.matches(':popover-open')) {

      hideHelpPopover();

      return;
    }

    if (!appHelperContainer.classList.contains("expanded")) {

      showAppHelper();
    }
  
    showHelpPopover();
  }
}

// Call App Helper menu by clicking on it

export function callAppHelper() {

  appHelperBtn.click();
}

// Show App Helper, slide in to full size

export function showAppHelper() {

  if (!appHelperContainer.classList.contains("expanded")) {

    appHelperContainer.classList.add("active");
    appHelperContainer.classList.add("expanded");
    appHelperContainer.removeAttribute("inert");

    return reportHelpTourStatus(10);
  }

  return reportHelpTourStatus(11);
}

// Hide App Helper, slide out to below the bottom of the page

export function hideAppHelper() {

  if (!helpCardPopover.matches(':popover-open')) {

    if (appHelperContainer.classList.contains("expanded")) {

      appHelperContainer.classList.remove("expanded");
      appHelperContainer.setAttribute("inert", "");
      appHelperContainer.addEventListener('transitionend', handleHelperTransitionEnd);

      return reportHelpTourStatus(74);
    }
  
    return reportHelpTourStatus(12);
  }

  return reportHelpTourStatus(11);
}

// Hide Helper after transition below the bottom of the screen is complete

export function handleHelperTransitionEnd(event) {

  const elInTransit = event.target;
  const elementClass = elInTransit.classList;

  if (elementClass.contains('dm-help-card')) {

    elInTransit.classList.remove('active');
  }

  if (elementClass.contains('dm-help-card')) {

    reportHelpTourStatus(19);
    updateTourStage(0);
    generateHelpCard(-1);
    hideHelpPopover();
    hideAppHelper();
    document.getElementById('main-nav-btn').focus();
    document.location.href = "#top";
  }

  elInTransit.removeEventListener('transitionend', handleHelperTransitionEnd);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
// Guided Help Tour Functions
////////////////////////////////////////////////////////////////////////////////////////////////////////

// Report on the status of the Help Tour by reading the value returned by hide/show functions

export function reportHelpTourStatus(status) {

  // console.warn("Status passed: " + status);

  let helpTourStatus = status === 0? "Help Tour message was minimised" :
                       status === 1? "Help Tour message was expanded" :
                       status === 2? "Help Tour has started" : 
                       status === -1? "Help Tour was stopped" : 
                       status === 10? "Helper expanded" : 
                       status === 11? "Helper is open" :
                       status === 12? "Helper is hidden" :
                       status === 19? "Help Tour finished and reset" :
                       status === 74? "Helper collapsed" : "";

  if (helpTourStatus === undefined || Number.isNaN(helpTourStatus)) {

    console.warn(`PD Helper:\n\nHelp Tour status undefined`);
    return;
  }

  console.log(`PD Helper:\n\n${helpTourStatus}`);
}

// Update Help Tour stage number in Help Popover dataset

export function updateTourStage(stageNo) {

  helpCardPopover.setAttribute("data-stage", stageNo);
}

// Start the Guided Help Tour after checking the state of the launcher

function startHelpTour() {

  showAppHelper();

  reportHelpTourStatus(2);

  helpCardOptions.setAttribute("hidden", "");

  if (appLauncherSection.hasAttribute("hidden")) {

    updateTourStage(21);
    generateHelpCard(21);
    return;
  }

  updateTourStage(1);
  generateHelpCard(1);
}

// Check if the App has been launched awaiting confirmation

function pauseHelpTourUntilLaunch() {

  if (appLauncherSection.hasAttribute("hidden")) {

    updateTourStage(2);
    generateHelpCard(2);
    return;
  }

  startExploringBtn.focus();
  hideHelpPopover();
  return;
}

// Quit the Guided Help Tour and reset the Help Popover Card

export function quitHelpTour() {

  let stageNo = +helpCardPopover.dataset.stage;
  helpCardPopover.dataset.welcome = 0;

  if (stageNo === 18) {

    appHelperContainer.setAttribute("inert", "");
    helpCardPopover.setAttribute("inert", "");
    updateTourStage(19);
    helpCardPopover.addEventListener('transitionend', handleHelperTransitionEnd);
    localStorage.setItem("user-help-tour-completed", 1);
    return;
  }

  hideHelpPopover();

  reportHelpTourStatus(-1);

  updateTourStage(0);

  generateHelpCard(-1);

  hideAppHelper();
}

// Trigger a Help action depending on Guided Tour stage

export async function doHelpAction(stageNo, triggerBtn) {

  // Return error if stageNo is undefined

  if (stageNo === undefined || Number.isNaN(stageNo)) {

    console.warn(`PD Helper: Stage number is undefined`);

    return;
  }

  // Define cases for Quit button before all else

  if (triggerBtn === helpSkipTourBtn) {

    switch (stageNo) {

      case 0:
        updateTourStage(20);
        generateHelpCard(20, "", "Explore Project Denis");
        return;
      
      case 20:

        if (!appLauncherSection.hasAttribute("hidden")) {
          launchAppSequence();
        }
    
      default:
        quitHelpTour();
        return;
    }
  }

  // Fetch helperJson if user continued with the tour

  if (await doDataCheckup(helperJson, "help") === 0) {

      helpCardMessage.textContent = "Oops! Helper's Gone For His Tea! Try pressing OK again or refresh the page.";
  
      return;
  }

  // Begin the tour by scrolling to the Search section
    
  if (stageNo === 1 || stageNo === 21) {

    document.getElementById("search").scrollIntoView();
  }

  // Define cases for OK / Try it! / Continue button

  if (triggerBtn === helpOKBtn) {

    switch (stageNo) {

      case 0:
        startHelpTour();
        return;

      case 1:
      case 21:
        pauseHelpTourUntilLaunch();
        return;
    
      case 18:
        quitHelpTour();
        return;

      case 3:
        searchInput.focus();
        break;

      case 6:
        document.location.href = "#explore";
        break;

      case 7:
        generateTracklistBtn.focus();

        if (generateTracklistBtn.getAttribute("aria-expanded") === "false") {
          
          generateTracklistBtn.click();
        }
        break;

      case 8:
        focusOnTrack(helpOKBtn, "1000");
        break;

      case 10:
        generateColsListBtn.focus();
        break;

      case 12:
        generateTunelistBtn.focus();
        break;

      case 13:
        document.location.href = "#discover";
        break;

      default:
        document.getElementById('main-nav-btn').focus();
        break;
    }

    hideHelpPopover();
    return;
  }

  // Handle arrow button navigation

  if (triggerBtn === helpBackBtn && stageNo >= 2) {

    stageNo--;
  }

  if (triggerBtn === helpNextBtn && stageNo < 18) {

    stageNo++;
  }

  updateTourStage(stageNo);
  generateHelpCard(stageNo);
  
  // Show relevant main page sections

  if (stageNo === 7) {
    
    document.getElementById("explore").scrollIntoView();
  }

  if (stageNo === 13) {

    document.getElementById("discover").scrollIntoView();
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
// Helper Popover Functions
////////////////////////////////////////////////////////////////////////////////////////////////////////

// Handle clicks on elements inside the Help Popover

export function helpPopoverHandler(event) {

  const helpBtn = event.target.closest('button');
  const helpBox = event.target.closest('input[type="checkbox"]');
  const helpTourStage = +helpCardPopover.getAttribute("data-stage");

  if (helpBox) {

    if (helpBox === helpTourCheckbox) {

      toggleHelpTourCheckbox(helpBox);
    }

    return;
  }

  if (helpBtn) {

    doHelpAction(helpTourStage, helpBtn);

    return;
  }
}

// Initialize Help Popover elements

export function initHelpPopover() {

  helpCardPopover.addEventListener('click', helpPopoverHandler);

  if (showWelcomeMessage) {

    helpCardPopover.dataset.welcome = 1;
  }

  if (localStorage.getItem("user-skip-welcome-msg")) {

    console.log(`PD Helper: Welcome message is off`);

    helpTourCheckbox.checked = false;

  } else {

    console.log(`PD Helper: Welcome message is on`);
  }
}

// Show Help Tour Popover, make sure it's visible for screen readers

export function showHelpPopover() {

  helpCardPopover.removeAttribute("inert");

  helpCardPopover.classList.add("active");

  helpCardPopover.showPopover();

  return reportHelpTourStatus(1);
}

// Hide Help Tour Popover and make sure it's invisible for screen readers

export function hideHelpPopover() {

  helpCardPopover.classList.remove("active");

  helpCardPopover.setAttribute("inert", "");

  helpCardPopover.hidePopover();

  return reportHelpTourStatus(0);
}

// Handle the checking and unchecking of Show Help Tour checkbox

function toggleHelpTourCheckbox(checkbox) {

  if (checkbox.checked) {

    localStorage.removeItem("user-skip-welcome-msg");

    return;
  } 

  localStorage.setItem("user-skip-welcome-msg", 1);
}

// Generate Help Tour card content from Helper JSON

export function generateHelpCard(helpItemNo, okBtnText, skipBtnText) {

  let newMessage = helperJson[helpItemNo]? helperJson[helpItemNo].msgtext : ""; 
  let okBtnNewText = okBtnText? okBtnText : helperJson[helpItemNo]? helperJson[helpItemNo].oktext : "";
  let skipBtnNewText = skipBtnText? skipBtnText : "Quit";
 
  if (helpItemNo === -1) {
    
    helpCardOptions.removeAttribute("hidden");
    helpOKBtn.removeAttribute("hidden");
    helpSkipTourBtn.removeAttribute("hidden");
    helpBackBtn.removeAttribute("style", "display: flex");
    helpNextBtn.removeAttribute("style", "display: flex");

    helpCardMessage.textContent = helperJson[0]?.msgtext;
    
    if (helperJson.length === 0) {
      
      helpCardMessage.textContent = "Welcome to Project Denis, a prototype app that helps uncover the rich repertoire of the Sliabh Luachra fiddle legend Denis Murphy (1910–1974). Would you like to take a detailed guided tour of the app?";
    }
    
    helpOKBtn.textContent = "";
    helpSkipTourBtn.textContent = "";
    
    return;
  }

  if (helpItemNo === 1) {

    helpBackBtn.removeAttribute("style", "display: flex");
    helpNextBtn.removeAttribute("style", "display: flex");
  }

  if (helpItemNo === 2) {

    helpBackBtn.setAttribute("style", "display: flex");
    helpNextBtn.setAttribute("style", "display: flex");
  }

  if (helpItemNo === 17) {

    helpNextBtn.setAttribute("style", "display: flex");
  }

  if (helpItemNo === 18) {

    helpNextBtn.removeAttribute("style", "display: flex");
  }
  
  if (helpItemNo === 20) {

    helpCardOptions.setAttribute("hidden", "");
    helpOKBtn.setAttribute("hidden", "");

    if (helperJson.length === 0) {

      newMessage = "No worries, you can always click on the little Denis Helper in the Start Menu if you want to revisit the tour. Enjoy the tunes!";
    }
  }
  
  helpCardMessage.textContent = newMessage;
  helpOKBtn.textContent = okBtnNewText;
  helpSkipTourBtn.textContent = skipBtnNewText;
}

