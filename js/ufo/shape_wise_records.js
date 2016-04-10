(function() {

  var margin = {top: 20, right: 20, bottom: 50, left: 100},
    width = 600 - margin.left - margin.right,
    height = 470 - margin.top - margin.bottom;

var x = d3.scale.linear()
        .range([0, width]);

var y = d3.scale.ordinal()
    .rangeRoundBands([0, height], .2);

var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(5);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");



var svg = d3.select("#shape_wise_trend").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("../../data/Shape_Wise_Records.csv",function(error, data) {
  if (error) throw error;

  data.forEach(function(d) {
    d.serial = +d.serial;
    d.records = +d.records;
  });

  y.domain(data.map(function(d) { return d.shape; }));
  x.domain([0, d3.max(data, function(d) { return d.records; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);


  // Add the X Axis Label
  svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .style("text-anchor", "middle")
        .text("Number of Reportings");

  svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em");

   // Add the Y-Axis Label
  svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", (0 - margin.left))
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Reported Shape");


  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("y", function(d) { return y(d.shape); })
      .attr("height", y.rangeBand())
      .attr("x", function(d) { return 0; })
      .attr("width", function(d) { return x(d.records); });
});

function type(d) {
  d.records = +d.records;
  return d;
}

})();
