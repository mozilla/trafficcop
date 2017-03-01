(function() {
    'use strict';

    var eddie = new Mozilla.TrafficCop({
        id: 'experiment-page-1',
        variations: {
            'v=1': 50,
            'v=2': 20,
            'v=3': 10
        }
    });

    eddie.init();
})();
