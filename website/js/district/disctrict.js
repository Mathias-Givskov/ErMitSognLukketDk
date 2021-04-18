var District = District || {};

$(function () {
    (function (main) {
        var config = {
            districtJsonUrl: "https://ermitsognlukketpublic.blob.core.windows.net/distictjson/discrict-json.json",
            districtSearchUrl: function(x, y) { return "https://api.dataforsyningen.dk/sogne?x=" + x + "&y=" + y; },
            resultCardContainer: function() { return $(".result-card-container"); }
        };

        function searchDistrictByCords(x, y) {
            axios.get(config.districtJsonUrl)
                .then(function (districtJsonResponse) {
                    axios.get(config.districtSearchUrl(x,y))
                        .then(function (searchResponse) {
                            var districtData = districtJsonResponse.data.find(function (x) { return x.district == searchResponse.data[0].navn });

                            if (districtData) {
                                var resultCardContainer = config.resultCardContainer();
                                var cardElement = $("<div>")
                                    .addClass("card")
                                    .addClass("mb-3")
                                    .addClass("text-white");

                                var cardTitle = $("<h5>")
                                    .addClass("card-title");

                                var cardBody = $("<div>")
                                    .addClass("card-body")
                                    .html(cardTitle);

                                if (districtData.is_closed) {
                                    cardElement.addClass("bg-danger");
                                    cardTitle.html("Dit sogn er desværre lukket");
                                } else {
                                    cardElement.addClass("bg-success");
                                    cardTitle.html("Dit sogn er åben!!");
                                }

                                cardElement.html(cardBody);
                                resultCardContainer.html(cardElement);

                                resultCardContainer.show();
                            }
                        });
                });
        }

        var eventFunctions = {
            autoCompletedSelected: function(selected) {
                searchDistrictByCords(selected.data.x, selected.data.y);
            }
        };

        main = {
            init: function () {
                main.subscribeToEvents();
            },
            subscribeToEvents: function() {
                if (!Utils || !Utils.EventEmitter)
                    return;
                
                if (Dawa && Dawa.Autocomplete) {
                    Utils.EventEmitter.subscribe(Dawa.Autocomplete.events.selected, eventFunctions.autoCompletedSelected);
                }
            }
        };

        main.init();

    })(District.main || (District.main = {}));
});