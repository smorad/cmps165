//some of the following code is from http://bl.ocks.org/mbostock/3885211

//Define Margin
var margin = {left: 80, right: 80, top: 50, bottom: 50 }, 
	width = 960 - margin.left -margin.right,
	height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y").parse,
    formatPercent = d3.format(".0%");

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category20();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(formatPercent);

var area = d3.svg.area()
    .x(function(d) { return x(d.date); })
    .y0(function(d) { return y(d.y0); })
    .y1(function(d) { return y(d.y0 + d.y); });

var stack = d3.layout.stack()
    .values(function(d) { return d.values; });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//add slider, could interpolate data and make more granular steps later
//d3.slider().axis(true).min(1850).max(2010).step(5)

d3.csv("immigration.csv", function(error, data) {
	color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));
	console.log(data);

	data.forEach(function(d) {
		console.log(d);
    	d.date = parseDate(d.date);
  	});

  var regions = stack(color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {date: d.date, y: d[name] / 100};
      })
    };
  }));
  x.domain(d3.extent(data, function(d) { return d.date; }));

  var browser = svg.selectAll(".browser")
      .data(regions)
    .enter().append("g")
      .attr("class", "browser");

  browser.append("path")
      .attr("class", "area")
      .attr("d", function(d) { return area(d.values); })
      .style("fill", function(d) { return color(d.name); });

  browser.append("text")
      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.y0 + d.value.y / 2) + ")"; })
      .attr("x", -6)
      .attr("dy", ".35em")
      .text(function(d) { return d.name; });

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);
});
