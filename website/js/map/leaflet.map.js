var LeafletMap = LeafletMap || {};

$(function () {
    (function (customMap) {
        var config = {
            defaultMapOptions: {
                center: [56.077, 10.536],
                zoom: 7
            }
        };

        function removeAllMarkers() {
            for(var i = 0; i < customMap.main.markers.length; i++) {
                customMap.main.map.removeLayer(customMap.main.markers[i]);
            }
        }

        function setMarkerLocation(x, y) {
            var latlng = new L.LatLng(x, y);
            var marker = L.marker(latlng)
            marker.addTo(customMap.main.map);
            customMap.main.markers.push(marker);
            customMap.main.map.setView(latlng, 15);
        }

        var eventFunctions = {
            autoCompletedSelected: function(selected) {
                removeAllMarkers();
                setMarkerLocation(selected.data.y, selected.data.x)
            },
            disctictFound: function (geoJsonData) {
                L.geoJSON(geoJsonData.features[0], geoJsonData.featureOptions).addTo(customMap.main.map);
            }
        };

        customMap.main = {
            map: {},
            markers: [],
            init: function() {
                var map = new L.map('map', config.defaultMapOptions);
                var layer = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
                map.addLayer(layer);

                customMap.main.map = map;
                customMap.main.subscribeToEvents();
                customMap.main.setToDeviceLocation();
            },
            subscribeToEvents: function() {
                if (!Utils || !Utils.EventEmitter)
                    return;
                
                if (Dawa && Dawa.Autocomplete) {
                    Utils.EventEmitter.subscribe(Dawa.Autocomplete.events.selected, eventFunctions.autoCompletedSelected);
                }

                Utils.EventEmitter.subscribe("District.main.Event.districtFound", eventFunctions.disctictFound);
            },
            setToDeviceLocation() {
                function gotPosition(position) {
                    removeAllMarkers();
                    setMarkerLocation(position.coords.latitude, position.coords.longitude);
                    
                    if (!Utils || !Utils.EventEmitter)
                        return;

                    Utils.EventEmitter.trigger(customMap.events.gotCurrentLocationFromDevice, position);
                }

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(gotPosition);
                }
            }
        };

        customMap.events = {
            gotCurrentLocationFromDevice: "Map.CustomMap.Event.gotCurrentLocationFromDevice"
        };

        customMap.main.init();
    })(LeafletMap.CustomMap || (LeafletMap.CustomMap = {}));
})