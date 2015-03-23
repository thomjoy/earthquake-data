import 'mapbox.js';
import PubSub from 'pubsub-js';

L.mapbox.accessToken = 'pk.eyJ1IjoidGhvbWpveTE5ODQiLCJhIjoiTGx2V3ZUVSJ9.pZlOrVUXu_aC1i0nTvpIpA';
var map = L.mapbox.map('map', 'thomjoy1984.lhfb140o', {
  tileLayer: true,
  legendControl: false,
  infoControl: false,
  attributionControl: false,
  zoomControl: true
});

var colorsWhite = ["#fff", "#ffe2e0", "#ffc1be", "#ffa19c", "#ff817a",
                    "#ff4136", "#ff2114", "#f10d00", "#f10d00", "#cf0b00",
                    "#ad0900"];

var featureLayer;

$('#mag-slider').on('input', function(evt) {
  $('.active').removeClass('active');
  var magFilter = parseFloat(evt.target.value, 10);
  featureLayer.setFilter(function(feature, val) {
    return parseFloat(feature.properties.Magnitude, 10) >= magFilter;
  })

  $('#mag-value').html("Mag " + magFilter);
});

// Fetch our GeoJson
Promise.resolve($.ajax('data/eq-data.json')).then(function(data) {

  // Store Data in JS DB?
  // Meteor, Forerunner?

  // If we want to filter circle using properties of the geojson data
  // we need to use L.mapbox.featureLayer
  // and the setFilter function.

  // Create a slider to filter by Magnitude.
  featureLayer = L.mapbox.featureLayer(data, {
      pointToLayer: function(feature, latlng) {
        var p = feature.properties;
        var mag = parseFloat(p.Magnitude, 10);
        var c = L.circleMarker(latlng, {
          radius: (Math.log(mag)) * mag,
          weight: 1,
          opacity: 0.5,
          stroke: true,
          color: colorsWhite[Math.ceil(1 * mag)],
          fillOpacity: 0.3
        });

        var popUp = '<strong class="popup-mag">' + p.Magnitude + '</strong>' +
                    '<p>' + p['Approximate location'] + '</p>' +
                    '<p>@ ' + p['UTC Time'] + ' on ' + p['UTC Date'] + '</p>';

        c.bindPopup(popUp);
        return c;
      },

      // ARGH, this needs to be passed in order for the circleMarker styles to be added.
      style: {},

      filter: function(feature, val) {
        var filterVal = val || 0;
        return parseInt(feature.properties.Magnitude, 10) >= filterVal;
      }
  });

  featureLayer.addTo(map);
});

map.on('ready', function(evt) {
  $('#filter').slideDown();
});

PubSub.subscribe('map.filter.date', (msg, data) => {
  var filterFn = function(feature) {
    return feature.properties['UTC Date'] == data.filterDate;
  }

  featureLayer.setFilter(filterFn);
});