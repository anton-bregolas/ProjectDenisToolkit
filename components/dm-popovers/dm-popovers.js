/* #ProjectDenis Popovers Scripts*/

import { colsDiv, tracksDiv, tunesDiv } from '../../modules/dm-toolkit.js';
import { validateJson } from '../dm-modals/dm-modals.js';
import { toggleAriaHidden } from '../../modules/aria-tools.js';

export const tuneCardPopover = document.querySelector('#dm-popover-card-tune');

// Display the Tune Card popover

export async function showTunePopover() {
  
  const tunesOutput = tunesDiv.textContent;
  let tunesJson = await validateJson(tunesOutput);
  
  if (Array.isArray(tunesJson) && tunesJson.length > 0) {

      const tuneRef = this.dataset.tuneref;

      console.log(`Creating tune card...\n\n Tune ref.:\n\n ${tuneRef}`);

      const tuneObject = tunesJson.find(tune => tune.tuneref === tuneRef);

      console.log(tuneObject);

      await createTuneCard(tuneObject);

      tuneCardPopover.showPopover();
      toggleAriaHidden(tuneCardPopover);

      console.log("Tune card created.");

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
  const tuneTranscriptUrl = tuneObject.transcriptlink.split(", ")[0];
  const tuneQuickRefUrl = tuneObject.refsettinglink.split(", ")[0];

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

    if (tuneTrackRefsArr.indexOf(refNo) < (tuneTrackRefsArr.length - 1)) {
    
      tuneTrackRefDiv.append(trackRefBtn);
      const refSeparator = document.createTextNode(", ")
      tuneTrackRefDiv.append(refSeparator);

    } else {
      
      tuneTrackRefDiv.append(trackRefBtn);
    }
  })

  if (tuneTranscriptUrl) {

    const tuneTranscriptSource = generateLinkSourceName(tuneTranscriptUrl);

    const tuneTranscriptHyperlink = document.createElement("a");
    const boldTranscriptLink = document.createElement("b");
    tuneTranscriptHyperlink.setAttribute("href", tuneTranscriptUrl);
    tuneTranscriptHyperlink.setAttribute("target", "_blank");
    tuneTranscriptHyperlink.textContent = tuneTranscriptSource;
    boldTranscriptLink.appendChild(tuneTranscriptHyperlink)
    tuneTranscrDiv.appendChild(boldTranscriptLink);
  }

  if (tuneQuickRefUrl) {

    const tuneQuickRefSource = generateLinkSourceName(tuneQuickRefUrl);

    const tuneQuickRefHyperlink = document.createElement("a");
    const boldQuickReftLink = document.createElement("b");
    tuneQuickRefHyperlink.setAttribute("href", tuneQuickRefUrl);
    tuneQuickRefHyperlink.setAttribute("target", "_blank");
    tuneQuickRefHyperlink.textContent = tuneQuickRefSource;
    boldQuickReftLink.appendChild(tuneQuickRefHyperlink);
    tuneQuickRefDiv.appendChild(boldQuickReftLink);
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
      fullColRef = "Johnny O'Leary of Sliabh Luachra (1994 / 2014)";
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

  const sourceLink = new URL(tuneTranscriptUrl);
  let sourceLinkHost = sourceLink.hostname;

  switch (sourceLinkHost) {
    case "thesession.org":
      return "The Session";
    case "tunearch.org":
      return "Tunearch";
    case "tunepal.org":
      return "Tunepal";
    default:
      return "Source";
  }
}

// Add event listeners to Tune Card buttons

export function initPopovers() {

  const closeTuneCardBtn = document.querySelectorAll('.dm-btn-popover-close');

  closeTuneCardBtn.forEach(btn => {
      
      btn.addEventListener('click', () => {

      tuneCardPopover.hidePopover();
      toggleAriaHidden(tuneCardPopover);
    });
  })
}
