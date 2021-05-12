var District = District || {};

$(function () {
    (function (main) {
        var config = {
            districtJsonUrl: function () {
                function getTimeOfDayInSeconds(date) {
                    return date.getSeconds() + (60 * (date.getMinutes() + (60 * date.getHours())));
                }

                var districtJsonNextDownloadDate = localStorage.getItem("district-json-next-download-date");
                if (districtJsonNextDownloadDate) {
                    var currentDate = new Date();
                    var nextRefreshDate = new Date(districtJsonNextDownloadDate);
                    nextRefreshDate.setHours(14);
                    nextRefreshDate.setMinutes(2);
                    nextRefreshDate.setSeconds(0);

                    if (getTimeOfDayInSeconds(nextRefreshDate) < getTimeOfDayInSeconds(currentDate)) {
                        nextRefreshDate.setDate(currentDate.getDate() + 1);
                    }

                    var testDate = new Date();
                    testDate.setDate(currentDate.getDate() + 1);
                    if (nextRefreshDate.getDate() < testDate.getDate())
                        localStorage.setItem("district-json-next-download-date", nextRefreshDate);
                } else {
                    var currentDate = new Date();
                    var nextRefreshDate = new Date();
                    nextRefreshDate.setHours(14);
                    nextRefreshDate.setMinutes(2);
                    nextRefreshDate.setSeconds(0);

                    if (getTimeOfDayInSeconds(nextRefreshDate) < getTimeOfDayInSeconds(currentDate)) {
                        nextRefreshDate.setDate(currentDate.getDate() + 1)
                    }

                    localStorage.setItem("district-json-next-download-date", nextRefreshDate);
                }

                var nextRefreshDate = new Date(districtJsonNextDownloadDate);
                var manualVersion = "1";
                return "https://ermitsognlukketpublic.blob.core.windows.net/distictjson/discrict-json.json?v=" + nextRefreshDate.getTime() + manualVersion;
            },
            districtThresholds: {
                incidens: 500,
                newCases: 20,
                postivePercentage: 2.5
            },
            districtSearchUrl: function(x, y) { return "https://api.dataforsyningen.dk/sogne?x=" + x + "&y=" + y + "&format=geojson"; },
            resultCardContainer: function() { return $(".result-card-container"); },
            resultCardTitleContainer: function() { return $("#result-card-title-container"); },
            resultCardTitle: function() { return $("#result-card-title"); },
            resultCardDistrict: function() { return $("#result-card-district"); },
            resultCardMunicipality: function() { return $("#result-card-municipality"); },
            thresholdincidensSpan: function() { return $("#threshold-incidens"); },
            thresholdNewcasesSpan: function() { return $("#threshold-newcases"); },
            thresholdpostivePercentageSpan: function() { return $("#threshold-postivepercentage"); }
        };

        function updateDistrictDetails(districtJsonResponse, searchResponse) {
            var districtData = districtJsonResponse.data.find(function (x) { return x.district == searchResponse.data.features[0].properties.navn });

            if (districtData) {
                var resultCardContainer = config.resultCardContainer();
                var resultCardTitleContainer = config.resultCardTitleContainer();
                var cardTitle = config.resultCardTitle();
                var cardDistrict = config.resultCardDistrict();
                var cardMunicipality = config.resultCardMunicipality();

                if (districtData.is_closed) {
                    resultCardTitleContainer.removeClass("bg-success");
                    resultCardTitleContainer.addClass("bg-danger");
                    cardTitle.html("Dit sogn er desværre lukket!");

                } else {
                    resultCardTitleContainer.removeClass("bg-danger");
                    resultCardTitleContainer.addClass("bg-success");
                    cardTitle.html("Dit sogn er åbent!");
                }

                cardDistrict.html(districtData.district.trim() + " sogn");
                cardMunicipality.html(districtData.municipality);

                function addDetails(idNumber, title, number, description, isAboveThreshold) {
                    number = number.toString().replace(".", ",");
                    $("#district-details-title-" + idNumber).html(title);
                    $("#district-details-number-" + idNumber).html(number);
                    $("#district-details-description-" + idNumber).html(description);

                    if (isAboveThreshold) {
                        $("#district-details-number-" + idNumber).addClass("text-danger")
                            .attr("data-toggle", "tooltip")
                            .attr("data-placement", "top")
                            .attr("title", "Grænse overskrevet");
                    } else {
                        $("#district-details-number-" + idNumber).removeClass("text-danger")
                            .attr("data-toggle", "")
                            .attr("data-placement", "")
                            .attr("title", "");
                    }
                }

                addDetails(1, "Indbyggertal", districtData.district_population_count, "Antal inbyggere", false);
                addDetails(2, "Incidens", Math.round(districtData.incidence), "Smittede pr. 100.000", Math.round(districtData.incidence) >= config.districtThresholds.incidens);
                addDetails(3, "Positiv procent", (Math.round(districtData.positive_percentage * 100) / 100) + "%", "Procent smittede", (Math.round(districtData.positive_percentage * 100) / 100) >= config.districtThresholds.postivePercentage);
                addDetails(4, "Nye smittede", districtData.new_infected_count, "Smittede personer den seneste uge", districtData.new_infected_count >= config.districtThresholds.newCases);

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

            axios.get(config.districtJsonUrl())
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
                main._local.writeDistrictThresholds();
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
            },
            writeDistrictThresholds: function() {
                config.thresholdincidensSpan().html(config.districtThresholds.incidens);
                config.thresholdNewcasesSpan().html(config.districtThresholds.newCases);
                config.thresholdpostivePercentageSpan().html(config.districtThresholds.postivePercentage.toString().replace('.', ','));
            }
        };

        main.events = {
            districtFound: "District.main.Event.districtFound"
        };

        main._local.init();

    })(District.Main || (District.Main = {}));
});