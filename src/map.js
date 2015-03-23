import 'mapbox.js';

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
        var c = L.circleMarker(latlng, {
          radius: 1 * feature.properties.Magnitude,
          weight: 1,
          opacity: 0.8,
          stroke: true,
          //fillColor: colorsWhite[Math.ceil(1 * feature.properties.Magnitude)],
          color: colorsWhite[Math.ceil(1 * feature.properties.Magnitude)],
          fillOpacity: 0.2
        });

        c.bindPopup(feature.properties.Magnitude);
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