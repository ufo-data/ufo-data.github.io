(function() {


  // Create the dc.js chart objects & link to div
  var dataTable = dc.dataTable("#dashboard-table-graph");
  var durationChart = dc.barChart("#dashboard-duration-chart");
  var eventYearChart = dc.barChart("#dashboard-event-year-chart");
  // var depthChart = dc.barChart("#dc-depth-chart");
  var shapeChart = dc.rowChart("#dashboard-shape-chart");
  // var islandChart = dc.pieChart("#dc-island-chart");
  var eventDateChart = dc.lineChart("#dashboard-event-date-chart");
  //var geoChart = dc.geoChoroplethChart("#dashboard-geo-map-chart");
  var usChart = dc.geoChoroplethChart("#us-chart");
  var div = d3.select("#TooltipSection").append("div").attr("class", "tooltip").style("opacity", 0);

  //var moveChart = dc.compositeChart("#monthly-move-chart");
  //var volumeChart = dc.barChart("#monthly-volume-chart");

  queue()
    .defer(d3.json, "../../data/us-states.json")
    .defer(d3.csv, "../../data/ufo_dashboard_new.csv")
    .await(ready);

  function ready(error, statesJson, data) {
    if (error) throw error;




    // format our data
    var eventDateFormat = d3.time.format("%Y-%m-%d");
    var numberFormat = d3.format(".2f");
    var eventDateTimeFormat = d3.time.format("%Y-%m-%d");

    data.forEach(function(d) {
      //console.log(d.EventDate);
      d.EventDate = eventDateFormat.parse(d.EventDate);
      d.Duration = d3.round(+d.Duration, 1);

    });

    // Run the data through crossfilter and load our 'facts'
    var facts = crossfilter(data);
    var all = facts.groupAll();

    // count all the facts
    dc.dataCount(".dashboard-data-count")
      .dimension(facts)
      .group(all);

    //Create State dimension
    var stateDimension = facts.dimension(function(d) {
      return d.State;
    });

    //Create State dimension
    var eventDateDimension = facts.dimension(function(d) {
      return d.EventDate;
    });

    //Create Duration dimension
    var durationDimension = facts.dimension(function(d) {
      return d.Duration;
    });

    //Create Shape dimension
    var shapeDimension = facts.dimension(function(d) {
      return d.Shape;
    });

    //Create Shape dimension
    var summaryDimension = facts.dimension(function(d) {
      return d.Summary;
    });


    // Table of earthquake data
    dataTable.width(900).height(500)
      .dimension(eventDateDimension)
      .group(function(d) {
        return "UFO Reportings Table"
      })
      .size(10)
      .columns([
        function(d) {
          return d.State;
        },
        function(d) {
          return eventDateTimeFormat(d.EventDate);
        },
        function(d) {
          return d.Shape;
        },
        function(d) {
          return d.Duration;
        },
        function(d) {
          return d.Summary;
        }

      ])
      .sortBy(function(d) {
        return d.EventDate;
      })
      .order(d3.descending);

    //Duration Chart
    var durationGroupCount = durationDimension.group()
      .reduceCount(function(d) {
        return d.Duration;
      }) // counts

    //Duration Bar Graph Counted
    durationChart.width(250)
      .height(200)
      .margins({
        top: 10,
        right: 10,
        bottom: 20,
        left: 40
      })
      .dimension(durationDimension)
      .group(durationGroupCount)
      .elasticY(true)
      .transitionDuration(500)
      .centerBar(true)
      .gap(20) // 65 = norm
      //    .filter([3, 5])
      .x(d3.scale.linear().domain([0, 1000]))
      .xAxis()
      .ticks(4)
      .tickFormat(function(v) {
        return v;
      });

    //Event By Date Chart
    var eventByDate = facts.dimension(function(d) {
      return d.EventDate;
    });


    var eventDateGroupCount = eventByDate.group()
      .reduceCount(function(d) {
        return d.EventDate;
      }) // counts

    // time graph
    eventDateChart.width(600)
      .height(150)
      .margins({
        top: 5,
        right: 5,
        bottom: 20,
        left: 30
      }).dimension(eventByDate)
      .group(eventDateGroupCount)
      .transitionDuration(500)
      .x(d3.time.scale().domain(d3.extent(data, function(d) {
        return d.EventDate;
      })))
      .elasticY(true)
      .xAxis().tickFormat();

    //Event By Year Chart
    var eventByYear = facts.dimension(function(d) {
      return d3.time.month(d.EventDate);
    });


    var eventYearGroupCount = eventByYear.group()
      .reduceCount(function(d) {
        return d.EventDate;
      }) // counts

    eventYearChart.width(600)
      .height(40)
      .margins({
        top: 5,
        right: 5,
        bottom: 20,
        left: 30
      })
      .dimension(eventByYear)
      .group(eventYearGroupCount)
      .centerBar(true)
      .gap(0)
      .x(d3.time.scale().domain(d3.extent(data, function(d) {
        return d.EventDate;
      })))
      .round(d3.time.month.round)
      .xUnits(d3.time.months)
      .renderlet(function(chart) {
        chart.select("g.y").style("display", "none");
        eventDateChart.filter(chart.filter());
      })
      .on("filtered", function(chart) {
        dc.events.trigger(function() {
          eventDateChart.focus(chart.filter());
        });
      })
      .xAxis()
      .tickFormat();


    // time graph
    // eventYearChart.width(960)
    //   .height(150)
    //   .margins({
    //     top: 10,
    //     right: 10,
    //     bottom: 20,
    //     left: 40
    //   }).dimension(eventByYear)
    //   .group(eventYearGroupCount)
    //   .transitionDuration(500)
    //   .x(d3.time.scale().domain(d3.extent(data, function(d) {
    //     return d3.time.year(d.EventDate);
    //   })))
    //   .elasticX(true)
    //   .xAxis();


    //Shape Charts
    var shapeCountGroup = shapeDimension.group()
      .reduceCount(function(d) {
        return d.Shape;
      })


    // row chart day of week
    shapeChart.width(250)
      .height(200)
      .margins({
        top: 10,
        left: 10,
        right: 10,
        bottom: 40
      }).dimension(shapeDimension)
      .group(shapeCountGroup)
      .rowsCap(5)
      .ordering(function(d) {
        return -d.value;
      })
      .colors(d3.scale.category10())
      .label(function(d) {
        return d.key;
      })
      .title(function(d) {
        return d.value;
      }).elasticX(true)
      .xAxis().ticks(4);




    // //GeoMap
    // var data = crossfilter(vc);
    // var states = data.dimension(function(d) {
    //   return d["State"];
    // });
    // var stateRaisedSum = states.group().reduceSum(function(d) {
    //   return d["Raised"];
    // });
    // //
    // usChart.width(990)
    //   .height(500)
    //   .dimension(states)
    //   .group(stateRaisedSum)
    //   .colors(d3.scale.quantize().range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]))
    //   .colorDomain([0, 200])
    //   .colorCalculator(function(d) {
    //     return d ? usChart.colors()(d) : '#fff';
    //   })
    //   .overlayGeoJson(statesJson.features, "state", function(d) {
    //     return d.properties.name;
    //   })
    //   .title(function(d) {
    //     return "State: " + d.key + "\nTotal Amount Raised: " + numberFormat(d.value ? d.value : 0) + "M";
    //   });
    //


    var stateGroupCount = stateDimension.group()
      .reduceCount(function(d) {
        return d.State;
      }) // counts

    var colorPicker = function(d) {
      if (d > 0 && d <= 1000) {
        return '#E2F2FF';
      }
      if (d > 1000 && d < 2000) {
        return '#C4E4FF';
      }
      if (d > 2000 && d < 3000) {
        return '#9ED2FF';
      }
      if (d > 3000 && d < 4000) {
        return '#81C5FF';
      }
      if (d > 4000 && d < 5000) {
        return '#6BBAFF';
      }
      if (d > 5000 && d < 6000) {
        return '#51AEFF';
      }
      if (d > 6000 && d < 7000) {
        return '#36A2FF';
      }
      if (d > 7000 && d < 8000) {
        return '#1E96FF';
      }
      if (d > 8000 && d < 9000) {
        return '#0089FF';
      }
      if (d > 9000 && d < 10000) {
        return '#0061B5';
      }
      if (d > 10000) {
        return '#0061B5';
      }
      // if(d > 0 && d < 3000) { return '#E2F2FF';}
      // if(d > 0 && d < 4000) { return '#E2F2FF';}
      // if(d > 0 && d < 5000) { return '#E2F2FF';}
      // if(d > 0 && d < 6000) { return '#E2F2FF';}
      // if(d > 0 && d < 7000) { return '#E2F2FF';}
      // if(d > 0 && d < 8000) { return '#E2F2FF';}
      // if(d > 0 && d < 8000) { return '#E2F2FF';}
      // if(d > 0 && d < 8000) { return '#E2F2FF';}
    }


    // usChart.width(1000)
    //             .height(600)
    //             .dimension(stateDimension)
    //             .projection(d3.geo.mercator()
    //             .scale((960 + 1) / 4 )
    //             .translate([960 / 4, 960 / 4])
    //             .precision(.1))
    //             .group(stateGroupCount)
    //             .colors(d3.scale.quantize().range(["#E2F2FF","#C4E4FF","#9ED2FF","#81C5FF","#6BBAFF","#51AEFF","#36A2FF","#1E96FF","#0089FF","#0061B5"]))
    //             .colorDomain([0, 9315])
    //             .colorCalculator(function(d){ return d ? colorPicker(d) :'#ccc'; })
    //             .overlayGeoJson(statesJson.features,"state",function(d){
    //                 return d.properties.name;
    //             })
    //             .title(function (d) {
    //                 return "State: " + d.key + (d.value ? d.value : 0) + "Impressions";
    //             });
    //

    var width = 600,
        height = 452;

    var projection = d3.geo.albersUsa()
        .scale(600)
        .translate([width / 2, height / 2]);


    usChart.width(width)
      .height(height)
      .dimension(stateDimension)
      .projection(projection)
      .group(stateGroupCount)
      .colors(d3.scale.quantize().range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]))
      .colorDomain([0, 9315])
      .colorCalculator(function(d) {
        return d ? colorPicker(d) : '#ccc';
      })
      .overlayGeoJson(statesJson.features, "state", function(d) {
        return d.properties.name;
      })
      .title(function(d) {
        return "State: " + d.key + " Reportings : " + (d.value ? d.value : 0);
      });

      // usChart.width(900)
      //   .height(600)
      //   .dimension(stateDimension)
      //   .group(stateGroupCount)
      //   .colors(d3.scale.quantize().range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]))
      //   .colorDomain([0, 9315])
      //   .colorCalculator(function(d) {
      //     return d ? colorPicker(d) : '#ccc';
      //   })
      //   .overlayGeoJson(statesJson.features, "state", function(d) {
      //     return d.properties.name;
      //   })
      //   .title(function(d) {
      //     return "State: " + d.key + " Reportings : " + (d.value ? d.value : 0);
      //   });

    // Render the Charts
    dc.renderAll();

    var range_data = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 1000];
    var range_color = ["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]
    var width = 400
    var height = 40
    var padding = 5
    var margin_left = 10
    var svg = d3.select("#range-marker").append("svg")
      .attr("width", width - margin_left)
      .attr("height", height);

    var g = svg.append("g");
      //.attr("class", "key")
      //.attr("transform", "translate( 50," + height * 3 / 4 + ")");


    var xScale = d3.scale.linear()
      .domain([0, 10000])
      .range([0, width - margin_left]);

    // var xAxis = d3.svg.axis()
    //   .scale(xScale)
    //   .orient("bottom")
    //   .tickSize(14);


    g.call(d3.svg.axis()
      .scale(xScale)
      .orient("bottom")
      .tickSize(5)
      .tickValues([1000,5000,9000])
      .tickFormat(function(d) {
        return d;
      }));

    //g.call(xAxis);
    g.selectAll("rect")
      .data(range_data)
      .enter().append("rect")
      .attr("height", 5)
      .attr("x", function(d, i) {
        return i * ((width - margin_left) / range_data.length);
      })
      .attr("width", function(d) {
        return (width - margin_left) / range_data.length;
      })
      .style("fill", function(d, i) {
        return range_color[i];
      })
      .on("mouseover", function(d,i) {
        div.transition()
          .duration(500)
          .style("opacity", 0);
        div.transition()
          .duration(200)
          .style("opacity", .9);
        div.html("<br/>Reportings:" +
            range_data[i])
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 30) + "px");
      })
    .on("mouseout", function(d) {
      div.transition()
            .duration(100)
            .style("opacity", 0);
    });

    // var x = d3.scale.linear()
    //   .domain([0, 10000])
    //   .range([0, width]);
    //
    // var xAxis = d3.svg.axis()
    //   .scale(x)
    //   .orient("bottom")
    //   .tickSize(14)
    //   .tickValues(range_data)
    //   .tickFormat(function(d) {
    //     return d; });
    //
    //
    // g.call(xAxis).append("text")
    //   .attr("class", "caption")
    //   .attr("y", -6)
    //   .text("UFO Reportings Count");


  }

  // load data from a csv file
  // d3.csv("../../data/ufo_dashboard_simple.csv", function(data) {
  //
  // });
})();
