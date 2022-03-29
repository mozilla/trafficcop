(function () {
    'use strict';

    var variants = {
        a: 40,
        b: 40
    };

    function handleVariation(variation) {
        if (Object.prototype.hasOwnProperty.call(variants, variation)) {
            var target = document.getElementById('var-' + variation);
            target.classList.remove('hidden');
        }
    }

    var wiggum = new Mozilla.TrafficCop({
        id: 'experiment-page-3-customcallback',
        customCallback: handleVariation,
        variations: variants
    });

    wiggum.init();
})();
