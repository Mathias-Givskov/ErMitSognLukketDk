var LeafletMap = LeafletMap || {};

$(function () {
    (function (customMap) {
        var config = {
            defaultMapOptions: {
                center: [56.077, 10.536],
                zoom: 7
            }
        };

        function createQueryStringObject(x, y) {
            return { coords: [{"x": x, "y": y}] };
        }

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

        function setMarkerLocation(x, y, keepZoomLevel) {
            var latlng = new L.LatLng(x, y);
            var marker = L.marker(latlng)
            marker.addTo(customMap.main.map);
            customMap.main.markers.push(marker);
            if (keepZoomLevel) {
                customMap.main.map.setView(latlng);
            } else {
                customMap.main.map.setView(latlng, 15);
            }
        }

        var eventFunctions = {
            autoCompletedSelected: function(selected) {
                customMap.setLocation(selected.data.x, selected.data.y, selected.keepZoomLevel);
            },
            disctictFound: function (geoJsonData) {
                var feature = L.geoJSON(geoJsonData.features[0], geoJsonData.featureOptions);
                feature.addTo(customMap.main.map);
                customMap.main.features.push(feature);
            }
        };

        customMap.setLocation = function(x, y, keepZoomLevel) {
            removeAllMarkers();
            removeAllFeatures();
            setMarkerLocation(y, x, keepZoomLevel);

            var queryStringParameterObj = createQueryStringObject(y, x);
            Utils.UrlHelper.setQueryStringParameter("coordinates", queryStringParameterObj, true, true);
        }

        customMap.main = {
            map: {},
            markers: [],
            features: [],
            patterns: { stripPattern: new L.StripePattern({ weight: 1, angle: 120, color: '#FE3249'}) },
            init: function() {
                var map = new L.map('map', config.defaultMapOptions);
                var layer = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
                customMap.main.patterns.stripPattern.addTo(map);
                map.addLayer(layer);
                map.on('click', function(e) {
                    var selected = {
                        data: {
                            x: e.latlng.lng,
                            y: e.latlng.lat
                        },
                        keepZoomLevel: true
                    };

                    Utils.EventEmitter.trigger(Dawa.Autocomplete.events.selected, selected);
                });

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