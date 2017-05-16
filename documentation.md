# Mozilla Traffic Cop Documentation

Traffic Cop handles redirecting users to different A/B/x variations through a query parameter.


## How it works

After verifying the supplied configuration, Traffic Cop first makes sure the user is not currently viewing a variation (to avoid a redirect loop). It then chooses a random percentage (1-100).

If the percentage falls within the total percentage specified by the config, it will choose the appropriate variation and redirect the user.

If the percentage exceeds that specified by the config, no redirect will occur - i.e. the user is not chosen to participate in the experiment.

If a variation is chosen, a cookie is set that will send the user back to the same variation if/when the page is again visited. (See below for setting cookie duration.)

Any query string parameters present when a user initially lands on a page will be propagated to the variation redirect.


### How a variation is chosen

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
4. (no redirect chosen): 76-100

So, if the random percentage chosen was 44, the user would be redirected to `?v=b`.


## Configuration

Each instance of a Traffic Cop requires at least two pieces of configuration:

- A string ID that is unique to other currently running tests (to avoid confusion when reading cookies)
- A variations object that lists all variations by query string along with the associated percent chance of being chosen

An implementation might look like:

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

In the above example, the string *experiment-new-headline* will be used as the cookie name should a variation be chosen.

The test will have 3 variations, each targeting 25% of users.

### Optional Configuration

1. Customizing how long a user sees the same variation

To specify how long the cookie associated with a visitor for an individual experiment will last, specify a `cookieExpires` value in the configuration. This value must be a `Number` and represents the number of hours the cookie will last. If omitted, the cookie will last for 24 hours. A value of 0 will result in a session-length cookie.

An implementation with `cookieExpires` set might look like the following:

```javascript
var lou = new Mozilla.TrafficCop({
    id: 'experiment-homepage-spring-2017',
    cookieExpires: 0, // lasts until user closes the window/tab
    variations: {
        'v=1': 25,
        'v=2': 25,
        'v=3': 25
    }
});

lou.init();
```

2. Maintaining referral sources

One obstacle with client-side redirects is that the original referrer gets lost, which makes it difficult to know where your traffic is coming from. To remedy this, Traffic Cop by default sets a cookie just prior to redirecting the visitor that holds the original value of `document.referer`. This cookie is named *mozilla-traffic-cop-original-referrer* and contains the value of `document.referer`, or *direct* if `document.referer` is empty.

If you don't need this cookie, simply pass `setReferrerCookie: false` in your configuration. By default, this cookie will be set.

This cookie uses the same `cookieExpires` value as described above.

**Note** Traffic Cop does nothing with this cookie. If required for your implementation, you'll need to check for this cookie on your variation pages and send it on to your analytics platform (or wherever you might need it).

At Mozilla, we use Google Tag Manager, and send this cookie information via a `dataLayer` push prior to the GTM script being loaded.

**If you are using this cookie, we recommend explicitly removing it after use!**

```javascript
// ...
// code to read the referrer cookie and send it to analytics
// ...

// now clear the cookie so we don't accidentally read it again
Mozilla.Cookies.removeItem('mozilla-traffic-cop-original-referrer')
```


## Implementation

Traffic Cop requires three JavaScript files:

1. `mozilla-cookie-helper.js` (included in the `src` directory)
2. `mozilla-traffic-cop.js`
3. A custom `.js` file to configure and initialize an instance of Traffic Cop (examples above)


### Considerations

1. To prevent search engines from indexing a variation URL, we recommend adding a `<link rel="canonical">` to the `<head>` of your experiment pages that points to the URL without any variation parameters. For example, all variations for `www.toohot.today/product` should have the following tag:

    `<link rel="canonical" href="http://www.toohot.today/product">`

2. Concatenate and minify experiment-specific files before sending to production. This will reduce your file size by about **70%**!
3. Respect your visitors' privacy settings and check their *doNotTrack*<sup>[1](#trafficcop-footnote1)</sup> status before putting them in an experiment.

<br><br>

<a name="trafficcop-footnote1"><sup>1</sup></a> - Perhaps you looked at the source and saw Traffic Cop looks for a function by the name of `Mozilla.dntEnabled`. Traffic Cop carries on just fine if this function doesn’t exist, but, should you wish to respect this setting, simply include the `mozilla-dnt-helper.js` code (it's in the `src` directory).
