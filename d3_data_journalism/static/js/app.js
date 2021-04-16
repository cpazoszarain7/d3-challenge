
//start with defining svg dimensions
let svgWidth = 860;
let svgHeight = 500;

//set the margin
let margin = { top: 20, right: 100, bottom: 80, left: 80 };

//calculate chart Dimension by adjusting the margin
let chartWidth = svgWidth - margin.left - margin.right;
let chartHeight = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
let svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
let chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

/********************************************/

d3.csv("static/data/data.csv", rowConverter)
  .then(createChart)
  .catch(function (error) {
    console.log("*********unexpected error occured*********");
    console.log(error);
  });

/******************************************** */
function rowConverter(row) {
    row.poverty = +row.poverty;
    row.healthcare = +row.healthcare;
    row.income = +row.income;
    row.obesity = +row.obesity
    return row;
  }
/********************************************/

//Initialize variable selector
var allGroup = ["healthcare", "income", "obesity"]

// add the options to the button
    d3.select("#selectButton")
      .selectAll('myOptions')
     	.data(allGroup)
      .enter()
    	.append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; }) // corresponding value returned by the button

function createChart(data) {

    console.log(data)

    //Create Scale Functions

    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.poverty), d3.max(data, d => d.poverty)])
        .range([0, chartWidth]);

    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.healthcare), d3.max(data, d => d.healthcare)])
        .range([chartHeight, 0]);

    //Create Axis Function
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //Append the Axis to the Chart
    chartGroup.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .attr('class','yaxis')
      .call(leftAxis);

    node = chartGroup.selectAll("g")
    .data(data)
    .enter()
    .append("g");

    //Create circles and initialize with healthcare group
    var circlesGroup = node.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", "15")
        .attr("fill", d3.schemeSet2[0])
        .attr("opacity", ".5");

      //Create  Labels in circles
      var labelsGroup = node.selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .text(d =>d.abbr)
      .attr("x",d => xLinearScale(d.poverty))
      .attr("y",d => yLinearScale(d.healthcare))
      .attr("text-anchor", "middle")
      .attr("font-size", "8px")
      .attr("font-family", "sans-serif")
      .attr("font-weight",700);



    // //Initialize Tooltip

    // var toolTip = d3.tip()
    //     .attr("class", "tooltip")
    //     .offset([80, -60])
    //     .html(function(d) {
    //       return (`<br>Poverty: ${d.poverty}<br>Healthcare: ${d.healthcare}`);
    //     });

    // //Create tooltip in the chart
    // chartGroup.call(toolTip);

    // //Create event listeners to display and hide the tooltip
    // circlesGroup.on("mouseover", function(data) {
    //     toolTip.show(data, this);
    //     toolTip.style("display", "block");
    //   })

    // // onmouseout event
    // .on("mouseout", function(data, index) {
    //     toolTip.hide(data);
    // });

    // Create axes labels
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0-margin.left-1)
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .attr("class", "yaxisText")
        .text("healthcare");
  
    
    chartGroup.append("text")
      .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.top + 30})`)
      .attr("class", "axisText")
      .text("Poverty");

     var dataFilter =[]   

    // A function that update the chart
    function update(selectedGroup) {

    // Create new data with the selection?
    dataFilter = data.map(function(d){return {poverty: d.poverty, value: d[selectedGroup]}})
    console.log(dataFilter)
    //Recreate yLinearScale based on selected value
    var newLinearScale = d3.scaleLinear()
        .domain([d3.min(dataFilter, d => d.value), d3.max(dataFilter, d => d.value)])
        .range([chartHeight, 0]);

    //Update y Axis
    var newyAxis = d3.axisLeft(newLinearScale);
    chartGroup.selectAll('g .yaxis')
        .transition()
        .duration(500)
        .call(newyAxis)

    //Update y Axis Text
    chartGroup.selectAll('.yaxisText')
        .transition()
        .duration(500)
        .text(selectedGroup)

    // //Update Tooltips


    // var toolTip = d3.tip()
    //     .attr("class", "tooltip")
    //     .offset([80, -60])
    //     .html(function(d) {
    //       return (`<br>Poverty: ${d.poverty}<br> ${selectedGroup}: ${d.value}`);
    //     });

    

   
    // //Create tooltip in the chart
    // chartGroup.call(toolTip);
    //update position of labels
    labelsGroup
      .data(dataFilter)
      .transition()
      .duration(1000)
      .attr('x',d => xLinearScale(d.poverty))
      .attr('y',d=> newLinearScale(d.value))

    // Give these new data to update buble graph
    circlesGroup
        .data(dataFilter)
        .transition()
        .duration(1000)
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => newLinearScale(d.value))
        .attr('fill',d => {
            if (selectedGroup=== 'healthcare') {
                
                return d3.schemeSet2[0]
            }else if (selectedGroup === 'income'){
                return d3.schemeSet2[1]
            }else{
                return d3.schemeSet2[2]
            }
        })
        
    }

    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        update(selectedOption)
    })
      
    
    // Create a map object to plot poverty data
    var myMap = L.map("mymap", {
      center: [40.09, -95.71],
      zoom: 4
    });

    // Add a tile layer
    L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {      
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/dark-v10",
      accessToken: API_KEY
    }).addTo(myMap);

    function map(pdata){
    
    // Store our API endpoint inside queryUrl
  var queryUrl = "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json";
  d3.json(queryUrl).then(function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  function getColor(d) {
    return d > 18.4 ? '#800026' :
           d > 17  ? '#BD0026' :
           d > 15.6  ? '#E31A1C' :
           d > 14.2  ? '#FC4E2A' :
           d > 12.8  ? '#FD8D3C' :
           d > 11.4   ? '#FEB24C' :
           d > 10   ? '#FED976' :
                      '#FFEDA0';
  }
  
  function style(feature) {
    
    return {
        
        fillColor: getColor(feature.properties.density),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
  }


  //Replace density key of used json with poverty values
  for (let index = 0; index < data.features.length-1; index++) {
    data.features[index].properties.density = pdata[index]
    
  }
  
  L.geoJson(data, {style:style}).addTo(myMap);
});}
//Create array of Povert Data
var povertydata = data.map(d => d.poverty)
map(povertydata)


}

