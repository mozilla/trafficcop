# Traffic Cop
## Simple, lightweight, developer-focused front-end A/B testing

(If you want to skip the spiel and get straight to business, check out the [docs](./documentation.md).)

### What does it do?

Traffic Cop is a small bit of JavaScript in the `<head>` of a page that decides if a visitor should be shown a variation of the current page. If so, a cookie is set and the user is redirected to the current URL with a developer-specified querystring parameter appended. That's it.

1. Visitor lands on `www.toohot.today/product`
2. Visitor is chosen for variation 2
3. Visitor is redirected to `www.toohot.today/product?v=2`

What happens on `www.toohot.today/product?v=2` is completely up to the developer (possibly you, dear reader).

### Why did we build it?

Most of the content experiments on [mozilla.org](https://www.mozilla.org) simply direct (or police, if you will) traffic to different URLs based on querystring parameters. We weren't aware of any developer-focused (simple, light, flexible) solutions, so we [wrote one](https://frinkiac.com/caption/S10E13/653685).

In contrast to third-party options (e.g. [Optimizely](https://www.optimizely.com/)), Traffic Cop offers:

1. **Security** — Many third-party options require loading JS from their site, which is a potential [XSS](https://en.wikipedia.org/wiki/Cross-site_scripting) vector. Traffic Cop can be served from your site/CDN.
2. **Performance** — Traffic Cop is light and has only one dependency, resulting in less than 2KB of JS when minified. (In our experience, Optimizely's JS bundle was regularly above 200KB.)
3. **Your workflow** — Traffic Cop offers great flexibility in when and how you write and load variation code. No need to type jQuery in a text box on a third-party web page.
4. **Savings** — No need to pay for a third-party service.

### How does it work?

A visitor hits a URL running an experiment (meaning the appropriate JS is loaded in the `<head>`). Traffic Cop picks a random number, and, if that random number falls within the range specified by a variation (see below), redirects the visitor to that variation.

Traffic Cop assumes all variations are loaded through a querystring parameter appended to the original URL. This keeps things simple, as no new URL patterns need to be defined (and later removed) for each experiment. Simply check for the querystring parameter (wherever your application might do that sort of thing) and load different content accordingly.

Implementing Traffic Cop requires two other JavaScript files: one to configure the experiment, and [MDN’s handy cookie library](https://developer.mozilla.org/docs/Web/API/Document/cookie/Simple_document.cookie_framework). The configuration file is fairly straightforward. Simply instantiate a new Traffic Cop with your experiment configuration, and then initialize it.

```javascript
// example configuration file
// assumes Traffic Cop & MDN cookie helper already loaded
var wiggum = new Mozilla.TrafficCop({
  id: ‘experiment-promo-fall-2017’,
  variations: {
    ‘v=1’: 20,
    ‘v=2’: 30
  }
});

wiggum.init();
```

In the above example, a visitor would have a 20% chance of being chosen for `v=1`, and a 30% chance for `v=2`. If the visitor is selected for a variation, a cookie with the key `experiment-promo-fall-2017` will be set to store the chosen variation, and the user redirected to the current URL with either `?v=2` or `?v=3` appended.

Check out [the docs](./documentation.md) for more complete technical/implementation information.
