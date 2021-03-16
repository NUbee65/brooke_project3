









// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
  "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

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
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      38.897250, -77.004760
    ],
    zoom: 11,
    layers: [streetmap, earthquakes]
  });

  fetch("./giantfood_address_geos.json")
  .then(function(response) {
     return response.json();
  })
  .then(function(storesdata) {
    console.log(storesdata);    
    console.log(storesdata.street_address[0]);
    console.log(storesdata.city[0]);
    console.log(storesdata.state[0]);
    console.log(storesdata.zip_code[0]);
    console.log(storesdata.lat[0]);
    console.log(storesdata.lng[0]);    

    console.log(`storesdata is type: ${typeof(storesdata)}`)

    // Extract simple Arrays from 3 of the 4 keys in the samplesData Object 
    var storeAddress = storesdata.street_address;
    console.log(storeAddress)
    var storeCity = storesdata.city;
    console.log(storeCity)
    var storeState = storesdata.state;
    var storeZip = storesdata.zipcode;
    var storeLat = storesdata.lat;
    var storeLng = storesdata.lng;

    // Reassemble the 3 simple Arrays into an Array of Objects
    // This makes sorting coherent and less error prone
    var storeArrayOfObjects = storeAddress.map((storeAddress, index) => {
      return {
        street_address: storeAddress,
        city: storeCity[index],
        state: storeState[index],
        zip: storeZip[index],
        lat: storeLat[index],
        lng: storeLng[index]
      }
    });
    console.log("--- testing storeArrayOfObjects ---");
    console.log(storeArrayOfObjects)




    // obj = storesdata

    

    /*
    var result = Object.keys(obj).map((key, index) => {
      var entries = obj[key];
      var combined = {};
      entries.forEach(entry => {
        if (typeof entry === 'string') {
           combined.name = entry;
        } else {
          Object.keys(entry).forEach(key => {
            if (Array.isArray(combined[key])) {
              combined[key].push(entry[key]);
            } else {
              combined[key] = [entry[key]];
            }
          });
        }
      });
      return combined;
    });    

    console.log(result)
    console.log(combined);
    */





    

    /*
    Object.entries(storesdata).forEach(store => {
           
      var marker = L.marker([store.lat, store.lng], {
        draggable: false
      }).addTo(myMap);
      
      marker.bindPopup(
        `<h4><b>Giant Food ${store.city}, ${store.state}</b></h4>
        <hr><br>
        ${store.street_address}<br>
        ${store.city}, ${store.state}  ${store.zip_code}`
      ); 
      
    });
    */
    

    
    // Create a new marker
    // Pass in some initial options, and then add it to the map using the addTo method
    var marker = L.marker([storesdata.lat[0], storesdata.lng[0]], {
      draggable: false,
      title: "My First Marker on this Map"
    }).addTo(myMap);

    // Binding a pop-up to our marker
    marker.bindPopup(
      `<h4><b>Giant Food ${storesdata.city[0]}, ${storesdata.state[0]}</b></h4>
      <hr><br>
      ${storesdata.street_address[0]}<br>
      ${storesdata.city[0]}, ${storesdata.state[0]}  ${storesdata.zip_code[0]}`
    );
    

  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}

