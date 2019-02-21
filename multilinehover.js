// Set configuration for lines and hover behavior
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
  lineDrift: 1.4,// This is used below to determine how much the random lines tend to spread out
  maxXValue: 100,
  numberOfLines: 8,
  lineWidth: 2,
  lineWidthHovered: 6,
  maximumDistanceToHover: 20,// If the mouse is more than this many pixels from all lines, no line is highlighted.
  labelFontSize: 12,
  spaceBetweenLineAndLabel: 4,
}

// Set up the svg
var svg = d3.select('#hover-line-svg');
svg.style('height', config.svgHeight)
    .style('width', config.svgWidth)
    .on('mousemove', highlightClosestLine);

// Set up the inner 'g' element
var gWidth = config.svgWidth - config.gMargin.left - config.gMargin.right;
var gHeight = config.svgHeight - config.gMargin.top - config.gMargin.bottom;
var g = svg.append('g')
            .attr('transform', 'translate(' + config.gMargin.left + ',' + config.gMargin.top + ')');

// Create an array of line data
var linePathArray = [];
var globalYValueArray = [];// Record every Y value to determine the y scale maximum and minimum
for (var i = 0;i < config.numberOfLines; i += 1) {// Create an array of points for each line
  linePathArray[i] = [[0,0]];// Each line will start at 0,0
  var lineDrift = ((Math.random() * 2) - 1) * config.lineDrift / config.lineNumberOfPoints;// Each line has its own "drift" factor which allows them to spread out
  for (var j = 1;j < config.lineNumberOfPoints; j += 1) {
    var newX = config.maxXValue / (config.lineNumberOfPoints - 1) * j;
    var newY = linePathArray[i][j-1][1] + ((Math.random() * 2) - 1 + lineDrift);
    linePathArray[i].push([newX, newY]);
    globalYValueArray.push(newY);
  }
}

// The x and y scales
var x =  d3.scaleLinear()
  .range([0, gWidth])
  .domain([0, config.maxXValue]);

var y =  d3.scaleLinear()
  .range([0, gHeight])
  .domain([d3.max(globalYValueArray), d3.min(globalYValueArray)]);// Use the maximum and minimum Y for the Y scale

// Build axes
g.append("g")
  .attr('transform', 'translate(0,' + (y(0)) + ')')
  .attr('class', 'axis')
  .call(d3.axisBottom(x));
g.append("g")
  .attr('class', 'axis')
  .call(d3.axisLeft(y));

// The line generator accepts an array of points and returns a string to allow d3 to build a path
var line = d3.line()
  .x(function(e) { return x(e[0]) })
  .y(function(e) { return y(e[1]) });

// Draw a line for each set of line data
for (var i = 0; i < config.numberOfLines; i += 1) {
  g.append("path")
    .attr('class', 'all-lines line' + i) // The all-lines class is used to unselect them all, the specific line0 line1 etc. class is used for selecting
    .attr("d", line(linePathArray[i]))
    .attr("stroke", "darkgrey")
    .attr("stroke-width", config.lineWidth)
    .attr("fill", "none");
}

// This function determines which line is closest
function highlightClosestLine() {
  var mouse = d3.mouse(this);// The mouse x and y coordinates on the svg
  var distanceFromEachLineArray = [];// This will be an array of distances between the mouse and each line
  for (var i = 0;i < config.numberOfLines; i += 1) {
    var distanceFromEachSegmentArray = [];// This will be the distance between the mouse and each line segment for a given line. The minimum of these will be the distance between the mouse and this line.
    for (var j = 1;j < config.lineNumberOfPoints; j += 1) {
      var mouseXPointOnGraph = (mouse[0] - config.gMargin.left);// remember the mouse location that matters is its location on the graph, not on the svg
      var mouseYPointOnGraph = (mouse[1] - config.gMargin.top);
      var xCoordinateOfBeginningOfSegment = x(linePathArray[i][j-1][0]);
      var yCoordinateOfBeginningOfSegment = y(linePathArray[i][j-1][1]);
      var xCoordinateOfEndOfSegment = x(linePathArray[i][j][0]);
      var yCoordinateOfEndOfSegment = y(linePathArray[i][j][1]);
      distanceFromEachSegmentArray.push(distanceBetweenPointAndSegment([mouseXPointOnGraph, mouseYPointOnGraph], [xCoordinateOfBeginningOfSegment, yCoordinateOfBeginningOfSegment], [xCoordinateOfEndOfSegment, yCoordinateOfEndOfSegment]));
    }
    distanceFromEachLineArray.push(d3.min(distanceFromEachSegmentArray));// Whichever segment distance is shortest is this line's distance from the mouse pointer
  }
  d3.selectAll('.all-lines')// Unselect all lines
      .attr('stroke-width', config.lineWidth);
  d3.select('#line-label').remove();// Remove the label

  if (d3.min(distanceFromEachLineArray) < config.maximumDistanceToHover) {// If the closest line is further away than the maximumDistanceToHover, don't highlight a line
    var closestLine = distanceFromEachLineArray.indexOf(d3.min(distanceFromEachLineArray));
    d3.selectAll('.line' + closestLine)
        .attr('stroke-width', config.lineWidthHovered);// make the selected line wider
    g.append('text')
      .attr('id', 'line-label')
      .attr("text-anchor", "start")
      .attr('font-size', config.labelFontSize + 'px')
      .attr('dy', '.35em')
      .attr('x', x(config.maxXValue) + config.spaceBetweenLineAndLabel)
      .attr('y',  y(linePathArray[closestLine][config.lineNumberOfPoints - 1][1]))
      .attr('fill', 'black')
      .attr('opacity', 1)
      .text('Line ' + closestLine);
  }
}

// This function takes three two-element arrays: the coordinates of a point, one end of a line, and the other end of the line,
// and returns the distance between the point and the closest point of that line.
// The most important part does some complicated algebra to determine the length of an imaginary line between the point and
// perpendicular to the segment in question if the segment were extended infinitely in both directions.
// This will always be the shortest distance, --unless-- the mouse is beyond the end of the line (imagine a perpendicular
// line on both ends of the segment, if the mouse is on the other side of this line, the closest point will instead be whichever
// end of the segment is closer to the mouse.)
function distanceBetweenPointAndSegment(pointLocation, segmentStartLocation, segmentEndLocation) {
  var a = segmentStartLocation[1] - segmentEndLocation[1];
  var b = segmentEndLocation[0] - segmentStartLocation[0];
  var c = (segmentEndLocation[1] * segmentStartLocation[0]) - (segmentStartLocation[1] * segmentEndLocation[0]);
  var distancePerpendicularToExtendedLine = Math.abs(((a * pointLocation[0]) + (b * pointLocation[1]) + c)/(Math.sqrt((Math.pow(a,2) + (Math.pow(b,2))))));
  var distance;
  var lengthOfLineSegment = Math.sqrt(Math.pow((segmentEndLocation[0] - segmentStartLocation[0]), 2) + Math.pow((segmentEndLocation[1] - segmentStartLocation[1]), 2));
  var distanceBetweenPointAndSegmentStart = Math.sqrt(Math.pow((pointLocation[0] - segmentStartLocation[0]), 2) + Math.pow((pointLocation[1] - segmentStartLocation[1]), 2));
  var distanceBetweenPointAndSegmentEnd = Math.sqrt(Math.pow((pointLocation[0] - segmentEndLocation[0]), 2) + Math.pow((pointLocation[1] - segmentEndLocation[1]), 2));
  var distanceBetweenClosestPointOfExtendedLineAndOtherEndOfLine = Math.sqrt(Math.pow(d3.max([distanceBetweenPointAndSegmentStart, distanceBetweenPointAndSegmentEnd]), 2) - Math.pow(distancePerpendicularToExtendedLine, 2));
  if (distanceBetweenClosestPointOfExtendedLineAndOtherEndOfLine > lengthOfLineSegment) {
    distance = d3.min([distanceBetweenPointAndSegmentStart, distanceBetweenPointAndSegmentEnd]);
  } else {
    distance = distancePerpendicularToExtendedLine;
  }
  return distance;
}
