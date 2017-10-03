$("#afterH1").append("<div class='gpa'></div>")
$(".gpa").append("<p id='gpaTitle'>GPA (W/UW):</p>");
var gradesArray = [];
var headerArray = [];

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

var headers = ["Q1","Q2","Q3","Q4","S1","S2","F1"]; //Column headers to access grades from
var colIndexArray = [12,14,16,18,15,19,20]; //Default header position offsets
var courseCol = 11; //Default course column to search names from
var offsetCount = 8; //Default offset between the header and body tables. (8 for 2 weeks worth of days)

var gpaArrays = [[]]; //2d array for weighted GPA
var gpaArraysUw = [[]];

var weighting=0; //Default weighting on classes

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




var pattern = [
  ["A.P.", "AP", "Calculus", "Diff"],
  [" Honors", "[0-9]H", "HNRS"],
  ["[0-9]A", "Contemp", "Acapella"], //Necessary for programatic weight reduction
  [" B$", "[0-9]B"],
  ["Algebra C", "[0-9]C"]
]


for(var i = 0; i < gradesArray.length; i++) {
  for(var j = 0; j < gradesArray[i].length; j++) {
    weighting=0;
    for (var k = 0; k<colIndexArray.length; k++) {
      if (j==colIndexArray[k]) {
        var storageIndex = k;
        var col = j;
        for (var p = 0; p<pattern.length; p++) {
          var re = new RegExp(pattern[p].join("|"), "i");
          if (re.test(gradesArray[i][courseCol])) {
            weighting = 0.666-0.333*p;
          }
        } //AP=include in weighting //
        getGrades(i,weighting,col,storageIndex);
      }
    }
  }
}

averageGPA();

console.log(gpaArrays)

function getGrades(rowIndex, weighting, colIndex, storageIndex) {
  if (typeof gpaArrays[storageIndex] == 'undefined') {
    gpaArrays[storageIndex] = new Array();
    gpaArraysUw[storageIndex] = new Array();
  }
  if (gradesArray[rowIndex][colIndex].match(/\d+/g) != null) {
    //Contains grades
    //StorageIndex = where in the GPA array to store, and which index in the columnarray to grab from
    letterGrade = gradesArray[rowIndex][colIndex].toString().replace(/[^A-Z+-]/g,'');
    gpaArrays[storageIndex].push(calculateClassGPA(letterGrade, weighting));
    gpaArraysUw[storageIndex].push(calculateClassGPA(letterGrade, 0));
  } else {
    gpaArrays[storageIndex].push(-1);
    gpaArraysUw[storageIndex].push(-1);
  }
}

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

function averageGPA() {
  //Q1
  for (var g=0; g<gpaArrays.length; g++) {
    var l = gpaArrays[g].length;
    var classTotal = 0;
    var GpaTotal = 0.0;
    var GpaTotalUw = 0.0;
    for (var i=0; i<l; i++) {
      if (gpaArrays[g][i] != -1) {
        GpaTotal+=gpaArrays[g][i];
        GpaTotalUw+=gpaArraysUw[g][i];
        classTotal++;
      }
    }
    var average = GpaTotal/classTotal;
    var averageUw = GpaTotalUw/classTotal;
    if (GpaTotal>0) {
      displayGPA(headerArray[1][colIndexArray[g]-8].toString(), average, averageUw);
    }
  }
}

function displayGPA(name, gpa, gpaUw) {
  gpa = gpa.toFixed(2);
  gpaUw = gpaUw.toFixed(2);
  $(".gpa").append("<span tabindex='0'>" + name + ": " + gpa + "/" + gpaUw + "</span></br>");
}
