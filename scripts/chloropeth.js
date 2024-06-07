d3.csv("data/depression.csv").then(function(data) {
   
    var groupByCountry = d3.group(data, d => d.Country);
    var groupByYear2019 = [];
    groupByCountry.forEach(function(countryData) {
        countryData.forEach(function(entry) {
            if (entry.Year == 2019) {
                groupByYear2019.push(entry);
            }
        });
    });

    regionalDepressionRates(groupByYear2019, groupByCountry);
});

function regionalDepressionRates(groupByYear2019, groupByCountry) {
    var projection = d3.geoMercator().scale(150).translate([480, 250]);
    var path = d3.geoPath().projection(projection);
    var color = d3.scaleQuantize().domain([1, 7]).range(d3.schemeBlues[7]);

    var svg = d3.select("#Choropleth").append("svg").attr("width", 960).attr("height", 500);

    svg.append("g").attr("class", "legendLinear").attr("transform", "translate(30,300)");

    svg.append('text').attr('y', 280).attr('x', 30).text('Unit: %').style('font-family', 'Helvetica').style('fill', "black");

    const legendLinear = d3.legendColor().shapeWidth(30).cells([1, 2, 3, 4, 5, 6, 7]).orient('vertical').scale(color);

    svg.select(".legendLinear").call(legendLinear).style('font-family', 'Helvetica').style('fill', "black").style('font-size', 12);

    var g = svg.append('g');

    svg.call(d3.zoom().scaleExtent([1, 10]).on('zoom', (event) => {
        g.attr('transform', event.transform);
    }));

    d3.json("data/countries.json").then(function(json) {
        for (var i = 0; i < groupByYear2019.length; i++) {
            var dataCountry = groupByYear2019[i].Country;
            var dataDepressionRate = parseFloat(groupByYear2019[i].Rate);
            for (var j = 0; j < json.features.length; j++) {
                var jsonCountry = json.features[j].properties.name;
                if (dataCountry == jsonCountry) {
                    json.features[j].properties.value = dataDepressionRate;
                    groupByCountry.get(dataCountry).forEach(function(entry) {
                        json.features[j].properties[`year${entry.Year}`] = entry.Rate;
                    });
                    break;
                }
            }
        }

        g.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("class", "country")
            .style("fill", d => d.properties.value ? color(d.properties.value) : "#ccc")
            .style("stroke", "black")
            .style("stroke-width", 0.5)
            .on("mouseover", function(event, d) {
                d3.selectAll(".country").transition().duration(200).style("opacity", .3).style("stroke", "black");
                d3.select(this).transition().duration(200).style("opacity", 1);
                d3.select(this).append('title').text(`Country Name: ${d.properties.name}\nDepression Rate: ${d.properties.value || 'N/A'} (%) \nYear: 2019`);
                mouseOverMap(d);
            })
            .on("mouseleave", function(event, d) {
                mouseLeaveMap(d);
            });
    });

    var mouseOverMap = function(d) {
        DisplayDetail();
        d3.selectAll("#detailed_info > *").remove();
        var dataset = [];
        for (let year = 2010; year <= 2019; year++) {
            dataset.push([year.toString(), d.properties[`year${year}`]]);
        }
        var margin = { top: 0, right: 0, bottom: 70, left: 60 },
            w = 350 - margin.left - margin.right,
            h = 250 - margin.top - margin.bottom;
        var svg1 = d3.select("#detailed_info").append("svg").attr("width", 350).attr("height", 250).attr("fill", "none");

        var xScale = d3.scaleTime().domain([new Date(2010, 0, 1), new Date(2019, 0, 1)]).range([margin.left, w - margin.right]);
        var yScale = d3.scaleLinear().domain([0, d3.max(dataset, d => parseFloat(d[1]))]).range([h, margin.left]).nice();

        var line = d3.line().x(d => xScale(new Date(d[0], 0, 1))).y(d => yScale(d[1]));

        svg1.append("path").datum(dataset).attr("class", "line").attr("d", line).style("stroke", "#382b06").style("stroke-width", "3px");

        var area = d3.area().x(d => xScale(new Date(d[0], 0, 1))).y0(() => yScale.range()[0]).y1(d => yScale(d[1]));

        svg1.append("path").datum(dataset).attr("class", "area").attr("d", area).style("fill", "#d9ae38");

        var xAxis = d3.axisBottom().scale(xScale);
        var yAxis = d3.axisLeft().scale(yScale).ticks(5);

        svg1.append("g").attr("class", "xAxis").attr("transform", "translate(0," + h + ")").call(xAxis);
        svg1.append("g").attr("class", "yAxis").attr("transform", "translate(" + margin.left + ", 0)").call(yAxis);

        d3.select(".yAxis").append('text').attr('y', -45).attr('x', -120).attr('fill', 'black').attr('transform', `rotate(-90)`).attr('text-anchor', 'middle').text("Depression Rate (%)");
        d3.select(".xAxis").append('text').attr('x', 170).attr('y', 30).attr('fill', 'black').attr('text-anchor', 'middle').text("Year");

        ChangeTitle_AreaChart(d.properties.name);
    };

    var mouseLeaveMap = function(d) {
        d3.selectAll(".country").transition().duration(200).style("stroke", "black").style("stroke-width", 0.5).style("opacity", 0.8);
        HideDetail();
    };

    function DisplayDetail() {
        var chart = document.getElementById("choropleth_detailed_info");
        chart.style.display = "block";
    }

    function HideDetail() {
        var chart = document.getElementById("choropleth_detailed_info");
        chart.style.display = "none";
    }

    function ChangeTitle_AreaChart(new_title) {
        var label = d3.select(".xAxis").append('text').attr('x', 170).attr('y', -120).attr('class', 'title_areachart').attr('fill', 'black').attr('text-anchor', 'middle').style("font-size", 20).text(new_title);
    }
}
