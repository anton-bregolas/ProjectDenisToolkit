#ProjectDenis Toolkit
========================================================================================
#ProjectDenis Toolkit is a set of simple tools for building, updating and testing the database for the prototype project in tribute to the Sliabh Luachra music legend, fiddle player Denis Murphy (1910–1974).

When toolkitMode is set to 1 in `dm-toolkit.js` it turns off fetch functions and reveals GUI for parsing .tsv files imported from Google Sheets

Toolkit contents:

File Name | Module Name | Description |
| --- | --- | --- |
| `dm-app.js` | **App Launcher** | Launch, Fetch and other general functions used in Start Menu |
| `dm-helper.js` | **App Helper** | Scripts related to App Helper and Guided Help Tour |
| `dm-modals.js` | **Modal Lists Generator** | Scripts related to creating modal dialog windows with lists of content |
| `dm-popovers.js` | **Popovers Generator** | Scripts handling generation and display of Popovers for all sections except for the Helper |
| `dm-search.js` | **Search Engine** | Search functions for filtering through Tune DB and generating search items |
| `dm-tracklist.js` | **Tracklist Generator** | Tracklist-related scripts for Main Page sortable Tracklist table |
| `dm-toolkit.js` | **TSV to JSON Parser** | Scripts converting .tsv imports from working Google Sheets into a single Tune DB format JSON |
| `dm-toolkit.js` | **JSON Splitter** | Scripts creating Tunelist from mixed JSON of objects and splitting all the data into Tune DB JSONs |

Tune DB contents:

File Name | DB Name | Description |
| --- | --- | --- |
| `collections.json` | **colsJson / Collections DB** | JSON array of Collection objects: All the albums, archival items, 78RPM recordings of Denis Murphy catalogued so far used for generating Collections list |
| `helper.json` | **helperJson / Helper DB** | JSON array of Help Card objects with lines used in App Helper UI |
| `references.json` | **refsJson / References DB** | JSON array of Links & References objects: All the referenced printed collections of music and online resources (archives, ABC databases, Sliabh Luachra-related pages) used for generating the list of References |
| `tracks.json` | **tracksJson / Tracks DB** | JSON array of Track objects: Every catalogued and numbered Track item with tune details and track comments for generating Tracklist |
| `tunes.json` | **tunesJson / Tunes DB** | JSON array of Tune objects: List of identified Tunes with unique ref. codes for generating Tunelist |

[v.3.1]

+ Guided Help Tour with Help Popover Menu and animated transitions.
+ Stable Helper animations on page load and theme change.
+ Helper JSON with detailed tour comments added. 
+ Helper scripts & styles separated into separate component.
+ Improved launcher handling cases of slow image load.
+ Arrow navigation now supported in all popovers.

[v.3.0]

+ Helper added to main page.
+ Asynchronous faster search.
+ Smooth scrolling and animations.
+ Main page nav popover fine-tuned. 
+ Fetch data and Custom JSON logic revisited.
+ Code refactored to prep for client version separation.

[v.2.9]

+ Click on Search item highlights keyword in target popover card.
+ Main page navigation hover button with popover menu added.
+ Color theme The Paps of Anu added and fine-tuned.
+ Data status checks simplified with doDataCheckup function.
+ Reference popover with additional links finished and styled.
+ Reference lists split into two tables to fix accessibility bug.

[v.2.8]

+ Reference list sections added using modal dialogs.
+ The Star Above The Garter color theme reworked with gradient background.
+ Color theme variations split to separate override css.
+ User color theme is now saved and retrieved from localStorage.
+ Search matches results regardless of diacritics.

[v.2.7]

+ App Main Page split into three sections: Search (Search section), Explore (Generator section) and Discover (Reference section).
+ Toolkit or Demo mode is now fully pre-set in the App via a variable. 
+ Search section checks simplified to avoid edge cases.
+ Smarter search results: matches are now explicitly grouped in the search output, relevant object sections are made more obvious.
+ Tune DB updated to version 2024-07-11 (major updates in Tracks and Tunes).

[v.2.6]

+ Multi-word Search Engine with stop list.

[v.2.5]

+ Search Engine added to Toolkit.
+ App launcher added to Toolkit.
+ Icons added and tidied up.
+ Button styles refactored.
+ Try-catch blocks added to scripts.

[v.2.4]

+ Tracklist and Collection List refactored from CSS Grid to Table to improve performance.
+ Function showPopoverHandler added, triggers popover card display using event delegation.
+ Accessibility of tables, dialogs and popovers verified using screen readers.

[v.2.3]

+ Fully fetchable Tracklist, Tunelist and Collections.
+ Tracklist compartmentalized into separate component to reduce clutter.
+ Tracklist sorting introduced with several sorting algorithms.
+ Experimental ARIA Table roles added to Tracklist.
+ Tune, Collections, Track popover cards adapted to new structure.

[v.2.2]

+ Experimental fetch requests to Tune database on GitHub to get Tracklist, Tunelist and Collections.

[v.2.1]

+ Popover cards' HTML / CSS / JS tweaked and refactored.
+ Semantic markup revisited to improve accessibility and prepare for ARIA tweaks.
+ Color themes thoroughly tweaked to meet contrast ratio requirements.

[v.2.0]

+ Fully functional and interlinked Tracklist, Tunelist and Collections.
+ Functions and styles refactored to reduce repetition.

[v.1.9]

+ Fully functional collection lists.
+ Design picked for CSS Grid table for collections and tracklist.

[v.1.8]

+ Fully functional tunelists and experimental version of collection lists.

[v.1.7]

+ CSS custom properties redesigned to declutter stylesheets.
+ Each color theme now has a color palette of 10 colors plus 2 variable focus colors.
+ Three experimental color themes added: Rainy theme, Rainbow theme and The Star above the Garter theme.
+ Color theme toggle button now triggers a popover offering a selection of themes.

[v.1.0 - v.1.6]

+ Development in basic Toolkit mode with Generator, Parser and Splitter sections (detailed breakdown below).

## App Helper v.1.1

[v.1.1]

+ Stable Helper animations on page load and theme change.
+ Helper JSON with detailed tour comments added. 
+ Helper JSON fetched separately from Tune DB.
+ Guided Help Tour algorithm created with data-stage checks on Help Popover. 
+ Help Popover Menu navigation designed with OK, Next/Back and Quit button types.
+ Added animated transitions and optional focusing on elements to Help Tour.
+ Helper scripts & styles separated into separate component.

[v.1.0]

+ Helper images added to assets/images in webp and png format.
+ Images wrapped in <picture> tag with basic srcset settings and media queries.
+ Helper costumes change colors on color theme toggle, load with remembered user theme setting.
+ Test slide-in and slide-out animations on page load and color theme change.

## App Launcher v.1.5

[v.1.5]

+ App Helper load functions added, Launch App Sequence extended.
+ Guided Tour prompt with selectable show-on-startup checkbox added on Start Exploring button press.
+ Slow loading of images cases handled with transitionend event and starting opacity style settings.

[v.1.4]

+ Code refactored and cleaned up to prepare for client version separation.
+ Fixed Custom JSON array imports and logic for updating to clearing Tune Data. 
+ Fetch data function split into multiple specialized callback functions.
+ Edge cases of missing Tune Data covered with automated checking and updating of Tune DB files.
+ Error handling or logging simplified and improved.
+ Shared Toolkit functions moved to dm-app.js, which now exports and initializes all Generator and Color Theme elements.

[v.1.3]

+ Added doDataCheckup function to check status of Tune DB files. 
+ The length of individual data JSONs is now returned via fetchDataJsons.
+ App launching sequence tweaked.

[v.1.2]

+ Support for References DB added to fetch data functions.
+ Saves user color theme and retrieves it on new page load via localStorage.

[v.1.1]

+ Determines starting mode as Toolkit or App Demo by checking global variable toolkitMode (offline mode if > 0).
+ Reveals or hides Toolkit sections depending on the mode (Parser and Splitter are hidden if toolkitMode === 0).
+ Fills in Tracks, Collections and Tunes counters in App and Splitter sections after JSONs are loaded.

[v.1.0]

+ Fetches Tracks, Collections and Tunes JSONs and assigns them to custom JSONs.
+ Reveals Search section with radio button group and search input / output.

## Search Engine v.1.5

[v.1.5]

+ Split word search now counts and displays results asynchronously, bulky search results no longer blocking the thread.

[v.1.4]

+ Text matching keyword is now automatically highlighted when the opening of a popover card is triggered by search item.
+ If multiple instances of keyword are found in the text of the target popover card section, they are all highlighted.

[v.1.3]

+ Matches results regardless of diacritics: both keywords and DB item strings now filtered using Normalize method.
+ Added processString function to handle search strings within the getSearchMatches function.

[v.1.2]

+ Matches in the search output are explicitly grouped and identified by separators (exact matches, partial matches).
+ Results found by exact phrase, results found in object names and the rest of the results are visually grouped.
+ Relevant object sections shown in result items are additionally highlighted to make them more obvious.
+ Results found in alt. names now use Alt. Name displayed instead of Tune Name.
+ Toggle functions switching TabIndex and Aria-Hidden split into explicit add / remove functions to avoid edge cases.
+ Added counters for Tracks, Collections and Tunes below the Search Input.

[v.1.1]

+ Search Engine now searches for each individual word in search input in addition to exact phrase search.
+ Basic stop list of English prepositions added.
+ Keyword is omitted from a multi-word search if stop list contains it.

[v.1.0]

+ Search split into three categories – Tracks, Collections and Tunes.
+ Radio button group checked value determines current search category.
+ Search filters through Tune Data JSON using the includes() method.
+ Search item cards are cloned and appended to Search Result section.
+ Each search item specifies search result type, name and ref. no.
+ Each search item is a button that triggers a Show Popover function.
+ Choice of functions is delegated to showPopoverHandler.

## List Generator v.2.3

This tool generates interactive lists of tunes, tracks and collections using the JSON Splitter data output.

[v.2.3]

+ Code refactored and cleaned up to prepare for client version separation.
+ Generator functions are now all handled within dm-app.js, dm-modals.js and dm-tracklist.js.

[v.2.2]

+ Generates lists of References and Links from References DB.

[v.2.1]

+ Toolkit or Demo mode is now fully pre-set via variable toolkitMode
+ Old checks have been cleaned up in dm-toolkit.js and Toolkit-relevant constants renamed to avoid confusion.

[v.2.0]

+ Full support for dual use of fetch and/or local JSON database.
+ Tracklist refactored and compartmentalized, headers moved to HTML.
+ Tracklist ARIA roles added.
+ Tracklist sorting introduced.
+ Tune Card better adapts to mobile.
+ Bugs fixed.

[v.1.9]

+ Generator buttons will now make fetch requests if data output is empty, fetching Tunes / Tracks / Collections JSON from the latest Tune Database on GitHub.

[v.1.8]

+ HTML: Better semantic markup, replaced some divs with section, nav, header tags.
+ CSS: Popover design overhaul across color themes for better accessibility and general better look.
+ JS: Changes to filtering and displaying reference links and codes in Popover creation functions.

[v.1.7]

+ Tracklist now dynamically generated on main page. 
+ Major refactor of functions.

[v.1.6]

+ Collection List and Cards redesigned using CSS Grid and Popover API.

[v.1.5]

+ Tunelist Generator now dynamically creates collection lists using data from Tunes Output.
+ Dynamically created Collection Cards designed using CSS Grid and Popover API.
+ Functions added: generateColsList, showColPopover, createColCard.

[v.1.4]

+ Tune Cards can now be browsed with next / previous buttons.

[v.1.3]

+ Tunelist Generator now dynamically creates Tune Cards using dataset properties of Tunelist items and Tunes Output data.
+ Tune Cards redesigned using CSS Grid and Popover API.
+ Functions added: showTunePopover, createTuneCard, generateTuneName, generateTuneFullRef, generateLinkSourceName.
+ Style and media query fixes for better responsiveness.

[v.1.2]

+ Popover design of a tune card for Tunelist Generator tested using dummy popover.
+ Styles, media queries and aria labels tweaked for better responsiveness and accessibility.

[v.1.1]

+ Tunelist Generator now dynamically creates tunelists using data from Tunes Output.
+ Tunelists can now be generated using outputs from either Parse From File or Parse Single String.

[v.1.0]

+ Responsive design tested for Tunelist grid using dummy tunelist.
+ Tunelist dialog styles tweaked for light and dark themes.

## TSV to JSON Parser v.2.3

This tool converts Tab-Separated Value strings from #ProjectDenis Google Sheet table into JSON format.

[v.2.3]

+ Code refactored and cleaned up to prepare for client version separation.
+ Parser-exclusive functions and definitions are contained within dm-toolkit.js, the rest is imported from dm-app.js.

[v.2.2]

+ Parser now recognizes and parses References .tsv imports.
+ References DB is printed to main output and saved.

[v.2.1]

+ Toolkit or Demo mode is now fully pre-set via variable toolkitMode
+ Old checks have been cleaned up in dm-toolkit.js and Toolkit-relevant constants renamed to avoid confusion.

[v.2.0]

+ Full support for dual use of fetch and/or local JSON database.

[v.1.9]

+ Validation of JSON output backed up by fetch requests, fetching Tunes / Tracks / Collections JSON from the latest Tune Database on GitHub if JSON Splitter output is empty.

[v.1.8]

+ Added function filterMergeLinks and tweaked Tunelist filtering to allow for multiple transcriptions or ref. links per tune.

[v.1.7]

+ Functions refactored to reduce repetition.

[v.1.6]

+ Module script functions and exports updated.

[v.1.5]

+ Styles and media queries tweaked for better responsiveness.
+ Aria labels rechecked and tweaked for better accessibility.

[v.1.4]

+ Updated parseSingleString, now it passes output result to JSON Splitter via filterOutput.

[v.1.3]

+ New responsive design for buttons using CSS Grid.
+ Stylesheet and scripts refactored, split into modules for code reusability.

[v.1.2]

+ Function clearOutput updated, now it also resets counters added to Splitter.
+ Added comments describing all functions.

[v.1.1]

+ Parse From File button now automatically launches a function that filters the output, splits it into three data categories and displays them below in the new JSON Splitter section.

[v.1.0]

+ Use Parse Single String button to convert a single table row into an object.
+ Use Parse From File to convert the entire table from an exported .tsv file into a JSON. 
+ Use Save Output button to download a .json file with the result.
+ The algorithm parses the lines beginning with 1000s as collection objects, lines starting with other integers are treated as individual tracks. All the other lines are ignored.
+ Clear Output button clears the last outputted result and all text in the input field.

## JSON Splitter v.2.3

This tool splits the JSON file generated by the parser into three data categories: collections, tracks and tunes.

[v.2.3]

+ Code refactored and cleaned up to prepare for client version separation.
+ Splitter-exclusive functions and definitions are contained within dm-toolkit.js, the rest is imported from dm-app.js.

[v.2.2]

+ Added Reference JSON output and support for splitting Reference data from Mixed Data JSON.

[v.2.1]

+ Toolkit or Demo mode is now fully pre-set via variable toolkitMode
+ Old checks have been cleaned up in dm-toolkit.js and Toolkit-relevant constants renamed to avoid confusion.

[v.2.0]

+ Full support for dual use of fetch and / or local JSON database.

[v.1.9]

+ Validation of JSON output backed up by fetch requests, fetching Tunes / Tracks / Collections JSON from the latest Tune Database on GitHub if JSON Splitter output is empty.

[v.1.8]

+ Added function filterMergeLinks and tweaked Tunelist filtering to allow for multiple transcriptions or ref. links per tune.

[v.1.7]

+ Functions refactored to reduce repetition.

[v.1.6]

+ Module script functions and exports updated.

[v.1.5]

+ Styles and media queries tweaked for better responsiveness.
+ Aria labels rechecked and tweaked for better accessibility.

[v.1.4]

+ Single tune objects with valid refno can now be outputted via parseSingleString and passed to Tunelist Generator.

[v.1.3]

+ New responsive design for buttons using CSS Grid.
+ Stylesheet and scripts refactored, split into modules for code reusability.

[v.1.2]

+ Function createTuneList further tweaked to account for unnamed tunes or those with no tune type.
+ Added counters for collections, tracks and tunes.
+ Added comments to all splitter functions.

[v.1.1]

+ Function createTuneList further tweaked, transcription and reference links added to tune objects.
+ Tunes with no reference now get temp tuneref assigned to them and get properly separated into multiple objects.

[v.1.0]

+ Use Split Mixed JSON button to split a mixed .json file into three data categories.
+ Use Save Cols JSON button to download a filtered .json file with collection headers.
+ Use Save Tracks JSON button to download a filtered .json file with all tracks.
+ Use Save Output button button to download a filtered .json file with unique tunes (work-in-progress).
