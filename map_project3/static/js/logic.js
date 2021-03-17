var inputLat = ' ';
var inputLng = ' ';
var inputLatLng = [inputLat,inputLng];
console.log(inputLatLng);


/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
// FUNCTION buildMap()
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

var myMap;
var markerLayer = L.layerGroup()

function buildMap(inputLatLng) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Dark Map": darkmap
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  myMap = L.map("map", {
    center: [
      inputLatLng[0], inputLatLng[1]
    ],
    zoom: 11,
    layers: [streetmap] // , earthquakes]
  });

  fetch("./static/data/giantfood_address_geos.json")
  .then(function(response) {
      return response.json();
  })
  .then(function(storesdata) {
    
    console.log(storesdata);    
    console.log(`storesdata is type: ${typeof(storesdata)}`)

    // Extract 6 simple Arrays from the storesdata Object from the JSON file
    var storeAddress = storesdata.street_address;
    console.log(storeAddress)
    var storeCity = storesdata.city;
    console.log(storeCity)
    var storeState = storesdata.state;
    console.log(storeState);
    var storeZip = storesdata.zip_code;
    console.log(storeZip);
    var storeLat = storesdata.lat;
    console.log(storeLat);
    var storeLng = storesdata.lng;
    console.log(storeLng);

    // Reassemble the 6 simple Arrays into a JSON records shape
    var storesdataX = Object.entries(storeAddress).map((address, index) => {
      return {
        street_address: address[1],
        city: storeCity[index],
        state: storeState[index],
        zip: storeZip[index],
        lat: storeLat[index],
        lng: storeLng[index]
      }
    });
    console.log("--- testing storesdataReshape ---");
    console.log(storesdataX)
    console.log(`storesdataX is type: ${typeof(storesdataX)}`)
    
    storesdataX.forEach(store => {
            
      var marker = L.marker([store.lat, store.lng], {
        draggable: false
      }).addTo(markerLayer);
      
      marker.bindPopup(
        `<h4><b>Giant Food ${store.city}, ${store.state}</b></h4>
        <hr><br>
        ${store.street_address}<br>
        ${store.city}, ${store.state}  ${store.zip_code}`
      );

    });
  });

  markerLayer.addTo(myMap);

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps // {
    // collapsed: false
  ).addTo(myMap);

};


/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
// FUNCTION init()
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
function init() {
  var inputLat = 38.897250;
  var inputLng = -77.004760;
  var inputLatLng = [inputLat,inputLng];
  console.log(inputLatLng);
  console.log(inputLatLng[0]);
  console.log(inputLatLng[1]);

  buildMap(inputLatLng);
};

// Call the init() function to initially load the map

init();


/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
// FUNCTION refreshMap()
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

function refreshMap() {

  slider = d3.select('#distance');
  distance_mi = slider.node().value;
  distance_m = distance_mi * 1600;

  zipfield = d3.select('#zip-field');
  zip = zipfield.node().value; 

  console.log(zip, distance_m);

  /////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////
  // d3 URL call with user zipcode returns geocoordinates
  /////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////

  // make API call and pass the zip code to get coords
  url = `/refreshMap?zip=${zip}&radius=${distance_m}`

  d3.json(url).then(data => {
    

    // clear initial layers
    markerLayer.clearLayers();

    console.log("--- data returned from 2nd Google Maps API call ---");
    console.log(data);
    console.log(data[0]['types']);

    var markerclusters = L.markerClusterGroup();

    data.forEach(d => {

      let result;

      var biztypes = d['types'];
      console.log("--- biztypes ---")
      console.log(biztypes)

      if ('grocery_or_supermarket' in biztypes === true) {

        lat = d['geometry']['location']['lat'];
        lng = d['geometry']['location']['lng'];
        coords = [lat, lng];
        store_name = d['name'];
        store_address = d['vicinity'];

        marker = L.circleMarker(coords);
        marker.bindPopup(`${store_name}<br/>${store_address}`)

        markerclusters.addLayer(marker);

      } else {
        console.log("--- location was not a grocery or supermarket ---")
      };

      return result;

    });

    markerclusters.addTo(markerLayer);
    //myMap.addLayer(markerclusters);
  });

  

  

  // d3.json that to plot maps

  // but use markerclusters :)

  // also, use L.markerCircle instead of L.marker **

  // once that is done, switch to marker image

  /*
  function getLatLngByZipcode(zipcode) {

    var geocoder = new google.maps.Geocoder();
    var address = zipcode;
    geocoder.geocode({ 'address': 'zipcode '+address }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var latitude = results[0].geometry.location.lat();
            var longitude = results[0].geometry.location.lng();
            alert("Latitude: " + latitude + "\nLongitude: " + longitude);
        } else {
            alert("Request failed.")
        }
    });
    return [latitude, longitude];
    console.log(latitude);
    console.log(longitude);

};
*/






  var inputLat = 38.897250;
  var inputLng = -77.004760;
  var inputLatLng = [inputLat,inputLng];
  console.log(inputLatLng);
  console.log(inputLatLng[0]);
  console.log(inputLatLng[1]);

  buildMap(inputLatLng);
};

// Call the init() function to initially load the map

// init();




/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
// EVENT LISTENERS
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

// Identify web elements on the page
zipfield = d3.select('#zip-field');
zipbtn = d3.select('#zip-btn');


// Add event listeners to the web elements
// zipfield.on('change', refreshMap);
zipbtn.on('click', refreshMap);

