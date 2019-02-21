var config = {
  svgHeight: 600,
  svgWidth: 900,
  gMargin: {
    top: 40,
    left: 40,
    right: 100,
    bottom: 40,
  },
  lineNumberOfPoints: 20,
  lineDrift: 0.5,
  maxXValue: 100,
  maxYValue: 50,
  minYValue: -50,
  numberOfLines: 3,
  lineWidth: 2,
  lineWidthHovered: 4,
  maximumDistanceToHover: 5,
}

var svg = d3.select('#hover-line-svg');
svg.style('height', config.svgHeight)
    .style('width', config.svgWidth)
    .on('mousemove', highlightClosestLine);

var gWidth = config.svgWidth - config.gMargin.left - config.gMargin.right;
var gHeight = config.svgHeight - config.gMargin.top - config.gMargin.bottom;

var g = svg.append('g')
            .attr('transform', 'translate(' + config.gMargin.left + ',' + config.gMargin.top + ')');

var x =  d3.scaleLinear()
  .range([0, gWidth])
  .domain([0, config.maxXValue]);

var y =  d3.scaleLinear()
  .range([0, gHeight])
  .domain([config.maxYValue, config.minYValue]);

g.append("g")
  .attr('transform', 'translate(0,' + (y(0)) + ')')
  .attr('class', 'axis')
  .call(d3.axisBottom(x));
g.append("g")
  .attr('class', 'axis')
  .call(d3.axisLeft(y));

var linePathArray = [];
for (var i = 0;i < config.numberOfLines; i += 1) {
  linePathArray[i] = [[0,0]];
  var lineDrift = ((Math.random() * 2) - 1) * config.lineDrift;
  for (var j = 1;j <= config.lineNumberOfPoints; j += 1) {
    var newX = config.maxXValue / config.lineNumberOfPoints * j;
    var newY = linePathArray[i][j-1][1] + (((Math.random() * 2) - 1) * (config.maxYValue / config.numberOfLines));
    if (newY > config.maxYValue) {
      newY = linePathArray[i][j-1][1] - (Math.random() * (config.maxYValue / config.numberOfLines));
    }
    if (newY < config.minYValue) {
      newY = linePathArray[i][j-1][1] + (Math.random() * (config.maxYValue / config.numberOfLines));
    }
    linePathArray[i].push([newX, newY]);
  }
}
// console.log('linePathArray: ', linePathArray);

var line = d3.line()
  .x(function(e) { return x(e[0]) })
  .y(function(e) { return y(e[1]) });


for (var i = 0;i < config.numberOfLines; i += 1) {
  g.append("path")
    .attr('class', 'all-lines line' + i)
    .attr("d", line(linePathArray[i]))
    .attr("stroke", "darkgrey")
    .attr("stroke-width", config.lineWidth)
    .attr("fill", "none");
}

function highlightClosestLine() {
  var mouse = d3.mouse(this);
  // console.log('hover: ', mouse);
  var distanceFromEachLineArray = [];
  for (var i = 0;i < config.numberOfLines; i += 1) {
    var distanceFromEachMidpointArray = [];
    for (var j = 1;j <= config.lineNumberOfPoints; j += 1) {
      var midpointX = (x(linePathArray[i][j][0]) + x(linePathArray[i][j-1][0])) * 0.5;
      var midpointY = (y(linePathArray[i][j][1]) + y(linePathArray[i][j-1][1])) * 0.5;
      distanceFromEachMidpointArray.push(distanceBetweenPoints([(mouse[0] - config.gMargin.left), (mouse[1] - config.gMargin.top)], [midpointX, midpointY]));
    }
    // console.log('distanceFromEachMidpointArray: ', distanceFromEachMidpointArray);
    distanceFromEachLineArray.push(d3.min(distanceFromEachMidpointArray));
  }
  // console.log('distanceFromEachLineArray: ', distanceFromEachLineArray);
  d3.selectAll('.all-lines')
      .attr('stroke-width', config.lineWidth);
  if (d3.min(distanceFromEachLineArray) < config.maximumDistanceToHover) {
    var closestLine = distanceFromEachLineArray.indexOf(d3.min(distanceFromEachLineArray));
    d3.selectAll('.line' + closestLine)
        .attr('stroke-width', config.lineWidthHovered);
  }
}


function distanceBetweenPoints(firstPoint, secondPoint) {
  // console.log('secondPoint: ', firstPoint, secondPoint);
  var distance = Math.sqrt(Math.pow((firstPoint[0] - secondPoint[0]), 2) + Math.pow((firstPoint[1] - secondPoint[1]), 2));
  return distance;
}


//
// var testContainer = d3.select("#test-container");
// var width = window.innerWidth;
// var height = window.innerHeight * 0.8;
//
// console.log('width, height: ', width, height);
// var yearStringArray = ['2013', '2014', '2015', '2016', '2017'];
// var dummyCostValues = [0,2.5,4,6.5,8];
// var dummyUtilValues = [0,-1,-2.2,-3.2,-4.1];
// var dummyCostArrays = ['2012', 2.5, '2013', 4, '2014', 3];
//
//
//
// var svg = testContainer.append("svg")
//   .attr("width", width)
//   .attr("height", height)
//   .attr("id", "testLineSVG");
//   // .style("background-color", "blue");
//
// // var innerContainer = svg.append("g")
// //   .attr("width", 100)
// //   .attr("height", 100)
// //   .attr("transform", "translate(0,0)");
//
// var xJasonLineGraph = d3.scalePoint()
//   .range([width * 0.1, width * 0.9])
//   .domain(yearStringArray)
//   .padding(0.1);
//
//
// var yJasonLineGraph = d3.scaleLinear()
//   .range([height * 0.9, height * 0.1])
//   .domain([-4.1, 8]);
//
//
// svg.append("g")
//   .attr('transform', 'translate(0,' + (yJasonLineGraph(0)) + ')')
//   .attr('class', 'axis')
//   .call(d3.axisBottom(xJasonLineGraph));
//   // d3.select(".axis")
//   //     .call(d3.axisBottom(x));
//
// // innerContainer.append('g')
// //   .attr('transform', 'translate(0,' + height + ')')
// //   .attr('class', 'axis')
// //   .call(d3.axisLeft(y));
//
// svg.append('g')
//     .attr('class', 'leftAxis leftAxis0 graph0')
//     .attr('transform', 'translate(' + (width * 0.1) + ',0)')
//     .call(d3.axisLeft(yJasonLineGraph));
//
// var line = d3.line()
//   .x(function(e, i) { return x(yearStrings[i]) })
//   .y(function(e) { return y(e) });
//
// console.log('line: ', line(dummyCostValues));
//
// var path = svg.append("path")
//   .attr("d", line(dummyCostValues))
//   .attr("stroke", "darkgrey")
//   .attr("stroke-width", "3")
//   .attr("fill", "none");
//
// var path2 = svg.append("path")
//   .attr("d", line(dummyUtilValues))
//   .attr("stroke", "blue")
//   .attr("stroke-width", "3")
//   .attr("fill", "none");
//
//   var totalLength = path.node().getTotalLength();
//
//   path.attr("stroke-dasharray", totalLength + " " + totalLength)
//   .attr("stroke-dashoffset", totalLength)
//
//
// function testFunction() {
//   console.log('test');
//
//     path
//       .attr("stroke-dasharray", totalLength + " " + totalLength)
//       .attr("stroke-dashoffset", totalLength)
//       .transition()
//         .duration(6000)
//         .ease(d3.easeLinear)
//         .attr("stroke-dashoffset", 0)
//     path2
//       .attr("stroke-dasharray", totalLength + " " + totalLength)
//       .attr("stroke-dashoffset", totalLength)
//       .transition()
//         .duration(6000)
//         .ease(d3.easeLinear)
//         .attr("stroke-dashoffset", 0)
// }
