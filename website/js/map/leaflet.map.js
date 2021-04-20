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

        function removeAllFeatures() {
            for(var i = 0; i < customMap.main.features.length; i++) {
                customMap.main.map.removeLayer(customMap.main.features[i]);
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
                removeAllFeatures();
                setMarkerLocation(selected.data.y, selected.data.x)
            },
            disctictFound: function (geoJsonData) {
                var feature = L.geoJSON(geoJsonData.features[0], geoJsonData.featureOptions);
                feature.addTo(customMap.main.map);
                customMap.main.features.push(feature);
            }
        };

        customMap.main = {
            map: {},
            markers: [],
            features: [],
            init: function() {
                var map = new L.map('map', config.defaultMapOptions);
                var layer = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
                map.addLayer(layer);

                customMap.main.map = map;
                customMap.main.subscribeToEvents();
                customMap.main.setDefaultLocation();
            },
            subscribeToEvents: function() {
                if (!Utils || !Utils.EventEmitter)
                    return;
                
                if (Dawa && Dawa.Autocomplete) {
                    Utils.EventEmitter.subscribe(Dawa.Autocomplete.events.selected, eventFunctions.autoCompletedSelected);
                }

                Utils.EventEmitter.subscribe("District.main.Event.districtFound", eventFunctions.disctictFound);
            },
            setDefaultLocation: function() {
                if (Utils && Utils.UrlHelper) {
                    var coordsQsParam = Utils.UrlHelper.getQueryStringParameter("coordinates", true);
                    if (!coordsQsParam) {
                        customMap.main.setToDeviceLocation();
                        return;
                    }

                    coordsQsParam.coords.forEach(function(coord) {
                        setMarkerLocation(coord.x, coord.y);

                        var eventObj = {
                            coords: {
                                latitude: coord.x,
                                longitude: coord.y
                            }
                        };
                        setTimeout(function () {
                            Utils.EventEmitter.trigger(customMap.events.gotCurrentLocationFromDevice, eventObj);
                        }, 1);
                    });
                }
            },
            setToDeviceLocation: function() {
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