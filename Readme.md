# Traffic Cop

# This project has been migrated to the MozMeao GitHub org, which can be found here: https://github.com/mozmeao/trafficcop/

## Simple, lightweight, developer-focused front-end A/B testing

(If you want to skip the spiel and get straight to business, check out the [docs](./documentation.md).)

### What does it do?

Traffic Cop is a small bit of JavaScript that decides if a visitor should participate in a variation of the current page. If so, a cookie is set and one of two things happens:

1. a developer-specified JavaScript function is passed the chosen variation and executed
2. the user is redirected to the current URL with a developer-specified querystring parameter appended

### Example flow

1. Visitor lands on `www.toohot.today/product`
2. Visitor is chosen for variation 2
3. Visitor is issued a cookie and then either:
   a. redirected to `www.toohot.today/product?v=2` _or_
   b. a developer-specified JavaScript function is passed the value of `2` and executed

What happens on `www.toohot.today/product?v=2`, or in the JavaScript function, is completely up to the developer (possibly you, dear reader).

### Why did we build it?

Most of the content experiments on [mozilla.org](https://www.mozilla.org) simply direct (or police, if you will) targeted visitors into pre-set variation cohorts. We weren't aware of any developer-focused (simple, light, flexible) solutions, so we [wrote one](https://frinkiac.com/caption/S10E13/653685).

In contrast to third-party options (e.g. [Optimizely](https://www.optimizely.com/)), Traffic Cop offers:

1. **Security** — Many third-party options require loading JS from their site, which is a potential [XSS](https://en.wikipedia.org/wiki/Cross-site_scripting) vector. Traffic Cop can (and should) be served from your site/CDN.
2. **Performance** — Traffic Cop is light and has only one dependency, resulting in less than 2KB of JS when minified. (In our experience, Optimizely's JS bundle was regularly above 200KB.)
3. **Your workflow** — Traffic Cop offers great flexibility in when and how you write and load variation code. No need to type jQuery in a text box on a third-party web page.
4. **Savings** — No need to pay for a third-party service.

### How does it work?

A visitor hits a URL running an experiment (meaning the appropriate JS is loaded). Traffic Cop picks a random number, and, if that random number falls within the range specified by a variation (see below), either redirects the visitor to that variation or executes an arbitrary, developer-specified callback function.

For redirects, Traffic Cop assumes all variations are loaded through a querystring parameter appended to the original URL. This keeps things simple, as no new URL patterns need to be defined (and later removed) for each experiment. Simply check for the querystring parameter (wherever your application might do that sort of thing) and load different content accordingly.

Implementing Traffic Cop requires at least two other JavaScript files: one to configure the experiment, and [MDN’s handy cookie library](https://developer.mozilla.org/docs/Web/API/Document/cookie/Simple_document.cookie_framework). The configuration file is fairly straightforward. Simply instantiate a new Traffic Cop with your experiment configuration, and then initialize it.

```javascript
// example configuration for a redirect experiment
var wiggum = new Mozilla.TrafficCop({
  id: ‘experiment-promo-fall-2017’,
  variations: {
    ‘v=1’: 10.5,
    ‘v=2’: 0.25
  }
});

wiggum.init();
```

In the above example, a visitor would have a 10.5% chance of being chosen for `v=1`, and a 0.25% chance for `v=2`. If the visitor is selected for a variation, a cookie with the key `experiment-promo-fall-2017` will be set to store the chosen variation, and the user redirected to the current URL with either `?v=1` or `?v=2` appended.

**Note that Traffic Cop supports percentages into the hundredths, but no smaller.**

```javascript
// example configuration for a callback function experiment
function myCallback(variation) {
    console.log('The chosen variation was ' + variation);
    // and then change button color based on variation chosen...
}

var lou = new Mozilla.TrafficCop({
  id: ‘experiment-button-color’,
  customCallback: myCallback,
  variations: {
    ‘a’: 25,
    ‘b’: 25,
    'c': 25
  }
});

lou.init();
//
```

In the above example, a visitor would have a 25% chance of being chosen for `a`, `b`, or `c`. The chosen variation will be passed to the `myCallback` function (which can do whatever it likes).

Check out [the docs](./documentation.md) for more complete information.

## License

This Source Code Form is subject to the terms of the [Mozilla Public
License, v. 2.0.](http://mozilla.org/MPL/2.0/)
