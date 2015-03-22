var d3 = require('d3');
var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

var formatDate = d3.time.format("%Y-%m-%d");

// use when cals are on white bg
var colorsWhite = ["#fff", "#ffe2e0", "#ffc1be", "#ffa19c", "#ff817a",
                    "#ff4136", "#ff2114", "#f10d00", "#f10d00", "#cf0b00",
                    "#ad0900"];

var colorsRed = ["#ff817a", "#ff6158", "#ff6158", "#ff4136", "#ff2014",
                  "#f10d00", "#cf0b00", "#ad0900", "#8b0700", "#690600"];

d3.csv('data/eq-data.csv', function(csvData) {

  // Set up our root element
  var container = d3.select("#dates-container"),

      // Determine the extent of the dates represented
      datesExtent = d3.extent(csvData, function(d){ return new Date(d['UTC Date']); }),

      // Create all dates between the min/max dates
      datesRange = d3.time.day.range(datesExtent[0], datesExtent[1]),

      // Group the Dates into Months
      nested = d3.nest()
        .key(function(d){ return d3.time.month(d); })
        .entries(datesRange);


  // Create a color scale from 0-10
  var scale = d3.scale.ordinal()
                .domain([0, 10])
                .range(colorsRed);

  // Build Calendar
  nested.forEach(function(month) {
    var date = new Date(month.key),
        monthTitle = monthNames[date.getMonth()] + " " + date.getFullYear(),
        monthDiv = container
                    .append("div")
                    .attr("class", "month"),
        monthHeader = monthDiv.append("span")
                        .attr("class", "month-header")
                        .html(monthTitle);



    // create the month representation
    monthDiv
      .selectAll('div')
      .data(month.values)
      .enter()
      .append("div")
        .attr("class", "eq-date")
        .style("background-color", function(d) {
          var id = formatDate(d);
          var num = csvData.filter(function(item) { return id == item['UTC Date']; }).length;
          return scale(num ? num : 0);
        })
        .attr("data-num-quakes", function(d) {
          var id = formatDate(d);
          var num = csvData.filter(function(item) { return id == item['UTC Date']; }).length;
          return num ? num : 0
        })
        .attr("id", function(d, i) { return formatDate(d); } )
        .on('mouseover', function(d){
            console.log(this.dataset.numQuakes);
        });
  });
});