$("#afterH1").append("<div class='gpa'></div>")
$(".gpa").append("<p id='gpaTitle'>GPA (W):</p>");
var gradesArray = [];
var headerArray = [];

$("tbody:first tr").each(function() {
    var arrayOfThisRow = [];
    var tableData = $(this).find('td');
    if (tableData.length > 0) {
        tableData.each(function() { arrayOfThisRow.push($(this).text()); });
        gradesArray.push(arrayOfThisRow);
    }
});
$("tbody:first tr").each(function() {
    var arrayOfThisRow = [];
    var tableData = $(this).find('th');
    if (tableData.length > 0) {
        tableData.each(function() { arrayOfThisRow.push($(this).text()); });
        headerArray.push(arrayOfThisRow);
    }
});

/*
for(var j = 0; j < headerArray[1].length; j++) {
  //headerArray[j][1]
  if (typeof headerArray[1][j] != 'undefined') {
    switch(headerArray[1][j].toString().replace(/\s/g)) {
      case "Course":
        courseRow = j+8;
        break;
      case "Q1":
        qOneRow = j+8;
        break;
      case "Q2":
        qTwoRow = j+8;
        break;
      case "Q3":
        qThreeRow = j+8;
        break;
      case "Q4":
        qFourRow = j+8;
        break;
      case "S1":
        semOneRow = j+8;
        break;
      case "S2":
        semTwoRow = j+8;
    }
  }
}
*/

var courseRow = 11;

var colIndexArray = [12,14,16,18,15,19];
//Course,Q1,Q2,Q3,Q4,S1,S2
var gpaArrays = [[]]; //2d array
//Q1,Q2,Q3,Q4,S1,S2

var weighting=0;

var pattern = [
  ["A.P.", "AP", "Calculus", "Diff"],
  [" Honors", "[0-9]H"],
  ["[0-9]A", "Contemp"], //Not necessary - for programatic weight reduction
  [" B", "[0-9]B"],
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
          if (re.test(gradesArray[i][courseRow])) {
            weighting = 0.667-0.333*p;
          }
        }
        getGrades(i,weighting,col,storageIndex);
      }
    }
  }
}

averageGPA();

console.log(gpaArrays)

function getGrades(rowIndex, weighting, col, storageIndex) {
  //Q1
//olIndexArray[storageIndex]
  if (typeof gpaArrays[storageIndex] == 'undefined') {
    gpaArrays[storageIndex] = new Array();
  }
  //console.log(rowIndex, col);
  if (gradesArray[rowIndex][col].match(/\d+/g) != null) {
    //Contains grades
    //StorageIndex = where in the GPA array to store, and which index in the columnarray to grab from
    letterGrade = gradesArray[rowIndex][col].toString().replace(/[^A-Z+-]/g,'');
    gpaArrays[storageIndex].push(calculateClassGPA(letterGrade, weighting));
  } else {
    gpaArrays[storageIndex].push(-1);
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
      g+=weighting;
    }
  }
  //console.log(g);
  return(g);

}

function averageGPA() {
  //Q1
  for (var g=0; g<gpaArrays.length; g++) {
    var l = gpaArrays[g].length;
    var classTotal = 0;
    var GpaTotal = 0.0;
    for (var i=0; i<l; i++) {
      if (gpaArrays[g][i] != -1) {
        GpaTotal+=gpaArrays[g][i];
        classTotal++;
      }
    }
    var average = GpaTotal/classTotal;
    if (GpaTotal>0) {
      displayGPA(headerArray[1][colIndexArray[g]-8].toString(), average);
    }
  }
}

function displayGPA(name, gpa) {
  gpa = gpa.toFixed(2);
  $(".gpa").append(name + ": " + gpa + "</br>")
}
//j = col
//i= row
//j = 11 = class
//Q1 = j12
//q2 = j14
//S1= j15
//3 = 16, 4=17, s2=18, f1=19
//Honors: " honors", " #H", "AP", "A.P."
