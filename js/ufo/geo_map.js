(function() {

  var width = 960,
      height = 500;



  var path = d3.geo.path();

  var div = d3.select("#TooltipSection").append("div").attr("class", "tooltip").style("opacity", 0);


  var svg = d3.select("#geo_map_wise_trend").append("svg")
      .attr("width", width)
      .attr("height", height);

  queue()
      .defer(d3.json, "../../data/us.json")
      .defer(d3.json, "../../data/us-state-ufo-records.json")
      .await(ready);

  function ready(error, us, centroid) {
    if (error) throw error;

    var radius = d3.scale.sqrt()
        .domain([0, d3.max(centroid.features, function(d) {
          return d.properties.records;
        })])
        .range([0, 15]);



    svg.append("path")
        .attr("class", "states")
        .datum(topojson.feature(us, us.objects.states))
        .attr("d", path);

        svg.selectAll(".symbol")
         .data(centroid.features.sort(function(a, b) { return b.properties.records - a.properties.records; }))
       .enter().append("path")
         .attr("class", "symbol")
         .attr("d", path.pointRadius(function(d) { return radius(d.properties.records); }))
         // Tooltip stuff after this
         .on("mouseover", function(d) {
           div.transition()
             .duration(500)
             .style("opacity", 0);
           div.transition()
             .duration(200)
             .style("opacity", .9);
           div.html(
               d.properties.name +
               "<br/>Reportings:" +
               d.properties.records)
             .style("left", (d3.event.pageX) + "px")
             .style("top", (d3.event.pageY - 30) + "px");
         })
       .on("mouseout", function(d) {
         div.transition()
               .duration(100)
               .style("opacity", 0);
       });
   }


})();
