
var testContainer = d3.select("#test-container");
var width = window.innerWidth;
var height = window.innerHeight * 0.8;

console.log('width, height: ', width, height);
var yearStrings = ['2012', '2013', '2014', '2015', '2016'];
var dummyCostValues = [0,2.5,4,6.5,8];
var dummyUtilValues = [0,-1,-2.2,-3.2,-4.1];
var dummyCostArrays = ['2012', 2.5, '2013', 4, '2014', 3];


var svg = testContainer.append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("id", "testLineSVG");
  // .style("background-color", "blue");

// var innerContainer = svg.append("g")
//   .attr("width", 100)
//   .attr("height", 100)
//   .attr("transform", "translate(0,0)");

var x = d3.scalePoint()
  .range([width * 0.1, width * 0.9])
  .domain(yearStrings);


var y = d3.scaleLinear()
  .range([height * 0.9, height * 0.1])
  .domain([-4.1, 8]);


svg.append("g")
  .attr('transform', 'translate(0,' + (y(0)) + ')')
  .attr('class', 'axis')
  .call(d3.axisBottom(x));
  // d3.select(".axis")
  //     .call(d3.axisBottom(x));

// innerContainer.append('g')
//   .attr('transform', 'translate(0,' + height + ')')
//   .attr('class', 'axis')
//   .call(d3.axisLeft(y));

svg.append('g')
    .attr('class', 'leftAxis leftAxis0 graph0')
    .attr('transform', 'translate(' + (width * 0.1) + ',0)')
    .call(d3.axisLeft(y));

var line = d3.line()
  .x(function(e, i) { return x(yearStrings[i]) })
  .y(function(e) { return y(e) });

console.log('line: ', line(dummyCostValues));

var path = svg.append("path")
  .attr("d", line(dummyCostValues))
  .attr("stroke", "darkgrey")
  .attr("stroke-width", "3")
  .attr("fill", "none");

var path2 = svg.append("path")
  .attr("d", line(dummyUtilValues))
  .attr("stroke", "blue")
  .attr("stroke-width", "3")
  .attr("fill", "none");

  var totalLength = path.node().getTotalLength();

  path
    .attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
      .duration(6000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0)
  path2
    .attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
      .duration(6000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0)
