function route(req, res) {
    // get the page id from the  URL
    const page = Number(req.params.pageId);

    // make sure page is expected
    if ([1, 2, 3].indexOf(page) > -1) {
        res.render(`pages/page${page}.njk`, {
            variation: req.query.v || false
        });
    } else {
        res.render('404.njk');
    }
}

module.exports = { route };
