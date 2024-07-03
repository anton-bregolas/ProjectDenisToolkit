/* #ProjectDenis Popovers Scripts*/

import { colsDiv, tracksDiv, tunesDiv, validateJson } from '../../modules/dm-toolkit.js';
import { dialogsDiv, tunelistDialog, colsListDialog, colsListDiv,
         generateTunelist, generateColsList, tunelistDiv } from '../dm-modals/dm-modals.js';
import { tracklistOutput, focusOnTrack } from '../dm-tracklist/dm-tracklist.js';
import { toggleAriaExpanded, toggleAriaHidden, toggleTabIndex, setAriaLabel } from '../../modules/aria-tools.js';
import { tunesJsonLink, tracksJsonLink, colsJsonLink, fetchData } from '../../modules/dm-app.js';

export const tuneCardPopover = document.querySelector('#dm-popover-card-tune');
export const colCardPopover = document.querySelector('#dm-popover-card-col');
export const trackCardPopover = document.querySelector('#dm-popover-card-track');
export const themePickerPopover = document.querySelector('#theme-picker-popover');
export const popoverCard = document.querySelectorAll('.dm-popover-card');

// Display the Tune Card popover

export async function showTunePopover(trigger, tuneRefNo) {

  const tunesOutput = tunesDiv.textContent;

  let tunesJson = await validateJson(tunesOutput);

  if (tunesJson.length === 0) {

    tunesJson = await fetchData(tunesJsonLink, "json");
  }
  
  if (Array.isArray(tunesJson) && tunesJson.length > 0) {

    if (!tunelistDiv.children.length > 0) {

      console.log(`Generating list of tunes...`);
      await generateTunelist(tunesJson);
    }

      const tuneRef = tuneRefNo === "???" || tuneRefNo === "" ? 
        `TMP # ${trackCardPopover.dataset.refno}` :
        tuneRefNo;
        
      const tuneObject = tunesJson.find(tune => tune.tuneref === tuneRef);

      await createTuneCard(tuneObject);

      if (!trigger.classList.contains("dm-tunelist-item")) {

        dialogsDiv.classList.toggle("hidden");
        toggleAriaHidden(dialogsDiv);
        await tunelistDialog.showModal();
        toggleAriaHidden(tunelistDialog);
      }

      tuneCardPopover.showPopover();

      document.querySelector("#dm-btn-tune-card-close").focus();

      console.log("Tune Card created.");

  } else {

    console.warn("No tunes found!")
  }
}

// Generate Tune Card details using data from tuneObject

async function createTuneCard(tuneObject) {

  const tuneRefDiv = document.querySelector(".tune-grid-htuneref");
  const tuneTitleDiv = document.querySelector(".tune-grid-htitle");
  const tuneAltTitleDiv = document.querySelector(".tune-grid-alttitle-cont");
  const tuneTrackRefDiv = document.querySelector(".tune-grid-refno-cont");
  const tuneTranscrDiv = document.querySelector(".tune-grid-transcr-cont");
  const tuneQuickRefDiv = document.querySelector(".tune-grid-refsetting-cont");
  const tuneRefFullDiv = document.querySelector(".tune-grid-tunereffull-cont");

  const tuneRef = tuneObject.tuneref;
  const tuneName = tuneObject.tunename;
  const tuneType = tuneObject.tunetype;
  const tuneAltNames = tuneObject.altnames;
  const tuneTrackRefs = tuneObject.refno;
  const tuneTranscriptUrls = tuneObject.transcriptlink;
  const tuneQuickRefUrls = tuneObject.refsettinglink;
  
  console.log(`Creating Tune Card...\n\nTune Ref.:\n\n${tuneRef}`);
  // console.log(tuneObject);

  tuneRefDiv.textContent = tuneRef;
  tuneTitleDiv.textContent = `${generateTuneName(tuneName)} (${tuneType})`;
  tuneAltTitleDiv.textContent = tuneAltNames;
  tuneTrackRefDiv.textContent = "";
  tuneTranscrDiv.textContent = "";
  tuneQuickRefDiv.textContent = "";
  tuneRefFullDiv.textContent = generateTuneFullRef(tuneRef);

  const tuneTrackRefsArr = tuneTrackRefs.split(", ");

  tuneTrackRefsArr.forEach(refNo => {

    const trackRefBtn = document.createElement("button");
    trackRefBtn.classList.add("dm-btn-open-track");
    trackRefBtn.textContent = refNo;
    trackRefBtn.setAttribute("title", "View Tune Setting in Tracklist");
    trackRefBtn.setAttribute("data-refno", refNo);
    trackRefBtn.addEventListener('click', focusOnTrack);

    if (tuneTrackRefsArr.indexOf(refNo) < (tuneTrackRefsArr.length - 1)) {
    
      tuneTrackRefDiv.append(trackRefBtn);
      const refSeparator = document.createTextNode("/")
      tuneTrackRefDiv.append(refSeparator);

    } else {
      
      tuneTrackRefDiv.append(trackRefBtn);
    }
  });

  const tuneTranscriptUrlArr = tuneTranscriptUrls === "" ? [] : tuneTranscriptUrls.split(", ");

  if (tuneTranscriptUrlArr.length > 0) {
    
    tuneTranscriptUrlArr.forEach(transcrLink => {

      const tuneTranscriptSource = generateLinkSourceName(transcrLink);

      const tuneTranscriptHyperlink = document.createElement("a");
      tuneTranscriptHyperlink.setAttribute("href", transcrLink);
      tuneTranscriptHyperlink.setAttribute("target", "_blank");
      tuneTranscriptHyperlink.setAttribute("title", "View Transcription Sheet Music");
      tuneTranscriptHyperlink.textContent = tuneTranscriptSource;
  
      if (tuneTranscriptUrlArr.indexOf(transcrLink) < (tuneTranscriptUrlArr.length - 1)) {
      
        tuneTranscrDiv.append(tuneTranscriptHyperlink);
        const refSeparator = document.createTextNode("/")
        tuneTranscrDiv.append(refSeparator);
  
      } else {
        
        tuneTranscrDiv.append(tuneTranscriptHyperlink);
      }
    });
  }
  
  const tuneQuickRefUrlArr = tuneQuickRefUrls === "" ? [] : tuneQuickRefUrls.split(", ");

  if (tuneQuickRefUrlArr.length > 0) {

    tuneQuickRefUrlArr.forEach(quickRefLink => {

      const tuneQuickRefSource = generateLinkSourceName(quickRefLink);

      const tuneQuickRefHyperlink = document.createElement("a");
      tuneQuickRefHyperlink.setAttribute("href", quickRefLink);
      tuneQuickRefHyperlink.setAttribute("target", "_blank");
      tuneQuickRefHyperlink.setAttribute("title", "View Reference Sheet Music");
      tuneQuickRefHyperlink.textContent = tuneQuickRefSource;
  
      if (tuneQuickRefUrlArr.indexOf(quickRefLink) < (tuneQuickRefUrlArr.length - 1)) {
      
        tuneQuickRefDiv.append(tuneQuickRefHyperlink);
        const refSeparator = document.createTextNode("/")
        tuneQuickRefDiv.append(refSeparator);
  
      } else {
        
        tuneQuickRefDiv.append(tuneQuickRefHyperlink);
      }
    });
  }
}

// Generate tune title for Tune Card after filtering and moving articles 

function generateTuneName(rawname) {

  let tuneName = rawname.endsWith(")")? rawname.split(" (")[0] : 
                                        rawname;

  let filteredTuneName = tuneName.endsWith(", The")? `The ${tuneName.slice(0, -5)}` : 
                         tuneName.endsWith(", A")? `A ${tuneName.slice(0, -3)}` : 
                         tuneName;

  return filteredTuneName;
}

// Generate citation for Tune Card using abbreviated collection ref. code

function generateTuneFullRef(tuneRef) {

  const colRef = tuneRef.split("#")[0].slice(0, -1);
  const refNo = tuneRef.split("#")[1];

  let fullColRef = "";
  let page = "";

  switch (colRef) {
    case "CRE 1":
      fullColRef = "Ceol Rince na hÉireann 1 (1963)";
      break;
    case "CRE 2":
      fullColRef = "Ceol Rince na hÉireann 2 (1976)";
      break;
    case "CRE 3":
      fullColRef = "Ceol Rince na hÉireann 3 (1985)";
      break;
    case "CRE 4":
      fullColRef = "Ceol Rince na hÉireann 4 (1996)";
      break;
    case "CRE 5":
      fullColRef = "Ceol Rince na hÉireann 5 (1999)";
      break;
    case "JOLSL":
      fullColRef = "Johnny O'Leary of Sliabh Luachra (1994, 2014)";
      break;
    case "SLOP":
      fullColRef = "Sliabh Luachra on Parade (1987)";
      break;
    case "TTRG":
      fullColRef = "Terence 'Cuz' Teahan : The Road to Glountane (1980)";
      break;
    case "RMC":
      fullColRef = "Ryan's Mammoth Collection (1883)";
      break;
    case "ONMI":
      fullColRef = "O'Neill's Music of Ireland : 1850 Melodies (1903)";
      break;
    case "DMI":
      fullColRef = "The Dance Music of Ireland : 1001 Gems (1907)";
      break;
    case "W&S":
      fullColRef = "Waifs and Strays of Gaelic Melody (1922)";
      break;
    case "FRC 1":
      fullColRef = "Francis Roche Collection 1 (1912)";
      break;
    case "FRC 2":
      fullColRef = "Francis Roche Collection 2 (1912)";
      break;
    case "FRC 3":
      fullColRef = "Francis Roche Collection 3 (1927)";
      break;
    case "B&S 1":
      fullColRef = "Bulmer & Sharpley : Music from Ireland 1 (1974)";
      break;
    case "B&S 2":
      fullColRef = "Bulmer & Sharpley : Music from Ireland 2 (1974)";
      break;
    case "B&S 3":
      fullColRef = "Bulmer & Sharpley : Music from Ireland 3 (1974)";
      break;
    case "B&S 4":
      fullColRef = "Bulmer & Sharpley : Music from Ireland 4 (1974)";
      break;
    case "MC ":
      fullColRef = "Matt Cranitch : The Irish Fiddle Book (1988)";
      page = "Page ";
      break;
    case "DL 2 ":
      fullColRef = "David Lyth : Bowing Styles in Irish Fiddle Playing 2 (1996)";
      page = "Page ";
      break;
    case "DBW ":
      fullColRef = "Drew Beisswenger : Irish Fiddle Music from Counties Cork and Kerry (2012)";
      page = "Page ";
      break;
    case "PRMS":
      fullColRef = "P.D. Reidy Music Manuscript Collection (1890s)";
      break;
    case "SLOW":
      fullColRef = "Tomás Ó Canainn : Traditional Slow Airs of Ireland (1995)";
      break;
    case "IRPO":
      fullColRef = "Dave Mallinson : 100 Irish Polkas (1997)";
      break;
    case "POSL":
      fullColRef = "Pat Conway : 110 Ireland's Best Polkas and Slides (1999)";
      break;
    case "CICD":
      fullColRef = "Breandán Breathnach's CICD Index";
      break;
    default:
      return "N/A";
  }

  return `${fullColRef}, ${page}No. ${refNo}`;
}

// Get collection reference code from Collections JSON

async function getColRefCode(colRefNo) {

  const colsOutput = colsDiv.textContent;

  let colsJson = await validateJson(colsOutput);

  if (colsJson.length === 0) {

    colsJson = await fetchData(colsJsonLink, "json");
  }

  const colObject = colsJson.find(col => col.colrefno == colRefNo);

  let colRefCode = colObject.refcode;

  return colRefCode;
}

// Generate source name based on source link hostname

function generateLinkSourceName(tuneTranscriptUrl) {

  const sourceLink = new URL(tuneTranscriptUrl);
  let sourceLinkHost = sourceLink.hostname;

  switch (sourceLinkHost) {
    case "thesession.org":
      return "The\u00A0Session";
    case "tunearch.org":
      return "Tunearch";
    case "tunepal.org":
      return "Tunepal";
    case "www.capeirish.com":
      return "Bill Black";
    case "www.itma.ie" :
      return "ITMA";
    default:
      return "Source";
  }
}

// Display the Collection Card popover

export async function showColPopover(trigger, colRefNo) {

  // Prevent click if text selection is being made

  if (window.getSelection().toString().length === 0) { 

    const parentDiv = trigger.parentElement;

    if (parentDiv.classList.contains("track-grid-colno-cont")) {

      trackCardPopover.hidePopover();
    }

    const colsOutput = colsDiv.textContent;

    let colsJson = await validateJson(colsOutput);

    if (colsJson.length === 0) {

      colsJson = await fetchData(colsJsonLink, "json");
    }
    
    if (Array.isArray(colsJson) && colsJson.length > 0) {

      if (!colsListDiv.children.length > 0) {

        console.log(`Generating list of collections...`);
        generateColsList(colsJson);
      }

      const colObject = colsJson.find(col => col.colrefno === colRefNo);

      await createColCard(colObject);
      
      if (!trigger.classList.contains("dm-collist-row")) {

        dialogsDiv.classList.toggle("hidden");
        toggleAriaHidden(dialogsDiv);
        await colsListDialog.showModal();
        toggleAriaHidden(colsListDialog);
      }

      colCardPopover.showPopover();

      document.querySelector("#dm-btn-col-card-close").focus();

      console.log("Collection Card created.");

    } else {

      console.warn("No collections found!")
    }
  } 
}

// Generate Collection Card details using data from colObject

async function createColCard(colObject) {

  const colRefNoDiv = document.querySelector(".col-grid-hrefno");
  const colRefCodeDiv = document.querySelector(".col-grid-hrefcode");
  const colTitleDiv = document.querySelector(".col-grid-htitle");
  const colPerformersDiv = document.querySelector(".col-grid-performers-cont");
  const colSourceDiv = document.querySelector(".col-grid-source-cont");
  const colRefLinkDiv = document.querySelector(".col-grid-reflink");
  const colYearRecDiv = document.querySelector(".col-grid-yearrec-cont");
  const colYearPubDiv = document.querySelector(".col-grid-yearpub-cont");
  const colTypeDiv = document.querySelector(".col-grid-coltype-cont");
  const colCommentsDiv = document.querySelector(".col-grid-comments-cont");

  const colRefNo = colObject.colrefno;
  const colRefCode = colObject.refcode;
  const colName = colObject.colname;
  const colPubCode = colObject.pubcode;
  const colPerformers = colObject.performers;
  const colSource = colObject.source;
  const colYearRec = colObject.recyear;
  const colYearRecEarliest = colObject.recyearfrom;
  const colYearRecLatest = colObject.recyearto;
  const colYearPub = colObject.pubyear;
  const colType = colObject.coltype;

  console.log(`Creating Collection Card...\n\nCol. Ref.:\n\n${colRefNo} | ${colRefCode}`);
  // console.log(colObject);

  colRefNoDiv.textContent = colRefNo;
  colRefCodeDiv.textContent = colRefCode;
  colTitleDiv.textContent = "";
  colPerformersDiv.textContent = colPerformers;
  colSourceDiv.textContent = colPubCode? `${colSource}, ${colPubCode}` : colSource;
  colRefLinkDiv.textContent = "";
  colYearRecDiv.textContent = colYearRec? colYearRec : colYearRecEarliest? `~${colYearRecEarliest}–${colYearRecLatest}` : "Undated";
  colYearPubDiv.textContent = colYearPub;
  colTypeDiv.textContent = colType;
  colCommentsDiv.textContent = "";

  const colNameArr = colName.split(/[:,]/);

  if (colNameArr.length > 1) {

    colNameArr.forEach(nameLine => {

      const colNameSpan = document.createElement("span");
      colNameSpan.textContent = nameLine;

      if (colNameArr.indexOf(nameLine) < colNameArr.length - 1) {

        const lineBreak = document.createElement("br");
        colNameSpan.appendChild(lineBreak);
      }
    
      colTitleDiv.appendChild(colNameSpan);
    });

  } else {
    
    colTitleDiv.textContent = colName;
  }

  const colRefLinksArr = ["reflink", "srclink", "dgslink", "tsolink", "itilink", "rmtlink", "strlink"];

  colRefLinksArr.forEach(refLink => {

    const colLinkDiv = document.querySelector(`.col-grid-${refLink}`);
    const colLinkUrl = colObject[refLink];

    if (colLinkUrl) {

      const colHyperlink = document.createElement("a");
      colHyperlink.setAttribute("href", colLinkUrl);
      colHyperlink.setAttribute("target", "_blank");
      colHyperlink.textContent = colLinkDiv.textContent;
      colLinkDiv.textContent = "";
      colLinkDiv.appendChild(colHyperlink);

    } else if (refLink !== "reflink") {

      const inactiveText = document.createElement("span");
      inactiveText.textContent = colLinkDiv.textContent;
      inactiveText.classList.add("dm-col-grid-item-inactive");
      colLinkDiv.textContent = "";
      colLinkDiv.appendChild(inactiveText);
    } 
    
    if (refLink === "reflink") {

      const trackRefBtn = document.createElement("button");
      trackRefBtn.classList.add("dm-btn-open-track");
      trackRefBtn.setAttribute("title", "View Collection in Tracklist");
      trackRefBtn.setAttribute("data-refno", colRefNo);
      trackRefBtn.addEventListener('click', focusOnTrack);
      colLinkDiv.appendChild(trackRefBtn);
    }
  });

  const colsCommentsArr = ["colnotes", "colnotes2", "colnotes3"]

  colsCommentsArr.forEach(colNotes => {

    if (colObject[colNotes]) {

      const notesPar = document.createElement("p");
      notesPar.classList.add("dm-col-grid-notes");
      notesPar.textContent = colObject[colNotes];
      colCommentsDiv.appendChild(notesPar);
    }
  });
}

// Display the Track Card popover

export async function showTrackPopover(trigger, trackRefNo) {

  // Prevent click if text selection is being made
  
  if (window.getSelection().toString().length === 0) { 

    const tracksOutput = tracksDiv.textContent;

    let tracksJson = await validateJson(tracksOutput);

    if (tracksJson.length === 0) {

      tracksJson = await fetchData(tracksJsonLink, "json");
    }
    
    if (Array.isArray(tracksJson) && tracksJson.length > 0) {

        const trackObject = tracksJson.find(track => track.refno === trackRefNo);

        await createTrackCard(trackObject);

        trackCardPopover.showPopover();

        // document.querySelector(".track-grid-htitle").focus();
        document.querySelector("#dm-btn-track-card-close").focus();

        console.log("Track Card created.");

    } else {

      console.warn("No tracks found!")
    }
  }
}

// Generate Track Card details using data from trackObject

async function createTrackCard(trackObject) {

  const trackRefNoDiv = document.querySelector(".track-grid-hrefno");
  const trackTitleDiv = document.querySelector(".track-grid-htitle");
  const trackPerformersDiv = document.querySelector(".track-grid-performers-cont");
  const trackAltTitleDiv = document.querySelector(".track-grid-alttitle-cont");
  const trackRefLinkDiv = document.querySelector(".track-grid-reflink");
  const trackSourceColNoDiv = document.querySelector(".track-grid-colno-cont");
  const trackSourceTrackNoDiv = document.querySelector(".track-grid-coltrackno-cont");
  const trackTranscrDiv = document.querySelector(".track-grid-transcr-cont");
  const trackCategoryDiv = document.querySelector(".track-grid-category-cont");
  const trackYearRecDiv = document.querySelector(".track-grid-yearrec-cont");
  const trackYearPubDiv = document.querySelector(".track-grid-yearpub-cont");
  const trackNotesDiv = document.querySelector(".track-grid-notes-cont");

  const trackRefNo = trackObject.refno;
  const trackSourceNo = trackObject.trackno;
  const trackTuneName = trackObject.tunename;
  const trackTuneType = trackObject.tunetype;
  const trackTuneRefCode = trackObject.tuneref;
  const trackPerformers = trackObject.performers;
  const trackTuneAltNames = trackObject.altnames;
  const trackSourceColNo = Math.floor(trackRefNo / 1000) * 1000;
  const trackTranscriptUrl = trackObject.transcriptlink;
  const trackRefSettingUrl = trackObject.refsettinglink;
  const trackCategory = trackObject.category;
  const trackYearRec = trackObject.recyear;
  const trackYearRecEarliest = trackObject.recyearfrom;
  const trackYearRecLatest = trackObject.recyearto;
  const trackYearPub = trackObject.pubyear;
  const trackNotes = trackObject.tracknotes;

  console.log(`Creating Track Card...\n\nTrack. Ref. No:\n\n${trackRefNo}`);
  // console.log(trackObject);

  trackRefNoDiv.textContent = `No. ${trackRefNo}`;
  trackTitleDiv.textContent = `${trackSourceNo} — ${generateTuneName(trackTuneName)} (${trackTuneType})`;
  trackPerformersDiv.textContent = trackPerformers? `Denis Murphy, ${trackPerformers.split("w. ")[1]}` : `Denis Murphy`;
  trackRefLinkDiv.textContent = "";
  trackSourceColNoDiv.textContent = "";
  trackSourceTrackNoDiv.textContent = "";
  trackTranscrDiv.textContent = "";
  trackCategoryDiv.textContent = trackCategory;
  trackYearRecDiv.textContent = trackYearRec? trackYearRec : trackYearRecEarliest? `~${trackYearRecEarliest}–${trackYearRecLatest}` : "Undated";
  trackYearPubDiv.textContent = trackYearPub;
  trackAltTitleDiv.textContent = trackTuneAltNames;
  trackNotesDiv.textContent = "";

  trackCardPopover.setAttribute("data-refno", trackRefNo);
  
  const trackRefBtn = document.createElement("button");
  trackRefBtn.classList.add("dm-btn-open-track");
  trackRefBtn.setAttribute("title", "View Detailed Tune Card");
  trackRefBtn.setAttribute("data-tuneref", trackTuneRefCode);
  trackRefBtn.addEventListener('click', showPopoverHandler);
  trackRefLinkDiv.appendChild(trackRefBtn);

  const trackSourceColNoBtn = document.createElement("button");
  trackSourceColNoBtn.textContent = trackSourceColNo;
  trackSourceColNoBtn.classList.add("dm-btn-open-track");
  trackSourceColNoBtn.setAttribute("title", "View Collection Card");
  trackSourceColNoBtn.setAttribute("data-colrefno", trackSourceColNo);
  trackSourceColNoBtn.addEventListener('click', showPopoverHandler);
  trackSourceColNoDiv.appendChild(trackSourceColNoBtn);

  const trackColRefCode = document.createElement("p");
  trackColRefCode.classList.add("track-grid-colrefcode");
  trackColRefCode.textContent = await getColRefCode(trackSourceColNo);
  trackSourceColNoDiv.appendChild(trackColRefCode);

  const trackSourceTrackNoArr = trackSourceNo.split(".");
  const trackSourceTrackNoLine1 = document.createElement("p");
  const trackSourceTrackNoLine2 = document.createElement("p");

  trackSourceTrackNoLine1.textContent = `Track # ${trackSourceTrackNoArr[0]}`;
  trackSourceTrackNoLine2.textContent = trackSourceTrackNoArr[1]? 
  `Tune # ${trackSourceTrackNoArr[1]}` :
  `Tune # 1`;
  trackSourceTrackNoDiv.appendChild(trackSourceTrackNoLine1);
  trackSourceTrackNoDiv.appendChild(trackSourceTrackNoLine2);

  if (trackTranscriptUrl || trackRefSettingUrl) {

    let trackTuneRefLink = trackTranscriptUrl? 
      trackTranscriptUrl.split(/[\s,]+/)[0] : 
      trackRefSettingUrl.split(/[\s,]+/)[0];

    const trackTranscriptSource = generateLinkSourceName(trackTuneRefLink);

    const trackTranscriptHyperlink = document.createElement("a");
    trackTranscriptHyperlink.setAttribute("href", trackTuneRefLink);
    trackTranscriptHyperlink.setAttribute("target", "_blank");
    trackTranscriptHyperlink.textContent = trackTranscriptSource;

    trackTranscrDiv.appendChild(trackTranscriptHyperlink);
  }
 
  const trackTuneRefCodeNo = document.createElement("p");
  trackTuneRefCodeNo.classList.add("track-grid-tuneref");
  trackTuneRefCodeNo.textContent = trackTuneRefCode;
  trackTranscrDiv.appendChild(trackTuneRefCodeNo);

  if (trackNotes) {

    const trackNoteLines = trackNotes.split(". ");

    trackNoteLines.forEach(line => {

      const trackNotesPar = document.createElement("p");
      trackNotesPar.classList.add("dm-track-grid-notes");

      if ((trackNoteLines.indexOf(line) < trackNoteLines.length - 1) && !line.endsWith("]")) {

        trackNotesPar.textContent = `${line}.`;

      } else {

        trackNotesPar.textContent = line;
      }

      trackNotesDiv.appendChild(trackNotesPar);
    });
  }
}

// Navigate between cards using navigation buttons (prev, close, next)

async function navigateTuneCard() {

  const navBtnClass = this.classList;
  const navBtnParent = this.parentElement.classList;

  if (navBtnClass.contains("dm-btn-popover-close")) {

    navBtnParent.contains("dm-col-grid-header") || 
    navBtnParent.contains("dm-col-grid-footer") ? 

    colCardPopover.hidePopover() :
  
    navBtnParent.contains("dm-track-grid-header") || 
    navBtnParent.contains("dm-track-grid-footer") ? 
    
    trackCardPopover.hidePopover() :
  
    tuneCardPopover.hidePopover();
  }

  if (navBtnClass.contains("dm-btn-prev-tune") ||
      navBtnClass.contains("dm-btn-prev-col") ||
      navBtnClass.contains("dm-btn-prev-track")) {

        navBtnParent[0].startsWith("dm-track") ? switchTuneCard("prev", "track") :
        navBtnParent[0].startsWith("dm-tune") ? switchTuneCard("prev", "tune") :
        navBtnParent[0].startsWith("dm-col") ? switchTuneCard("prev", "col") :
        console.warn("Unknown card type!");
      }

  if (navBtnClass.contains("dm-btn-next-tune") ||
      navBtnClass.contains("dm-btn-next-col") ||
      navBtnClass.contains("dm-btn-next-track")) {

        navBtnParent[0].startsWith("dm-track") ? switchTuneCard("next", "track") :
        navBtnParent[0].startsWith("dm-tune") ? switchTuneCard("next", "tune") :
        navBtnParent[0].startsWith("dm-col") ? switchTuneCard("next", "col") :
        console.warn("Unknown card type!");
      } 
}

async function switchTuneCard(switchDirection, cardType) {

  if (!switchDirection || !cardType) {
    console.warn("Card switch direction or type not specified!");
    return;
  }

  const outputDiv = cardType === "track"? tracksDiv : cardType === "tune"? tunesDiv : colsDiv;
  const outputData = outputDiv.textContent; 

  let parentJson = await validateJson(outputData);

  if (parentJson.length === 0) {

      parentJson = cardType === "tune"? await fetchData(tunesJsonLink, "json") :

                   cardType === "track"? await fetchData(tracksJsonLink, "json") :
                  
                   await fetchData(colsJsonLink, "json");
  }

  let cardRef;
  let currentCardObject;
  let targetTuneObject;
  let targetLabel;

  if (cardType === "track") {
    cardRef = document.querySelector('.track-grid-hrefno').textContent.split(' ')[1];
    currentCardObject = parentJson.find(track => track.refno === cardRef);
  }

  if (cardType === "tune") {      
    cardRef = document.querySelector('.tune-grid-htuneref').textContent;
    currentCardObject = parentJson.find(tune => tune.tuneref === cardRef);
  }

  if (cardType === "col") {
    cardRef = document.querySelector('.col-grid-hrefcode').textContent;
    currentCardObject = parentJson.find(col => col.refcode === cardRef);
  }

  const currentCardObjectIndex = parentJson.indexOf(currentCardObject);

  if (switchDirection === "prev") {

    targetLabel = "Previous";
    targetTuneObject = currentCardObjectIndex > 0? parentJson[currentCardObjectIndex - 1] : parentJson[parentJson.length - 1];
  }

  if (switchDirection === "next") {

    targetLabel = "Next";
    targetTuneObject = currentCardObject === parentJson[parentJson.length - 1]? parentJson[0] : parentJson[currentCardObjectIndex + 1];
  }
  
  cardType === "track"? createTrackCard(targetTuneObject) : 
  cardType === "tune"? createTuneCard(targetTuneObject) :
  createColCard(targetTuneObject);

  console.log(`${targetLabel} card rendered.`);
}

// Call a Show Popover function depending on element clicked

export function showPopoverHandler(event) {

  const triggerElement = event.target;
  const closestClickableRow = triggerElement.closest('tr[data-refno]');
  const closestButton = triggerElement.closest(".dm-btn-open-track");

  let rowRefNo;

  if (closestClickableRow) {

    rowRefNo = closestClickableRow.dataset.refno;
    
    if (closestClickableRow.classList.contains("dm-tracklist-col-header-row") || 
        closestClickableRow.classList.contains("dm-collist-row")) {

      showColPopover(closestClickableRow, rowRefNo);
      return;
    }

    if (closestClickableRow.classList.contains("dm-tracklist-row")) {

      showTrackPopover(closestClickableRow, rowRefNo);
      return;
    }
  }

  if (closestButton) {
    
    let refNo;
    
    if (closestButton.hasAttribute("data-colrefno")) {

      refNo = closestButton.dataset.colrefno;
      showColPopover(closestButton, refNo);
      return;
    }

    if (closestButton.hasAttribute("data-tuneref")) {

      refNo = closestButton.dataset.tuneref;
      showTunePopover(closestButton, refNo);
      return;
    }
  }
}

// Add event listeners to Popover Card navigation buttons

export function initPopovers() {

  const cardNavBtn = document.querySelectorAll('.dm-btn-card-nav');

  cardNavBtn.forEach(navBtn => {

    navBtn.addEventListener('click', navigateTuneCard);
  });
}
