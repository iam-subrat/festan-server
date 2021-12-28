mapboxgl.accessToken = mapToken;

const latitude = document.getElementById('latitude');
const longitude = document.getElementById('longitude');

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: (latitude.value && longitude.value) ? [longitude.value, latitude.value] : [84.2, 20.4],
    zoom: 5
});

let marker = null;

if (latitude.value && longitude.value) {
    marker = new mapboxgl.Marker({
        color: "#FF0000"
    }).setLngLat([longitude.value, latitude.value]).addTo(map);
}

map.doubleClickZoom.disable();

map.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
    })
);
// Initialize the geolocate control.
const geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
});
// Add the control to the map.
map.addControl(geolocate);

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl({
    showCompass: false
}));

// Set an event listener that fires
geolocate.once('geolocate', function (data) {
    console.log('Tracked...', data.coords.longitude, data.coords.latitude);
});

map.on('dblclick', async function(data) {
    if(!marker) {
        marker = new mapboxgl.Marker({
            color: "#FF0000"
        }).setLngLat(data.lngLat).addTo(map);
    }
    else
        marker.setLngLat(data.lngLat);
    longitude.value = data.lngLat.lng;
    latitude.value = data.lngLat.lat;
    try {
        // Reverse GeoCoding API end-point
        const APIendPoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${data.lngLat.lng},${data.lngLat.lat}.json?types=poi&access_token=${mapboxgl.accessToken}`;
        const response = await fetch(APIendPoint);
        const loc = await response.json();
        if(loc.features.length>0) {
            loc.features[0].context.forEach(obj => {
                if (obj.id.includes('locality'))
                    document.getElementById('address').value = obj.text;
                else if (obj.id.includes('place'))
                    document.getElementById('city').value = obj.text;
                else if (obj.id.includes('region'))
                    document.getElementById('state').value = obj.text;
                else if (obj.id.includes('postcode'))
                    document.getElementById('pincode').value = obj.text;
            });
        }
    } catch (err) {
        console.log(err);
    }
});

function clr() {
    if (marker) {
        longitude.value = '';
        latitude.value = '';
        marker.remove();
        marker = null;
    }
}