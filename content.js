$("#afterH1").append("<div class='gpa'></div>")
$(".gpa").append("<p id='gpaTitle'>GPA:</p>");
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

var courseRow = 11;
var qOneRow = 12;
var qTwoRow = 14;
var qThreeRow = 16;
var qFourRow = 18;
var semOneRow = 15;
var semTwoRow = 19;


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



var qOneGpas = [];
var qTwoGpas = [];
var qThreeGpas = [];
var qFourGpas = [];
var semTwoGpas = [];


var weighting=0;

var patternAP = ["A.P.", "AP", "Calculus", "Diff"]
var patternH = [" Honors", "[0-9]H"]
var patternB = [" B", "[0-9]B"]
var patternC = [" C", "[0-9]C"]


for(var i = 0; i < gradesArray.length; i++) {
  for(var j = 0; j < gradesArray[i].length; j++) {
    weighting=0;

    if (j==courseRow) {
      var re = new RegExp(patternAP.join("|"), "i");
      if (re.test(gradesArray[i][j])) {
        weighting = 0.67;
      }
      re = new RegExp(patternH.join("|"), "i");
      if (re.test(gradesArray[i][j])) {
        weighting = 0.33;
      }
      re = new RegExp(patternB.join("|"), "i");
      if (re.test(gradesArray[i][j])) {
        weighting = -0.33;
      }
      re = new RegExp(patternC.join("|"), "i");
      if (re.test(gradesArray[i][j])) {
        weighting = -0.66;
      }
      getGrades(i,weighting);
    }
  }
}
console.log(qOneGpas)

averageGPA();

function getGrades(rowIndex, weighting) {
  //Q1

  if (gradesArray[rowIndex][qOneRow].match(/\d+/g) != null) {
    //Contains grades
    letterGrade = gradesArray[rowIndex][qOneRow].toString().replace(/[^A-Z+-]/g,'');
    qOneGpas.push(calculateClassGPA(letterGrade, weighting));

  } else {
    qOneGpas.push(-1);
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
  console.log(g);
  return(g);

}

function averageGPA() {
  //Q1

  var l = qOneGpas.length;
  var classTotal = 0;
  var GpaTotal = 0.0;
  for (var i=0; i<l; i++) {
    if (qOneGpas[i] != -1) {
      GpaTotal+=qOneGpas[i];
      classTotal++;
    }
  }
  var average = GpaTotal/classTotal;
  if (GpaTotal>0) {
    displayGPA(headerArray[1][qOneRow-8].toString(), average);
  }
  
}

function displayGPA(name, gpa) {
  gpa = gpa.toFixed(2);
  $(".gpa").append("<bold>"+ name + "</bold>: " + gpa)
}
//j = col
//i= row
//j = 11 = class
//Q1 = j12
//q2 = j14
//S1= j15
//3 = 16, 4=17, s2=18, f1=19
//Honors: " honors", " #H", "AP", "A.P."
