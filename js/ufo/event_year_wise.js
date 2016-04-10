(function () {

  // Set the dimensions of the canvas / graph
  var margin = {top: 30, right: 20, bottom: 40, left: 70},
      width = 600 - margin.left - margin.right,
      height = 270 - margin.top - margin.bottom;

  // Parse the date / time
  var parseYear = d3.time.format("%Y").parse;

  // Set the ranges
  var x = d3.time.scale().range([0, width]);
  var y = d3.scale.linear().range([height, 0]);

  // Define the axes
  var xAxis = d3.svg.axis().scale(x)
      .orient("bottom").ticks(5);

  var yAxis = d3.svg.axis().scale(y)
      .orient("left").ticks(5);

  // for area
  var area = d3.svg.area()
            .x(function(d) { return x(d.year); })
            .y0(height)
            .y1(function(d) { return y(d.records); });
  // Define the line
  var valueline = d3.svg.line()
      .x(function(d) { return x(d.year); })
      .y(function(d) { return y(d.records); });

  //Adds the svg canvas
  var svg = d3.select("#event_year_wise_trend")
      .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
      .append("g")
          .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

  //Get the data
  d3.csv("../../data/Event_Year_Wise_Record.csv", function(error, data) {

      data.forEach(function(d) {
          d.year = parseYear(d.year);
          d.records = +d.records;
      });

      // Scale the range of the data
      x.domain(d3.extent(data, function(d) { return d.year; }));
      y.domain([0, d3.max(data, function(d) { return d.records; })]);



      // for area
      svg.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area);


      // Add the valueline path.
      svg.append("path")
          .attr("class", "line")
          .attr("d", valueline(data));

      // Add the X Axis
      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      // Add the X Axis Label
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom )
        .style("text-anchor", "middle")
        .text("Event Year");

      // Add the Y Axis
      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);

      // Add the Y-Axis Label
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", (0 - margin.left))
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("No. of Reportings");

      // Add the title
      svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("UFO Reportings - Year Wise");

  });
 }
)();
