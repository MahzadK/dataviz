// Set the dimensions of the canvas / graph
  var	margin = {top: 30, right: 20, bottom: 30, left: 50},
  w = 800 - margin.left - margin.right,
   h = 400 - margin.top - margin.bottom;
    // set-up unit projection and path
    var projection = d3.geo.mercator()
            .scale(1)
            .translate([0, 0]);
    var path = d3.geo.path()
            .projection(projection);
    // set-up svg canvas
    var svg = d3.select("#map").append("svg")
            .attr("width", w + margin.left + margin.right)
             .attr("height", h + margin.top + margin.bottom);

    var color = d3.scale.linear()
            .range(["PapayaWhip", "red"]);

   var linear = d3.scale.linear()
                .range(["PapayaWhip", "red"]);

    var showValue= "Gini";
    var record=[];

    var g = svg.append("g");
            // zoom and pan
    var zoom = d3.behavior.zoom()
             .on("zoom",function() {
                 g.attr("transform","translate("+
                     d3.event.translate.join(",")+")scale("+d3.event.scale+")");
                 g.selectAll("path")
                     .attr("d", path.projection(projection));
           });

    svg.call(zoom)


    function addRecord(d){
      if (  d[showValue]!=0){
        d[showValue]=+d[showValue];
        var obj = {key: d.countries, value: d[showValue]};
        record.push(obj);
        return d;
      }
    }
    d3.csv("../data/gapminder/gini-complete.csv", addRecord, function(error,data){
        color.domain(d3.extent(data, function(d){
          return d[showValue];
        }));
        linear.domain(d3.extent(data, function(d){
          if (d[showValue]!=0)
          {return d[showValue];}
        }));
    });
    //https://github.com/johan/world.geo.json
    d3.json("../data/countries.geo.json", function(error, data) {
        d3.csv("../data/idCountry.csv", function(error, csv) {
            var world = data.features;
            csv.forEach(function(d, i) {
                world.forEach(function(e, j) {
                    if (d.id === e.id) {
                        e.name = d.name
                    }
                })
            })
            // calculate bounds, scale and transform
            // see http://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object
            var b = path.bounds(data),
                    s = .95 / Math.max((b[1][0] - b[0][0]) / w, (b[1][1] - b[0][1]) / h),
                    t = [(w - s * (b[1][0] + b[0][0])) / 2, (h - s * (b[1][1] + b[0][1])) / 2];
            projection.scale(s)
                    .translate(t);
            g.selectAll("path")
                    .data(world).enter()
                    .append("path")
                    .style("fill", getColor)
                    .style("stroke", "grey")
                    .style("stroke-width", "1px")
                    .attr("d", path)
                    .on("mouseover", function(d, i) {
                        reporter(d);
                    });
        });
        g.append("g")
                .attr("class", "legendLinear")
                .attr("transform", "translate(20,20)");
        var legendLinear = d3.legend.color()
                .shapeWidth(60)
                .scale(linear);
        g.select(".legendLinear")
                .call(legendLinear);
        function reporter(x) {
            var value = "Not known";
            record.forEach(function(d){
                if(x.name === d.key && d.value!=0 ){
                    value = d.value;
                    return;
                }
            });
            d3.select("#report").text(function() {
                return x.name+": "+value;
            });
        }
        function getColor(data){
            var value=-1;
            record.forEach(function(d){
                if(data.name === d.key ){
                    value = d.value;
                    return;
            }
            });
            if(value==-1){
                return "none";
            }
            return color(value);
        }
    })
