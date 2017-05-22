(function() {
    'use strict';

    var lou = new Mozilla.TrafficCop({
        id: 'experiment-page-2',
        storeReferrerCookie: false, // don't store original referrer on redirect
        variations: {
            'v=a': 20,
            'v=b': 40
        }
    });

    lou.init();
})();
