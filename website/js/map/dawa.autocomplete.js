var Dawa = Dawa || {};

$(function () {
    (function (autocomplete) {
        autocomplete.events = {
            selected: "dawa.autocomplete.selected"
        };

        dawaAutocomplete.dawaAutocomplete(document.getElementById('dawa-autocomplete-input'), {
            select: function(selected) {
                if (Utils && Utils.EventEmitter) {
                    Utils.EventEmitter.trigger(autocomplete.events.selected, selected);
                }
            }
        });
    })(Dawa.Autocomplete || (Dawa.Autocomplete = {}));
})