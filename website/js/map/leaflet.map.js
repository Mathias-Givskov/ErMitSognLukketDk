var Map = Map || {};

$(function () {
    (function (customMap) {
        var config = {
            defaultMapOptions: {
                center: [56.077, 10.536],
                zoom: 7
            }
        };

        var eventFunctions = {
            autoCompletedSelected: function(selected) {
                for(var i = 0; i < customMap.markers.length; i++) {
                    customMap.map.removeLayer(customMap.markers[i]);
                }

                var latlng = new L.LatLng(selected.data.y, selected.data.x);
				var marker = L.marker(latlng)
                marker.addTo(customMap.map);
                customMap.markers.push(marker);
				customMap.map.setView(latlng, 15);
            }
        };

        customMap = {
            map: {},
            markers: [],
            init: function() {
                var map = new L.map('map', config.defaultMapOptions);
                var layer = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
                map.addLayer(layer);

                customMap.map = map;
                customMap.subscribeToEvents();
            },
            subscribeToEvents: function() {
                if (!Utils || !Utils.EventEmitter)
                    return;
                
                if (Dawa && Dawa.Autocomplete) {
                    Utils.EventEmitter.subscribe(Dawa.Autocomplete.events.selected, eventFunctions.autoCompletedSelected);
                }
            }
        };

        customMap.init();
    })(Map.CustomMap || (Map.CustomMap = {}));
})