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

// Fetch our GeoJson
Promise.resolve($.ajax('data/eq-data.json')).then(function(data) {
  L.geoJson(data, {
      pointToLayer: function(feature, latlng) {
          return L.circleMarker(latlng, {
              // Here we use the `count` property in GeoJSON verbatim: if it's
              // to small or two large, we can use basic math in Javascript to
              // adjust it so that it fits the map better.
              //feature.properties.count
              radius: 1 * feature.properties.Magnitude,
              color: colorsWhite[Math.ceil(1 * feature.properties.Magnitude)],
              fill: '#ff817a'
          })
      }
  }).addTo(map);

})