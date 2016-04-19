(function() {

  var width = 600,
      height = 400;

  var projection = d3.geo.albersUsa()
      .scale(600)
      .translate([width / 2, height / 2]);


  var path = d3.geo.path().projection(projection);


  var div = d3.select("#TooltipSection").append("div").attr("class", "tooltip").style("opacity", 0);


  var svg = d3.select("#geo_map_wise_trend_with_population").append("svg")
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
          return d.properties.records / d.properties.population;
        })])
        .range([0, 10]);



    svg.append("path")
        .attr("class", "states")
        .datum(topojson.feature(us, us.objects.states))
        .attr("d", path);

        svg.selectAll(".symbol")
         .data(centroid.features.sort(function(a, b) { return (b.properties.records / b.properties.population) - (a.properties.records / a.properties.population); }))
       .enter().append("path")
         .attr("class", "symbol")
         .attr("d", path.pointRadius(function(d) { return radius(d.properties.records / d.properties.population); }))
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
               d.properties.records +
              "<br/>Popluation:" +
              d.properties.population)
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
