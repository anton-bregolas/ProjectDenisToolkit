#ProjectDenis Toolkit
========================================================================================
#ProjectDenis Toolkit is a set of simple tools for building and updating the database for the project in tribute to the Sliabh Luachra music legend, fiddle player Denis Murphy (1910–1974).

## #ProjectDenis TSV to JSON Parser v.1.0

This tool converts Tab-Separated Value strings from #ProjectDenis Google Sheet table into JSON format.

[v.1.0]

+ Use Parse Single String button to convert a single table row into an object.
+ Use Parse From File to convert the entire table from an exported .tsv file into a JSON. 
+ Use Save Output button to download a .json file with the result.
+ The algorithm parses the lines beginning with 1000s as collection objects, lines starting with other integers are treated as individual tracks. All the other lines are ignored.
+ Clear Output button clears the last outputted result and all text in the input field.
