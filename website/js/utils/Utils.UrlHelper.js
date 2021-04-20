var Utils = Utils || {};

$(function () {
    (function (urlHelper) {
        var state = {
            initialQueryStringParameters: []
        };

        function getUrlWithUpdatedQueryString(key, value, url) {
            if (!url) url = window.location.href;
            var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
                hash;
        
            if (re.test(url)) {
                if (typeof value !== 'undefined' && value !== null) {
                    return url.replace(re, '$1' + key + "=" + value + '$2$3');
                } 
                else {
                    hash = url.split('#');
                    url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
                    if (typeof hash[1] !== 'undefined' && hash[1] !== null) {
                        url += '#' + hash[1];
                    }
                    return url;
                }
            }
            else {
                if (typeof value !== 'undefined' && value !== null) {
                    var separator = url.indexOf('?') !== -1 ? '&' : '?';
                    hash = url.split('#');
                    url = hash[0] + separator + key + '=' + value;
                    if (typeof hash[1] !== 'undefined' && hash[1] !== null) {
                        url += '#' + hash[1];
                    }
                    return url;
                }
                else {
                    return url;
                }
            }
        }

        urlHelper.getQueryStringParameters = function () {
            var match;
            var regExPlusSymbol = /\+/g;
            var regExSearch = /([^&=]+)=?([^&]*)/g;
            var query = window.location.search.substring(1);

            var decode = function (str) {
                return decodeURIComponent(str.replace(regExPlusSymbol, " "));
            };

            urlParams = {};
            while (match = regExSearch.exec(query))
                urlParams[decode(match[1]).toLowerCase()] = decode(match[2]);

            return urlParams;
        }

        urlHelper.getQueryStringParameter = function (queryStringParameterName, isBase64) {
            if (!queryStringParameterName)
                return null;

            var qsParams = urlHelper.getQueryStringParameters();
            if (!qsParams || !qsParams[queryStringParameterName.toLowerCase()])
                return null;

            var result = qsParams[queryStringParameterName.toLowerCase()];
            if (isBase64)
                return JSON.parse(atob(result));

            return qsParams[queryStringParameterName.toLowerCase()];
        }

        urlHelper.getInitalQueryStringParameters = function () {
            return state.initialQueryStringParameters;
        }

        urlHelper.setQueryStringParameter = function (name, value, replaceHistory, toBase64) {
            if (toBase64)
                value = btoa(JSON.stringify(value));

            var newUrl = getUrlWithUpdatedQueryString(name, value);

            if (replaceHistory) {
                window.history.replaceState(null, '', newUrl);
            } else {
                window.history.pushState(null,'', newUrl);
            }
        }

        function init() {
            state.initialQueryStringParameters = urlHelper.getQueryStringParameters();
        }

        init();

    })(Utils.UrlHelper || (Utils.UrlHelper = {}));
});