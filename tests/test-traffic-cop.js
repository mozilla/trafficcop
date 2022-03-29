/* For reference read the Jasmine and Sinon docs
 * Jasmine docs: http://pivotal.github.io/jasmine/
 * Sinon docs: http://sinonjs.org/docs/
 */

/* global sinon */

describe('mozilla-traffic-cop.js', function () {
    'use strict';

    beforeEach(function () {
        // stub out Mozilla.Cookie lib
        window.Mozilla.Cookies = sinon.stub();
        window.Mozilla.Cookies.enabled = sinon.stub().returns(true);
        window.Mozilla.Cookies.setItem = sinon.stub().returns(true);
        window.Mozilla.Cookies.removeItem = sinon.stub().returns(true);
        window.Mozilla.Cookies.getItem = sinon.stub().returns(false);
        window.Mozilla.Cookies.hasItem = sinon.stub().returns(false);

        // actual redirect shouldn't happen in tests
        Mozilla.TrafficCop.performRedirect = sinon.stub();
    });

    describe('Mozilla.TrafficCop instantiation defaults', function () {
        it('should store supplied config', function () {
            var config = {
                id: 'testABC'
            };
            var cop = new Mozilla.TrafficCop(config);
            expect(cop.config).toEqual(config);
        });

        it('should default to an empty object if supplied config is not an object', function () {
            var config = 'purplemonkeydishwasher';
            var cop = new Mozilla.TrafficCop(config);
            expect(cop.config).toEqual({});
        });

        it('should store supplied customCallback', function () {
            var funkyFunc = sinon.stub();
            var cop = new Mozilla.TrafficCop({
                customCallback: funkyFunc
            });
            expect(cop.customCallback).toEqual(funkyFunc);
        });

        it('should default customCallback to null if not supplied', function () {
            var cop = new Mozilla.TrafficCop();
            expect(cop.customCallback).toEqual(null);
        });

        it('should set customCallback to null if not supplied with a function', function () {
            var cop = new Mozilla.TrafficCop({
                customCallback: 'frinkahedron'
            });
            expect(cop.customCallback).toEqual(null);
        });

        it('should store cookieExpires if specified', function () {
            var cop = new Mozilla.TrafficCop({
                cookieExpires: 48
            });
            expect(cop.cookieExpires).toEqual(48);
        });

        it('should default cookieExpires to 24 if not specified', function () {
            var cop = new Mozilla.TrafficCop();
            expect(cop.cookieExpires).toEqual(
                Mozilla.TrafficCop.defaultCookieExpires
            );
        });

        it('should store storeReferrerCookie if specified', function () {
            var cop = new Mozilla.TrafficCop({
                storeReferrerCookie: false
            });
            expect(cop.storeReferrerCookie).toEqual(false);
        });

        it('should default storeReferrerCookie to true if not specified', function () {
            var cop = new Mozilla.TrafficCop();
            expect(cop.storeReferrerCookie).toEqual(true);
        });

        it('should calculate totalPercentage based off supplied variations', function () {
            var cop = new Mozilla.TrafficCop({
                variations: {
                    'v=1': 25,
                    'v=2': 15,
                    'v=3': 5
                }
            });
            expect(cop.totalPercentage).toEqual(45);
        });

        it('should handle variation percentages in the tenths', function () {
            var cop = new Mozilla.TrafficCop({
                variations: {
                    'v=1': 10.4,
                    'v=2': 0.2,
                    'v=3': 7,
                    'v=4': 0.1
                }
            });
            expect(cop.totalPercentage).toEqual(17.7);
        });

        it('should handle variation percentages in the hundredths', function () {
            var cop = new Mozilla.TrafficCop({
                variations: {
                    'v=1': 9.04,
                    'v=2': 10.25,
                    'v=3': 27.3,
                    'v=4': 0.1
                }
            });
            expect(cop.totalPercentage).toEqual(46.69);
        });
    });

    describe('Mozilla.TrafficCop.init', function () {
        var cop = new Mozilla.TrafficCop({
            id: 'test123',
            variations: {
                'v=1': 20,
                'v=2': 40
            }
        });

        beforeEach(function () {
            spyOn(cop, 'verifyConfig').and.returnValue(true);
        });

        it('should not initialize is user has DNT enabled', function () {
            spyOn(Mozilla, 'dntEnabled').and.returnValue(true);
            cop.init();
            expect(cop.verifyConfig).not.toHaveBeenCalled();
        });

        it('should initialize if user does not have DNT enabled', function () {
            spyOn(Mozilla, 'dntEnabled').and.returnValue(false);
            cop.init();
            expect(cop.verifyConfig).toHaveBeenCalled();
        });

        it('should initialize if DNT helper function is not available', function () {
            var dntBak = Mozilla.dntEnabled;
            Mozilla.dntEnabled = undefined;
            cop.init();
            expect(cop.verifyConfig).toHaveBeenCalled();
            Mozilla.dntEnabled = dntBak;
        });

        it('should not initialize is cookies are disabled', function () {
            spyOn(window.Mozilla.Cookies, 'enabled').and.returnValue(false);
            cop.init();
            expect(cop.verifyConfig).not.toHaveBeenCalled();
        });
    });

    describe('Mozilla.TrafficCop.init redirect', function () {
        var cop = new Mozilla.TrafficCop({
            id: 'test123',
            variations: {
                'v=1': 20,
                'v=2': 40
            }
        });

        it('should call setReferrerCookie by default', function () {
            spyOn(Mozilla.TrafficCop, 'isRedirectVariation').and.returnValue(
                false
            );
            spyOn(Mozilla.TrafficCop, 'generateRedirectUrl').and.returnValue(
                'http://www.mozilla.com/en-US/?v=1'
            );
            spyOn(Mozilla.TrafficCop, 'setReferrerCookie').and.returnValue(
                true
            );

            cop.init();

            expect(Mozilla.TrafficCop.setReferrerCookie).toHaveBeenCalled();
        });

        it('should not call setReferrerCookie when specified in config', function () {
            cop.storeReferrerCookie = false;

            spyOn(Mozilla.TrafficCop, 'isRedirectVariation').and.returnValue(
                false
            );
            spyOn(Mozilla.TrafficCop, 'generateRedirectUrl').and.returnValue(
                'http://www.mozilla.com/en-US/?v=1'
            );
            spyOn(Mozilla.TrafficCop, 'setReferrerCookie').and.returnValue(
                true
            );

            cop.init();

            expect(Mozilla.TrafficCop.setReferrerCookie).not.toHaveBeenCalled();
        });
    });

    describe('Mozilla.TrafficCop.init customCallback', function () {
        it('should call customCallback when specified', function () {
            var cop = new Mozilla.TrafficCop({
                id: 'test123',
                customCallback: sinon.stub(),
                variations: {
                    a: 30,
                    b: 30
                }
            });

            spyOn(Mozilla.TrafficCop, 'chooseVariation').and.returnValue('a');
            spyOn(cop, 'customCallback');

            cop.init();

            expect(cop.customCallback).toHaveBeenCalledWith('a');
        });

        it('should not attempt a redirect if customCallback is specified', function () {
            var cop = new Mozilla.TrafficCop({
                id: 'test123',
                customCallback: sinon.stub(),
                variations: {
                    a: 30,
                    b: 30
                }
            });

            spyOn(Mozilla.TrafficCop, 'generateRedirectUrl');
            spyOn(Mozilla.TrafficCop, 'performRedirect');

            cop.init();

            expect(
                Mozilla.TrafficCop.generateRedirectUrl
            ).not.toHaveBeenCalled();
            expect(Mozilla.TrafficCop.performRedirect).not.toHaveBeenCalled();
        });
    });

    describe('Mozilla.TrafficCop.verifyConfig', function () {
        it('should return true for valid id and variations', function () {
            var cop = new Mozilla.TrafficCop({
                id: 'test123',
                variations: {
                    'v=1': 20,
                    'v=2': 40
                }
            });

            expect(cop.verifyConfig()).toBeTruthy();
        });

        it('should return false when no id or variations are provided', function () {
            var cop = new Mozilla.TrafficCop();

            expect(cop.verifyConfig()).toBeFalsy();
        });

        it('should return false when no id is provided', function () {
            var cop = new Mozilla.TrafficCop({
                variations: {
                    'v=1': 80
                }
            });

            expect(cop.verifyConfig()).toBeFalsy();
        });

        it('should return false when no variations provided', function () {
            var cop = new Mozilla.TrafficCop({
                id: 'test123',
                variations: {}
            });

            expect(cop.verifyConfig()).toBeFalsy();
        });

        it('should return false when variation percentage is 0', function () {
            var cop = new Mozilla.TrafficCop({
                id: 'test123',
                variations: {
                    'v=1': 0,
                    'v=2': 0
                }
            });

            expect(cop.verifyConfig()).toBeFalsy();
        });

        it('should return false when variation percentage exceeds 100', function () {
            var cop = new Mozilla.TrafficCop({
                id: 'test123',
                variations: {
                    'v=1': 50,
                    'v=2': 60
                }
            });

            expect(cop.verifyConfig()).toBeFalsy();
        });

        it('should return true with a valid cookieExpires value', function () {
            var cop = new Mozilla.TrafficCop({
                id: 'test123',
                cookieExpires: 48,
                variations: {
                    'v=1': 20,
                    'v=2': 40
                }
            });

            expect(cop.verifyConfig()).toBeTruthy();
        });

        it('should return false with an invalid cookieExpires value', function () {
            var config1;
            var config2;
            var config3;

            config1 =
                config2 =
                config3 =
                    {
                        id: 'test123',
                        variations: {
                            'v=1': 20,
                            'v=2': 40
                        }
                    };

            config1.cookieExpires = '2 days';
            config2.cookieExpires = null;
            config3.cookieExpires = [];

            var cop = new Mozilla.TrafficCop(config1);
            var cop2 = new Mozilla.TrafficCop(config2);
            var cop3 = new Mozilla.TrafficCop(config3);

            expect(cop.verifyConfig()).toBeFalsy();
            expect(cop2.verifyConfig()).toBeFalsy();
            expect(cop3.verifyConfig()).toBeFalsy();
        });
    });

    describe('Mozilla.TrafficCop.generateCookieExpiresDate', function () {
        var config = {
            id: 'test123',
            variations: {
                'v=1': 40,
                'v=2': 30
            }
        };

        it('should return a date 24 hours into the future when no hours are specified', function () {
            // a cop with no
            var cop = new Mozilla.TrafficCop(config);
            var expiry = Mozilla.TrafficCop.generateCookieExpiresDate(
                cop.cookieExpires,
                new Date(2017, 0, 1, 12, 30)
            );
            expect(expiry.getFullYear()).toBe(2017);
            expect(expiry.getMonth()).toBe(0);
            expect(expiry.getDate()).toBe(2); // 24 hours default cookie length
        });

        it('should return an appropriate future date when hours are specified', function () {
            var expiry = Mozilla.TrafficCop.generateCookieExpiresDate(
                72,
                new Date(2017, 0, 1, 12, 30)
            );
            expect(expiry.getFullYear()).toBe(2017);
            expect(expiry.getMonth()).toBe(0);
            expect(expiry.getDate()).toBe(4); // 72 hours = 3 days
        });

        it('should return null when 0 hours are specified', function () {
            expect(Mozilla.TrafficCop.generateCookieExpiresDate(0)).toBe(null);
        });
    });

    describe('Mozilla.TrafficCop.isRedirectVariation', function () {
        var variations = {
            'v=1': 40,
            'v=2': 30
        };

        it('should return false if the current queryString does not contain a variation', function () {
            expect(
                Mozilla.TrafficCop.isRedirectVariation(variations, '?v=3')
            ).toBeFalsy();
            expect(
                Mozilla.TrafficCop.isRedirectVariation(variations, '?fav=1')
            ).toBeFalsy();
            expect(
                Mozilla.TrafficCop.isRedirectVariation(variations, '?v=3&fav=1')
            ).toBeFalsy();
        });

        it('should return true if the current querystring contains a variation', function () {
            expect(
                Mozilla.TrafficCop.isRedirectVariation(variations, '?v=2')
            ).toBeTruthy();
            expect(
                Mozilla.TrafficCop.isRedirectVariation(
                    variations,
                    '?foo=bar&v=2'
                )
            ).toBeTruthy();
            expect(
                Mozilla.TrafficCop.isRedirectVariation(
                    variations,
                    '?v=2&foo=bar'
                )
            ).toBeTruthy();
        });
    });

    describe('Mozilla.TrafficCop.chooseVariation', function () {
        var cop = new Mozilla.TrafficCop({
            id: 'test123',
            variations: {
                'v=3': 30,
                'v=1': 20,
                'v=2': 25.25,
                'v=4': 0.2,
                'v=5': 0.1
            }
        });

        it('should return noVariationCookieValue if random number is greater than total percentages', function () {
            // random number >= 80 is greater than percentage total above (75.55)
            spyOn(window.Math, 'random').and.returnValue(0.7556);
            expect(
                Mozilla.TrafficCop.chooseVariation(
                    cop.id,
                    cop.variations,
                    cop.totalPercentage
                )
            ).toEqual(Mozilla.TrafficCop.noVariationCookieValue);
        });

        it('should choose the first variation when random number is at the start of the range', function () {
            // first variation is 30%, so 1-30
            spyOn(window.Math, 'random').and.returnValue(0.01);
            expect(
                Mozilla.TrafficCop.chooseVariation(
                    cop.id,
                    cop.variations,
                    cop.totalPercentage
                )
            ).toEqual('v=3');
        });

        it('should choose the first variation when random number is at the end of the range', function () {
            // first variation is 30%, so 1-30
            spyOn(window.Math, 'random').and.returnValue(0.29);
            expect(
                Mozilla.TrafficCop.chooseVariation(
                    cop.id,
                    cop.variations,
                    cop.totalPercentage
                )
            ).toEqual('v=3');
        });

        it('should choose the second variation when random number is at the start of the range', function () {
            // second variation is 20%, so 31-50
            spyOn(window.Math, 'random').and.returnValue(0.3);
            expect(
                Mozilla.TrafficCop.chooseVariation(
                    cop.id,
                    cop.variations,
                    cop.totalPercentage
                )
            ).toEqual('v=1');
        });

        it('should choose the second variation when random number is at the end of the range', function () {
            // second variation is 20%, so 31-50
            spyOn(window.Math, 'random').and.returnValue(0.49);
            expect(
                Mozilla.TrafficCop.chooseVariation(
                    cop.id,
                    cop.variations,
                    cop.totalPercentage
                )
            ).toEqual('v=1');
        });

        it('should choose to the third variation when random number is at the start of the range', function () {
            // third variation is 25.25%, so 51-75.25
            spyOn(window.Math, 'random').and.returnValue(0.5);
            expect(
                Mozilla.TrafficCop.chooseVariation(
                    cop.id,
                    cop.variations,
                    cop.totalPercentage
                )
            ).toEqual('v=2');
        });

        it('should choose the third variation when random number is at the end of the range', function () {
            // third variation is 25.25%, so 51-75.25
            spyOn(window.Math, 'random').and.returnValue(0.7525);
            expect(
                Mozilla.TrafficCop.chooseVariation(
                    cop.id,
                    cop.variations,
                    cop.totalPercentage
                )
            ).toEqual('v=2');
        });

        it('should choose the fourth variation when random number is at the start of the range', function () {
            // fourth variation is 0.2%, so 75.26-75.45
            spyOn(window.Math, 'random').and.returnValue(0.7526);
            expect(
                Mozilla.TrafficCop.chooseVariation(
                    cop.id,
                    cop.variations,
                    cop.totalPercentage
                )
            ).toEqual('v=4');
        });

        it('should choose the fourth variation when random number is at the end of the range', function () {
            // fourth variation is 0.2%, so 75.26-75.45
            spyOn(window.Math, 'random').and.returnValue(0.7545);
            expect(
                Mozilla.TrafficCop.chooseVariation(
                    cop.id,
                    cop.variations,
                    cop.totalPercentage
                )
            ).toEqual('v=4');
        });

        it('should choose the fifth variation when random number matches', function () {
            // fifth variation is 0.1%, so 75.46
            spyOn(window.Math, 'random').and.returnValue(0.7546);
            expect(
                Mozilla.TrafficCop.chooseVariation(
                    cop.id,
                    cop.variations,
                    cop.totalPercentage
                )
            ).toEqual('v=5');
        });

        it('should choose a valid variation stored in a cookie', function () {
            spyOn(Mozilla.Cookies, 'hasItem').and.returnValue(true);
            spyOn(Mozilla.Cookies, 'getItem').and.returnValue('v=2');

            expect(
                Mozilla.TrafficCop.chooseVariation(
                    cop.id,
                    cop.variations,
                    cop.totalPercentage
                )
            ).toEqual('v=2');
        });

        it('should pick a new variation if variation stored in cookie is invalid', function () {
            spyOn(Mozilla.Cookies, 'hasItem').and.returnValue(true);
            spyOn(Mozilla.Cookies, 'getItem').and.returnValue('v=42');
            spyOn(window.Math, 'random').and.returnValue(0.74);

            expect(
                Mozilla.TrafficCop.chooseVariation(
                    cop.id,
                    cop.variations,
                    cop.totalPercentage
                )
            ).toEqual('v=2');
        });

        it('should choose noVariationCookieValue if user was placed into a no-variation cohort', function () {
            spyOn(Mozilla.Cookies, 'hasItem').and.returnValue(true);
            spyOn(Mozilla.Cookies, 'getItem').and.returnValue(
                Mozilla.TrafficCop.noVariationCookieValue
            );

            expect(
                Mozilla.TrafficCop.chooseVariation(
                    cop.id,
                    cop.variations,
                    cop.totalPercentage
                )
            ).toEqual(Mozilla.TrafficCop.noVariationCookieValue);
        });
    });

    describe('Mozilla.TrafficCop.generateRedirectUrl', function () {
        it('should generate a redirect retaining the original querystring when present', function () {
            expect(
                Mozilla.TrafficCop.generateRedirectUrl(
                    'v=2',
                    'https://www.mozilla.org?foo=bar'
                )
            ).toEqual('https://www.mozilla.org?foo=bar&v=2');
        });

        it('should generate a redirect retaining the original hash when present', function () {
            expect(
                Mozilla.TrafficCop.generateRedirectUrl(
                    'v=2',
                    'https://www.mozilla.org#hash'
                )
            ).toEqual('https://www.mozilla.org?v=2#hash');
        });

        it('should generate a redirect retaining the original querystring and hash when present', function () {
            expect(
                Mozilla.TrafficCop.generateRedirectUrl(
                    'v=2',
                    'https://www.mozilla.org?foo=bar#hash'
                )
            ).toEqual('https://www.mozilla.org?foo=bar&v=2#hash');
        });

        it('should not generate a redirect if no variation was chosen', function () {
            expect(
                Mozilla.TrafficCop.generateRedirectUrl(
                    Mozilla.TrafficCop.noVariationCookieValue
                )
            ).toBeFalsy();
        });
    });

    describe('Mozilla.TrafficCop.setReferrerCookie', function () {
        it('should set referrer cookie to `direct` if no document.referer exists', function () {
            spyOn(Mozilla.Cookies, 'setItem').and.returnValue(true);
            spyOn(Mozilla.TrafficCop, 'getDocumentReferrer').and.returnValue(
                ''
            );
            Mozilla.TrafficCop.setReferrerCookie(new Date());
            expect(Mozilla.Cookies.setItem).toHaveBeenCalledWith(
                Mozilla.TrafficCop.referrerCookieName,
                'direct',
                jasmine.any(Date),
                undefined,
                undefined,
                false,
                'lax'
            );
        });

        it('should set referrer cookie to the value of `document.referrer` if exists', function () {
            spyOn(Mozilla.Cookies, 'setItem').and.returnValue(true);
            Mozilla.TrafficCop.setReferrerCookie(
                new Date(),
                'http://www.google.com'
            );
            expect(Mozilla.Cookies.setItem).toHaveBeenCalledWith(
                Mozilla.TrafficCop.referrerCookieName,
                'http://www.google.com',
                jasmine.any(Date),
                undefined,
                undefined,
                false,
                'lax'
            );
        });

        it('should set referrer cookie to the value of `document.referrer` if exists', function () {
            spyOn(Mozilla.Cookies, 'setItem').and.returnValue(true);
            // karma does seem to have a document.referer when running these tests...
            Mozilla.TrafficCop.setReferrerCookie(new Date());
            expect(Mozilla.Cookies.setItem).toHaveBeenCalledWith(
                Mozilla.TrafficCop.referrerCookieName,
                jasmine.stringMatching(/^http.*/),
                jasmine.any(Date),
                undefined,
                undefined,
                false,
                'lax'
            );
        });
    });

    describe('Mozilla.TrafficCop.clearReferrerCookie', function () {
        it('should remove the referrer cookie', function () {
            spyOn(Mozilla.Cookies, 'removeItem').and.returnValue(true);
            Mozilla.TrafficCop.clearReferrerCookie();
            expect(Mozilla.Cookies.removeItem).toHaveBeenCalledWith(
                Mozilla.TrafficCop.referrerCookieName
            );
        });
    });

    describe('Mozilla.TrafficCop.getDocumentReferrer', function () {
        it('should return a non-zero length string for document.referrer', function () {
            expect(Mozilla.TrafficCop.getDocumentReferrer()).toEqual(
                jasmine.stringMatching(/^http.*/)
            );
        });
    });
});
