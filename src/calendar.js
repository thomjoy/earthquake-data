import PubSub from 'pubsub-js';
import d3 from 'd3';
import $ from 'jquery';
import tooltip from 'bootstrap-tooltip';

// Set up our root element
var container = d3.select("#dates-container");

var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

var formatDate = d3.time.format("%Y-%m-%d");

// use when cals are on white bg
var colorsWhite = ["#fff", "#ffe2e0", "#ffc1be", "#ffa19c", "#ff817a",
                    "#ff4136", "#ff2114", "#f10d00", "#f10d00", "#cf0b00",
                    "#ad0900"];

var colorsRed = ["#ff4136", "#ff2014", "#f10d00", "#cf0b00", "#ad0900",
                  "#8b0700", "#690600", "#470400", "#250200", "#030000"];

// Used to filter the dataset
// d is a date, which we turn into a string and use as a key to group on
// i.e. how many earthquakes in dataSet have a 'UTC Date' of 2015-03-20?
var filterFn = function(d, dataSet) {
  var id = formatDate(d),
      items = dataSet.filter(function(item) { return id == item['UTC Date']; });

  return items;
}

// Create a color scale from 0-10
var scale = d3.scale.ordinal()
              .domain([0, 10])
              .range(colorsRed);

var scaleContainer = container
                      .append("div")
                      .attr("id", "scale");

scaleContainer
  .append("div")
    .attr("class", "scale-desc")
    .text("low")

d3.range(0, 10).forEach(function(scaleValue) {
  scaleContainer
    .append("div")
      .attr("class", "scale-item")
      .style("background-color", function() { return colorsRed[scaleValue]; })
});

scaleContainer
  .append("div")
    .attr("class", "scale-desc")
    .text("high")

// Fetch the data
d3.csv('data/eq-data.csv', function(csvData) {

  // -- Calendar
  // Determine the extent of the dates represented
  var datesExtent = d3.extent(csvData, function(d){ return new Date(d['UTC Date']); }),

      // Create all dates between the min/max dates
      datesRange = d3.time.day.range(datesExtent[0], datesExtent[1]),

      // Group the Dates into Months
      nested = d3.nest()
        .key(function(d){ return d3.time.month(d); })
        .entries(datesRange);

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
        .style("background-color", function(d) { return scale((filterFn(d, csvData)).length); })
        .attr("title", function(d) { return (filterFn(d, csvData)).length + " quakes on " + formatDate(d); })
        .attr("data-toggle", "tooltip")
        .attr("data-placement", "top")
        .attr("id", function(d, i) { return formatDate(d); })
        .on('mouseover', function(d) { $(this).tooltip(); })
        .on('click', function(d) {
          $('.active').removeClass('active');
          $(this).toggleClass('active');

          PubSub.publish('map.filter.date', { filterDate: formatDate(d) });
          PubSub.publish('filter.update', { quakes: filterFn(d, csvData), date: formatDate(d) });
        });
  });

  // -- Event Handlers
  $(function () {
    $('[data-toggle="tooltip"]').tooltip({
      placement: 'auto',
      animation: false
    });
  });

  // -- Summary Stats.
  var totalEqs = csvData.length,
      averageMag = ((data) => {
        return parseFloat(
                data
                .map(d => { return parseFloat(d.Magnitude); })
                .reduce((a, b) => { return a + b }) / data.length, 10);
      })(csvData),
      streak = ((allDates, quakeDates) => {
        var contains = (item, arr) => { return arr.indexOf(item) !== -1; },
            longest = 0, tmp = 0, from, to;

        allDates.forEach((date, index) => {
          if (! contains(date, quakeDates)) {
            if (tmp > longest) {
              from = allDates[index - tmp];
              to = date;
              longest = tmp;
            }
            tmp++;
          }
          else
            tmp = 0;
        });

        return {value: longest, from: from, to: to};

      })(datesRange.map(d => { return formatDate(d); }),
        csvData.map(d => { return d['UTC Date']; }));

  // add to the DOM
  $('#total-eqs .value').html(totalEqs);
  $('#streak .value').html(streak.value + ' ' + (streak.value > 1 ? 'days' : 'day'));
  $('#streak .date').html(streak.from + ' to ' + streak.to);
  $('#mags #average .value').html(averageMag.toPrecision(2));



  // -- Graph
  var values = csvData.map(eq => { return parseFloat(eq.Magnitude, 10); });
  var formatCount = d3.format(",.0f");

  var margin = {top: 15, right: 10, bottom: 20, left: 12},
      width = 280 - margin.left - margin.right,
      height = 120 - margin.top - margin.bottom;

  var x = d3.scale.linear()
      .domain([0, 10])
      .range([0, width]);

  var data = d3.layout.histogram()
    .bins(x.ticks(50))
    (values);

  var y = d3.scale.linear()
    .domain([0, d3.max(data, function(d) { return d.y; })])
    .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var svg = d3.select("#histogram").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var bar = svg.selectAll(".bar")
      .data(data)
    .enter().append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

  bar.append("rect")
      .attr("x", 1)
      .attr("width", x(data[0].dx) - 1)
      .attr("height", function(d) { return height - y(d.y); });

  /*bar.append("text")
      .attr("dy", ".75em")
      .attr("y", 6)
      .attr("x", x(data[0].dx) / 2)
      .attr("text-anchor", "middle")
      .text(function(d) { return formatCount(d.y); });*/

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
});

PubSub.subscribe('filter.update', (msg, data) => {
  var htmlString = data.quakes.length + ' Earthquakes on <span class="date">' + data.date + '</span>'
  $('#num-quakes').html(htmlString)
});