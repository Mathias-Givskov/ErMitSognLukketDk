var Utils = Utils || {};

$(function () {
    (function (eventEmitter) {

        var events = {
        };

        var eventManager = {
            subcribe: function (eventName, cb) {
                if (!events[eventName]) {
                    events[eventName] = [];
                }

                events[eventName].push(cb);

                // calling returned object will unsubcribe
                return function () {
                    events[eventName] = events[eventName].filter(function (eventCb) { return cb !== eventCb; });
                };
            },
            unsubscribe: function (eventName, cb) {
                if (events[eventName]) {
                    events[eventName] = events[eventName].filter(function (eventCb) { return cb !== eventCb; });
                }
            },
            trigger: function (eventName, data) {
                var event = events[eventName];

                if (event) {
                    event.forEach(function (cb) {
                        cb.call(null, data);
                    });
                }
            }
        };

        eventEmitter.subscribe = function (eventName, cb) {
            return eventManager.subcribe(eventName, cb);
        };

        eventEmitter.unsubscribe = function (eventName, cb) {
            eventManager.unsubscribe(eventName, cb);
        };

        eventEmitter.trigger = function (eventName, data) {
            eventManager.trigger(eventName, data);
        };

    })(Utils.EventEmitter || (Utils.EventEmitter = {}));
});