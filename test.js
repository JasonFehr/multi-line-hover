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
  lineDrift: 0.8,
  maxXValue: 100,
  maxYValue: 50,
  minYValue: -50,
  numberOfLines: 8,
  lineWidth: 2,
  lineWidthHovered: 6,
  maximumDistanceToHover: 20,
  labelFontSize: 12,
  spaceBetweenLineAndLabel: 4,
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
  for (var j = 1;j < config.lineNumberOfPoints; j += 1) {
    var newX = config.maxXValue / (config.lineNumberOfPoints - 1) * j;
    var newY = linePathArray[i][j-1][1] + (((Math.random() * 2) - 1 + lineDrift) * (config.maxYValue / config.numberOfLines));
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
    var distanceFromEachSegmentArray = [];
    for (var j = 1;j < config.lineNumberOfPoints; j += 1) {
      distanceFromEachSegmentArray.push(distanceBetweenPointAndSegment([(mouse[0] - config.gMargin.left), (mouse[1] - config.gMargin.top)], [x(linePathArray[i][j-1][0]), y(linePathArray[i][j-1][1])], [x(linePathArray[i][j][0]), y(linePathArray[i][j][1])]));
    }
    // console.log('distanceFromEachMidpointArray: ', distanceFromEachMidpointArray);
    distanceFromEachLineArray.push(d3.min(distanceFromEachSegmentArray));
  }
  // console.log('distanceFromEachLineArray: ', distanceFromEachLineArray);
  d3.selectAll('.all-lines')
      .attr('stroke-width', config.lineWidth);
  d3.select('#line-label').remove();
  if (d3.min(distanceFromEachLineArray) < config.maximumDistanceToHover) {
    // console.log('distance: ', d3.min(distanceFromEachLineArray));
    var closestLine = distanceFromEachLineArray.indexOf(d3.min(distanceFromEachLineArray));
    d3.selectAll('.line' + closestLine)
        .attr('stroke-width', config.lineWidthHovered);
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


function distanceBetweenPointAndSegment(pointLocation, segmentStartLocation, segmentEndLocation) {
  var distance;
  // console.log('locations: ', pointLocation, segmentStartLocation, segmentEndLocation);
  var lengthOfLineSegment = Math.sqrt(Math.pow((segmentEndLocation[0] - segmentStartLocation[0]), 2) + Math.pow((segmentEndLocation[1] - segmentStartLocation[1]), 2));
  var distanceBetweenPointAndSegmentStart = Math.sqrt(Math.pow((pointLocation[0] - segmentStartLocation[0]), 2) + Math.pow((pointLocation[1] - segmentStartLocation[1]), 2));
  var distanceBetweenPointAndSegmentEnd = Math.sqrt(Math.pow((pointLocation[0] - segmentEndLocation[0]), 2) + Math.pow((pointLocation[1] - segmentEndLocation[1]), 2));
  var a = segmentStartLocation[1] - segmentEndLocation[1];
  var b = segmentEndLocation[0] - segmentStartLocation[0];
  var c = (segmentEndLocation[1] * segmentStartLocation[0]) - (segmentStartLocation[1] * segmentEndLocation[0]);
  var distancePerpendicularToExtendedLine = Math.abs(((a * pointLocation[0]) + (b * pointLocation[1]) + c)/(Math.sqrt((Math.pow(a,2) + (Math.pow(b,2))))));
  var distanceBetweenClosestPointOfExtendedLineAndOtherEndOfLine = Math.sqrt(Math.pow(d3.max([distanceBetweenPointAndSegmentStart, distanceBetweenPointAndSegmentEnd]), 2) - Math.pow(distancePerpendicularToExtendedLine, 2));
  if (distanceBetweenClosestPointOfExtendedLineAndOtherEndOfLine > lengthOfLineSegment) {
    distance = d3.min([distanceBetweenPointAndSegmentStart, distanceBetweenPointAndSegmentEnd]);
  } else {
    distance = distancePerpendicularToExtendedLine;
  }
  // console.log('distance: ', distance);
  return distance;
}
