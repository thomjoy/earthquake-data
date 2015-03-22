import 'mapbox.js';

L.mapbox.accessToken = 'pk.eyJ1IjoidGhvbWpveTE5ODQiLCJhIjoiTGx2V3ZUVSJ9.pZlOrVUXu_aC1i0nTvpIpA';
var map = L.mapbox.map('map', 'thomjoy1984.lhfb140o', {
  tileLayer: true,
  legendControl: false,
  infoControl: false,
  attributionControl: false,
  zoomControl: true
});

// Fetch our GeoJson
Promise.resolve($.ajax('data/eq-data.json')).then(function(data) {
  L.geoJson(data, {
      pointToLayer: function(feature, latlng) {
          return L.circleMarker(latlng, {
              // Here we use the `count` property in GeoJSON verbatim: if it's
              // to small or two large, we can use basic math in Javascript to
              // adjust it so that it fits the map better.
              //feature.properties.count
              radius: 2,
              color: '#ffc1be'
          })
      }
  }).addTo(map);

})