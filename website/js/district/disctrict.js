var District = District || {};

$(function () {
    (function (main) {
        var config = {
            districtJsonUrl: "https://ermitsognlukketpublic.blob.core.windows.net/distictjson/discrict-json.json",
            districtSearchUrl: function(x, y) { return "https://api.dataforsyningen.dk/sogne?x=" + x + "&y=" + y + "&format=geojson"; },
            resultCardContainer: function() { return $(".result-card-container"); },
            resultCardTitleContainer: function() { return $("#result-card-title-container"); },
            resultCardTitle: function() { return $("#result-card-title"); }
        };

        function updateDistrictDetails(districtJsonResponse, searchResponse) {
            var districtData = districtJsonResponse.data.find(function (x) { return x.district == searchResponse.data.features[0].properties.navn });

            if (districtData) {
                var resultCardContainer = config.resultCardContainer();
                var resultCardTitleContainer = config.resultCardTitleContainer();
                var cardTitle = config.resultCardTitle();

                if (districtData.is_closed) {
                    resultCardTitleContainer.removeClass("bg-success");
                    resultCardTitleContainer.addClass("bg-danger");
                    cardTitle.html("Dit sogn er desværre lukket");

                } else {
                    resultCardTitleContainer.removeClass("bg-danger");
                    resultCardTitleContainer.addClass("bg-success");
                    cardTitle.html("Dit sogn er åbent!!");
                }

                function addDetails(idNumber, title, number, description) {
                    $("#district-details-title-" + idNumber).html(title);
                    $("#district-details-number-" + idNumber).html(number);
                    $("#district-details-description-" + idNumber).html(description);
                }

                addDetails(1, "Indbyggertal", districtData.district_population_count, "Antal inbyggere");
                addDetails(2, "Incidens", districtData.incidence, "Smittede pr. 100.000");
                addDetails(3, "Positiv procent", (Math.round(districtData.positive_percentage * 100) / 100) + "%", "Procent smittede");
                addDetails(4, "Nye smittede", districtData.new_infected_count, "Smittede personer den seneste uge");

                $("#district-details").show();

                resultCardContainer.show();

                var geoJsonData = {
                    districtData: districtData,
                    features: searchResponse.data.features,
                    featureOptions: districtData.is_closed ? { "color": "#FE3249" } : {}
                };

                Utils.EventEmitter.trigger(main.events.districtFound, geoJsonData);
            }
        }

        function searchDistrictByCords(x, y) {
            function handleDistrictJson(districtJsonResponse) {
                axios.get(config.districtSearchUrl(x,y))
                    .then(function(searchResponse) {
                        updateDistrictDetails(districtJsonResponse, searchResponse);
                    }
                );
            }

            axios.get(config.districtJsonUrl)
                .then(handleDistrictJson);
        }

        var eventFunctions = {
            autoCompletedSelected: function(selected) {
                searchDistrictByCords(selected.data.x, selected.data.y);
            },
            gotGeoLocationFromDevice: function(position) {
                searchDistrictByCords(position.coords.longitude, position.coords.latitude);
            }
        };

        main._local = {
            init: function () {
                main._local.subscribeToEvents();
            },
            subscribeToEvents: function() {
                if (!Utils || !Utils.EventEmitter)
                    return;
                
                if (Dawa && Dawa.Autocomplete) {
                    Utils.EventEmitter.subscribe(Dawa.Autocomplete.events.selected, eventFunctions.autoCompletedSelected);
                }

                if (LeafletMap || LeafletMap.CustomMap) {
                    Utils.EventEmitter.subscribe(LeafletMap.CustomMap.events.gotCurrentLocationFromDevice, eventFunctions.gotGeoLocationFromDevice)
                }
            }
        };

        main.events = {
            districtFound: "District.main.Event.districtFound"
        };

        main._local.init();

    })(District.Main || (District.Main = {}));
});