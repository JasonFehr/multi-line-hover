
var testContainer = d3.select("#test-container");
var width = window.innerWidth;
var height = window.innerHeight;

var svg = testContainer
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("id", "testLineSVG");
