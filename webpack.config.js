const path = require('path');

module.exports = {
    entry: './src/mozilla-traffic-cop.js',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist')
    }
};
