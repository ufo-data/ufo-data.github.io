(function() {

  var width = 600,
    height = 400;

  var projection = d3.geo.albersUsa()
    .scale(600)
    .translate([width / 2, height / 2]);



  var path = d3.geo.path().projection(projection);


  var div = d3.select("#TooltipSection").append("div").attr("class", "tooltip").style("opacity", 0);

  var rateById = d3.map();

  var svg = d3.select("#geo_map_wise_trend_with_military").append("svg")
    .attr("width", width)
    .attr("height", height);

  queue()
    .defer(d3.json, "../../data/us.json")
    .defer(d3.json, "../../data/us-state-ufo-records.json")
    .defer(d3.csv, "../../data/fips_data_military.csv", function(d) { rateById.set(d.id, +d.rate); })
    .await(ready);

  function ready(error, us, centroid, fips) {
    if (error)  {
      console.log(error);
    }


    var max_military_count = d3.max(centroid.features, function(d) {
      return d.properties.military;
    });

    

    var color_scale = d3.scale.quantize().domain([0, max_military_count]).range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]);

    var radius = d3.scale.sqrt()
      .domain([0, d3.max(centroid.features, function(d) {
        return d.properties.records;
      })])
      .range([0, 10]);

    var GetFIPSID = function(t) {
       t = t.toString();
       var result = 0;
       if(t.length === 4){
         result = parseInt(t.substring(0, 1));
       }
       if(t.length === 5){
         result = parseInt(t.substring(0, 2));
       }

       //console.log(result);
       return result;
    };

    var GetCount = function(t){
      var fips = GetFIPSID(t);
      var result = rateById.get(fips);
      return result;
    }




    svg.append("g")
      .attr("class", "counties")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
      .enter().append("path")
      .style("fill", function(d) {
        return color_scale(GetCount(d.id));
      })
      .attr("d", path);

    svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) {
        return a !== b;
      }))
      .attr("class", "states")
      .attr("d", path);


    svg.selectAll(".symbol")
      .data(centroid.features.sort(function(a, b) {
        return (b.properties.records) - (a.properties.records);
      }))
      .enter().append("path")
      .attr("class", "symbol")
      .attr("d", path.pointRadius(function(d) {
        return radius(d.properties.records);
      }))
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
            "<br/>Military Bases:" +
            d.properties.military
          )
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
