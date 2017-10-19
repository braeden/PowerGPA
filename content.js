$("#afterH1").append("<div class='gpa'></div>")
$(".gpa").append("<p id='gpaTitle'>GPA <br>(Academic/UW):</p>");
var gradesArray = [];
var headerArray = [];
var headers = ["Q1","Q2","Q3","Q4","S1","S2","F1"]; //Column headers to access grades from
var colIndexArray = [12,14,16,18,15,19,20]; //Default header position offsets
var courseCol = 11; //Default course column to search names from
var offsetCount = 8; //Default offset between the header and body tables. (8 for 2 weeks worth of days)

var gpaArrays = [[]]; //2d array for weighted GPA
var gpaArraysUw = [[]];

var weighting=0; //Default weighting on classes

var pattern = [
  ["P"],
  ["H"],
  ["A"], // Patterns to match the weighting of classes.csv
  ["B"], // Programatic weighting reduction (order matters)
  ["C"]
]


htmlToArrays();
setupColumns();

var classesArray = [[]];

//
// Make an XML request for the CSV file and put it in an array
//
var xhr = new XMLHttpRequest();
xhr.open('GET', chrome.extension.getURL('classes.csv'), true);
xhr.onreadystatechange = function() {
    if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
      classesArray = CSVToArray(xhr.responseText);
      beginParsing();
    }
};
xhr.send();

//
// Main function for getting and calculating grades
//
function beginParsing() {
  for(var i = 0; i < gradesArray.length; i++) {
    for(var j = 0; j < gradesArray[i].length; j++) {
      weighting=0;
      for (var k = 0; k<colIndexArray.length; k++) {
        if (j==colIndexArray[k]) {
          var storageIndex = k;
          var col = j;
          weighting = getWeighting(i);
          getGrades(i,weighting,col,storageIndex);
        }
      }
    }
  }

  averageGPA();

  console.log(gpaArrays);
  console.log(gpaArraysUw);
}

//
// Parse the header HTML table and the main table body into two 2d arrays 
//
function htmlToArrays() {
  //Store body w/ grades into array
  $("tbody:first tr").each(function() {
      var arrayOfThisRow = [];
      var tableData = $(this).find('td');
      if (tableData.length > 0) {
          tableData.each(function() { arrayOfThisRow.push($(this).text()); });
          gradesArray.push(arrayOfThisRow);
      }
  });
  //Store header rows into array
  $("tbody:first tr").each(function() {
      var arrayOfThisRow = [];
      var tableData = $(this).find('th');
      if (tableData.length > 0) {
          tableData.each(function() { arrayOfThisRow.push($(this).text()); });
          headerArray.push(arrayOfThisRow);
      }
  });

}

//
// Based on a row index of existing classes, find the weighting if they're academic
//
// Returns:
//  int  - for weighting
//  null - if it's not academic
//
function getWeighting(row) {
  for (var i = 0; i<classesArray.length; i++) {
    if (gradesArray[row][courseCol].toLowerCase().includes(classesArray[i][0].toLowerCase())) {
      //Class name is in the class list array
      for (var p = 0; p<pattern.length; p++) {
        var re = new RegExp(pattern[p]);
        if (re.test(classesArray[i][1])) {
          //academic class
          weighting = 0.666-0.333*p;
          return weighting;
        }
      }
    }
  }
  return null;
}

//
// Programatically find the column index of each header that we want eg. Semester 1, Final 1
//
function setupColumns() {
  for(var j = 0; j < headerArray[1].length; j++) {
    if (typeof headerArray[1][j] != 'undefined') {
      for (var h = 0; h < headers.length; h++) {
        if (headerArray[1][j].toString().replace(/\s/g) == headers[h]) {
            colIndexArray[h] = j+offsetCount; //Day count offset in table
        }
      }
      if (headerArray[1][j].toString().replace(/\s/g) == "Course") {
          courseCol = j+offsetCount;
      }
    }
  }
}

//
// Organize the gathering of grades and 2d array assignment of individual class GPAs
//
function getGrades(rowIndex, weighting, colIndex, storageIndex) {
  if (typeof gpaArrays[storageIndex] == 'undefined') {
    gpaArrays[storageIndex] = new Array();
    gpaArraysUw[storageIndex] = new Array();
  }
  if (gradesArray[rowIndex][colIndex].match(/\d+/g) != null) {
    //Contains grades
    //StorageIndex = where in the GPA array to store, and which index in the columnarray to grab from
    letterGrade = gradesArray[rowIndex][colIndex].toString().replace(/[^A-Z+-]/g,'');
    if (weighting != null) { //An academic class
      gpaArrays[storageIndex].push(calculateClassGPA(letterGrade, weighting));
    } else {
      gpaArrays[storageIndex].push(-1);
    }
    gpaArraysUw[storageIndex].push(calculateClassGPA(letterGrade, 0));
  } else {
    gpaArrays[storageIndex].push(-1);
    gpaArraysUw[storageIndex].push(-1);
  }
}

//
// Coverts a letter grade to a GPA with included weighting and extension
//
// Returns:
//  int - the converted GPA for a given letter grade and weighting
//
function calculateClassGPA(letterGrade, weighting) {
  var g = 0.0;
  //console.log(letterGrade)
  var l = ["A", "B", "C", "D", "N"];
  for (var i=0; i<l.length; i++) {
    if (letterGrade.includes(l[i])) {
      g=4.00-i;
      if (letterGrade.includes("+")) {
        g+=0.333;
      } else if (letterGrade.includes("-")) {
        g-=0.333;
      }
      if (g>0) {
        g+=weighting;
      }
    }
  }
  return(g);

}

//
// Average both weighted and unweighted 2d GPA arrays
//
function averageGPA() {
  for (var g=0; g<gpaArrays.length; g++) {
    var l = gpaArrays[g].length;
    var classTotal = 0;
    var classTotalUw = 0
    var GpaTotal = 0.0;
    var GpaTotalUw = 0.0;
    for (var i=0; i<l; i++) {
      if (gpaArrays[g][i] != -1) {
        GpaTotal+=gpaArrays[g][i];
        classTotal++;
      }
      if (gpaArraysUw[g][i] != -1) {
        GpaTotalUw+=gpaArraysUw[g][i];
        classTotalUw++;
      }
    }
    var average = GpaTotal/classTotal;
    var averageUw = GpaTotalUw/classTotalUw;
    if (GpaTotal>0) {
      displayGPA(headerArray[1][colIndexArray[g]-8].toString(), average, averageUw);
    }
  }
}

//
// Push the unweighted and weighted GPAs to the page
//
function displayGPA(name, gpa, gpaUw) {
  gpa = gpa.toFixed(2);
  gpaUw = gpaUw.toFixed(2);
  $(".gpa").append("<span tabindex='0'>" + name + ": " + gpa + "/" + gpaUw + "</span></br>");
}

// Credit: https://www.bennadel.com/blog/1504-ask-ben-parsing-csv-strings-with-javascript-exec-regular-expression-command.htm

// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray( strData, strDelimiter ){
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");
    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
        );
    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];
    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;
    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec( strData )){
        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[ 1 ];
        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
            strMatchedDelimiter.length &&
            (strMatchedDelimiter != strDelimiter)
            ){
            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push( [] );
        }
        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[ 2 ]){
            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            var strMatchedValue = arrMatches[ 2 ].replace(
                new RegExp( "\"\"", "g" ),
                "\""
                );
        } else {
            // We found a non-quoted value.
            var strMatchedValue = arrMatches[ 3 ];
        }
        // Now that we have our value string, let's add
        // it to the data array.
        arrData[ arrData.length - 1 ].push( strMatchedValue );
    }
    // Return the parsed data.
    return( arrData );
}
