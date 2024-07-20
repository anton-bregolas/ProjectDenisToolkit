/* #ProjectDenis Popovers Scripts*/

import { toolkitMode } from '../../modules/dm-toolkit.js';
import { processString } from '../dm-search/dm-search.js'
import { tunelistDialog, colsListDialog, colsListDiv,
         generateTunelist, generateColsList, tunelistDiv, 
         showDialogsDiv, hideDialogsDiv } from '../dm-modals/dm-modals.js';
import { tracklistOutput, focusOnTrack } from '../dm-tracklist/dm-tracklist.js';
import { addAriaHidden, removeAriaHidden, setAriaLabel } from '../../modules/aria-tools.js';
import { doDataCheckup, isObjectEmpty, toggleColorTheme, themeToggleBtn, statusBars, 
         tracksJson, colsJson, tunesJson, refsJson, generateTracklistBtn, 
         getInfoFromDataType, allAppHelperImgs, showAppHelper, hideAppHelper } from '../../modules/dm-app.js';

export const tuneCardPopover = document.querySelector('#dm-popover-card-tune');
export const colCardPopover = document.querySelector('#dm-popover-card-col');
export const trackCardPopover = document.querySelector('#dm-popover-card-track');
export const linksCardPopover = document.querySelector('#dm-popover-card-reflinks');
export const allPopovers = document.querySelectorAll('[popover]');
export const themePickerPopover = document.querySelector('#theme-picker-popover');
export const navCardPopover = document.querySelector('#dm-popover-nav-main');

const trackRefLinkDiv = document.querySelector('.track-grid-reflink');
const trackSourceDiv = document.querySelector('.dm-track-grid-source');
const tuneTrackRefDiv = document.querySelector('.tune-grid-refno-cont');
const colRefLinkDiv = document.querySelector('.col-grid-reflink');
const cardNavBtn = document.querySelectorAll('.dm-btn-card-nav');
const refCardGridDiv = document.querySelector('.dm-ref-grid-body');


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Tune Popover Functions
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Show Tune Card popover handler function: Do checks, Create card, Highlight text, Display card 

export async function showTunePopover(trigger, tuneRefNo, highlightObj) {

  if (await doDataCheckup(tunesJson, "tunes") === 0) {

    return;
  }

  try {

    if (!tunelistDiv.children.length > 0) {

      console.log(`PD App:\n\nGenerating list of tunes...`);
      await generateTunelist(tunesJson);
    }

      const tuneRef = tuneRefNo === "???" || tuneRefNo === "" ? 
        `TMP # ${trackCardPopover.dataset.refno}` :
        tuneRefNo;
        
      const tuneObject = tunesJson.find(tune => tune.tuneref === tuneRef);

      await createTuneCard(tuneObject);

      if (!trigger.classList.contains("dm-tunelist-item")) {

        showDialogsDiv();
        await tunelistDialog.showModal();
        removeAriaHidden(tunelistDialog);
      }

      tuneCardPopover.showPopover();
      
      if (highlightObj) {

        highlightCardText(highlightObj, tuneCardPopover);
      }

      document.querySelector("#dm-btn-tune-card-close").focus();

      console.log("PD App:\n\nTune Card created.");

  } catch (error) {

    console.warn(`PD App:\n\nCreating Tune Card failed. Details:\n\n${error}`);
  }
}

// Generate Tune Card details using data from tuneObject

async function createTuneCard(tuneObject) {

  try {

    const tuneRefDiv = document.querySelector(".tune-grid-htuneref");
    const tuneTitleDiv = document.querySelector(".tune-grid-htitle");
    const tuneAltTitleDiv = document.querySelector(".tune-grid-alttitle-cont");
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
    
    console.log(`PD App:\n\nCreating Tune Card...\n\nTune Ref.:\n\n${tuneRef}`);

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
  } catch (error) {

    throw new Error(error.message);
  }
}

// Generate tune title for Tune Card after filtering and moving articles 

function generateTuneName(rawname) {

  let tuneName = rawname;

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

// Generate source name based on source link hostname

function generateLinkSourceName(tuneTranscriptUrl) {

  try {

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

  } catch (error) {

    throw new Error(error.message);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Collection Popover Functions
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Show Collection Card popover handler function: Do checks, Create card, Highlight text, Display card

async function showColPopover(trigger, colRefNo, highlightObj) {

  const parentDiv = trigger.parentElement;

  // Prevent click if text selection is being made

  if (parentDiv === colsListDiv && window.getSelection().toString().length > 0) { 

    return;
  }
  
  if (await doDataCheckup(colsJson, "cols") === 0) {

    return;
  }

  if (parentDiv.classList.contains("track-grid-colno-cont")) {

    trackCardPopover.hidePopover();
  }

  try {

    if (!colsListDiv.children.length > 0) {

      console.log(`PD App:\n\nGenerating list of collections...`);
      generateColsList(colsJson);
    }

    const colObject = colsJson.find(col => col.colrefno === colRefNo);

    await createColCard(colObject);
    
    if (!trigger.classList.contains("dm-collist-row")) {

      showDialogsDiv();
      await colsListDialog.showModal();
      removeAriaHidden(colsListDialog);
    }

    if (highlightObj) {

      highlightCardText(highlightObj, colCardPopover);
    }

    colCardPopover.showPopover();

    document.querySelector("#dm-btn-col-card-close").focus();

    console.log("PD App:\n\nCollection Card created.");
  
  } catch (error) {

    console.warn(`PD App:\n\nCreating Collection Card failed. Details:\n\n${error}`);
  }
}

// Generate Collection Card details using data from colObject

async function createColCard(colObject) {

  try {

    const colRefNoDiv = document.querySelector(".col-grid-hrefno");
    const colRefCodeDiv = document.querySelector(".col-grid-hrefcode");
    const colTitleDiv = document.querySelector(".col-grid-htitle");
    const colPerformersDiv = document.querySelector(".col-grid-performers-cont");
    const colSourceDiv = document.querySelector(".col-grid-source-cont");
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

    console.log(`PD App:\n\nCreating Collection Card...\n\nCol. Ref.:\n\n${colRefNo} | ${colRefCode}`);

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
        colLinkDiv.appendChild(trackRefBtn);
      }
    });

    const colsCommentsArr = ["colnotes", "colnotes2", "colnotes3"]

    colsCommentsArr.forEach(colNotes => {

      if (colObject[colNotes]) {

        const notesPar = document.createElement("p");
        notesPar.classList.add("dm-col-grid-notes");
        notesPar.setAttribute("data-type", `${colNotes}`);
        notesPar.textContent = colObject[colNotes];
        colCommentsDiv.appendChild(notesPar);
      }
    });

  } catch (error) {

    throw new Error(error.message);
  }
}

// Get collection reference code from Collections JSON

async function getColRefCode(colRefNo) {

  if (await doDataCheckup(colsJson, "cols") === 0) {

    return;
  }

  try {

    const colObject = colsJson.find(col => col.colrefno == colRefNo);

    let colRefCode = colObject.refcode;

    return colRefCode;
  
  } catch (error) {

    throw new Error(`Failed to get Col. Ref. Code.\n\n${error.message}`);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Track Popover Functions
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Show Track Card popover handler function: Do checks, Create card, Highlight text, Display card

async function showTrackPopover(trigger, trackRefNo, highlightObj) {

  // Prevent click if text selection is being made

  if (window.getSelection().toString().length > 0) { 

    return;
  }

  if (await doDataCheckup(tracksJson, "tracks") === 0) {

    return;
  }

  try {

      const trackObject = tracksJson.find(track => track.refno === trackRefNo);

      await createTrackCard(trackObject);

      if (highlightObj) {

        highlightCardText(highlightObj, trackCardPopover);
      }

      trackCardPopover.showPopover();

      document.querySelector("#dm-btn-track-card-close").focus();

      console.log("PD App:\n\nTrack Card created.");

  } catch (error) {

    console.warn(`PD App:\n\nCreating Track Card failed. Details:\n\n${error}`);
  }
}

// Generate Track Card details using data from trackObject

async function createTrackCard(trackObject) {

  try {

    const trackRefNoDiv = document.querySelector(".track-grid-hrefno");
    const trackTitleDiv = document.querySelector(".track-grid-htitle");
    const trackPerformersDiv = document.querySelector(".track-grid-performers-cont");
    const trackAltTitleDiv = document.querySelector(".track-grid-alttitle-cont");
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

    console.log(`PD App:\n\nCreating Track Card...\n\nTrack. Ref. No:\n\n${trackRefNo}`);

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
    trackRefLinkDiv.appendChild(trackRefBtn);

    const trackSourceColNoBtn = document.createElement("button");
    trackSourceColNoBtn.textContent = trackSourceColNo;
    trackSourceColNoBtn.classList.add("dm-btn-open-track");
    trackSourceColNoBtn.setAttribute("title", "View Collection Card");
    trackSourceColNoBtn.setAttribute("data-colrefno", trackSourceColNo);
    trackSourceColNoBtn.setAttribute("data-type", "colrefno");
    trackSourceColNoDiv.appendChild(trackSourceColNoBtn);

    const trackColRefCode = document.createElement("p");
    trackColRefCode.classList.add("track-grid-colrefcode");
    trackColRefCode.textContent = await getColRefCode(trackSourceColNo);
    trackSourceColNoDiv.appendChild(trackColRefCode);

    const trackSourceTrackNoArr = trackSourceNo.split(".");
    const trackSourceTrackNoLine1Btn = document.createElement("button");
    const trackSourceTrackNoLine2 = document.createElement("p");

    trackSourceTrackNoLine1Btn.classList.add("dm-btn-open-track");
    trackSourceTrackNoLine1Btn.setAttribute("title", "View Track in Tracklist");
    trackSourceTrackNoLine1Btn.setAttribute("data-refno", trackRefNo);
    trackSourceTrackNoLine1Btn.setAttribute("data-type", "trackno");
    trackSourceTrackNoLine1Btn.textContent = `Track # ${trackSourceTrackNoArr[0]}`;
    trackSourceTrackNoLine2.textContent = trackSourceTrackNoArr[1]? 
    `Tune # ${trackSourceTrackNoArr[1]}` :
    `Tune # 1`;
    trackSourceTrackNoDiv.appendChild(trackSourceTrackNoLine1Btn);
    trackSourceTrackNoDiv.appendChild(trackSourceTrackNoLine2);

    let trackTuneRefLink;

    if (trackTranscriptUrl) {

      trackTuneRefLink = trackTranscriptUrl;

    } else {

      const tuneObject = tunesJson.find(tune => tune.tuneref === trackTuneRefCode);
      const tuneCardTranscript = tuneObject? tuneObject.transcriptlink : "";

      trackTuneRefLink = tuneCardTranscript? tuneCardTranscript : trackRefSettingUrl;
    }

    const trackTuneFirstRefLink = trackTuneRefLink.split(/[\s,]+/)[0];
    
    if (trackTuneRefLink) {

      const trackTranscriptSource = generateLinkSourceName(trackTuneFirstRefLink);

      const trackTranscriptHyperlink = document.createElement("a");
      trackTranscriptHyperlink.setAttribute("href", trackTuneFirstRefLink);
      trackTranscriptHyperlink.setAttribute("target", "_blank");
      trackTranscriptHyperlink.textContent = trackTranscriptSource;

      trackTranscrDiv.appendChild(trackTranscriptHyperlink);
    
      const trackTuneRefCodeNo = document.createElement("p");
      trackTuneRefCodeNo.setAttribute("data-type", "tuneref");
      trackTuneRefCodeNo.classList.add("track-grid-tuneref");
      trackTuneRefCodeNo.textContent = trackTuneRefCode;
      trackTranscrDiv.appendChild(trackTuneRefCodeNo);
    
    } else {

      const trackTuneRefCodeBlank = document.createElement("p");
      trackTuneRefCodeBlank.classList.add("track-grid-tuneref");
      trackTuneRefCodeBlank.textContent = "N/A";
      trackTranscrDiv.appendChild(trackTuneRefCodeBlank);
    }

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

  } catch (error) {

    console.warn(`PD App:\n\nCreating Track Card failed. Details:\n\n${error}`);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Reference Popover Functions
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Show Reference Links popover handler function

async function showRefPopover(trigger, refNo) {

  if (await doDataCheckup(refsJson, "refs") === 0) {

    return;
  }

  try {

    const refObject = refsJson.find(reflinks => reflinks.refitemno === refNo);

    await createRefCard(refObject);

    linksCardPopover.showPopover();

    document.querySelector("#dm-btn-ref-card-close").focus();

    console.log("PD App:\n\nRefLinks Card created.");

  } catch (error) {

    console.warn(`PD App:\n\nCreating RefLink Card failed. Details:\n\n${error}`);
  }
}


// Generate Reference Links details using data from refLinksObject

async function createRefCard(refObject) {

  try {

    refCardGridDiv.textContent = "";

    const refItemCodeDiv = document.querySelector(".ref-grid-hcode");
    const refItemTitleDiv = document.querySelector(".ref-grid-htitle");

    const refItemCode = refObject.refitemcode;
    const refItemName = refObject.refshortname;
    const refItemType = refObject.reftype;

    let refItemTitle = `Links for: ${refItemName}`;

    refItemCodeDiv.textContent = refItemCode;
    refItemTitleDiv.textContent = refItemTitle;

    for (let i = 1; i <= 5; i++) {
      
      const linkText = refObject[`refdetails${i}`].split(' | ')[0];
      const linkUrl = refObject[`refdetailslink${i}`];

      if (linkText && linkUrl) {

        const linkAltText = refObject[`refdetails${i}`].split(' | ')[1];

        const linkDescription = 
          refItemType === "tunedb" && linkAltText? `${refItemName} ${linkText}: ${linkAltText}` :
          linkAltText? linkAltText : 
          `${refItemName}: ${linkText}`;

        const refLinkWrapper = document.createElement("div");
        refLinkWrapper.classList.add("dm-ref-link-wrapper", "link-wrapper");

        const refLink = document.createElement("a");
        refLink.setAttribute("href", linkUrl);
        refLink.setAttribute("target", "_blank");
        refLink.setAttribute("title", linkDescription);
        setAriaLabel(refLink, linkDescription);
        refLink.textContent = linkText.split(' | ')[0];

        refLinkWrapper.appendChild(refLink);
        refCardGridDiv.appendChild(refLinkWrapper);
      }
    }

  } catch (error) {

    throw new Error(error.message);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Popover Navigation Functions
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Navigate between cards using navigation buttons (prev, close, next)

async function navigateTuneCard() {

  const navBtnClass = this.classList;
  const navBtnParent = this.parentElement.classList;
  let parentDialog;

  try {

    if (navBtnClass.contains("dm-btn-popover-close")) {

      navBtnParent.contains("dm-col-grid-header") || 
      navBtnParent.contains("dm-col-grid-footer") ? 
        colCardPopover.hidePopover() :
    
      navBtnParent.contains("dm-track-grid-header") || 
      navBtnParent.contains("dm-track-grid-footer") ? 
        trackCardPopover.hidePopover() :
      
      navBtnParent.contains("dm-ref-grid-header") ?
        linksCardPopover.hidePopover() :
      
      navBtnParent.contains("dm-nav-card-header") ?
        navCardPopover.hidePopover() :
      
        tuneCardPopover.hidePopover();

      if (navBtnClass.contains("dm-btn-card-dialog-close")) {

        parentDialog = navBtnParent.contains("dm-col-grid-footer")? colsListDialog : tunelistDialog;

        await parentDialog.close();
        addAriaHidden(parentDialog);
        hideDialogsDiv();
      }

      return;
    }

    if (navBtnClass[1].endsWith("tune") ||
        navBtnClass[1].endsWith("col") ||
        navBtnClass[1].endsWith("track")) {

      const navBtnDirection = navBtnClass[1].slice(7, 11);

      navBtnClass[1].endsWith("track") ? switchTuneCard(navBtnDirection, tracksJson, "tracks") :
      navBtnClass[1].endsWith("tune") ? switchTuneCard(navBtnDirection, tunesJson, "tunes") :
      navBtnClass[1].endsWith("col") ? switchTuneCard(navBtnDirection, colsJson, "cols") :
      console.warn("PD App:\n\nUnknown card type!");
    }

  } catch (error) {

    console.warn(`PD App:\n\nError generating card. Details\n\n:${error}`);
  }
}

async function switchTuneCard(switchDirection, parentJson, dataType) {

  if (!switchDirection || !parentJson) {

    console.warn("PD App:\n\nCard switch direction or type not specified!");

    return;
  }

  if (await doDataCheckup(parentJson, dataType) === 0) {

    return;
  }

  try {

    let cardRef;
    let currentCardObject;
    let targetTuneObject;
    let targetLabel;

    if (parentJson === tracksJson) {
      cardRef = document.querySelector('.track-grid-hrefno').textContent.split(' ')[1];
      currentCardObject = parentJson.find(track => track.refno === cardRef);
    }

    if (parentJson === tunesJson) {      
      cardRef = document.querySelector('.tune-grid-htuneref').textContent;
      currentCardObject = parentJson.find(tune => tune.tuneref === cardRef);
    }

    if (parentJson === colsJson) {
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
    
    parentJson === tracksJson? createTrackCard(targetTuneObject) : 
    parentJson === tunesJson? createTuneCard(targetTuneObject) :
    createColCard(targetTuneObject);

    console.log(`PD App:\n\n${targetLabel} card rendered.`);
  
  } catch (error) {

    throw new Error(`Error rendering ${targetLabel} card in ${getInfoFromDataType(parentJson)[1]}. Details:\n\n${error}`);
  }
}

// Get popover section and keyword to highlight, return them as object

function getHighlightObject(button) {

  let targetSectionPar = button.getAttribute("data-type");

  if (targetSectionPar === "tunetype") {

    targetSectionPar = "tunename";
  }

  let highlightObj = {};

  if (targetSectionPar) {

    const targetKeyword = button.firstElementChild.textContent.split('”: ')[0].slice(1);

    highlightObj.section = targetSectionPar;
    highlightObj.keyword = targetKeyword;
  }

  return highlightObj;
}

// Highlight target text inside popover element

function highlightCardText(hightlightObj, targetPopover) {

  if (isObjectEmpty(hightlightObj)) {

    return;
  }

  const targetText = hightlightObj.keyword;
  const targetSection = hightlightObj.section;
  let targetSectionPar = targetPopover.querySelector(`[data-type="${targetSection}"]`);

  if (targetSectionPar) {
    
    if (targetSection === "tracknotes") {

      targetSectionPar.querySelectorAll("p").forEach(paragraph => {

        if (processString(paragraph.textContent).includes(processString(targetText))) {

          splitHighlightRejoin(targetText, paragraph, targetPopover);
        }
      });

    } else {

      splitHighlightRejoin(targetText, targetSectionPar, targetPopover);
    }
  }
}

// Split normalized text on keyword, rejoin using original string and split indexes, wrap keyword into highlighting span

function splitHighlightRejoin(targetText, targetSectionPar, targetPopover) {

  const origText = targetSectionPar.textContent;

  const plainTargetText = processString(targetText);
  const plainSectionText = processString(targetSectionPar.textContent);
  const plainPartsArr = plainSectionText.split(plainTargetText);

  let partsStringLastIndex = 0;

  targetSectionPar.textContent = "";
  
  for (let i = 0; i < plainPartsArr.length; i++) {

    const origTextPart = origText.substring(partsStringLastIndex, partsStringLastIndex + plainPartsArr[i].length);

    const origTextPartNode = document.createTextNode(origTextPart);

    targetSectionPar.appendChild(origTextPartNode);

    partsStringLastIndex += plainPartsArr[i].length;

    if (i < plainPartsArr.length - 1) {

      const matchingText = origText.substring(partsStringLastIndex, partsStringLastIndex + targetText.length);

      const highlightSpan = document.createElement("span");

      if (targetPopover === tuneCardPopover) {

        highlightSpan.classList.add("highlighted-bright");

      } else {

        highlightSpan.classList.add("highlighted");
      }

      const matchingTextNode = document.createTextNode(matchingText);

      highlightSpan.appendChild(matchingTextNode);

      targetSectionPar.appendChild(highlightSpan);

      partsStringLastIndex += targetText.length;
    }
  }
}

// Notify speech reader user when Popover Card is opened / closed

export function alertPopoverState() {

  const isPopoverOpen = this.matches(':popover-open');

  let popoverType = this === tuneCardPopover? "Tune Card" : 
                    this === colCardPopover? "Collection Card" :
                    this === trackCardPopover? "Track Card" :
                    this === themePickerPopover? "Color Theme Selection Card" :
                    "Links Card";

  let popoverMessage = isPopoverOpen? " is open." : " was closed.";

  statusBars.forEach(bar => {

    bar.textContent = `${popoverType} ${popoverMessage}`;

    setTimeout(() => {
      bar.textContent = "";
    }, 3000);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Popover Handler Functions
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Call a Show Popover function depending on element clicked

export async function showPopoverHandler(event) {

  try {

    const triggerElement = event.target;
    const closestClickableRow = triggerElement.closest('tr[data-refno]');
    const closestButton = triggerElement.closest(".dm-btn-open-track");

    let rowRefNo;

    if (closestClickableRow) {

      rowRefNo = closestClickableRow.dataset.refno;
      
      if (closestClickableRow.classList.contains("dm-tracklist-col-header-row") || 
          closestClickableRow.classList.contains("dm-collist-row")) {

        if (closestClickableRow.parentElement.id === "dm-references" || 
          closestClickableRow.parentElement.id === "dm-reflinks") {

            if (triggerElement.classList.contains("dm-btn-ref-open")) {

              showRefPopover(triggerElement, rowRefNo);
              return;
            }

          return;
        }

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
      let textToHighlight;

      if (closestButton.classList.contains("dm-btn-search-item")) {

        textToHighlight = getHighlightObject(closestButton);
      }

      if (closestButton.hasAttribute("data-refno")) {

        refNo = closestButton.dataset.refno;

        if (closestButton.parentElement.classList.contains("dm-search-results-container")) {

          if (tracklistOutput.classList.contains("hidden")) {

            generateTracklistBtn.click();
          }

          showTrackPopover(closestButton, refNo, textToHighlight);

          return;
        }

        focusOnTrack(closestButton, refNo);

        return;
      }    
      
      if (closestButton.hasAttribute("data-colrefno")) {

        refNo = closestButton.dataset.colrefno;
        
        showColPopover(closestButton, refNo, textToHighlight);

        return;
      }

      if (closestButton.hasAttribute("data-tuneref")) {

        refNo = closestButton.dataset.tuneref;
        
        showTunePopover(closestButton, refNo, textToHighlight);

        return;
      }
    }
  } catch (error) {

    console.warn(`PD App:\n\nshowPopoverHandler failed. Details:\n\n${error}`)
  }
}

// Handle click on Color Theme Picker Popover

function toggleColorThemeHandler(event) {

  const btn = event.target.closest('.theme-btn');

  if (btn) {

    themePickerPopover.hidePopover();

    toggleColorTheme(btn.dataset.theme);

    btn.classList.add("hidden");

    themeToggleBtn.focus();

    // Let App Helper show off their new look

    if (!allAppHelperImgs[0].classList.contains("expanded")) {
    
        setTimeout(() => {

          showAppHelper();
        }, 150);

        setTimeout(() => {
          
          hideAppHelper();
        }, 3750);
      }
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialize Popovers & Popover Elements
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Add event listeners to Popover Card navigation buttons

export function initPopovers() {

  themePickerPopover.addEventListener('click', toggleColorThemeHandler);
  
  [trackRefLinkDiv, 
    trackSourceDiv, 
    tuneTrackRefDiv, 
    colRefLinkDiv].forEach(popoverRefDiv => {
    popoverRefDiv.addEventListener('click', showPopoverHandler);
  });

  cardNavBtn.forEach(navBtn => {

    navBtn.addEventListener('click', navigateTuneCard);
  });

  allPopovers.forEach(popover => {

    popover.addEventListener('toggle', alertPopoverState);
  });
}
