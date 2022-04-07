(function () {
    'use strict';

    var lou = new Mozilla.TrafficCop({
        id: 'experiment-page-3',
        storeReferrerCookie: false, // don't store original referrer on redirect
        variations: {
            'v=a': 40,
            'v=b': 40
        }
    });

    lou.init();
})();
