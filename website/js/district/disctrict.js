var District = District || {};

$(function () {
    (function (main) {
        var config = {
            districtJsonUrl: function () {
                var currentDownloadDate = new moment();
                currentDownloadDate.hours(14);
                currentDownloadDate.minutes(2);
                currentDownloadDate.seconds(0);

                var currentTime = new moment();

                var districtJsonNextDownloadDate = localStorage.getItem("district-json-next-download-date");
                var nextRefreshDate = moment(districtJsonNextDownloadDate);
                if (nextRefreshDate.date() == currentDownloadDate.date() && currentTime < currentDownloadDate) {
                    nextRefreshDate = moment(districtJsonNextDownloadDate);
                }
                else if (nextRefreshDate < currentDownloadDate)
                {
                    nextRefreshDate = new moment();
                    nextRefreshDate.date(currentDownloadDate.date() + 1);
                    nextRefreshDate.hours(14);
                    nextRefreshDate.minutes(2);
                    nextRefreshDate.seconds(0);
                } else if (!districtJsonNextDownloadDate) {
                    nextRefreshDate = new moment();
                    if (new moment() > currentDownloadDate)
                        nextRefreshDate.date(currentDownloadDate.date() + 1);
                    nextRefreshDate.hours(14);
                    nextRefreshDate.minutes(2);
                    nextRefreshDate.seconds(0);
                }

                localStorage.setItem("district-json-next-download-date", nextRefreshDate.format('YYYY-MM-DD HH:mm:ss'));
                var manualVersion = "3";
                return "https://ermitsognlukketpublic.blob.core.windows.net/distictjson/discrict-json.json?v=" + nextRefreshDate.valueOf() + manualVersion;
            },
            districtThresholds: {
                incidens: 500,
                newCases: 20,
                postivePercentage: 2.5,
                municipalityIncidens: 250
            },
            districtSearchUrl: function(x, y) { return "https://api.dataforsyningen.dk/sogne?x=" + x + "&y=" + y + "&format=geojson"; },
            municipalitySearchUrl: function(x, y) { return "https://api.dataforsyningen.dk/kommuner?x=" + x + "&y=" + y + "&format=geojson"; },
            resultCardContainer: function() { return $(".result-card-container"); },
            resultCardTitleContainer: function() { return $("#result-card-title-container"); },
            resultCardTitle: function() { return $("#result-card-title"); },
            resultCardDistrict: function() { return $("#result-card-district"); },
            resultCardDistrictShutdown: function () { return $("#result-card-district-shutdown"); },
            resultCardDistrictShutdownDate: function () { return $("#result-card-district-shutdown-date"); },
            resultCardMuncipalityShutdownContainer: function () { return $(".result-card-muncipality-shutdown-container"); },
            resultCardMunicipality: function() { return $("#result-card-municipality"); },
            thresholdincidensSpan: function() { return $("#threshold-incidens"); },
            thresholdNewcasesSpan: function() { return $("#threshold-newcases"); },
            thresholdpostivePercentageSpan: function() { return $("#threshold-postivepercentage"); },
            thresholdMunicipalityIncidensSpan: function() { return $("#threshold-municipality-incidens"); },
        };

        function formatDateString(dateString) {
            var date = new moment(dateString);
            return date.date() + "-" + (date.month() + 1) + "-" + date.year();
        }

        function updateDistrictDetails(districtJsonResponse, searchResponse, municipalitySearchResponse) {
            var districtData = districtJsonResponse.data.find(function (x) {
                if (searchResponse.data.features[0])
                    return x.district_code == searchResponse.data.features[0].properties.kode;
                return false;
            });

            var municipalityCode = null;
            var municipalityCodeClosed = false;
            if (municipalitySearchResponse.data.features[0]) {
                var municipalityCode = municipalitySearchResponse.data.features[0].properties.kode;
            }

            if (districtData) {
                function GetAffectedMuncipalitiesText() {
                    var muncipalityText = "";
                    for (var i = 0; i < districtData.municipality_details.length; i++) {
                        if (!muncipalityText) {
                            muncipalityText = districtData.municipality_details[i].municipality.replace("kommune", "");
                        } else {
                            if (i == districtData.municipality_details.length - 1) {
                                muncipalityText += " og " + districtData.municipality_details[i].municipality.replace("kommune", "");
                            } else {
                                muncipalityText += ", " + districtData.municipality_details[i].municipality.replace("kommune", "");
                            }
                        }
                    }

                    return muncipalityText;
                }

                function SetMunicipalitiesShutdownTexts() {
                    var result = false;
                    $(".result-card-muncipality-shutdown").hide();
                    for (var i = 0; i < districtData.municipality_details.length; i++) {
                        if (districtData.municipality_details[i].is_closed) {
                            result = true;
                            $("#result-card-muncipality-shutdown-muncipality-" + (i + 1)).html(districtData.municipality_details[i].municipality);
                            $("#result-card-muncipality-shutdown-date-" + (i + 1)).html(formatDateString(districtData.municipality_details[i].start_of_latest_automatic_shutdown));
                            $("#result-card-muncipality-shutdown-" + (i + 1)).show();
                        }
                    }

                    return result;
                }

                function isMunicipalityCodeClosed() {
                    var result = false;
                    for (var i = 0; i < districtData.municipality_details.length; i++) {
                        result = districtData.municipality_details[i].is_closed && districtData.municipality_details[i].municipality_code == municipalityCode;
                        if (result)
                            break;
                    }

                    return result;
                }

                municipalityCodeClosed = isMunicipalityCodeClosed();

                var resultCardContainer = config.resultCardContainer();
                var resultCardTitleContainer = config.resultCardTitleContainer();
                var cardTitle = config.resultCardTitle();
                var cardDistrict = config.resultCardDistrict();
                var cardDistrictShutdown = config.resultCardDistrictShutdown();
                var cardDistrictShutdownDate = config.resultCardDistrictShutdownDate();
                var cardMunicipality = config.resultCardMunicipality();

                var anyClosedMunicipalities = SetMunicipalitiesShutdownTexts();
                if (anyClosedMunicipalities) {
                    config.resultCardMuncipalityShutdownContainer().show();
                } else {
                    config.resultCardMuncipalityShutdownContainer().hide();
                }

                if (districtData.is_closed) {
                    resultCardTitleContainer.removeClass("bg-success");
                    resultCardTitleContainer.addClass("bg-danger");
                    cardTitle.html("Dit sogn er desværre lukket!");

                    cardDistrictShutdownDate.html(formatDateString(districtData.start_of_latest_automatic_shutdown));
                    cardDistrictShutdown.show();
                } else {
                    resultCardTitleContainer.removeClass("bg-danger");
                    resultCardTitleContainer.removeClass("bg-success");

                    if (municipalityCodeClosed) {
                        resultCardTitleContainer.addClass("bg-danger");
                        cardTitle.html("Din kommune er desværre lukket!");
                    } else {
                        resultCardTitleContainer.addClass("bg-success");
                        cardTitle.html("Dit sogn er åbent!");
                    }

                    cardDistrictShutdown.hide();

                    if (!anyClosedMunicipalities)
                        config.resultCardMuncipalityShutdownContainer().hide();
                }

                cardDistrict.html(districtData.district.trim() + " sogn");
                cardMunicipality.html(GetAffectedMuncipalitiesText().trim() + " kommune");

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

                if (municipalityCode && municipalityCodeClosed) {
                    var geoJsonData = {
                        districtData: districtData,
                        features: municipalitySearchResponse.data.features,
                        featureOptions: {
                            color: "#FE3249",
                            style: {
                                fillPattern: LeafletMap.CustomMap.main.patterns.stripPattern,
                                fillOpacity: 1.0,
                                weight: 1,
                            }
                        }
                    };

                    Utils.EventEmitter.trigger(main.events.districtFound, geoJsonData);
                }
            } else {
                config.resultCardContainer().hide();
                $("#district-details").hide();
            }
        }

        function searchDistrictByCords(x, y) {
            function handleDistrictJson(districtJsonResponse) {
                axios.get(config.districtSearchUrl(x,y))
                    .then(function(districtSearchResponse) {
                        axios.get(config.municipalitySearchUrl(x, y))
                            .then(function (municipalitySearchResponse) {
                                updateDistrictDetails(districtJsonResponse, districtSearchResponse, municipalitySearchResponse);
                        });
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
                config.thresholdMunicipalityIncidensSpan().html(config.districtThresholds.municipalityIncidens);
            }
        };

        main.events = {
            districtFound: "District.main.Event.districtFound"
        };

        main._local.init();

    })(District.Main || (District.Main = {}));
});