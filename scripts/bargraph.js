const width = 900;
const height = 500;
const margin = { top: 50, right: 30, bottom: 50, left: 80};
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

d3.csv("data/suiciderates.csv").then(function(data) {
    data.forEach(d => {
        d['Rate'] = +d['Rate'];
    });

    var groupByCountry = d3.group(data, d => d.Country);
    BarChart(groupByCountry);
});

function BarChart(groupByCountry) {
    var title = "Suicide Rates in Australia";
    const yAxisLabel = "Suicide Rate (per 100,000)";
    const xAxisLabel = "Year";
    var countryRecord = groupByCountry.get("Australia");

    const svg = d3.select('#barchart')
                    .append("svg")
                    .attr('width', width)
                    .attr('height', height); 

    var yValue = d => d.Rate;
    var xValue = d => d.Year;

    var xScale = d3.scaleBand()
                    .domain(countryRecord.map(xValue))
                    .range([0, innerWidth])
                    .padding(0.1);

    var yScale = d3.scaleLinear()
                    .domain([0, d3.max(countryRecord, yValue)])
                    .range([innerHeight, 0]).nice();

    const g = svg.append('g')
                 .attr('transform', `translate(${margin.left},${margin.top})`);

    svg.append("text")
        .attr("class", "title_barchart")
        .attr('y', 40)
        .attr('x', innerWidth / 2 + margin.left)
        .attr('text-anchor', 'middle')
        .text(title)
        .style('font-size', 30);                    

    const xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale).ticks(5);

    g.append('g')
     .attr('transform', `translate(0,${innerHeight})`)
     .attr("class", "xaxis")
     .call(xAxis);

    g.append('g').attr('class','yaxis').call(yAxis);

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var tooltip = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("position", "absolute")
                    .style("visibility", "hidden")
                    .style("background-color", "white")
                    .style("border", "solid")
                    .style("border-width", "2px")
                    .style("border-radius", "5px")
                    .style("padding", "5px");

    g.append('g').selectAll('rect')
        .data(countryRecord)
        .enter()
        .append('rect')
        .attr("class", "bar")            
        .attr('x', d => xScale(xValue(d)))
        .attr('y', d => yScale(yValue(d)))
        .attr('height', d => innerHeight - yScale(yValue(d)))
        .attr('width', xScale.bandwidth())
        .attr('fill', (d, i) => color(i))
        .on("mouseover", function(event, d) {
            tooltip.style("visibility", "visible")
                   .text(`Year: ${d.Year}, Rate: ${d.Rate}`);
            d3.select(this).style("opacity", 0.7);
        })
        .on("mousemove", function(event) {
            tooltip.style("top", (event.pageY - 10) + "px")
                   .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
            d3.select(this).style("opacity", 1);
        });

    d3.select('#getData').on('click', () => {
        var countrySelected = d3.select('input[name="Country"]:checked').node().value;
        title = "Suicide Rates in " + countrySelected;
        ChangeTitle_BarChart(title);
        countryRecord = groupByCountry.get(countrySelected);

        yScale.domain([0, d3.max(countryRecord, yValue)]).nice();
        d3.select('.yaxis').call(yAxis);

        g.selectAll('rect')
            .data(countryRecord)
            .transition()
            .duration(1000)
            .attr('x', d => xScale(xValue(d)))
            .attr('y', d => yScale(yValue(d)))
            .attr('height', d => innerHeight - yScale(yValue(d)))
            .attr('width', xScale.bandwidth())
            .attr('fill', (d, i) => color(i));
    });

    function ChangeTitle_BarChart(new_title) {
        d3.select(".title_barchart").remove();
        svg.append("text")
            .attr('text-anchor', 'middle')
            .attr("class", "title_barchart")
            .attr('y', 40)
            .attr('x', innerWidth / 2 + margin.left)
            .text(new_title)
            .style('font-size', 30);     
    }
}