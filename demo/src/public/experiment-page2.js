(function () {
    'use strict';

    var variants = {
        a: 30,
        b: 30,
        c: 30
    };

    function handleVariation(variation) {
        // wait until DOM is ready to be manipulated...
        domReady(function () {
            // make sure variation is one we are expecting (and not noVariationCookieValue)
            if (Object.prototype.hasOwnProperty.call(variants, variation)) {
                var target = document.getElementById('var-' + variation);
                target.classList.remove('hidden');
            }
        });
    }

    // non-jquery document ready function
    // http://beeker.io/jquery-document-ready-equivalent-vanilla-javascript
    function domReady(callback) {
        document.readyState === 'interactive' ||
        document.readyState === 'complete'
            ? callback()
            : document.addEventListener('DOMContentLoaded', callback);
    }

    var wiggum = new Mozilla.TrafficCop({
        id: 'experiment-page-2',
        customCallback: handleVariation,
        variations: variants
    });

    wiggum.init();
})();
