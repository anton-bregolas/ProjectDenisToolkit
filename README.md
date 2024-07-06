#ProjectDenis Toolkit
========================================================================================
#ProjectDenis Toolkit is a set of simple tools for building and updating the database for the project in tribute to the Sliabh Luachra music legend, fiddle player Denis Murphy (1910–1974).

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
+ Tracklist compartmentalised into separate component to reduce clutter.
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

## App Launcher v.1.0

[v.1.0]

+ Fetches Tracks, Collections and Tunes JSONs and assigns them to custom JSONs.
+ Reveals Search section with radio button group and search input / output.

## Search Engine v.1.0

[v.1.1]

+ Search Engine now searches for each individual word in search input.
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

## List Generator v.2.0

This tool generates interactive lists of tunes, tracks and collections using the JSON Splitter data output.

[v.2.0]

+ Full support for dual use of fetch and/or local JSON database.
+ Tracklist refactored and compartmentalised, headers moved to HTML.
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

## TSV to JSON Parser v.2.0

This tool converts Tab-Separated Value strings from #ProjectDenis Google Sheet table into JSON format.

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

## JSON Splitter v.1.8

This tool splits the JSON file generated by the parser into three data categories: collections, tracks and tunes.

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
