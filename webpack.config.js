const path = require('path');

module.exports = {
    entry: {
        trafficCop: './src/mozilla-traffic-cop.js',
        cookieHelper: './src/mozilla-cookie-helper.js',
        dntHelper: './src/mozilla-dnt-helper.js'
    },
    output: {
        filename: '[name]-bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        library: {
            name: 'mozModules',
            type: 'umd'
        }
    }
};
