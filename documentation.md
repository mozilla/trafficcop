# Mozilla Traffic Cop Documentation

Traffic Cop places visitors into A/B/x cohorts, and either performs a redirect or executes a developer-specified JavaScript function.


## How it works

After verifying the supplied configuration, Traffic Cop chooses a variation for the visitor in one of two ways:

1. Checks the visitor's cookies to see if they were previously given a variation. If so, that same variation is used.
2. If no previous variation exists, Traffic Cop generates a random number to choose a variation. If the supplied variations do not target 100% of visitors, the `novariation` value may be chosen. The chosen variation is written to a cookie for subsequent visits.


## Type A: Callback

If the instance of Traffic Cop is provided a `customCallback` in the config, the function supplied will be passed the variation value and executed.

Any further functionality is handled by the `customCallback`.

**For performance, and to not require any kind of `document.ready` code, it is recommended that "Type A" instances of Traffic Cop have their `.js` files placed at the bottom of the page, just before the closing `</body>` tag.**

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
```


## Type B: Redirect

If the instance of Traffic Cop is *not* provided a `customCallback`, and if the chosen variation is *not* `novariation`, the visitor is redirected to the current URL with the chosen variation appended to the querystring.

Any further functionality is handled by the application. (Usually loading different HTML/JS/CSS based on the query parameter.)

If the chosen variation is `novariation`, no redirect will occur - i.e. the user is not chosen to participate in the experiment.

Any query string parameters present when a user initially lands on a page will be propagated to the variation redirect.

**To avoid content flicker, it is recommended that "Type B" instances of Traffic Cop have their `.js` files placed in the `<head>` of the page.**

```javascript
// example configuration for a redirect experiment
var wiggum = new Mozilla.TrafficCop({
  id: ‘experiment-promo-fall-2017’,
  variations: {
    ‘v=1’: 20,
    ‘v=2’: 30
  }
});

wiggum.init();
```

**Note that the `variations` for redirect experiments contain a `key=value` pair.** This is not required, but does result in nicer redirect URLs, e.g. `https://www.toohot.today/?v=2` instead of `https://www.toohot.today/?2`.

### Advanced: Type B + Type A

It is possible to have both types of experiments running on the same page for the same audience. The general setup would be:

1. Place the redirect experiment in the `<head>` of the page. This will take precedence.
2. Place the callback experiment at the end of the page. This will execute regardless of querystring values.

Check out the demo for a live example of this setup.


## How a variation is chosen

Variations are sorted in the order provided, and percentages are tallied to create tiers. Take the following config:

```javascript
var rex = new Mozilla.TrafficCop({
    id: 'experiment-new-headline',
    variations: {
        'v=a': 25,
        'v=b': 25,
        'v=c': 25
    }
});
```

The implied tiers would be:

1. `v=a`: 1-25
2. `v=b`: 26-50
3. `v=c`: 51-75
4. (no variation chosen): 76-100

If the random number generated was 44, the user would be redirected to `?v=b`.


## Configuration

Each instance of a Traffic Cop requires at least two pieces of configuration:

- A string ID that is unique to other currently running tests (to avoid confusion when reading cookies)
- A variations object that lists all variations along with the associated percent chance of being chosen

An implementation for a redirect experiment might look like:

```javascript
var eddie = new Mozilla.TrafficCop({
    id: 'experiment-new-headline',
    variations: {
        'v=1': 25,
        'v=2': 25,
        'v=3': 25
    }
});

eddie.init();
```

In the above example, the string *experiment-new-headline* will be used as the cookie name to store the chosen variation.

The test will have 3 variations, each targeting 25% of users. There will also be a 25% chance that `novariation` is chosen.


### Optional Configuration

#### Customizing how long a user sees the same variation

To specify how long the cookie associated with a visitor for an individual experiment will last, specify a `cookieExpires` value in the configuration. This value must be a `Number` and represents the number of hours the cookie will last. If omitted, the cookie will last for 24 hours. A value of 0 will result in a session-length cookie.

An implementation with `cookieExpires` set might look like the following:

```javascript
var lou = new Mozilla.TrafficCop({
    id: 'experiment-homepage-spring-2017',
    customCallback: someCallbackFunction,
    cookieExpires: 0, // lasts until user closes the window/tab
    variations: {
        'a': 25,
        'b': 25,
        'c': 25
    }
});

lou.init();
```

#### Maintaining referral sources

One obstacle with client-side redirects is that the original referrer gets lost, which makes it difficult to know where your traffic is coming from. To remedy this, Traffic Cop by default sets a cookie just prior to redirecting the visitor that holds the original value of `document.referer`. This cookie is named *mozilla-traffic-cop-original-referrer* and contains the value of `document.referer`, or *direct* if `document.referer` is empty.

If you don't need this cookie, simply pass `setReferrerCookie: false` in your configuration. By default, this cookie will be set.

This cookie uses the same `cookieExpires` value as described above.

**Note** Traffic Cop does nothing with this cookie. If required for your implementation, you'll need to check for this cookie on your variation pages and send it on to your analytics platform (or wherever you might need it).

At Mozilla, we use Google Tag Manager, and send this cookie information via a `dataLayer` push prior to the GTM script being loaded.

**If you are using this cookie, we recommend explicitly removing it after use!**

```javascript
//
var referrer = Mozilla.Cookies.getItem('mozilla-traffic-cop-original-referrer');
// some code to send 'referrer' on to analytics goes here...
//

// now clear the cookie so we don't accidentally read it again
Mozilla.Cookies.removeItem('mozilla-traffic-cop-original-referrer')
```


## Implementation

Traffic Cop requires three JavaScript files:

1. `mozilla-cookie-helper.js` (included in the `src` directory)
2. `mozilla-traffic-cop.js`
3. A custom `.js` file to configure and initialize an instance of Traffic Cop (and perhaps contain a callback function)


### Considerations

1. To prevent search engines from indexing a variation URL, we recommend adding a `<link rel="canonical">` to the `<head>` of your experiment pages that points to the URL without any variation parameters. For example, all variations for `www.toohot.today/product` should have the following tag:

    `<link rel="canonical" href="http://www.toohot.today/product">`

2. Concatenate and minify experiment-specific files before sending to production. This will reduce your file size by about **70%**!
3. Respect your visitors' privacy settings and check their *doNotTrack*<sup>[1](#trafficcop-footnote1)</sup> status before putting them in an experiment.

<br><br>

<a name="trafficcop-footnote1"><sup>1</sup></a> - Perhaps you looked at the source and saw Traffic Cop looks for a function by the name of `Mozilla.dntEnabled`. Traffic Cop carries on just fine if this function doesn’t exist, but, should you wish to respect this setting, simply include the `mozilla-dnt-helper.js` code (it's in the `src` directory).
