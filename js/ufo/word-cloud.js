(function() {



  queue()
    .defer(d3.csv, "../../data/SummaryTokensCloud.csv")
    .await(ready);

  function ready(error, data) {
    if (error) throw error;
     var tokens = [];

      data.forEach(function(d) {
        tokens = _.concat(tokens, _.split(d.tokens, ' '));
      });
      tokens = _.shuffle(tokens);
      //console.log(tokens);
      var fill = d3.scale.category20c();

       d3.layout.cloud().size([900, 300])
           .words(tokens.map(function(d) {
             return {text: d, size: 10 + Math.random() * 50};
           }))
           .rotate(function() { return ~~(Math.random() * 2) * 90; })
           .font("Impact")
           .fontSize(function(d) { return d.size; })
           .on("end", draw)
           .start();

       function draw(words) {
         d3.select("#token_cloud").append("svg")
             .attr("width", 900)
             .attr("height", 300)
           .append("g")
             .attr("transform", "translate(150,150)")
           .selectAll("text")
             .data(words)
           .enter().append("text")
             .style("font-size", function(d) { return d.size + "px"; })
             .style("font-family", "Impact")
             .style("fill", function(d, i) { return fill(i); })
             .attr("text-anchor", "middle")
             .attr("transform", function(d) {
               return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
             })
             .text(function(d) { return d.text; });
       }

}


  // queue()
  //   .defer(d3.csv, "../../data/SummaryTokensCloud.csv")
  //   .await(ready);
  //
  // function ready(error, data) {
  //   if (error) throw error;
  //   var tokens = [];
  //
  //   var t = 0;
  //   data.forEach(function(d) {
  //     tokens = _.concat(tokens, _.split(d.tokens, ' '));
  //   });
  //   console.log(tokens);
  //   var to_plot = false;
  //   if (to_plot == true) {
  //     var fill = d3.scale.category20c();
  //
  //     var layout = d3.layout.cloud()
  //       .size([800, 500])
  //       .words(tokens.map(function(d) {
  //         return {
  //           text: d,
  //           size: 10 + Math.random() * 90,
  //           test: "haha"
  //         };
  //       }))
  //       .padding(5)
  //       .rotate(function() {
  //         return ~~(Math.random() * 2) * 360;
  //       })
  //       .font("Impact")
  //       .fontSize(function(d) {
  //         return d.size;
  //       })
  //       .on("end", draw);
  //
  //     layout.start();
  //
  //     function draw(words) {
  //       d3.select("#token_cloud").append("svg")
  //         .attr("width", layout.size()[0])
  //         .attr("height", layout.size()[1])
  //         .append("g")
  //         .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
  //         .selectAll("text")
  //         .data(words)
  //         .enter().append("text")
  //         .style("font-size", function(d) {
  //           return d.size + "px";
  //         })
  //         .style("font-family", "Impact")
  //         .style("fill", function(d, i) {
  //           return fill(i);
  //         })
  //         .attr("text-anchor", "middle")
  //         .attr("transform", function(d) {
  //           return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
  //         })
  //         .text(function(d) {
  //           return d.text;
  //         });
  //     }
  //
  //   }
  //
  //
  //
  // }
  //







  // var fill = d3.scale.category20();
  //
  //  d3.layout.cloud().size([300, 300])
  //      .words([
  //        ".NET", "Silverlight", "jQuery", "CSS3", "HTML5", "JavaScript", "SQL","C#"].map(function(d) {
  //        return {text: d, size: 10 + Math.random() * 50};
  //      }))
  //      .rotate(function() { return ~~(Math.random() * 2) * 90; })
  //      .font("Impact")
  //      .fontSize(function(d) { return d.size; })
  //      .on("end", draw)
  //      .start();
  //
  //  function draw(words) {
  //    d3.select("#token_cloud").append("svg")
  //        .attr("width", 300)
  //        .attr("height", 300)
  //      .append("g")
  //        .attr("transform", "translate(150,150)")
  //      .selectAll("text")
  //        .data(words)
  //      .enter().append("text")
  //        .style("font-size", function(d) { return d.size + "px"; })
  //        .style("font-family", "Impact")
  //        .style("fill", function(d, i) { return fill(i); })
  //        .attr("text-anchor", "middle")
  //        .attr("transform", function(d) {
  //          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
  //        })
  //        .text(function(d) { return d.text; });
  //  }



})();
