(function() {
    'use strict';

    var lou = new Mozilla.TrafficCop({
        id: 'experiment-page-2',
        variations: {
            'v=a': 20,
            'v=b': 40
        }
    });

    lou.init();
})();
