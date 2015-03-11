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
    .range([0, width])
	.clamp(true);

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
    })
	.interpolate('basis');

var stack = d3.layout.stack()
    .values(function(d) {
        return d.values;
    });

//global variable holding year to animate pie chart
var slider_year = '1850';

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([0, 0])
  .html(function(d) {
    return d.data.region + ": <span style='color:orangered'>" + d.data[slider_year] +"%" + "</span>";
  });

var svg = d3.select("#chart1")  
    .append("svg")
    .attr("width", width + margin.left + margin.right + 200)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//svg2 is for slider
var svg2 = d3.select("#chart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", 50)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + 0 + ")");


var svg3 = d3.select("#chart3")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + width / 3 + "," + height / 2 + ")");

svg3.call(tip);

d3.csv("immigration.csv", function(error, data) {
    color.domain(d3.keys(data[0])
        .filter(function(key) {
            return key !== "year" && key !== "Percent Foreign" &&
                key !== "Natives";
        }));

    data.forEach(function(d) {
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


    browser.append('circle')
        .attr('cx', width + 205)
        .attr('cy', function(d, i) {
            return height -i * 20;
        })
        .attr('r', 5)
        .style('fill', function(d) {
            return color(d.name);
        });

    browser.append('text')
        .attr('x', width + 195)
        .attr('y', function(d, i) {
            return height - (i * 20) + 6;
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
        .style("text-anchor", "middle");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height/2)
        .attr("y", -margin.bottom - 15)
        .attr("dy", ".1em")
        .style("text-anchor", "middle")
        .text("Percentage of Immigrants");

		//tooltips
//		var paths = svg.selectAll("path");
//		var l = path.getTotalLength();
//		function get_yval(x){
//			return path.getPointAtLength(x * l);
//		}
		browser.append("circle")
			.attr('fill', 'black')
			.attr("transform", "translate(" + x(new Date('1930')) + "," + 0 + ")")
			.attr("r", 5)
			.append("svg:title")
			.text('1930: The Great Depression causes downturn in immigration');
			
		browser.append("circle")
			.attr('fill', color('Eastern Asia'))
			.attr("transform", "translate(" + x(new Date('1859')) + "," + 0 + ")")
			.attr("r", 5)
			.append("svg:title")
			.text('1859: California passes law that bans all immigration from China');

		browser.append("circle")
			.attr('fill', color('Europe'))
			.attr("transform", "translate(" + x(new Date('1855')) + "," + 0 + ")")
			.attr("r", 5)
			.append("svg:title")
			.text('1840-1860: Irish potato famine, many flee Ireland');

		browser.append("circle")
			.attr('fill', color('Eastern Asia'))
			.attr("transform", "translate(" + x(new Date('1859')) + "," + 0 + ")")
			.attr("r", 5)
			.append("svg:title")
			.text('1882: Chinese Exclusion Act bans all immigration from China into California');

		browser.append("circle")
			.attr('fill', color('Mexico'))
			.attr("transform", "translate(" + x(new Date('1910')) + "," + 0 + ")")
			.attr("r", 5)
			.append("svg:title")
			.text('1910-1917: Mexican revolution causes refugees to flee to the US');

		browser.append("circle")
			.attr('fill', color('Eastern Asia'))
			.attr("transform", "translate(" + x(new Date('1943')) + "," + 0 + ")")
			.attr("r", 5)
			.append("svg:title")
			.text('1943: US and China ally against Japan during WWII, Chinese Exclusion Act repealed');
			
		browser.append("circle")
			.attr('fill', 'black')
			.attr("transform", "translate(" + x(new Date('1965')) + "," + 0 + ")")
			.attr("r", 5)
			.append("svg:title")
			.text('1965: Immigration Nationality Act allows visas based on skill and family');

		browser.append("circle")
			.attr('fill', color('Latin America'))
			.attr("transform", "translate(" + x(new Date('1970')) + "," + 0 + ")")
			.attr("r", 5)
			.append("svg:title")
			.text('1970-1973: US sponsored coup in Chile');

		browser.append("circle")
			.attr('fill', color('Latin America'))
			.attr("transform", "translate(" + x(new Date('1976')) + "," + 0 + ")")
			.attr("r", 5)
			.append("svg:title")
			.text('1976: US sponsored coup in Argentina');

		browser.append("circle")
			.attr('fill', color('Western Asia'))
			.attr("transform", "translate(" + x(new Date('1979')) + "," + 0 + ")")
			.attr("r", 5)
			.append("svg:title")
			.text('1978-1979: Iranian revolution sparks mass exodus');

		browser.append("circle")
			.attr('fill', color('Mexico'))
			.attr("transform", "translate(" + x(new Date('1977')) + "," + 0 + ")")
			.attr("r", 5)
			.append("svg:title")
			.text('1976: First Mexican peso crisis');

		browser.append("circle")
			.attr('fill', color('Latin America'))
			.attr("transform", "translate(" + x(new Date('1981')) + "," + 0 + ")")
			.attr("r", 5)
			.append("svg:title")
			.text('1981-1990: US sponsored coup in Nicaragua (Iran-Contra)');

		browser.append("circle")
			.attr('fill', color('Mexico'))
			.attr("transform", "translate(" + x(new Date('1994')) + "," + 0 + ")")
			.attr("r", 5)
			.append("svg:title")
			.text('1994: NAFTA passes, Mexican goods production declines');
});

function draw_pie(){
	//clear image so we can redraw
	//http://stackoverflow.com/questions/10784018/how-can-i-remove-or-replace-svg-content
	svg3.selectAll("*").remove();		

	var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) {
        return d[slider_year];
    });

	d3.csv("transposed_immigration.csv", function(error, data) {
		//pie chart
		var radius = height / 2;
		var arc = d3.svg.arc()
			.outerRadius(radius)
			.innerRadius(0);
		
		var g = svg3.selectAll(".arc")
			.data(pie(data))
			.enter()
			.append("g")
			.attr("class", "arc");

		g.append("text")

		g.append("path")
            .attr("class", "arc")
			.attr("d", arc)
			.each(function(d) { this._current = d; })
			.style("fill", function(d) {
				return color(d.data.region);
			})
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);
	});
}

//begin slider block
var slider_x = d3.scale.linear()
    .domain([1850, 2010])
    .range([0, width])
    .clamp(true);

var brush = d3.svg.brush()
    .x(slider_x)
    .extent([0, 0])
    .on("brush", brushed);

svg2.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + 10 + ")")
    .call(d3.svg.axis()
      .scale(slider_x)
      .orient("bottom")
      .tickFormat(function(d) { return ''; })
      .tickSize(0)
      .tickPadding(12))
  .select(".domain")
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "halo");

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


function get_nearest_date(string){
	//Why JS and d3 wouldn't use the same date format is beyond me
	//So let's convert a date string into millis back into a js Date type...
	var js_date = Date.parse(string);
	var years = 1000 * 60 * 60 * 24 * 365;
	var rounded_time = Math.round(js_date / years);
	//time is relative to epoch, let's change that
	rounded_time += 1970
	//drop the ones place
	rounded_time = Math.round(rounded_time / 10) * 10
	if(rounded_time > 2010)
		rounded_time = 2010
	else if(rounded_time < 1850)
		rounded_time = 1850
	return rounded_time;

}

function brushed() {
        var value = brush.extent()[0];

        if (d3.event.sourceEvent) { // not a programmatic event
            value = x.invert(d3.mouse(this)[0]);
            brush.extent([value, value]);
        }

        handle.attr("cx", x(value));
			tmp = get_nearest_date(value);
			if(tmp !== slider_year){
				slider_year = get_nearest_date(value);
				draw_pie();
			}
        //d3.select("body").style("background-color", d3.hsl(value, .8, .8));
    }
    //end slider block
    
