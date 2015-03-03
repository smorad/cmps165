//some of the following code is from http://bl.ocks.org/mbostock/3885211

//Define Margin
var margin = {
        left: 80,
        right: 80,
        top: 50,
        bottom: 50
    },
    width = 760 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y").parse,
    formatPercent = d3.format(".0%");

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .domain([0, 0.4])
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
    .x(function(d) {
        return x(d.year);
    })
    .y0(function(d) {
        return y(d.y0);
    })
    .y1(function(d) {
        return y(d.y0 + d.y);
    });

var stack = d3.layout.stack()
    .values(function(d) {
        return d.values;
    });

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) {
        console.log(d.year);
        return d.year;
    });

var svg = d3.select("#chart1")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//svg2 is for slider
var svg2 = d3.select("#chart2")
    .append("svg")
    .attr("width", width + margin.left / 2 + margin.right / 2 + 5)
    .attr("height", 100)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + 0 + ")");


var svg3 = d3.select("#chart3")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

d3.csv("immigration.csv", function(error, data) {
    color.domain(d3.keys(data[0])
        .filter(function(key) {
            return key !== "year" && key !== "Percent Foreign" &&
                key !== "Natives";
        }));
    console.log(data);

    data.forEach(function(d) {
        console.log(d);
        d.year = parseDate(d.year);
    });

    var regions = stack(color.domain()
        .map(function(name) {
            return {
                name: name,
                values: data.map(function(d) {
                    return {
                        year: d.year,
                        y: d[name] / 100
                    };
                })
            };
        }));
    x.domain(d3.extent(data, function(d) {
        return d.year;
    }));

    var browser = svg.selectAll(".browser")
        .data(regions)
        .enter()
        .append("g")
        .attr("class", "browser");

    browser.append("path")
        .attr("class", "area")
        .attr("d", function(d) {
            return area(d.values);
        })
        .style("fill", function(d) {
            return color(d.name);
        });

    browser.append("text")
        .datum(function(d) {
            return {
                name: d.name,
                value: d.values[d.values.length - 1]
            };
        })
        .attr("transform", function(d) {
            return "translate(" + x(d.value.year) + "," + y(d.value
                .y0 + d.value.y / 2) + ")";
        })
        .attr("x", -6)
        .attr("dy", ".35em")
        //.text(function(d) { return d.name; });


    browser.append('rect')
        .attr('x', width - 20)
        .attr('y', function(d, i) {
            return i * 20;
        })
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', function(d) {
            return color(d.name);
        });

    browser.append('text')
        .attr('x', width - 25)
        .attr('y', function(d, i) {
            return (i * 20) + 9;
        })
        .text(function(d) {
            return d.name;
        });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("x", width / 2)
        .attr("y", margin.bottom - 5)
        .attr("dy", ".1em")
        .style("text-anchor", "middle")
        .text("1850-2010 (Every 10 Years)");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height/2)
        .attr("y", -margin.bottom - 15)
        .attr("dy", ".1em")
        .style("text-anchor", "middle")
        .text("Percentage of Foreigners");

    //pie chart
    var radius = height / 2;
    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);


    var g = svg3.selectAll(".arc")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "arc");

    console.log(g);

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d) {
            return color(d.data.year);
        });

});

//begin slider block
var slider_x = d3.scale.linear()
    .domain([1850, 2010])
    .range([0, width])
    .clamp(true);

var brush = d3.svg.brush()
    .x(slider_x)
    .extent([0, 0])
    .on("brush", brushed);

var slider = svg2.append("g")
    .attr("class", "slider")
    .call(brush);

slider.selectAll(".extent,.resize")
    .remove();

slider.select(".background")
    .attr("height", height);

var handle = slider.append("circle")
    .attr("class", "handle")
    .attr("transform", "translate(0," + 10 + ")")
    .attr("r", 9);

slider.call(brush.event)
    .transition() // gratuitous intro!
    .duration(750)
    .call(brush.extent([70, 70]))
    .call(brush.event);

function brushed() {
        var value = brush.extent()[0];

        if (d3.event.sourceEvent) { // not a programmatic event
            value = x.invert(d3.mouse(this)[0]);
            brush.extent([value, value]);
        }

        handle.attr("cx", x(value));
        //d3.select("body").style("background-color", d3.hsl(value, .8, .8));
    }
    //end slider block
    
