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
  //var usChart = dc.geoChoroplethChart("#us-chart");

  //var moveChart = dc.compositeChart("#monthly-move-chart");
  //var volumeChart = dc.barChart("#monthly-volume-chart");

  queue()
    .defer(d3.json, "../../data/us-states.json")
    .defer(d3.csv, "../../data/vc.csv")
    .defer(d3.csv, "../../data/ufo_dashboard.csv")
    .await(ready);

  function ready(error, statesJson, vc, data) {
    if (error) throw error;




    // format our data
    var eventDateFormat = d3.time.format("%Y-%m-%d");
    var numberFormat = d3.format(".2f");

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

    // Table of earthquake data
    dataTable.width(960).height(800)
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
          return d.EventDate;
        },
        function(d) {
          return d.Shape;
        },
        function(d) {
          return d.Duration;
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
    durationChart.width(480)
      .height(150)
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
      .gap(2) // 65 = norm
      //    .filter([3, 5])
      .x(d3.scale.linear().domain([1, 50]))
      .xAxis().tickFormat(function(v) {
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
    eventDateChart.width(960)
      .height(150)
      .margins({
        top: 10,
        right: 10,
        bottom: 20,
        left: 40
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

    eventYearChart.width(960)
      .height(40)
      .margins({
        top: 0,
        right: 50,
        bottom: 20,
        left: 40
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
    shapeChart.width(300)
      .height(200)
      .margins({
        top: 5,
        left: 10,
        right: 10,
        bottom: 20
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


    // var stateGroupCount = stateDimension.group()
    //   .reduceCount(function(d) {
    //     return d.State;
    //   }) // counts
    //
    // geoChart.width(990)
    //   .height(500)
    //   .dimension(stateDimension)
    //   .group(stateGroupCount)
    //   .colors(d3.scale.quantize().range(
    //     ["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]))
    //   .colorDomain([0, 10])
    //   .overlayGeoJson(us.features, "state", function(d) {
    //     return d.properties.name;
    //   });

    // Render the Charts
    dc.renderAll();

  }

  // load data from a csv file
  // d3.csv("../../data/ufo_dashboard_simple.csv", function(data) {
  //
  // });
})();
