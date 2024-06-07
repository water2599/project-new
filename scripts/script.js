// Set dimensions and margins for the chart

const margin = { top: 70, right: 30, bottom: 40, left: 80 };
const width =  600- margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;


// Create the SVG element and append it to the chart container

const svg = d3.select("#linechart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// dataset

d3.csv("data/health-stats-new.csv").then(function(data) {

  console.log(data);

// grouping the countries into options
  const allGroup = new Set(data.map(d => d.Country));

// add the options to the button
  d3.select("#selectButton")
    .selectAll('myOptions')
    .data(allGroup)
    .enter()
    .append('option')
    .text(function (d) { return d;}) // text showed in the menu
    .attr("value", function (d) { return d;}) // corresponding value returned in the button

// add colour to each country
const myColor = d3.scaleOrdinal()
  .domain(allGroup)
  .range(d3.schemeSet2);

// Add the x-axis

const x = d3.scaleLinear()
  .domain(d3.extent(data, function(d) {return d.Year; }))
  .range([0, width]);
svg.append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(d3.axisBottom(x).ticks(9));

// Add the y-axis

const y = d3.scaleLinear()
  .domain([0, d3.max(data, function(d) { return +d.Rate; })])
  .range([height, 0]);
svg.append("g")
  .call(d3.axisLeft(y));

// Create the line generator

const line = svg
  .append('g')
  .append("path")
    .datum(data.filter(function(d){return d.Country=="Australia"}))
    .attr("d", d3.line()
      .x(function(d) { return x(+d.Year) })
      .y(function(d) { return y(+d.Rate) })
    )
    .attr("stroke", function(d){ return myColor(d.Country)})
    .style("stroke-width", 3)
    .style("fill", "none")

// a function to update the chart
function update(selectedGroup) {

  // Create new data with the selection
  const dataFilter = data.filter(function(d){return d.Country==selectedGroup})

  // Update the line with new data
  line
      .datum(dataFilter)
      .transition()
      .duration(1000)
      .attr("d", d3.line()
        .x(function(d) { return x(+d.Year) })
        .y(function(d) { return y(+d.Rate) })
      )
      .attr("stroke", function(d){ return myColor(selectedGroup)})
}

//  When the button is changed, run the updateChart function  
d3.select("#selectButton").on("change", function(event,d) {
  // recover the option that has been chosen
  const selectedOption = d3.select(this).property("value")
  // run the updateChart function with this selected option
  update(selectedOption)
})

})