module.exports = {
    env: {
        node: true,
        browser: true,
        es6: true,
        jasmine: true
    },
    extends: ['eslint:recommended', 'prettier'],
    rules: {
        'no-global-assign': 2,
        'linebreak-style': [2, 'unix'],
        quotes: [2, 'single'],
        semi: [2, 'always'],
        curly: [2, 'all'],
        camelcase: [
            2,
            {
                properties: 'always'
            }
        ],
        eqeqeq: [2, 'smart'],
        'one-var-declaration-per-line': [2, 'always'],
        'new-cap': 2
    },
    globals: {
        Mozilla: true
    }
};
