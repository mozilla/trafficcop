const express = require('express');
const nunjucks = require('nunjucks');
const path = require('path');
const favicon = require('serve-favicon');
const pages = require('./controllers/pages');

const app = express();

app.set('view engine', 'nunjucks');
app.set('port', 3030);

app.use(favicon(path.join(__dirname, './public/favicon.ico')));
app.use(express.static(path.join(__dirname, './public')));
app.use(
    '/uncompressed-src',
    express.static(path.join(__dirname, '/../../src/'))
);

nunjucks.configure('src/views', {
    autoescape: true,
    express: app,
    noCache: true
});

app.get('/', (req, res) => {
    res.render('index.njk');
});

app.get('/page/:pageId', pages.route);

app.listen(app.get('port'), () => {
    /* eslint-disable no-console */
    console.log(`Express server listening on port ${app.get('port')}...`);
    /* eslint-enable no-console */
});

module.exports = app;
