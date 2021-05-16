var Manager = Manager || {};

$(function () {
    (function (locationManager) {
        var config = {
            localStorageSavedLocationKey: "saved-locations",
            addLocationBtn: function() { return $("#add-location-btn"); },
            saveLocationModal: "save-location-modal",
            saveLocationForm: function() { return $("#save-location-modal-form") },
            locationLatInput: function() { return $("#locationLat") },
            locationLngInput: function() { return $("#locationLng") },
            locationNameInput: function() { return $("#locationName"); },
            saveLocationBtn: function() { return $("#save-location-btn"); },
            savedLocationsContainer: function() { return $("#saved-locations-container"); },
            dawaAutocompleteInput: function() { return $("#dawa-autocomplete-input"); },
            resultCardDistrict: function() { return $("#result-card-district"); },
            resultCardMunicipality: function() { return $("#result-card-municipality"); },
            events: {
                locationLoaded: "location.manager.locationLoaded"
            }
        };

        function createSaveLocationObject(lat, lng, name) {
            return {
                name: name,
                lat: lat,
                lng, lng
            };
        }

        function saveLocationObject(locationObj) {
            if (!locationObj) {
                return;
            }

            var savedLocations = JSON.parse(localStorage.getItem(config.localStorageSavedLocationKey));
            if (!savedLocations) {
                var arr = [locationObj];
                localStorage.setItem(config.localStorageSavedLocationKey, JSON.stringify(arr));
                showLocations();
                return;
            }

            savedLocations.push(locationObj);
            localStorage.setItem(config.localStorageSavedLocationKey, JSON.stringify(savedLocations));
            showLocations();
        }

        function loadLoacationObj(locationObj) {
            LeafletMap.CustomMap.setLocation(locationObj.lng, locationObj.lat, true);
            Utils.EventEmitter.trigger(config.events.locationLoaded, locationObj);

            const y = document.getElementById("save-locations-container").getBoundingClientRect().top + window.pageYOffset + -10;
            window.scrollTo({top: y, behavior: 'smooth'});
        }

        function loadLocation(locationElementEvent) {
            var savedLocations = JSON.parse(localStorage.getItem(config.localStorageSavedLocationKey));
            if (!savedLocations) {
                return;
            }

            var dataLocationId = $(locationElementEvent.target).closest("a[data-location-id]").attr("data-location-id");
            loadLoacationObj(savedLocations[dataLocationId]);
        }

        function showLocations() {
            var savedLocations = JSON.parse(localStorage.getItem(config.localStorageSavedLocationKey));
            if (!savedLocations) {
                return;
            }

            var savedLocationsContainers = config.savedLocationsContainer();
            savedLocationsContainers.html("");
            for (let i = 0; i < savedLocations.length; i++) {
                const location = savedLocations[i];
                
                //<a href="#" class="list-group-item list-group-item-action"><span>Location name </span><span>(52.89468765, 56.484949)</span></a>
                var deleteBtn = $('<button class="btn btn-danger btn-sm" data-delete-location-id="' + i + '">').html('Slet');
                var deleteBtnDiv = $('<div class="float-end">').html(deleteBtn);

                var spans = $('<span class="allign-middle">')
                    .html(location.name + ' <span class="text-muted">(' + location.lat + ', ' + location.lng + ')</span>')
                    .append(deleteBtnDiv);

                var locationAtag = $('<a href="javascript:void(0);" class="list-group-item list-group-item-action" data-location-id="' + i + '">')
                    .html(spans);

                savedLocationsContainers.append(locationAtag);
            }

            $('a[data-location-id]').on('click', loadLocation);
            $('button[data-delete-location-id]').on('click', deleteBtnClick);
        }

        function isInputsValid() {
            if (!config.locationLatInput().val() || !config.locationLngInput().val() || !config.locationNameInput().val())
                return false;
            
            return true;
        }

        function setCurrentLocationFromMap() {
            if (!LeafletMap.CustomMap || !LeafletMap.CustomMap.main.markers[0])
                return;
            
            var marker = LeafletMap.CustomMap.main.markers[LeafletMap.CustomMap.main.markers.length - 1];
            var lat = marker._latlng.lat;
            var lng = marker._latlng.lng;

            config.locationLatInput().val(lat);
            config.locationLngInput().val(lng);

            if (config.dawaAutocompleteInput().val()) {
                config.locationNameInput().val(config.dawaAutocompleteInput().val());
            } else if (config.resultCardDistrict().html() && config.resultCardMunicipality().html()) {
                config.locationNameInput().val(config.resultCardDistrict().html() + " - " +config.resultCardMunicipality().html());
            }
            else {
                config.locationNameInput().val("");
            }

            var modal = new bootstrap.Modal(document.getElementById(config.saveLocationModal));
            modal.show();
        }

        function showAddLocationButton() {
            config.addLocationBtn().show();
        }

        function saveBtnClick(e) {
            if (!isInputsValid()) {
                return;
            }

            var locationObj = createSaveLocationObject(config.locationLatInput().val(), config.locationLngInput().val(), config.locationNameInput().val());
            saveLocationObject(locationObj);

            var modal = bootstrap.Modal.getInstance(document.getElementById(config.saveLocationModal));
            modal.hide();
            main.setupBootstrapValidation();
        }

        function deleteBtnClick(e) {
            var savedLocations = JSON.parse(localStorage.getItem(config.localStorageSavedLocationKey));
            if (!savedLocations) {
                return;
            }

            var dataLocationId = $(e.target).closest("a[data-location-id]").attr("data-location-id");
            savedLocations.splice(dataLocationId, 1);
            localStorage.setItem(config.localStorageSavedLocationKey, JSON.stringify(savedLocations));
            showLocations();
        }

        var main = {
            init: function () {
                main.setupBootstrapValidation();
                showLocations();
                main.setupEvents();

                if (LeafletMap.CustomMap.main.markers[0]) {
                    showAddLocationButton();
                }
            },
            setupEvents: function () {
                Utils.EventEmitter.subscribe("LeafletMap.CustomMap.locationSet", showAddLocationButton);

                config.addLocationBtn().on('click', setCurrentLocationFromMap);
                config.saveLocationBtn().on('click', saveBtnClick);
                $('a[data-location-id]').on('click', loadLocation);
                $('button[data-delete-location-id]').on('click', deleteBtnClick);
            },
            setupBootstrapValidation: function () {
                var forms = document.querySelectorAll('.needs-validation')
                
                Array.prototype.slice.call(forms)
                    .forEach(function (form) {
                    form.addEventListener('submit', function (event) {
                        if (!form.checkValidity()) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                
                        form.classList.add('was-validated');
                    }, false)
                })
            }
        }

        main.init();
    })(Manager.Location || (Manager.Location = {}));
});