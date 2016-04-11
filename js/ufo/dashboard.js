(function() {


  // Create the dc.js chart objects & link to div
  var dataTable = dc.dataTable("#dashboard-table-graph");
  var durationChart = dc.barChart("#dashboard-duration-chart");
  // var depthChart = dc.barChart("#dc-depth-chart");
  var shapeChart = dc.rowChart("#dashboard-shape-chart");
  // var islandChart = dc.pieChart("#dc-island-chart");
  var eventDateChart = dc.lineChart("#dashboard-event-date-chart");
  var geoChart = dc.geoChoroplethChart("#dashboard-geo-map-chart");

  // load data from a csv file
  d3.csv("../../data/ufo_dashboard_simple.csv", function(data) {

    // format our data
    var eventDateFormat = d3.time.format("%Y-%m-%d");
    var dtgFormat = d3.time.format("%Y-%m-%dT%H:%M:%S");
    var dtgFormat2 = d3.time.format("%a %e %b %H:%M");

    data.forEach(function(d) {
      //console.log(d.EventDate);
      d.EventDate = eventDateFormat.parse(d.EventDate);
      //console.log(d.EventDate);
      // d.dtg1  = d.origintime.substr(0,10) + " " + d.origintime.substr(11,8);
      // d.dtg   = dtgFormat.parse(d.origintime.substr(0,19));
      // d.lat   = +d.latitude;
      // d.long  = +d.longitude;
      d.Duration = d3.round(+d.Duration, 1);
      // d.depth = d3.round(+d.depth,0);

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
      .transitionDuration(500)
      .centerBar(true)
      .gap(2) // 65 = norm
      //    .filter([3, 5])
      .x(d3.scale.linear().domain([1, 50]))
      .elasticY(true)
      .xAxis().tickFormat();

    //Duration Chart
    var eventByDate = facts.dimension(function(d) {
      return d3.time.hour(d.EventDate);
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
      .elasticY(true)
      .x(d3.time.scale().domain(d3.extent(data, function(d) {
        return d.EventDate;
      }))).xAxis();

    //Shape Charts
    var shapeCountGroup = shapeDimension.group();
    // row chart day of week
    shapeChart.width(300)
      .height(220)
      .margins({
        top: 5,
        left: 10,
        right: 10,
        bottom: 20
      }).dimension(shapeDimension)
      .group(shapeCountGroup)
      .colors(d3.scale.category10())
      .label(function(d) {
        return d.key;
      })
      .title(function(d) {
        return d.value;
      }).elasticX(true)
      .xAxis().ticks(4);

    // Render the Charts
    dc.renderAll();


    // var magValueGroupSum = magValue.group()
    //   .reduceSum(function(d) { return d.mag; });	// sums

    //
    // // for Depth
    // var depthValue = facts.dimension(function (d) {
    //   return d.depth;
    // });
    // var depthValueGroup = depthValue.group();
    //
    // // time chart
    // var volumeByHour = facts.dimension(function(d) {
    //   return d3.time.hour(d.dtg);
    // });
    // var volumeByHourGroup = volumeByHour.group()
    //   .reduceCount(function(d) { return d.dtg; });

    // row chart Day of Week
    // var dayOfWeek = facts.dimension(function (d) {
    //   var day = d.dtg.getDay();
    //   switch (day) {
    //     case 0:
    //       return "0.Sun";
    //     case 1:
    //       return "1.Mon";
    //     case 2:
    //       return "2.Tue";
    //     case 3:
    //       return "3.Wed";
    //     case 4:
    //       return "4.Thu";
    //     case 5:
    //       return "5.Fri";
    //     case 6:
    //       return "6.Sat";
    //   }
    // });
    // var dayOfWeekGroup = dayOfWeek.group();
    //
    // // Pie Chart
    // var islands = facts.dimension(function (d) {
    //   if (d.lat <= -40.555907 && d.long <= 174.590607)
    //     return "South";
    //   else
    //     return "North";
    //   });
    // var islandsGroup = islands.group();
    //
    // // Create datatable dimension
    // var timeDimension = facts.dimension(function (d) {
    //   return d.dtg;
    // });

    // Setup the charts

    // count all the facts
    // dc.dataCount(".dc-data-count")
    //   .dimension(facts)
    //   .group(all);

    // Magnitide Bar Graph Counted
    //   magnitudeChart.width(480)
    //     .height(150)
    //     .margins({top: 10, right: 10, bottom: 20, left: 40})
    //     .dimension(magValue)
    //     .group(magValueGroupCount)
    // 	.transitionDuration(500)
    //     .centerBar(true)
    // 	.gap(65)  // 65 = norm
    // //    .filter([3, 5])
    //     .x(d3.scale.linear().domain([0.5, 7.5]))
    // 	.elasticY(true)
    // 	.xAxis().tickFormat();

    // Depth bar graph
    // depthChart.width(480)
    //   .height(150)
    //   .margins({top: 10, right: 10, bottom: 20, left: 40})
    //   .dimension(depthValue)
    //   .group(depthValueGroup)
    // .transitionDuration(500)
    //   .centerBar(true)
    // .gap(1)
    //   .x(d3.scale.linear().domain([0, 100]))
    // .elasticY(true)
    // .xAxis().tickFormat(function(v) {return v;});

    // time graph
    //   timeChart.width(960)
    //     .height(150)
    //     .transitionDuration(500)
    // //    .mouseZoomable(true)
    //     .margins({top: 10, right: 10, bottom: 20, left: 40})
    //     .dimension(volumeByHour)
    //     .group(volumeByHourGroup)
    // //    .brushOn(false)			// added for title
    //     .title(function(d){
    //       return dtgFormat2(d.data.key)
    //       + "\nNumber of Events: " + d.data.value;
    //       })
    // 	.elasticY(true)
    //     .x(d3.time.scale().domain(d3.extent(data, function(d) { return d.dtg; })))
    //     .xAxis();

    // row chart day of week
    // dayOfWeekChart.width(300)
    //   .height(220)
    //   .margins({top: 5, left: 10, right: 10, bottom: 20})
    //   .dimension(dayOfWeek)
    //   .group(dayOfWeekGroup)
    //   .colors(d3.scale.category10())
    //   .label(function (d){
    //      return d.key.split(".")[1];
    //   })
    //   .title(function(d){return d.value;})
    //   .elasticX(true)
    //   .xAxis().ticks(4);

    // islands pie chart
    // islandChart.width(250)
    //   .height(220)
    //   .radius(100)
    //   .innerRadius(30)
    //   .dimension(islands)
    //   .title(function(d){return d.value;})
    //   .group(islandsGroup);


  });
})();
