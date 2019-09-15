/*!
 * Modernizr v2.7.1
 * www.modernizr.com
 *
 * Copyright (c) Faruk Ates, Paul Irish, Alex Sexton
 * Available under the BSD and MIT licenses: www.modernizr.com/license/
 */

/*
 * Modernizr tests which native CSS3 and HTML5 features are available in
 * the current UA and makes the results available to you in two ways:
 * as properties on a global Modernizr object, and as classes on the
 * <html> element. This information allows you to progressively enhance
 * your pages with a granular level of control over the experience.
 *
 * Modernizr has an optional (not included) conditional resource loader
 * called Modernizr.load(), based on Yepnope.js (yepnopejs.com).
 * To get a build that includes Modernizr.load(), as well as choosing
 * which tests to include, go to www.modernizr.com/download/
 *
 * Authors        Faruk Ates, Paul Irish, Alex Sexton
 * Contributors   Ryan Seddon, Ben Alman
 */

window.Modernizr = (function( window, document, undefined ) {

    var version = '2.7.1',

    Modernizr = {},

    /*>>cssclasses*/
    // option for enabling the HTML classes to be added
    enableClasses = true,
    /*>>cssclasses*/

    docElement = document.documentElement,

    /**
     * Create our "modernizr" element that we do most feature tests on.
     */
    mod = 'modernizr',
    modElem = document.createElement(mod),
    mStyle = modElem.style,

    /**
     * Create the input element for various Web Forms feature tests.
     */
    inputElem /*>>inputelem*/ = document.createElement('input') /*>>inputelem*/ ,

    /*>>smile*/
    smile = ':)',
    /*>>smile*/

    toString = {}.toString,

    // TODO :: make the prefixes more granular
    /*>>prefixes*/
    // List of property values to set for css tests. See ticket #21
    prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),
    /*>>prefixes*/

    /*>>domprefixes*/
    // Following spec is to expose vendor-specific style properties as:
    //   elem.style.WebkitBorderRadius
    // and the following would be incorrect:
    //   elem.style.webkitBorderRadius

    // Webkit ghosts their properties in lowercase but Opera & Moz do not.
    // Microsoft uses a lowercase `ms` instead of the correct `Ms` in IE8+
    //   erik.eae.net/archives/2008/03/10/21.48.10/

    // More here: github.com/Modernizr/Modernizr/issues/issue/21
    omPrefixes = 'Webkit Moz O ms',

    cssomPrefixes = omPrefixes.split(' '),

    domPrefixes = omPrefixes.toLowerCase().split(' '),
    /*>>domprefixes*/

    /*>>ns*/
    ns = {'svg': 'http://www.w3.org/2000/svg'},
    /*>>ns*/

    tests = {},
    inputs = {},
    attrs = {},

    classes = [],

    slice = classes.slice,

    featureName, // used in testing loop


    /*>>teststyles*/
    // Inject element with style element and some CSS rules
    injectElementWithStyles = function( rule, callback, nodes, testnames ) {

      var style, ret, node, docOverflow,
          div = document.createElement('div'),
          // After page load injecting a fake body doesn't work so check if body exists
          body = document.body,
          // IE6 and 7 won't return offsetWidth or offsetHeight unless it's in the body element, so we fake it.
          fakeBody = body || document.createElement('body');

      if ( parseInt(nodes, 10) ) {
          // In order not to give false positives we create a node for each test
          // This also allows the method to scale for unspecified uses
          while ( nodes-- ) {
              node = document.createElement('div');
              node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
              div.appendChild(node);
          }
      }

      // <style> elements in IE6-9 are considered 'NoScope' elements and therefore will be removed
      // when injected with innerHTML. To get around this you need to prepend the 'NoScope' element
      // with a 'scoped' element, in our case the soft-hyphen entity as it won't mess with our measurements.
      // msdn.microsoft.com/en-us/library/ms533897%28VS.85%29.aspx
      // Documents served as xml will throw if using &shy; so use xml friendly encoded version. See issue #277
      style = ['&#173;','<style id="s', mod, '">', rule, '</style>'].join('');
      div.id = mod;
      // IE6 will false positive on some tests due to the style element inside the test div somehow interfering offsetHeight, so insert it into body or fakebody.
      // Opera will act all quirky when injecting elements in documentElement when page is served as xml, needs fakebody too. #270
      (body ? div : fakeBody).innerHTML += style;
      fakeBody.appendChild(div);
      if ( !body ) {
          //avoid crashing IE8, if background image is used
          fakeBody.style.background = '';
          //Safari 5.13/5.1.4 OSX stops loading if ::-webkit-scrollbar is used and scrollbars are visible
          fakeBody.style.overflow = 'hidden';
          docOverflow = docElement.style.overflow;
          docElement.style.overflow = 'hidden';
          docElement.appendChild(fakeBody);
      }

      ret = callback(div, rule);
      // If this is done after page load we don't want to remove the body so check if body exists
      if ( !body ) {
          fakeBody.parentNode.removeChild(fakeBody);
          docElement.style.overflow = docOverflow;
      } else {
          div.parentNode.removeChild(div);
      }

      return !!ret;

    },
    /*>>teststyles*/

    /*>>mq*/
    // adapted from matchMedia polyfill
    // by Scott Jehl and Paul Irish
    // gist.github.com/786768
    testMediaQuery = function( mq ) {

      var matchMedia = window.matchMedia || window.msMatchMedia;
      if ( matchMedia ) {
        return matchMedia(mq).matches;
      }

      var bool;

      injectElementWithStyles('@media ' + mq + ' { #' + mod + ' { position: absolute; } }', function( node ) {
        bool = (window.getComputedStyle ?
                  getComputedStyle(node, null) :
                  node.currentStyle)['position'] == 'absolute';
      });

      return bool;

     },
     /*>>mq*/


    /*>>hasevent*/
    //
    // isEventSupported determines if a given element supports the given event
    // kangax.github.com/iseventsupported/
    //
    // The following results are known incorrects:
    //   Modernizr.hasEvent("webkitTransitionEnd", elem) // false negative
    //   Modernizr.hasEvent("textInput") // in Webkit. github.com/Modernizr/Modernizr/issues/333
    //   ...
    isEventSupported = (function() {

      var TAGNAMES = {
        'select': 'input', 'change': 'input',
        'submit': 'form', 'reset': 'form',
        'error': 'img', 'load': 'img', 'abort': 'img'
      };

      function isEventSupported( eventName, element ) {

        element = element || document.createElement(TAGNAMES[eventName] || 'div');
        eventName = 'on' + eventName;

        // When using `setAttribute`, IE skips "unload", WebKit skips "unload" and "resize", whereas `in` "catches" those
        var isSupported = eventName in element;

        if ( !isSupported ) {
          // If it has no `setAttribute` (i.e. doesn't implement Node interface), try generic element
          if ( !element.setAttribute ) {
            element = document.createElement('div');
          }
          if ( element.setAttribute && element.removeAttribute ) {
            element.setAttribute(eventName, '');
            isSupported = is(element[eventName], 'function');

            // If property was created, "remove it" (by setting value to `undefined`)
            if ( !is(element[eventName], 'undefined') ) {
              element[eventName] = undefined;
            }
            element.removeAttribute(eventName);
          }
        }

        element = null;
        return isSupported;
      }
      return isEventSupported;
    })(),
    /*>>hasevent*/

    // TODO :: Add flag for hasownprop ? didn't last time

    // hasOwnProperty shim by kangax needed for Safari 2.0 support
    _hasOwnProperty = ({}).hasOwnProperty, hasOwnProp;

    if ( !is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined') ) {
      hasOwnProp = function (object, property) {
        return _hasOwnProperty.call(object, property);
      };
    }
    else {
      hasOwnProp = function (object, property) { /* yes, this can give false positives/negatives, but most of the time we don't care about those */
        return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
      };
    }

    // Adapted from ES5-shim https://github.com/kriskowal/es5-shim/blob/master/es5-shim.js
    // es5.github.com/#x15.3.4.5

    if (!Function.prototype.bind) {
      Function.prototype.bind = function bind(that) {

        var target = this;

        if (typeof target != "function") {
            throw new TypeError();
        }

        var args = slice.call(arguments, 1),
            bound = function () {

            if (this instanceof bound) {

              var F = function(){};
              F.prototype = target.prototype;
              var self = new F();

              var result = target.apply(
                  self,
                  args.concat(slice.call(arguments))
              );
              if (Object(result) === result) {
                  return result;
              }
              return self;

            } else {

              return target.apply(
                  that,
                  args.concat(slice.call(arguments))
              );

            }

        };

        return bound;
      };
    }

    /**
     * setCss applies given styles to the Modernizr DOM node.
     */
    function setCss( str ) {
        mStyle.cssText = str;
    }

    /**
     * setCssAll extrapolates all vendor-specific css strings.
     */
    function setCssAll( str1, str2 ) {
        return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
    }

    /**
     * is returns a boolean for if typeof obj is exactly type.
     */
    function is( obj, type ) {
        return typeof obj === type;
    }

    /**
     * contains returns a boolean for if substr is found within str.
     */
    function contains( str, substr ) {
        return !!~('' + str).indexOf(substr);
    }

    /*>>testprop*/

    // testProps is a generic CSS / DOM property test.

    // In testing support for a given CSS property, it's legit to test:
    //    `elem.style[styleName] !== undefined`
    // If the property is supported it will return an empty string,
    // if unsupported it will return undefined.

    // We'll take advantage of this quick test and skip setting a style
    // on our modernizr element, but instead just testing undefined vs
    // empty string.

    // Because the testing of the CSS property names (with "-", as
    // opposed to the camelCase DOM properties) is non-portable and
    // non-standard but works in WebKit and IE (but not Gecko or Opera),
    // we explicitly reject properties with dashes so that authors
    // developing in WebKit or IE first don't end up with
    // browser-specific content by accident.

    function testProps( props, prefixed ) {
        for ( var i in props ) {
            var prop = props[i];
            if ( !contains(prop, "-") && mStyle[prop] !== undefined ) {
                return prefixed == 'pfx' ? prop : true;
            }
        }
        return false;
    }
    /*>>testprop*/

    // TODO :: add testDOMProps
    /**
     * testDOMProps is a generic DOM property test; if a browser supports
     *   a certain property, it won't return undefined for it.
     */
    function testDOMProps( props, obj, elem ) {
        for ( var i in props ) {
            var item = obj[props[i]];
            if ( item !== undefined) {

                // return the property name as a string
                if (elem === false) return props[i];

                // let's bind a function
                if (is(item, 'function')){
                  // default to autobind unless override
                  return item.bind(elem || obj);
                }

                // return the unbound function or obj or value
                return item;
            }
        }
        return false;
    }

    /*>>testallprops*/
    /**
     * testPropsAll tests a list of DOM properties we want to check against.
     *   We specify literally ALL possible (known and/or likely) properties on
     *   the element including the non-vendor prefixed one, for forward-
     *   compatibility.
     */
    function testPropsAll( prop, prefixed, elem ) {

        var ucProp  = prop.charAt(0).toUpperCase() + prop.slice(1),
            props   = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

        // did they call .prefixed('boxSizing') or are we just testing a prop?
        if(is(prefixed, "string") || is(prefixed, "undefined")) {
          return testProps(props, prefixed);

        // otherwise, they called .prefixed('requestAnimationFrame', window[, elem])
        } else {
          props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
          return testDOMProps(props, prefixed, elem);
        }
    }
    /*>>testallprops*/


    /**
     * Tests
     * -----
     */

    // The *new* flexbox
    // dev.w3.org/csswg/css3-flexbox

    tests['flexbox'] = function() {
      return testPropsAll('flexWrap');
    };

    // The *old* flexbox
    // www.w3.org/TR/2009/WD-css3-flexbox-20090723/

    tests['flexboxlegacy'] = function() {
        return testPropsAll('boxDirection');
    };

    // On the S60 and BB Storm, getContext exists, but always returns undefined
    // so we actually have to call getContext() to verify
    // github.com/Modernizr/Modernizr/issues/issue/97/

    tests['canvas'] = function() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    };

    tests['canvastext'] = function() {
        return !!(Modernizr['canvas'] && is(document.createElement('canvas').getContext('2d').fillText, 'function'));
    };

    // webk.it/70117 is tracking a legit WebGL feature detect proposal

    // We do a soft detect which may false positive in order to avoid
    // an expensive context creation: bugzil.la/732441

    tests['webgl'] = function() {
        return !!window.WebGLRenderingContext;
    };

    /*
     * The Modernizr.touch test only indicates if the browser supports
     *    touch events, which does not necessarily reflect a touchscreen
     *    device, as evidenced by tablets running Windows 7 or, alas,
     *    the Palm Pre / WebOS (touch) phones.
     *
     * Additionally, Chrome (desktop) used to lie about its support on this,
     *    but that has since been rectified: crbug.com/36415
     *
     * We also test for Firefox 4 Multitouch Support.
     *
     * For more info, see: modernizr.github.com/Modernizr/touch.html
     */

    tests['touch'] = function() {
        var bool;

        if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
          bool = true;
        } else {
          injectElementWithStyles(['@media (',prefixes.join('touch-enabled),('),mod,')','{#modernizr{top:9px;position:absolute}}'].join(''), function( node ) {
            bool = node.offsetTop === 9;
          });
        }

        return bool;
    };


    // geolocation is often considered a trivial feature detect...
    // Turns out, it's quite tricky to get right:
    //
    // Using !!navigator.geolocation does two things we don't want. It:
    //   1. Leaks memory in IE9: github.com/Modernizr/Modernizr/issues/513
    //   2. Disables page caching in WebKit: webk.it/43956
    //
    // Meanwhile, in Firefox < 8, an about:config setting could expose
    // a false positive that would throw an exception: bugzil.la/688158

    tests['geolocation'] = function() {
        return 'geolocation' in navigator;
    };


    tests['postmessage'] = function() {
      return !!window.postMessage;
    };


    // Chrome incognito mode used to throw an exception when using openDatabase
    // It doesn't anymore.
    tests['websqldatabase'] = function() {
      return !!window.openDatabase;
    };

    // Vendors had inconsistent prefixing with the experimental Indexed DB:
    // - Webkit's implementation is accessible through webkitIndexedDB
    // - Firefox shipped moz_indexedDB before FF4b9, but since then has been mozIndexedDB
    // For speed, we don't test the legacy (and beta-only) indexedDB
    tests['indexedDB'] = function() {
      return !!testPropsAll("indexedDB", window);
    };

    // documentMode logic from YUI to filter out IE8 Compat Mode
    //   which false positives.
    tests['hashchange'] = function() {
      return isEventSupported('hashchange', window) && (document.documentMode === undefined || document.documentMode > 7);
    };

    // Per 1.6:
    // This used to be Modernizr.historymanagement but the longer
    // name has been deprecated in favor of a shorter and property-matching one.
    // The old API is still available in 1.6, but as of 2.0 will throw a warning,
    // and in the first release thereafter disappear entirely.
    tests['history'] = function() {
      return !!(window.history && history.pushState);
    };

    tests['draganddrop'] = function() {
        var div = document.createElement('div');
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
    };

    // FF3.6 was EOL'ed on 4/24/12, but the ESR version of FF10
    // will be supported until FF19 (2/12/13), at which time, ESR becomes FF17.
    // FF10 still uses prefixes, so check for it until then.
    // for more ESR info, see: mozilla.org/en-US/firefox/organizations/faq/
    tests['websockets'] = function() {
        return 'WebSocket' in window || 'MozWebSocket' in window;
    };


    // css-tricks.com/rgba-browser-support/
    tests['rgba'] = function() {
        // Set an rgba() color and check the returned value

        setCss('background-color:rgba(150,255,150,.5)');

        return contains(mStyle.backgroundColor, 'rgba');
    };

    tests['hsla'] = function() {
        // Same as rgba(), in fact, browsers re-map hsla() to rgba() internally,
        //   except IE9 who retains it as hsla

        setCss('background-color:hsla(120,40%,100%,.5)');

        return contains(mStyle.backgroundColor, 'rgba') || contains(mStyle.backgroundColor, 'hsla');
    };

    tests['multiplebgs'] = function() {
        // Setting multiple images AND a color on the background shorthand property
        //  and then querying the style.background property value for the number of
        //  occurrences of "url(" is a reliable method for detecting ACTUAL support for this!

        setCss('background:url(https://),url(https://),red url(https://)');

        // If the UA supports multiple backgrounds, there should be three occurrences
        //   of the string "url(" in the return value for elemStyle.background

        return (/(url\s*\(.*?){3}/).test(mStyle.background);
    };



    // this will false positive in Opera Mini
    //   github.com/Modernizr/Modernizr/issues/396

    tests['backgroundsize'] = function() {
        return testPropsAll('backgroundSize');
    };

    tests['borderimage'] = function() {
        return testPropsAll('borderImage');
    };


    // Super comprehensive table about all the unique implementations of
    // border-radius: muddledramblings.com/table-of-css3-border-radius-compliance

    tests['borderradius'] = function() {
        return testPropsAll('borderRadius');
    };

    // WebOS unfortunately false positives on this test.
    tests['boxshadow'] = function() {
        return testPropsAll('boxShadow');
    };

    // FF3.0 will false positive on this test
    tests['textshadow'] = function() {
        return document.createElement('div').style.textShadow === '';
    };


    tests['opacity'] = function() {
        // Browsers that actually have CSS Opacity implemented have done so
        //  according to spec, which means their return values are within the
        //  range of [0.0,1.0] - including the leading zero.

        setCssAll('opacity:.55');

        // The non-literal . in this regex is intentional:
        //   German Chrome returns this value as 0,55
        // github.com/Modernizr/Modernizr/issues/#issue/59/comment/516632
        return (/^0.55$/).test(mStyle.opacity);
    };


    // Note, Android < 4 will pass this test, but can only animate
    //   a single property at a time
    //   daneden.me/2011/12/putting-up-with-androids-bullshit/
    tests['cssanimations'] = function() {
        return testPropsAll('animationName');
    };


    tests['csscolumns'] = function() {
        return testPropsAll('columnCount');
    };


    tests['cssgradients'] = function() {
        /**
         * For CSS Gradients syntax, please see:
         * webkit.org/blog/175/introducing-css-gradients/
         * developer.mozilla.org/en/CSS/-moz-linear-gradient
         * developer.mozilla.org/en/CSS/-moz-radial-gradient
         * dev.w3.org/csswg/css3-images/#gradients-
         */

        var str1 = 'background-image:',
            str2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));',
            str3 = 'linear-gradient(left top,#9f9, white);';

        setCss(
             // legacy webkit syntax (FIXME: remove when syntax not in use anymore)
              (str1 + '-webkit- '.split(' ').join(str2 + str1) +
             // standard syntax             // trailing 'background-image:'
              prefixes.join(str3 + str1)).slice(0, -str1.length)
        );

        return contains(mStyle.backgroundImage, 'gradient');
    };


    tests['cssreflections'] = function() {
        return testPropsAll('boxReflect');
    };


    tests['csstransforms'] = function() {
        return !!testPropsAll('transform');
    };


    tests['csstransforms3d'] = function() {

        var ret = !!testPropsAll('perspective');

        // Webkit's 3D transforms are passed off to the browser's own graphics renderer.
        //   It works fine in Safari on Leopard and Snow Leopard, but not in Chrome in
        //   some conditions. As a result, Webkit typically recognizes the syntax but
        //   will sometimes throw a false positive, thus we must do a more thorough check:
        if ( ret && 'webkitPerspective' in docElement.style ) {

          // Webkit allows this media query to succeed only if the feature is enabled.
          // `@media (transform-3d),(-webkit-transform-3d){ ... }`
          injectElementWithStyles('@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}', function( node, rule ) {
            ret = node.offsetLeft === 9 && node.offsetHeight === 3;
          });
        }
        return ret;
    };


    tests['csstransitions'] = function() {
        return testPropsAll('transition');
    };


    /*>>fontface*/
    // @font-face detection routine by Diego Perini
    // javascript.nwbox.com/CSSSupport/

    // false positives:
    //   WebOS github.com/Modernizr/Modernizr/issues/342
    //   WP7   github.com/Modernizr/Modernizr/issues/538
    tests['fontface'] = function() {
        var bool;

        injectElementWithStyles('@font-face {font-family:"font";src:url("https://")}', function( node, rule ) {
          var style = document.getElementById('smodernizr'),
              sheet = style.sheet || style.styleSheet,
              cssText = sheet ? (sheet.cssRules && sheet.cssRules[0] ? sheet.cssRules[0].cssText : sheet.cssText || '') : '';

          bool = /src/i.test(cssText) && cssText.indexOf(rule.split(' ')[0]) === 0;
        });

        return bool;
    };
    /*>>fontface*/

    // CSS generated content detection
    tests['generatedcontent'] = function() {
        var bool;

        injectElementWithStyles(['#',mod,'{font:0/0 a}#',mod,':after{content:"',smile,'";visibility:hidden;font:3px/1 a}'].join(''), function( node ) {
          bool = node.offsetHeight >= 3;
        });

        return bool;
    };



    // These tests evaluate support of the video/audio elements, as well as
    // testing what types of content they support.
    //
    // We're using the Boolean constructor here, so that we can extend the value
    // e.g.  Modernizr.video     // true
    //       Modernizr.video.ogg // 'probably'
    //
    // Codec values from : github.com/NielsLeenheer/html5test/blob/9106a8/index.html#L845
    //                     thx to NielsLeenheer and zcorpan

    // Note: in some older browsers, "no" was a return value instead of empty string.
    //   It was live in FF3.5.0 and 3.5.1, but fixed in 3.5.2
    //   It was also live in Safari 4.0.0 - 4.0.4, but fixed in 4.0.5

    tests['video'] = function() {
        var elem = document.createElement('video'),
            bool = false;

        // IE9 Running on Windows Server SKU can cause an exception to be thrown, bug #224
        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('video/ogg; codecs="theora"')      .replace(/^no$/,'');

                // Without QuickTime, this value will be `undefined`. github.com/Modernizr/Modernizr/issues/546
                bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"') .replace(/^no$/,'');

                bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,'');
            }

        } catch(e) { }

        return bool;
    };

    tests['audio'] = function() {
        var elem = document.createElement('audio'),
            bool = false;

        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,'');
                bool.mp3  = elem.canPlayType('audio/mpeg;')               .replace(/^no$/,'');

                // Mimetypes accepted:
                //   developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
                //   bit.ly/iphoneoscodecs
                bool.wav  = elem.canPlayType('audio/wav; codecs="1"')     .replace(/^no$/,'');
                bool.m4a  = ( elem.canPlayType('audio/x-m4a;')            ||
                              elem.canPlayType('audio/aac;'))             .replace(/^no$/,'');
            }
        } catch(e) { }

        return bool;
    };


    // In FF4, if disabled, window.localStorage should === null.

    // Normally, we could not test that directly and need to do a
    //   `('localStorage' in window) && ` test first because otherwise Firefox will
    //   throw bugzil.la/365772 if cookies are disabled

    // Also in iOS5 Private Browsing mode, attempting to use localStorage.setItem
    // will throw the exception:
    //   QUOTA_EXCEEDED_ERRROR DOM Exception 22.
    // Peculiarly, getItem and removeItem calls do not throw.

    // Because we are forced to try/catch this, we'll go aggressive.

    // Just FWIW: IE8 Compat mode supports these features completely:
    //   www.quirksmode.org/dom/html5.html
    // But IE8 doesn't support either with local files

    tests['localstorage'] = function() {
        try {
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };

    tests['sessionstorage'] = function() {
        try {
            sessionStorage.setItem(mod, mod);
            sessionStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };


    tests['webworkers'] = function() {
        return !!window.Worker;
    };


    tests['applicationcache'] = function() {
        return !!window.applicationCache;
    };


    // Thanks to Erik Dahlstrom
    tests['svg'] = function() {
        return !!document.createElementNS && !!document.createElementNS(ns.svg, 'svg').createSVGRect;
    };

    // specifically for SVG inline in HTML, not within XHTML
    // test page: paulirish.com/demo/inline-svg
    tests['inlinesvg'] = function() {
      var div = document.createElement('div');
      div.innerHTML = '<svg/>';
      return (div.firstChild && div.firstChild.namespaceURI) == ns.svg;
    };

    // SVG SMIL animation
    tests['smil'] = function() {
        return !!document.createElementNS && /SVGAnimate/.test(toString.call(document.createElementNS(ns.svg, 'animate')));
    };

    // This test is only for clip paths in SVG proper, not clip paths on HTML content
    // demo: srufaculty.sru.edu/david.dailey/svg/newstuff/clipPath4.svg

    // However read the comments to dig into applying SVG clippaths to HTML content here:
    //   github.com/Modernizr/Modernizr/issues/213#issuecomment-1149491
    tests['svgclippaths'] = function() {
        return !!document.createElementNS && /SVGClipPath/.test(toString.call(document.createElementNS(ns.svg, 'clipPath')));
    };

    /*>>webforms*/
    // input features and input types go directly onto the ret object, bypassing the tests loop.
    // Hold this guy to execute in a moment.
    function webforms() {
        /*>>input*/
        // Run through HTML5's new input attributes to see if the UA understands any.
        // We're using f which is the <input> element created early on
        // Mike Taylr has created a comprehensive resource for testing these attributes
        //   when applied to all input types:
        //   miketaylr.com/code/input-type-attr.html
        // spec: www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#input-type-attr-summary

        // Only input placeholder is tested while textarea's placeholder is not.
        // Currently Safari 4 and Opera 11 have support only for the input placeholder
        // Both tests are available in feature-detects/forms-placeholder.js
        Modernizr['input'] = (function( props ) {
            for ( var i = 0, len = props.length; i < len; i++ ) {
                attrs[ props[i] ] = !!(props[i] in inputElem);
            }
            if (attrs.list){
              // safari false positive's on datalist: webk.it/74252
              // see also github.com/Modernizr/Modernizr/issues/146
              attrs.list = !!(document.createElement('datalist') && window.HTMLDataListElement);
            }
            return attrs;
        })('autocomplete autofocus list placeholder max min multiple pattern required step'.split(' '));
        /*>>input*/

        /*>>inputtypes*/
        // Run through HTML5's new input types to see if the UA understands any.
        //   This is put behind the tests runloop because it doesn't return a
        //   true/false like all the other tests; instead, it returns an object
        //   containing each input type with its corresponding true/false value

        // Big thanks to @miketaylr for the html5 forms expertise. miketaylr.com/
        Modernizr['inputtypes'] = (function(props) {

            for ( var i = 0, bool, inputElemType, defaultView, len = props.length; i < len; i++ ) {

                inputElem.setAttribute('type', inputElemType = props[i]);
                bool = inputElem.type !== 'text';

                // We first check to see if the type we give it sticks..
                // If the type does, we feed it a textual value, which shouldn't be valid.
                // If the value doesn't stick, we know there's input sanitization which infers a custom UI
                if ( bool ) {

                    inputElem.value         = smile;
                    inputElem.style.cssText = 'position:absolute;visibility:hidden;';

                    if ( /^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined ) {

                      docElement.appendChild(inputElem);
                      defaultView = document.defaultView;

                      // Safari 2-4 allows the smiley as a value, despite making a slider
                      bool =  defaultView.getComputedStyle &&
                              defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== 'textfield' &&
                              // Mobile android web browser has false positive, so must
                              // check the height to see if the widget is actually there.
                              (inputElem.offsetHeight !== 0);

                      docElement.removeChild(inputElem);

                    } else if ( /^(search|tel)$/.test(inputElemType) ){
                      // Spec doesn't define any special parsing or detectable UI
                      //   behaviors so we pass these through as true

                      // Interestingly, opera fails the earlier test, so it doesn't
                      //  even make it here.

                    } else if ( /^(url|email)$/.test(inputElemType) ) {
                      // Real url and email support comes with prebaked validation.
                      bool = inputElem.checkValidity && inputElem.checkValidity() === false;

                    } else {
                      // If the upgraded input compontent rejects the :) text, we got a winner
                      bool = inputElem.value != smile;
                    }
                }

                inputs[ props[i] ] = !!bool;
            }
            return inputs;
        })('search tel url email datetime date month week time datetime-local number range color'.split(' '));
        /*>>inputtypes*/
    }
    /*>>webforms*/


    // End of test definitions
    // -----------------------



    // Run through all tests and detect their support in the current UA.
    // todo: hypothetically we could be doing an array of tests and use a basic loop here.
    for ( var feature in tests ) {
        if ( hasOwnProp(tests, feature) ) {
            // run the test, throw the return value into the Modernizr,
            //   then based on that boolean, define an appropriate className
            //   and push it into an array of classes we'll join later.
            featureName  = feature.toLowerCase();
            Modernizr[featureName] = tests[feature]();

            classes.push((Modernizr[featureName] ? '' : 'no-') + featureName);
        }
    }

    /*>>webforms*/
    // input tests need to run.
    Modernizr.input || webforms();
    /*>>webforms*/


    /**
     * addTest allows the user to define their own feature tests
     * the result will be added onto the Modernizr object,
     * as well as an appropriate className set on the html element
     *
     * @param feature - String naming the feature
     * @param test - Function returning true if feature is supported, false if not
     */
     Modernizr.addTest = function ( feature, test ) {
       if ( typeof feature == 'object' ) {
         for ( var key in feature ) {
           if ( hasOwnProp( feature, key ) ) {
             Modernizr.addTest( key, feature[ key ] );
           }
         }
       } else {

         feature = feature.toLowerCase();

         if ( Modernizr[feature] !== undefined ) {
           // we're going to quit if you're trying to overwrite an existing test
           // if we were to allow it, we'd do this:
           //   var re = new RegExp("\\b(no-)?" + feature + "\\b");
           //   docElement.className = docElement.className.replace( re, '' );
           // but, no rly, stuff 'em.
           return Modernizr;
         }

         test = typeof test == 'function' ? test() : test;

         if (typeof enableClasses !== "undefined" && enableClasses) {
           docElement.className += ' ' + (test ? '' : 'no-') + feature;
         }
         Modernizr[feature] = test;

       }

       return Modernizr; // allow chaining.
     };


    // Reset modElem.cssText to nothing to reduce memory footprint.
    setCss('');
    modElem = inputElem = null;

    /*>>shiv*/
    /**
     * @preserve HTML5 Shiv prev3.7.1 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
     */
    ;(function(window, document) {
        /*jshint evil:true */
        /** version */
        var version = '3.7.0';

        /** Preset options */
        var options = window.html5 || {};

        /** Used to skip problem elements */
        var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

        /** Not all elements can be cloned in IE **/
        var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

        /** Detect whether the browser supports default html5 styles */
        var supportsHtml5Styles;

        /** Name of the expando, to work with multiple documents or to re-shiv one document */
        var expando = '_html5shiv';

        /** The id for the the documents expando */
        var expanID = 0;

        /** Cached data for each document */
        var expandoData = {};

        /** Detect whether the browser supports unknown elements */
        var supportsUnknownElements;

        (function() {
          try {
            var a = document.createElement('a');
            a.innerHTML = '<xyz></xyz>';
            //if the hidden property is implemented we can assume, that the browser supports basic HTML5 Styles
            supportsHtml5Styles = ('hidden' in a);

            supportsUnknownElements = a.childNodes.length == 1 || (function() {
              // assign a false positive if unable to shiv
              (document.createElement)('a');
              var frag = document.createDocumentFragment();
              return (
                typeof frag.cloneNode == 'undefined' ||
                typeof frag.createDocumentFragment == 'undefined' ||
                typeof frag.createElement == 'undefined'
              );
            }());
          } catch(e) {
            // assign a false positive if detection fails => unable to shiv
            supportsHtml5Styles = true;
            supportsUnknownElements = true;
          }

        }());

        /*--------------------------------------------------------------------------*/

        /**
         * Creates a style sheet with the given CSS text and adds it to the document.
         * @private
         * @param {Document} ownerDocument The document.
         * @param {String} cssText The CSS text.
         * @returns {StyleSheet} The style element.
         */
        function addStyleSheet(ownerDocument, cssText) {
          var p = ownerDocument.createElement('p'),
          parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

          p.innerHTML = 'x<style>' + cssText + '</style>';
          return parent.insertBefore(p.lastChild, parent.firstChild);
        }

        /**
         * Returns the value of `html5.elements` as an array.
         * @private
         * @returns {Array} An array of shived element node names.
         */
        function getElements() {
          var elements = html5.elements;
          return typeof elements == 'string' ? elements.split(' ') : elements;
        }

        /**
         * Returns the data associated to the given document
         * @private
         * @param {Document} ownerDocument The document.
         * @returns {Object} An object of data.
         */
        function getExpandoData(ownerDocument) {
          var data = expandoData[ownerDocument[expando]];
          if (!data) {
            data = {};
            expanID++;
            ownerDocument[expando] = expanID;
            expandoData[expanID] = data;
          }
          return data;
        }

        /**
         * returns a shived element for the given nodeName and document
         * @memberOf html5
         * @param {String} nodeName name of the element
         * @param {Document} ownerDocument The context document.
         * @returns {Object} The shived element.
         */
        function createElement(nodeName, ownerDocument, data){
          if (!ownerDocument) {
            ownerDocument = document;
          }
          if(supportsUnknownElements){
            return ownerDocument.createElement(nodeName);
          }
          if (!data) {
            data = getExpandoData(ownerDocument);
          }
          var node;

          if (data.cache[nodeName]) {
            node = data.cache[nodeName].cloneNode();
          } else if (saveClones.test(nodeName)) {
            node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
          } else {
            node = data.createElem(nodeName);
          }

          // Avoid adding some elements to fragments in IE < 9 because
          // * Attributes like `name` or `type` cannot be set/changed once an element
          //   is inserted into a document/fragment
          // * Link elements with `src` attributes that are inaccessible, as with
          //   a 403 response, will cause the tab/window to crash
          // * Script elements appended to fragments will execute when their `src`
          //   or `text` property is set
          return node.canHaveChildren && !reSkip.test(nodeName) && !node.tagUrn ? data.frag.appendChild(node) : node;
        }

        /**
         * returns a shived DocumentFragment for the given document
         * @memberOf html5
         * @param {Document} ownerDocument The context document.
         * @returns {Object} The shived DocumentFragment.
         */
        function createDocumentFragment(ownerDocument, data){
          if (!ownerDocument) {
            ownerDocument = document;
          }
          if(supportsUnknownElements){
            return ownerDocument.createDocumentFragment();
          }
          data = data || getExpandoData(ownerDocument);
          var clone = data.frag.cloneNode(),
          i = 0,
          elems = getElements(),
          l = elems.length;
          for(;i<l;i++){
            clone.createElement(elems[i]);
          }
          return clone;
        }

        /**
         * Shivs the `createElement` and `createDocumentFragment` methods of the document.
         * @private
         * @param {Document|DocumentFragment} ownerDocument The document.
         * @param {Object} data of the document.
         */
        function shivMethods(ownerDocument, data) {
          if (!data.cache) {
            data.cache = {};
            data.createElem = ownerDocument.createElement;
            data.createFrag = ownerDocument.createDocumentFragment;
            data.frag = data.createFrag();
          }


          ownerDocument.createElement = function(nodeName) {
            //abort shiv
            if (!html5.shivMethods) {
              return data.createElem(nodeName);
            }
            return createElement(nodeName, ownerDocument, data);
          };

          ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' +
                                                          'var n=f.cloneNode(),c=n.createElement;' +
                                                          'h.shivMethods&&(' +
                                                          // unroll the `createElement` calls
                                                          getElements().join().replace(/[\w\-]+/g, function(nodeName) {
            data.createElem(nodeName);
            data.frag.createElement(nodeName);
            return 'c("' + nodeName + '")';
          }) +
            ');return n}'
                                                         )(html5, data.frag);
        }

        /*--------------------------------------------------------------------------*/

        /**
         * Shivs the given document.
         * @memberOf html5
         * @param {Document} ownerDocument The document to shiv.
         * @returns {Document} The shived document.
         */
        function shivDocument(ownerDocument) {
          if (!ownerDocument) {
            ownerDocument = document;
          }
          var data = getExpandoData(ownerDocument);

          if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
            data.hasCSS = !!addStyleSheet(ownerDocument,
                                          // corrects block display not defined in IE6/7/8/9
                                          'article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}' +
                                            // adds styling not present in IE6/7/8/9
                                            'mark{background:#FF0;color:#000}' +
                                            // hides non-rendered elements
                                            'template{display:none}'
                                         );
          }
          if (!supportsUnknownElements) {
            shivMethods(ownerDocument, data);
          }
          return ownerDocument;
        }

        /*--------------------------------------------------------------------------*/

        /**
         * The `html5` object is exposed so that more elements can be shived and
         * existing shiving can be detected on iframes.
         * @type Object
         * @example
         *
         * // options can be changed before the script is included
         * html5 = { 'elements': 'mark section', 'shivCSS': false, 'shivMethods': false };
         */
        var html5 = {

          /**
           * An array or space separated string of node names of the elements to shiv.
           * @memberOf html5
           * @type Array|String
           */
          'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video',

          /**
           * current version of html5shiv
           */
          'version': version,

          /**
           * A flag to indicate that the HTML5 style sheet should be inserted.
           * @memberOf html5
           * @type Boolean
           */
          'shivCSS': (options.shivCSS !== false),

          /**
           * Is equal to true if a browser supports creating unknown/HTML5 elements
           * @memberOf html5
           * @type boolean
           */
          'supportsUnknownElements': supportsUnknownElements,

          /**
           * A flag to indicate that the document's `createElement` and `createDocumentFragment`
           * methods should be overwritten.
           * @memberOf html5
           * @type Boolean
           */
          'shivMethods': (options.shivMethods !== false),

          /**
           * A string to describe the type of `html5` object ("default" or "default print").
           * @memberOf html5
           * @type String
           */
          'type': 'default',

          // shivs the document according to the specified `html5` object options
          'shivDocument': shivDocument,

          //creates a shived element
          createElement: createElement,

          //creates a shived documentFragment
          createDocumentFragment: createDocumentFragment
        };

        /*--------------------------------------------------------------------------*/

        // expose html5
        window.html5 = html5;

        // shiv the document
        shivDocument(document);

    }(this, document));
    /*>>shiv*/

    // Assign private properties to the return object with prefix
    Modernizr._version      = version;

    // expose these for the plugin API. Look in the source for how to join() them against your input
    /*>>prefixes*/
    Modernizr._prefixes     = prefixes;
    /*>>prefixes*/
    /*>>domprefixes*/
    Modernizr._domPrefixes  = domPrefixes;
    Modernizr._cssomPrefixes  = cssomPrefixes;
    /*>>domprefixes*/

    /*>>mq*/
    // Modernizr.mq tests a given media query, live against the current state of the window
    // A few important notes:
    //   * If a browser does not support media queries at all (eg. oldIE) the mq() will always return false
    //   * A max-width or orientation query will be evaluated against the current state, which may change later.
    //   * You must specify values. Eg. If you are testing support for the min-width media query use:
    //       Modernizr.mq('(min-width:0)')
    // usage:
    // Modernizr.mq('only screen and (max-width:768)')
    Modernizr.mq            = testMediaQuery;
    /*>>mq*/

    /*>>hasevent*/
    // Modernizr.hasEvent() detects support for a given event, with an optional element to test on
    // Modernizr.hasEvent('gesturestart', elem)
    Modernizr.hasEvent      = isEventSupported;
    /*>>hasevent*/

    /*>>testprop*/
    // Modernizr.testProp() investigates whether a given style property is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testProp('pointerEvents')
    Modernizr.testProp      = function(prop){
        return testProps([prop]);
    };
    /*>>testprop*/

    /*>>testallprops*/
    // Modernizr.testAllProps() investigates whether a given style property,
    //   or any of its vendor-prefixed variants, is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testAllProps('boxSizing')
    Modernizr.testAllProps  = testPropsAll;
    /*>>testallprops*/


    /*>>teststyles*/
    // Modernizr.testStyles() allows you to add custom styles to the document and test an element afterwards
    // Modernizr.testStyles('#modernizr { position:absolute }', function(elem, rule){ ... })
    Modernizr.testStyles    = injectElementWithStyles;
    /*>>teststyles*/


    /*>>prefixed*/
    // Modernizr.prefixed() returns the prefixed or nonprefixed property name variant of your input
    // Modernizr.prefixed('boxSizing') // 'MozBoxSizing'

    // Properties must be passed as dom-style camelcase, rather than `box-sizing` hypentated style.
    // Return values will also be the camelCase variant, if you need to translate that to hypenated style use:
    //
    //     str.replace(/([A-Z])/g, function(str,m1){ return '-' + m1.toLowerCase(); }).replace(/^ms-/,'-ms-');

    // If you're trying to ascertain which transition end event to bind to, you might do something like...
    //
    //     var transEndEventNames = {
    //       'WebkitTransition' : 'webkitTransitionEnd',
    //       'MozTransition'    : 'transitionend',
    //       'OTransition'      : 'oTransitionEnd',
    //       'msTransition'     : 'MSTransitionEnd',
    //       'transition'       : 'transitionend'
    //     },
    //     transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];

    Modernizr.prefixed      = function(prop, obj, elem){
      if(!obj) {
        return testPropsAll(prop, 'pfx');
      } else {
        // Testing DOM property e.g. Modernizr.prefixed('requestAnimationFrame', window) // 'mozRequestAnimationFrame'
        return testPropsAll(prop, obj, elem);
      }
    };
    /*>>prefixed*/


    /*>>cssclasses*/
    // Remove "no-js" class from <html> element, if it exists:
    docElement.className = docElement.className.replace(/(^|\s)no-js(\s|$)/, '$1$2') +

                            // Add the new classes to the <html> element.
                            (enableClasses ? ' js ' + classes.join(' ') : '');
    /*>>cssclasses*/

    return Modernizr;

})(this, this.document);
/**
 * @copyright (c) 2011, Yahoo! Inc.  All rights reserved.
 * @copyright (c) 2012, Log-Normal, Inc.  All rights reserved.
 * @copyright (c) 2012-2017, SOASTA, Inc. All rights reserved.
 * @copyright (c) 2017, Akamai Technologies, Inc. All rights reserved.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE.txt file for terms.
 */

/**
 * @class BOOMR
 * @desc
 * boomerang measures various performance characteristics of your user's browsing
 * experience and beacons it back to your server.
 *
 * To use this you'll need a web site, lots of users and the ability to do
 * something with the data you collect.  How you collect the data is up to
 * you, but we have a few ideas.
 *
 * Everything in boomerang is accessed through the `BOOMR` object, which is
 * available on `window.BOOMR`.  It contains the public API, utility functions
 * ({@link BOOMR.utils}) and all of the plugins ({@link BOOMR.plugins}).
 *
 * Each plugin has its  own API, but is reachable through {@link BOOMR.plugins}.
 *
 * ## Beacon Parameters
 *
 * The core boomerang object will add the following parameters to the beacon.
 *
 * Note that each individual {@link BOOMR.plugins plugin} will add its own
 * parameters as well.
 *
 * * `v`: Boomerang version
 * * `sv`: Boomerang Loader Snippet version
 * * `sm`: Boomerang Loader Snippet method
 * * `u`: The page's URL (for most beacons), or the `XMLHttpRequest` URL
 * * `pgu`: The page's URL (for `XMLHttpRequest` beacons)
 * * `pid`: Page ID (8 characters)
 * * `r`: Navigation referrer (from `document.location`)
 * * `vis.pre`: `1` if the page transitioned from prerender to visible
 * * `xhr.pg`: The `XMLHttpRequest` page group
 * * `errors`: Error messages of errors detected in Boomerang code, separated by a newline
 */

/**
 * @typedef TimeStamp
 * @type {number}
 *
 * @desc
 * A [Unix Epoch](https://en.wikipedia.org/wiki/Unix_time) timestamp (milliseconds
 * since 1970) created by [BOOMR.now()]{@link BOOMR.now}.
 *
 * If `DOMHighResTimeStamp` (`performance.now()`) is supported, it is
 * a `DOMHighResTimeStamp` (with microsecond resolution in the fractional),
 * otherwise, it is `Date.now()`.
 */


/**
 * @global
 * @type {TimeStamp}
 * @desc
 * Timestamp the boomerang.js script started executing.
 *
 * This has to be global so that we don't wait for this entire
 * script to download and execute before measuring the
 * time.  We also declare it without `var` so that we can later
 * `delete` it.  This is the only way that works on Internet Explorer.
 */
BOOMR_start = new Date().getTime();

/**
 * @function
 * @global
 * @desc
 * Check the value of `document.domain` and fix it if incorrect.
 *
 * This function is run at the top of boomerang, and then whenever
 * {@link BOOMR.init} is called.  If boomerang is running within an IFRAME, this
 * function checks to see if it can access elements in the parent
 * IFRAME.  If not, it will fudge around with `document.domain` until
 * it finds a value that works.
 *
 * This allows site owners to change the value of `document.domain` at
 * any point within their page's load process, and we will adapt to
 * it.
 *
 * @param {string} domain Domain name as retrieved from page URL
 */
function BOOMR_check_doc_domain(domain) {
	/*eslint no-unused-vars:0*/
	var test;


	if (!window) {
		return;
	}

	// If domain is not passed in, then this is a global call
	// domain is only passed in if we call ourselves, so we
	// skip the frame check at that point
	if (!domain) {
		// If we're running in the main window, then we don't need this
		if (window.parent === window || !document.getElementById("boomr-if-as")) {
			return;// true;	// nothing to do
		}

		if (window.BOOMR && BOOMR.boomerang_frame && BOOMR.window) {
			try {
				// If document.domain is changed during page load (from www.blah.com to blah.com, for example),
				// BOOMR.window.location.href throws "Permission Denied" in IE.
				// Resetting the inner domain to match the outer makes location accessible once again
				if (BOOMR.boomerang_frame.document.domain !== BOOMR.window.document.domain) {
					BOOMR.boomerang_frame.document.domain = BOOMR.window.document.domain;
				}
			}
			catch (err) {
				if (!BOOMR.isCrossOriginError(err)) {
					BOOMR.addError(err, "BOOMR_check_doc_domain.domainFix");
				}
			}
		}
		domain = document.domain;
	}

	if (!domain || domain.indexOf(".") === -1) {
		return;// false;	// not okay, but we did our best
	}

	// window.parent might be null if we're running during unload from
	// a detached iframe
	if (!window.parent) {
		return;
	}

	// 1. Test without setting document.domain
	try {
		test = window.parent.document;
		return;// test !== undefined;	// all okay
	}
	// 2. Test with document.domain
	catch (err) {
		try {
			document.domain = domain;
		}
		catch (err2) {
			// An exception might be thrown if the document is unloaded
			// or when the domain is incorrect.  If so, we can't do anything
			// more, so bail.
			return;
		}
	}

	try {
		test = window.parent.document;
		return;// test !== undefined;	// all okay
	}
	// 3. Strip off leading part and try again
	catch (err) {
		domain = domain.replace(/^[\w\-]+\./, "");
	}

	BOOMR_check_doc_domain(domain);
}

BOOMR_check_doc_domain();

// Construct BOOMR
// w is window
(function(w) {
	var impl, boomr, d, createCustomEvent, dispatchEvent, visibilityState, visibilityChange, orig_w = w;

	// If the window that boomerang is running in is not top level (ie, we're running in an iframe)
	// and if this iframe contains a script node with an id of "boomr-if-as",
	// Then that indicates that we are using the iframe loader, so the page we're trying to measure
	// is w.parent
	//
	// Note that we use `document` rather than `w.document` because we're specifically interested in
	// the document of the currently executing context rather than a passed in proxy.
	//
	// The only other place we do this is in `BOOMR.utils.getMyURL` below, for the same reason, we
	// need the full URL of the currently executing (boomerang) script.
	if (w.parent !== w &&
	    document.getElementById("boomr-if-as") &&
	    document.getElementById("boomr-if-as").nodeName.toLowerCase() === "script") {
		w = w.parent;
	}

	d = w.document;

	// Short namespace because I don't want to keep typing BOOMERANG
	if (!w.BOOMR) {
		w.BOOMR = {};
	}

	BOOMR = w.BOOMR;

	// don't allow this code to be included twice
	if (BOOMR.version) {
		return;
	}

	/**
	 * Boomerang version, formatted as major.minor.patchlevel.
	 *
	 * This variable is replaced during build (`grunt build`).
	 *
	 * @type {string}
	 *
	 * @memberof BOOMR
	 */
	BOOMR.version = "1.0.0";

	/**
	 * The main document window.
	 * * If Boomerang was loaded in an IFRAME, this is the parent window
	 * * If Boomerang was loaded inline, this is the current window
	 *
	 * @type {Window}
	 *
	 * @memberof BOOMR
	 */
	BOOMR.window = w;

	/**
	 * The Boomerang frame:
	 * * If Boomerang was loaded in an IFRAME, this is the IFRAME
	 * * If Boomerang was loaded inline, this is the current window
	 *
	 * @type {Window}
	 *
	 * @memberof BOOMR
	 */
	BOOMR.boomerang_frame = orig_w;

	/**
	 * @class BOOMR.plugins
	 * @desc
	 * Boomerang plugin namespace.
	 *
	 * All plugins should add their plugin object to `BOOMR.plugins`.
	 *
	 * A plugin should have, at minimum, the following exported functions:
	 * * `init(config)`
	 * * `is_complete()`
	 *
	 * See {@tutorial creating-plugins} for details.
	 */
	if (!BOOMR.plugins) {
		BOOMR.plugins = {};
	}

	// CustomEvent proxy for IE9 & 10 from https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
	(function() {
		try {
			if (new w.CustomEvent("CustomEvent") !== undefined) {
				createCustomEvent = function(e_name, params) {
					return new w.CustomEvent(e_name, params);
				};
			}
		}
		catch (ignore) {
			// empty
		}

		try {
			if (!createCustomEvent && d.createEvent && d.createEvent("CustomEvent")) {
				createCustomEvent = function(e_name, params) {
					var evt = d.createEvent("CustomEvent");
					params = params || { cancelable: false, bubbles: false };
					evt.initCustomEvent(e_name, params.bubbles, params.cancelable, params.detail);

					return evt;
				};
			}
		}
		catch (ignore) {
			// empty
		}

		if (!createCustomEvent && d.createEventObject) {
			createCustomEvent = function(e_name, params) {
				var evt = d.createEventObject();
				evt.type = evt.propertyName = e_name;
				evt.detail = params.detail;

				return evt;
			};
		}

		if (!createCustomEvent) {
			createCustomEvent = function() { return undefined; };
		}
	}());

	/**
	 * Dispatch a custom event to the browser
	 * @param {string} e_name The custom event name that consumers can subscribe to
	 * @param {object} e_data Any data passed to subscribers of the custom event via the `event.detail` property
	 * @param {boolean} async By default, custom events are dispatched immediately.
	 * Set to true if the event should be dispatched once the browser has finished its current
	 * JavaScript execution.
	 */
	dispatchEvent = function(e_name, e_data, async) {
		var ev = createCustomEvent(e_name, {"detail": e_data});
		if (!ev) {
			return;
		}

		function dispatch() {
			try {
				if (d.dispatchEvent) {
					d.dispatchEvent(ev);
				}
				else if (d.fireEvent) {
					d.fireEvent("onpropertychange", ev);
				}
			}
			catch (e) {
				
			}
		}

		if (async) {
			BOOMR.setImmediate(dispatch);
		}
		else {
			dispatch();
		}
	};

	// visibilitychange is useful to detect if the page loaded through prerender
	// or if the page never became visible
	// http://www.w3.org/TR/2011/WD-page-visibility-20110602/
	// http://www.nczonline.net/blog/2011/08/09/introduction-to-the-page-visibility-api/
	// https://developer.mozilla.org/en-US/docs/Web/Guide/User_experience/Using_the_Page_Visibility_API

	// Set the name of the hidden property and the change event for visibility
	if (typeof d.hidden !== "undefined") {
		visibilityState = "visibilityState";
		visibilityChange = "visibilitychange";
	}
	else if (typeof d.mozHidden !== "undefined") {
		visibilityState = "mozVisibilityState";
		visibilityChange = "mozvisibilitychange";
	}
	else if (typeof d.msHidden !== "undefined") {
		visibilityState = "msVisibilityState";
		visibilityChange = "msvisibilitychange";
	}
	else if (typeof d.webkitHidden !== "undefined") {
		visibilityState = "webkitVisibilityState";
		visibilityChange = "webkitvisibilitychange";
	}

	// impl is a private object not reachable from outside the BOOMR object.
	// Users can set properties by passing in to the init() method.
	impl = {
		// Beacon URL
		beacon_url: "",

		// Forces protocol-relative URLs to HTTPS
		beacon_url_force_https: true,

		// List of string regular expressions that must match the beacon_url.  If
		// not set, or the list is empty, all beacon URLs are allowed.
		beacon_urls_allowed: [],

		// Beacon request method, either GET, POST or AUTO. AUTO will check the
		// request size then use GET if the request URL is less than MAX_GET_LENGTH
		// chars. Otherwise, it will fall back to a POST request.
		beacon_type: "AUTO",

		// Beacon authorization key value. Most systems will use the 'Authentication'
		// keyword, but some some services use keys like 'X-Auth-Token' or other
		// custom keys.
		beacon_auth_key: "Authorization",

		// Beacon authorization token. This is only needed if your are using a POST
		// and the beacon requires an Authorization token to accept your data.  This
		// disables use of the browser sendBeacon() API.
		beacon_auth_token: undefined,

		// Sends beacons with Credentials (applies to XHR beacons, not IMG or `sendBeacon()`).
		// If you need this, you may want to enable `beacon_disable_sendbeacon` as
		// `sendBeacon()` does not support credentials.
		beacon_with_credentials: false,

		// Disables navigator.sendBeacon() support
		beacon_disable_sendbeacon: false,

		// Strip out everything except last two parts of hostname.
		// This doesn't work well for domains that end with a country tld,
		// but we allow the developer to override site_domain for that.
		// You can disable all cookies by setting site_domain to a falsy value.
		site_domain: w.location.hostname.
					replace(/.*?([^.]+\.[^.]+)\.?$/, "$1").
					toLowerCase(),

		// User's ip address determined on the server.  Used for the BW cookie.
		user_ip: "",

		// Whether or not to send beacons on page load
		autorun: true,

		// Whether or not we've sent a page load beacon
		hasSentPageLoadBeacon: false,

		// document.referrer
		r: undefined,

		// strip_query_string: false,

		// onloadfired: false,

		// handlers_attached: false,

		// waiting_for_config: false,

		events: {
			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired when the page is usable by the user.
			 *
			 * By default this is fired when `window.onload` fires, but if you
			 * set `autorun` to false when calling {@link BOOMR.init}, then you
			 * must explicitly fire this event by calling {@link BOOMR#event:page_ready}.
			 *
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onload}
			 * @event BOOMR#page_ready
			 * @property {Event} [event] Event triggering the page_ready
			 */
			"page_ready": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired just before the browser unloads the page.
			 *
			 * The first event of `window.pagehide`, `window.beforeunload`,
			 * or `window.unload` will trigger this.
			 *
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Events/pagehide}
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload}
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onunload}
			 * @event BOOMR#page_unload
			 */
			"page_unload": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired before the document is about to be unloaded.
			 *
			 * `window.beforeunload` will trigger this.
			 *
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload}
			 * @event BOOMR#before_unload
			 */
			"before_unload": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired on `document.DOMContentLoaded`.
			 *
			 * The `DOMContentLoaded` event is fired when the initial HTML document
			 * has been completely loaded and parsed, without waiting for stylesheets,
			 * images, and subframes to finish loading
			 *
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Events/DOMContentLoaded}
			 * @event BOOMR#dom_loaded
			 */
			"dom_loaded": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired on `document.visibilitychange`.
			 *
			 * The `visibilitychange` event is fired when the content of a tab has
			 * become visible or has been hidden.
			 *
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Events/visibilitychange}
			 * @event BOOMR#visibility_changed
			 */
			"visibility_changed": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired when the `visibilityState` of the document has changed from
			 * `prerender` to `visible`
			 *
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Events/visibilitychange}
			 * @event BOOMR#prerender_to_visible
			 */
			"prerender_to_visible": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired when a beacon is about to be sent.
			 *
			 * The subscriber can still add variables to the beacon at this point,
			 * either by modifying the `vars` paramter or calling {@link BOOMR.addVar}.
			 *
			 * @event BOOMR#before_beacon
			 * @property {object} vars Beacon variables
			 */
			"before_beacon": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired when a beacon was sent.
			 *
			 * The beacon variables cannot be modified at this point.  Any calls
			 * to {@link BOOMR.addVar} or {@link BOOMR.removeVar} will apply to the
			 * next beacon.
			 *
			 * Also known as `onbeacon`.
			 *
			 * @event BOOMR#beacon
			 * @property {object} vars Beacon variables
			 */
			"beacon": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired when the page load beacon has been sent.
			 *
			 * This event should only happen once on a page.  It does not apply
			 * to SPA soft navigations.
			 *
			 * @event BOOMR#page_load_beacon
			 * @property {object} vars Beacon variables
			 */
			"page_load_beacon": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired when an XMLHttpRequest has finished, or, if something calls
			 * {@link BOOMR.responseEnd}.
			 *
			 * @event BOOMR#xhr_load
			 * @property {object} data Event data
			 */
			"xhr_load": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired when the `click` event has happened on the `document`.
			 *
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onclick}
			 * @event BOOMR#click
			 */
			"click": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired when any `FORM` element is submitted.
			 *
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit}
			 * @event BOOMR#form_submit
			 */
			"form_submit": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired whenever new configuration data is applied via {@link BOOMR.init}.
			 *
			 * Also known as `onconfig`.
			 *
			 * @event BOOMR#config
			 * @property {object} data Configuration data
			 */
			"config": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired whenever `XMLHttpRequest.open` is called.
			 *
			 * This event will only happen if {@link BOOMR.plugins.AutoXHR} is enabled.
			 *
			 * @event BOOMR#xhr_init
			 * @property {string} type XHR type ("xhr")
			 */
			"xhr_init": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired whenever a SPA plugin is about to track a new navigation.
			 *
			 * @event BOOMR#spa_init
			 * @property {string} navType Navigation type (`spa` or `spa_hard`)
			 * @property {object} param SPA navigation parameters
			 */
			"spa_init": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired whenever a SPA navigation is complete.
			 *
			 * @event BOOMR#spa_navigation
			 */
			"spa_navigation": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired whenever a SPA navigation is cancelled.
			 *
			 * @event BOOMR#spa_cancel
			 */
			"spa_cancel": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired whenever `XMLHttpRequest.send` is called.
			 *
			 * This event will only happen if {@link BOOMR.plugins.AutoXHR} is enabled.
			 *
			 * @event BOOMR#xhr_send
			 * @property {object} xhr `XMLHttpRequest` object
			 */
			"xhr_send": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired whenever and `XMLHttpRequest` has an error (if its `status` is
			 * set).
			 *
			 * This event will only happen if {@link BOOMR.plugins.AutoXHR} is enabled.
			 *
			 * Also known as `onxhrerror`.
			 *
			 * @event BOOMR#xhr_error
			 * @property {object} data XHR data
			 */
			"xhr_error": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired whenever a page error has happened.
			 *
			 * This event will only happen if {@link BOOMR.plugins.Errors} is enabled.
			 *
			 * Also known as `onerror`.
			 *
			 * @event BOOMR#error
			 * @property {object} err Error
			 */
			"error": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired whenever connection information changes via the
			 * Network Information API.
			 *
			 * This event will only happen if {@link BOOMR.plugins.Mobile} is enabled.
			 *
			 * @event BOOMR#netinfo
			 * @property {object} connection `navigator.connection`
			 */
			"netinfo": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired whenever a Rage Click is detected.
			 *
			 * This event will only happen if {@link BOOMR.plugins.Continuity} is enabled.
			 *
			 * @event BOOMR#rage_click
			 * @property {Event} e Event
			 */
			"rage_click": []
		},

		/**
		 * Public events
		 */
		public_events: {
			/**
			 * Public event (fired on `document`), and can be subscribed via
			 * `document.addEventListener("onBeforeBoomerangBeacon", ...)` or
			 * `document.attachEvent("onpropertychange", ...)`.
			 *
			 * Maps to {@link BOOMR#event:before_beacon}
			 *
			 * @event document#onBeforeBoomerangBeacon
			 * @property {object} vars Beacon variables
			 */
			"before_beacon": "onBeforeBoomerangBeacon",

			/**
			 * Public event (fired on `document`), and can be subscribed via
			 * `document.addEventListener("onBoomerangBeacon", ...)` or
			 * `document.attachEvent("onpropertychange", ...)`.
			 *
			 * Maps to {@link BOOMR#event:before_beacon}
			 *
			 * @event document#onBoomerangBeacon
			 * @property {object} vars Beacon variables
			 */
			"beacon": "onBoomerangBeacon",

			/**
			 * Public event (fired on `document`), and can be subscribed via
			 * `document.addEventListener("onBoomerangLoaded", ...)` or
			 * `document.attachEvent("onpropertychange", ...)`.
			 *
			 * Fired when {@link BOOMR} has loaded and can be used.
			 *
			 * @event document#onBoomerangLoaded
			 */
			"onboomerangloaded": "onBoomerangLoaded"
		},

		/**
		 * Maps old event names to their updated name
		 */
		translate_events: {
			"onbeacon": "beacon",
			"onconfig": "config",
			"onerror": "error",
			"onxhrerror": "xhr_error"
		},

		/**
		 * Number of page_unload or before_unload callbacks registered
		 */
		unloadEventsCount: 0,

		/**
		 * Number of page_unload or before_unload callbacks called
		 */
		unloadEventCalled: 0,

		listenerCallbacks: {},

		vars: {},
		singleBeaconVars: {},

		/**
		 * Variable priority lists:
		 * -1 = first
		 *  1 = last
		 */
		varPriority: {
			"-1": {},
			"1": {}
		},

		errors: {},

		disabled_plugins: {},

		localStorageSupported: false,
		LOCAL_STORAGE_PREFIX: "_boomr_",

		/**
		 * Native functions that were overwritten and should be restored when
		 * the Boomerang IFRAME is unloaded
		 */
		nativeOverwrites: [],

		xb_handler: function(type) {
			return function(ev) {
				var target;
				if (!ev) { ev = w.event; }
				if (ev.target) { target = ev.target; }
				else if (ev.srcElement) { target = ev.srcElement; }
				if (target.nodeType === 3) {  // defeat Safari bug
					target = target.parentNode;
				}

				// don't capture events on flash objects
				// because of context slowdowns in PepperFlash
				if (target &&
				    target.nodeName &&
				    target.nodeName.toUpperCase() === "OBJECT" &&
				    target.type === "application/x-shockwave-flash") {
					return;
				}
				impl.fireEvent(type, target);
			};
		},

		clearEvents: function() {
			var eventName;

			for (eventName in this.events) {
				if (this.events.hasOwnProperty(eventName)) {
					this.events[eventName] = [];
				}
			}
		},

		clearListeners: function() {
			var type, i;

			for (type in impl.listenerCallbacks) {
				if (impl.listenerCallbacks.hasOwnProperty(type)) {
					// remove all callbacks -- removeListener is guaranteed
					// to remove the element we're calling with
					while (impl.listenerCallbacks[type].length) {
						BOOMR.utils.removeListener(
						    impl.listenerCallbacks[type][0].el,
						    type,
						    impl.listenerCallbacks[type][0].fn);
					}
				}
			}

			impl.listenerCallbacks = {};
		},

		fireEvent: function(e_name, data) {
			var i, handler, handlers, handlersLen;

			e_name = e_name.toLowerCase();


			// translate old names
			if (this.translate_events[e_name]) {
				e_name = this.translate_events[e_name];
			}

			if (!this.events.hasOwnProperty(e_name)) {
				return;// false;
			}

			if (this.public_events.hasOwnProperty(e_name)) {
				dispatchEvent(this.public_events[e_name], data);
			}

			handlers = this.events[e_name];

			// Before we fire any event listeners, let's call real_sendBeacon() to flush
			// any beacon that is being held by the setImmediate.
			if (e_name !== "before_beacon" && e_name !== "beacon") {
				BOOMR.real_sendBeacon();
			}

			// only call handlers at the time of fireEvent (and not handlers that are
			// added during this callback to avoid an infinite loop)
			handlersLen = handlers.length;
			for (i = 0; i < handlersLen; i++) {
				try {
					handler = handlers[i];
					handler.fn.call(handler.scope, data, handler.cb_data);
				}
				catch (err) {
					BOOMR.addError(err, "fireEvent." + e_name + "<" + i + ">");
				}
			}

			// remove any 'once' handlers now that we've fired all of them
			for (i = 0; i < handlersLen; i++) {
				if (handlers[i].once) {
					handlers.splice(i, 1);
					handlersLen--;
					i--;
				}
			}


			return;// true;
		},

		spaNavigation: function() {
			// a SPA navigation occured, force onloadfired to true
			impl.onloadfired = true;
		},

		/**
		 * Determines whether a beacon URL is allowed based on
		 * `beacon_urls_allowed` config
		 *
		 * @param {string} url URL to test
		 *
		 */
		beaconUrlAllowed: function(url) {
			if (!impl.beacon_urls_allowed || impl.beacon_urls_allowed.length === 0) {
				return true;
			}

			for (var i = 0; i < impl.beacon_urls_allowed.length; i++) {
				var regEx = new RegExp(impl.beacon_urls_allowed[i]);
				if (regEx.exec(url)) {
					return true;
				}
			}

			return false;
		},

		/**
		 * Checks browser for localStorage support
		 */
		checkLocalStorageSupport: function() {
			var name = impl.LOCAL_STORAGE_PREFIX + "clss";
			impl.localStorageSupported = false;

			// Browsers with cookies disabled or in private/incognito mode may throw an
			// error when accessing the localStorage variable
			try {
				// we need JSON and localStorage support
				if (!w.JSON || !w.localStorage) {
					return;
				}

				w.localStorage.setItem(name, name);
				impl.localStorageSupported = (w.localStorage.getItem(name) === name);
				w.localStorage.removeItem(name);
			}
			catch (ignore) {
				impl.localStorageSupported = false;
			}
		},

		/**
		 * Fired when the Boomerang IFRAME is unloaded.
		 *
		 * If Boomerang was loaded into the root document, this code
		 * will not run.
		 */
		onFrameUnloaded: function() {
			var i, prop;

			BOOMR.isUnloaded = true;

			// swap the original function back in for any overwrites
			for (i = 0; i < impl.nativeOverwrites.length; i++) {
				prop = impl.nativeOverwrites[i];

				prop.obj[prop.functionName] = prop.origFn;
			}

			impl.nativeOverwrites = [];
		}
	};

	// We create a boomr object and then copy all its properties to BOOMR so that
	// we don't overwrite anything additional that was added to BOOMR before this
	// was called... for example, a plugin.
	boomr = {
		/**
		 * The timestamp when boomerang.js showed up on the page.
		 *
		 * This is the value of `BOOMR_start` we set earlier.
		 * @type {TimeStamp}
		 *
		 * @memberof BOOMR
		 */
		t_start: BOOMR_start,

		/**
		 * When the Boomerang plugins have all run.
		 *
		 * This value is generally set in zzz-last-plugin.js.
		 * @type {TimeStamp}
		 *
		 * @memberof BOOMR
		 */
		t_end: undefined,

		/**
		 * URL of boomerang.js.
		 *
		 * @type {string}
		 *
		 * @memberof BOOMR
		 */
		url: "",

		/**
		 * (Optional) URL of configuration file
		 *
		 * @type {string}
		 *
		 * @memberof BOOMR
		 */
		config_url: null,

		/**
		 * Whether or not Boomerang was loaded after the `onload` event.
		 *
		 * @type {boolean}
		 *
		 * @memberof BOOMR
		 */
		loadedLate: false,

		/**
		 * Current number of beacons sent.
		 *
		 * Will be incremented and added to outgoing beacon as `n`.
		 *
		 * @type {number}
		 *
		 */
		beaconsSent: 0,

		/**
		 * Whether or not Boomerang thinks it has been unloaded (if it was
		 * loaded in an IFRAME)
		 *
		 * @type {boolean}
		 */
		isUnloaded: false,

		/**
		 * Whether or not we're in the middle of building a beacon.
		 *
		 * If so, the code desiring to send a beacon should wait until the beacon
		 * event and try again.  At that point, it should set this flag to true.
		 *
		 * @type {boolean}
		 */
		beaconInQueue: false,

		/**
		 * Constants visible to the world
		 * @class BOOMR.constants
		 */
		constants: {
			/**
			 * SPA beacon types
			 *
			 * @type {string[]}
			 *
			 * @memberof BOOMR.constants
			 */
			BEACON_TYPE_SPAS: ["spa", "spa_hard"],

			/**
			 * Maximum GET URL length.
			 * Using 2000 here as a de facto maximum URL length based on:
 			 * http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers
			 *
			 * @type {number}
			 *
			 * @memberof BOOMR.constants
			 */
			MAX_GET_LENGTH: 2000
		},

		/**
		 * Session data
		 * @class BOOMR.session
		 */
		session: {
			/**
			 * Session Domain.
			 *
			 * You can disable all cookies by setting site_domain to a falsy value.
			 *
			 * @type {string}
			 *
			 * @memberof BOOMR.session
			 */
			domain: impl.site_domain,

			/**
			 * Session ID.  This will be randomly generated in the client but may
			 * be overwritten by the server if not set.
			 *
			 * @type {string}
			 *
			 * @memberof BOOMR.session
			 */
			ID: Math.random().toString(36).replace(/^0\./, ""),

			/**
			 * Session start time.
			 *
			 * @type {TimeStamp}
			 *
			 * @memberof BOOMR.session
			 */
			start: undefined,

			/**
			 * Session length (number of pages)
			 *
			 * @type {number}
			 *
			 * @memberof BOOMR.session
			 */
			length: 0,

			/**
			 * Session enabled (Are session cookies enabled?)
			 *
			 * @type {boolean}
			 *
			 * @memberof BOOMR.session
			 */
			enabled: true
		},

		/**
		 * @class BOOMR.utils
		 */
		utils: {
			/**
			 * Determines whether or not the browser has `postMessage` support
			 *
			 * @returns {boolean} True if supported
			 */
			hasPostMessageSupport: function() {
				if (!w.postMessage || typeof w.postMessage !== "function" && typeof w.postMessage !== "object") {
					return false;
				}
				return true;
			},

			/**
			 * Converts an object to a string.
			 *
			 * @param {object} o Object
			 * @param {string} separator Member separator
			 * @param {number} nest_level Number of levels to recurse
			 *
			 * @returns {string} String representation of the object
			 *
			 * @memberof BOOMR.utils
			 */
			objectToString: function(o, separator, nest_level) {
				var value = [], k;

				if (!o || typeof o !== "object") {
					return o;
				}
				if (separator === undefined) {
					separator = "\n\t";
				}
				if (!nest_level) {
					nest_level = 0;
				}

				if (BOOMR.utils.isArray(o)) {
					for (k = 0; k < o.length; k++) {
						if (nest_level > 0 && o[k] !== null && typeof o[k] === "object") {
							value.push(
								this.objectToString(
									o[k],
									separator + (separator === "\n\t" ? "\t" : ""),
									nest_level - 1
								)
							);
						}
						else {
							if (separator === "&") {
								value.push(encodeURIComponent(o[k]));
							}
							else {
								value.push(o[k]);
							}
						}
					}
					separator = ",";
				}
				else {
					for (k in o) {
						if (Object.prototype.hasOwnProperty.call(o, k)) {
							if (nest_level > 0 && o[k] !== null && typeof o[k] === "object") {
								value.push(encodeURIComponent(k) + "=" +
									this.objectToString(
										o[k],
										separator + (separator === "\n\t" ? "\t" : ""),
										nest_level - 1
									)
								);
							}
							else {
								if (separator === "&") {
									value.push(encodeURIComponent(k) + "=" + encodeURIComponent(o[k]));
								}
								else {
									value.push(k + "=" + o[k]);
								}
							}
						}
					}
				}

				return value.join(separator);
			},

			/**
			 * Gets the value of the cookie identified by `name`.
			 *
			 * @param {string} name Cookie name
			 *
			 * @returns {string|null} Cookie value, if set.
			 *
			 * @memberof BOOMR.utils
			 */
			getCookie: function(name) {
				if (!name) {
					return null;
				}


				name = " " + name + "=";

				var i, cookies;
				cookies = " " + d.cookie + ";";
				if ((i = cookies.indexOf(name)) >= 0) {
					i += name.length;
					cookies = cookies.substring(i, cookies.indexOf(";", i)).replace(/^"/, "").replace(/"$/, "");
					return cookies;
				}
			},

			/**
			 * Sets the cookie named `name` to the serialized value of `subcookies`.
			 *
			 * @param {string} name The name of the cookie
			 * @param {object} subcookies Key/value pairs to write into the cookie.
			 * These will be serialized as an & separated list of URL encoded key=value pairs.
			 * @param {number} max_age Lifetime in seconds of the cookie.
			 * Set this to 0 to create a session cookie that expires when
			 * the browser is closed. If not set, defaults to 0.
			 *
			 * @returns {boolean} True if the cookie was set successfully
			 *
			 * @example
			 * BOOMR.utils.setCookie("RT", { s: t_start, r: url });
			 *
			 * @memberof BOOMR.utils
			 */
			setCookie: function(name, subcookies, max_age) {
				var value, nameval, savedval, c, exp;

				if (!name || !BOOMR.session.domain || typeof subcookies === "undefined") {
					

					BOOMR.addVar("nocookie", 1);
					return false;
				}


				value = this.objectToString(subcookies, "&");
				nameval = name + "=\"" + value + "\"";

				if (nameval.length < 500) {
					c = [nameval, "path=/", "domain=" + BOOMR.session.domain];
					if (typeof max_age === "number") {
						exp = new Date();
						exp.setTime(exp.getTime() + max_age * 1000);
						exp = exp.toGMTString();
						c.push("expires=" + exp);
					}

					d.cookie = c.join("; ");
					// confirm cookie was set (could be blocked by user's settings, etc.)
					savedval = this.getCookie(name);
					// the saved cookie should be the same or undefined in the case of removeCookie
					if (value === savedval ||
					    (typeof savedval === "undefined" && typeof max_age === "number" && max_age <= 0)) {
						return true;
					}
					BOOMR.warn("Saved cookie value doesn't match what we tried to set:\n" + value + "\n" + savedval);
				}
				else {
					BOOMR.warn("Cookie too long: " + nameval.length + " " + nameval);
				}

				BOOMR.addVar("nocookie", 1);
				return false;
			},

			/**
			 * Parse a cookie string returned by {@link BOOMR.utils.getCookie} and
			 * split it into its constituent subcookies.
			 *
			 * @param {string} cookie Cookie value
			 *
			 * @returns {object} On success, an object of key/value pairs of all
			 * sub cookies. Note that some subcookies may have empty values.
			 * `null` if `cookie` was not set or did not contain valid subcookies.
			 *
			 * @memberof BOOMR.utils
			 */
			getSubCookies: function(cookie) {
				var cookies_a,
				    i, l, kv,
				    gotcookies = false,
				    cookies = {};

				if (!cookie) {
					return null;
				}

				if (typeof cookie !== "string") {
					
					return null;
				}

				cookies_a = cookie.split("&");

				for (i = 0, l = cookies_a.length; i < l; i++) {
					kv = cookies_a[i].split("=");
					if (kv[0]) {
						kv.push("");  // just in case there's no value
						cookies[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
						gotcookies = true;
					}
				}

				return gotcookies ? cookies : null;
			},

			/**
			 * Removes the cookie identified by `name` by nullifying its value,
			 * and making it a session cookie.
			 *
			 * @param {string} name Cookie name
			 *
			 * @memberof BOOMR.utils
			 */
			removeCookie: function(name) {
				return this.setCookie(name, {}, -86400);
			},

			/**
			 * Retrieve items from localStorage
			 *
			 * @param {string} name Name of storage
			 *
			 * @returns {object|null} Returns object retrieved from localStorage.
			 *                       Returns undefined if not found or expired.
			 *                       Returns null if parameters are invalid or an error occured
			 *
			 * @memberof BOOMR.utils
			 */
			getLocalStorage: function(name) {
				var value, data;
				if (!name || !impl.localStorageSupported) {
					return null;
				}


				try {
					value = w.localStorage.getItem(impl.LOCAL_STORAGE_PREFIX + name);
					if (value === null) {
						return undefined;
					}
					data = w.JSON.parse(value);
				}
				catch (e) {
					BOOMR.warn(e);
					return null;
				}

				if (!data || typeof data.items !== "object") {
					// Items are invalid
					this.removeLocalStorage(name);
					return null;
				}
				if (typeof data.expires === "number") {
					if (BOOMR.now() >= data.expires) {
						// Items are expired
						this.removeLocalStorage(name);
						return undefined;
					}
				}
				return data.items;
			},

			/**
			 * Saves items in localStorage
			 * The value stored in localStorage will be a JSON string representation of {"items": items, "expiry": expiry}
			 * where items is the object we're saving and expiry is an optional epoch number of when the data is to be
			 * considered expired
			 *
			 * @param {string} name Name of storage
			 * @param {object} items Items to be saved
			 * @param {number} max_age Age in seconds before items are to be considered expired
			 *
			 * @returns {boolean} True if the localStorage was set successfully
			 *
			 * @memberof BOOMR.utils
			 */
			setLocalStorage: function(name, items, max_age) {
				var data, value, savedval;

				if (!name || !impl.localStorageSupported || typeof items !== "object") {
					return false;
				}


				data = {"items": items};

				if (typeof max_age === "number") {
					data.expires = BOOMR.now() + (max_age * 1000);
				}

				value = w.JSON.stringify(data);

				if (value.length < 50000) {
					try {
						w.localStorage.setItem(impl.LOCAL_STORAGE_PREFIX + name, value);
						// confirm storage was set (could be blocked by user's settings, etc.)
						savedval = w.localStorage.getItem(impl.LOCAL_STORAGE_PREFIX + name);
						if (value === savedval) {
							return true;
						}
					}
					catch (ignore) {
						// Empty
					}
					BOOMR.warn("Saved storage value doesn't match what we tried to set:\n" + value + "\n" + savedval);
				}
				else {
					BOOMR.warn("Storage items too large: " + value.length + " " + value);
				}

				return false;
			},

			/**
			 * Remove items from localStorage
			 *
			 * @param {string} name Name of storage
			 *
			 * @returns {boolean} True if item was removed from localStorage.
			 *
			 * @memberof BOOMR.utils
			 */
			removeLocalStorage: function(name) {
				if (!name || !impl.localStorageSupported) {
					return false;
				}
				try {
					w.localStorage.removeItem(impl.LOCAL_STORAGE_PREFIX + name);
					return true;
				}
				catch (ignore) {
					// Empty
				}
				return false;
			},

			/**
			 * Cleans up a URL by removing the query string (if configured), and
			 * limits the URL to the specified size.
			 *
			 * @param {string} url URL to clean
			 * @param {number} urlLimit Maximum size, in characters, of the URL
			 *
			 * @returns {string} Cleaned up URL
			 *
			 * @memberof BOOMR.utils
			 */
			cleanupURL: function(url, urlLimit) {
				if (!url || BOOMR.utils.isArray(url)) {
					return "";
				}

				if (impl.strip_query_string) {
					url = url.replace(/\?.*/, "?qs-redacted");
				}

				if (typeof urlLimit !== "undefined" && url && url.length > urlLimit) {
					// We need to break this URL up.  Try at the query string first.
					var qsStart = url.indexOf("?");
					if (qsStart !== -1 && qsStart < urlLimit) {
						url = url.substr(0, qsStart) + "?...";
					}
					else {
						// No query string, just stop at the limit
						url = url.substr(0, urlLimit - 3) + "...";
					}
				}

				return url;
			},

			/**
			 * Gets the URL with the query string replaced with a MD5 hash of its contents.
			 *
			 * @param {string} url URL
			 * @param {boolean} stripHash Whether or not to strip the hash
			 *
			 * @returns {string} URL with query string hashed
			 *
			 * @memberof BOOMR.utils
			 */
			hashQueryString: function(url, stripHash) {
				if (!url) {
					return url;
				}
				if (!url.match) {
					BOOMR.addError("TypeError: Not a string", "hashQueryString", typeof url);
					return "";
				}
				if (url.match(/^\/\//)) {
					url = location.protocol + url;
				}
				if (!url.match(/^(https?|file):/)) {
					BOOMR.error("Passed in URL is invalid: " + url);
					return "";
				}
				if (stripHash) {
					url = url.replace(/#.*/, "");
				}
				if (!BOOMR.utils.MD5) {
					return url;
				}
				return url.replace(/\?([^#]*)/, function(m0, m1) {
					return "?" + (m1.length > 10 ? BOOMR.utils.MD5(m1) : m1);
				});
			},

			/**
			 * Sets the object's properties if anything in config matches
			 * one of the property names.
			 *
			 * @param {object} o The plugin's `impl` object within which it stores
			 * all its configuration and private properties
			 * @param {object} config The config object passed in to the plugin's
			 * `init()` method.
			 * @param {string} plugin_name The plugin's name in the {@link BOOMR.plugins} object.
			 * @param {string[]} properties An array containing a list of all configurable
			 * properties that this plugin has.
			 *
			 * @returns {boolean} True if a property was set
			 *
			 * @memberof BOOMR.utils
			 */
			pluginConfig: function(o, config, plugin_name, properties) {
				var i, props = 0;

				if (!config || !config[plugin_name]) {
					return false;
				}

				for (i = 0; i < properties.length; i++) {
					if (config[plugin_name][properties[i]] !== undefined) {
						o[properties[i]] = config[plugin_name][properties[i]];
						props++;
					}
				}

				return (props > 0);
			},

			/**
			 * `filter` for arrays
			 *
			 * @param {Array} array The array to iterate over.
			 * @param {Function} predicate The function invoked per iteration.
			 *
			 * @returns {Array} Returns the new filtered array.
			 *
			 * @memberof BOOMR.utils
			 */
			arrayFilter: function(array, predicate) {
				var result = [];

				if (!(this.isArray(array) || (array && typeof array.length === "number")) ||
				    typeof predicate !== "function") {
					return result;
				}

				if (typeof array.filter === "function") {
					result = array.filter(predicate);
				}
				else {
					var index = -1,
					    length = array.length,
					    value;

					while (++index < length) {
						value = array[index];
						if (predicate(value, index, array)) {
							result[result.length] = value;
						}
					}
				}
				return result;
			},

			/**
			 * `find` for Arrays
			 *
			 * @param {Array} array The array to iterate over
			 * @param {Function} predicate The function invoked per iteration
			 *
			 * @returns {Array} Returns the value of first element that satisfies
			 * the predicate
			 *
			 * @memberof BOOMR.utils
			 */
			arrayFind: function(array, predicate) {
				if (!(this.isArray(array) || (array && typeof array.length === "number")) ||
				    typeof predicate !== "function") {
					return undefined;
				}

				if (typeof array.find === "function") {
					return array.find(predicate);
				}
				else {
					var index = -1,
					    length = array.length,
					    value;

					while (++index < length) {
						value = array[index];
						if (predicate(value, index, array)) {
							return value;
						}
					}
					return undefined;
				}
			},

			/**
			 * MutationObserver feature detection
			 *
			 * @returns {boolean} Returns true if MutationObserver is supported.
			 * Always returns false for IE 11 due several bugs in it's implementation that MS flagged as Won't Fix.
			 * In IE11, XHR responseXML might be malformed if MO is enabled (where extra newlines get added in nodes with UTF-8 content).
			 * Another IE 11 MO bug can cause the process to crash when certain mutations occur.
			 * For the process crash issue, see https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8137215/ and
			 * https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/15167323/
			 *
			 * @memberof BOOMR.utils
			 */
			isMutationObserverSupported: function() {
				// We can only detect IE 11 bugs by UA sniffing.
				var ie11 = (w && w.navigator && w.navigator.userAgent && w.navigator.userAgent.match(/Trident.*rv[ :]*11\./));
				return (!ie11 && w && w.MutationObserver && typeof w.MutationObserver === "function");
			},

			/**
			 * The callback function may return a falsy value to disconnect the
			 * observer after it returns, or a truthy value to keep watching for
			 * mutations. If the return value is numeric and greater than 0, then
			 * this will be the new timeout. If it is boolean instead, then the
			 * timeout will not fire any more so the caller MUST call disconnect()
			 * at some point.
			 *
			 * @callback BOOMR~addObserverCallback
			 * @param {object[]} mutations List of mutations detected by the observer or `undefined` if the observer timed out
			 * @param {object} callback_data Is the passed in `callback_data` parameter without modifications
			 */

			/**
			 * Add a MutationObserver for a given element and terminate after `timeout`ms.
			 *
			 * @param {DOMElement} el DOM element to watch for mutations
			 * @param {MutationObserverInit} config MutationObserverInit object (https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver#MutationObserverInit)
			 * @param {number} timeout Number of milliseconds of no mutations after which the observer should be automatically disconnected.
			 * If set to a falsy value, the observer will wait indefinitely for Mutations.
			 * @param {BOOMR~addObserverCallback} callback Callback function to call either on timeout or if mutations are detected.
			 * @param {object} callback_data Any data to be passed to the callback function as its second parameter.
			 * @param {object} callback_ctx An object that represents the `this` object of the `callback` method.
			 * Leave unset the callback function is not a method of an object.
			 *
			 * @returns {object|null}
			 * - `null` if a MutationObserver could not be created OR
			 * - An object containing the observer and the timer object:
			 *   `{ observer: <MutationObserver>, timer: <Timeout Timer if any> }`
			 * - The caller can use this to disconnect the observer at any point
			 *   by calling `retval.observer.disconnect()`
			 * - Note that the caller should first check to see if `retval.observer`
			 *   is set before calling `disconnect()` as it may have been cleared automatically.
			 *
			 * @memberof BOOMR.utils
			 */
			addObserver: function(el, config, timeout, callback, callback_data, callback_ctx) {
				var MO, zs, o = {observer: null, timer: null};


				if (!this.isMutationObserverSupported() || !callback || !el) {
					return null;
				}

				function done(mutations) {
					var run_again = false;


					if (o.timer) {
						clearTimeout(o.timer);
						o.timer = null;
					}

					if (callback) {
						run_again = callback.call(callback_ctx, mutations, callback_data);

						if (!run_again) {
							callback = null;
						}
					}

					if (!run_again && o.observer) {
						o.observer.disconnect();
						o.observer = null;
					}

					if (typeof run_again === "number" && run_again > 0) {
						o.timer = setTimeout(done, run_again);
					}
				}

				MO = w.MutationObserver;
				// if the site uses Zone.js then get the native MutationObserver
				if (w.Zone && typeof w.Zone.__symbol__ === "function") {
					zs = w.Zone.__symbol__("MutationObserver");
					if (zs && typeof zs === "string" && w.hasOwnProperty(zs) && typeof w[zs] === "function") {
						
						MO = w[zs];
					}
				}
				o.observer = new MO(done);

				if (timeout) {
					o.timer = setTimeout(done, o.timeout);
				}

				o.observer.observe(el, config);

				return o;
			},

			/**
			 * Adds an event listener.
			 *
			 * @param {DOMElement} el DOM element
			 * @param {string} type Event name
			 * @param {function} fn Callback function
			 * @param {boolean} passive Passive mode
			 *
			 * @memberof BOOMR.utils
			 */
			addListener: function(el, type, fn, passive) {
				var opts = false;


				if (el.addEventListener) {
					if (passive && BOOMR.browser.supportsPassive()) {
						opts = {
							capture: false,
							passive: true
						};
					}

					el.addEventListener(type, fn, opts);
				}
				else if (el.attachEvent) {
					el.attachEvent("on" + type, fn);
				}

				// ensure the type arry exists
				impl.listenerCallbacks[type] = impl.listenerCallbacks[type] || [];

				// save a reference to the target object and function
				impl.listenerCallbacks[type].push({ el: el, fn: fn});
			},

			/**
			 * Removes an event listener.
			 *
			 * @param {DOMElement} el DOM element
			 * @param {string} type Event name
			 * @param {function} fn Callback function
			 *
			 * @memberof BOOMR.utils
			 */
			removeListener: function(el, type, fn) {
				var i;


				if (el.removeEventListener) {
					// NOTE: We don't need to match any other options (e.g. passive)
					// from addEventListener, as removeEventListener only cares
					// about captive.
					el.removeEventListener(type, fn, false);
				}
				else if (el.detachEvent) {
					el.detachEvent("on" + type, fn);
				}

				if (impl.listenerCallbacks.hasOwnProperty(type)) {
					for (var i = 0; i < impl.listenerCallbacks[type].length; i++) {
						if (fn === impl.listenerCallbacks[type][i].fn &&
						    el === impl.listenerCallbacks[type][i].el) {
							impl.listenerCallbacks[type].splice(i, 1);
							return;
						}
					}
				}
			},

			/**
			 * Determines if the specified object is an `Array` or not
			 *
			 * @param {object} ary Object in question
			 *
			 * @returns {boolean} True if the object is an `Array`
			 *
			 * @memberof BOOMR.utils
			 */
			isArray: function(ary) {
				return Object.prototype.toString.call(ary) === "[object Array]";
			},

			/**
			 * Determines if the specified value is in the array
			 *
			 * @param {object} val Value to check
			 * @param {object} ary Object in question
			 *
			 * @returns {boolean} True if the value is in the Array
			 *
			 * @memberof BOOMR.utils
			 */
			inArray: function(val, ary) {
				var i;

				if (typeof val === "undefined" || typeof ary === "undefined" || !ary.length) {
					return false;
				}

				for (i = 0; i < ary.length; i++) {
					if (ary[i] === val) {
						return true;
					}
				}

				return false;
			},

			/**
			 * Get a query parameter value from a URL's query string
			 *
			 * @param {string} param Query parameter name
			 * @param {string|Object} [url] URL containing the query string, or a link object.
			 * Defaults to `BOOMR.window.location`
			 *
			 * @returns {string|null} URI decoded value or null if param isn't a query parameter
			 *
			 * @memberof BOOMR.utils
			 */
			getQueryParamValue: function(param, url) {
				var l, params, i, kv;
				if (!param) {
					return null;
				}

				if (typeof url === "string") {
					l = BOOMR.window.document.createElement("a");
					l.href = url;
				}
				else if (typeof url === "object" && typeof url.search === "string") {
					l = url;
				}
				else {
					l = BOOMR.window.location;
				}

				// Now that we match, pull out all query string parameters
				params = l.search.slice(1).split(/&/);

				for (i = 0; i < params.length; i++) {
					if (params[i]) {
						kv = params[i].split("=");
						if (kv.length && kv[0] === param) {
							return kv.length > 1 ? decodeURIComponent(kv.splice(1).join("=").replace(/\+/g, " ")) : "";
						}
					}
				}
				return null;
			},

			/**
			 * Generates a pseudo-random UUID (Version 4):
			 * https://en.wikipedia.org/wiki/Universally_unique_identifier
			 *
			 * @returns {string} UUID
			 *
			 * @memberof BOOMR.utils
			 */
			generateUUID: function() {
				return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
					var r = Math.random() * 16 | 0;
					var v = c === "x" ? r : (r & 0x3 | 0x8);
					return v.toString(16);
				});
			},

			/**
			 * Generates a random ID based on the specified number of characters.  Uses
			 * characters a-z0-9.
			 *
			 * @param {number} chars Number of characters (max 40)
			 *
			 * @returns {string} Random ID
			 *
			 * @memberof BOOMR.utils
			 */
			generateId: function(chars) {
				return "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx".substr(0, chars || 40).replace(/x/g, function(c) {
					var c = (Math.random() || 0.01).toString(36);

					// some implementations may return "0" for small numbers
					if (c === "0") {
						return "0";
					}
					else {
						return c.substr(2, 1);
					}
				});
			},

			/**
			 * Attempt to serialize an object, preferring JSURL over JSON.stringify
			 *
			 * @param {Object} value Object to serialize
			 * @returns {string} serialized version of value, empty-string if not possible
			 */
			serializeForUrl: function(value) {
				if (BOOMR.utils.Compression && BOOMR.utils.Compression.jsUrl) {
					return BOOMR.utils.Compression.jsUrl(value);
				}
				if (window.JSON) {
					return JSON.stringify(value);
				}
				// not supported
				
				return "";
			},

			/**
			 * Attempt to identify the URL of boomerang itself using multiple methods for cross-browser support
			 *
			 * This method uses document.currentScript (which cannot be called from an event handler), script.readyState (IE6-10),
			 * and the stack property of a caught Error object.
			 *
			 * @returns {string} The URL of the currently executing boomerang script.
			 */
			getMyURL: function() {
				var stack;
				// document.currentScript works in all browsers except for IE: https://caniuse.com/#feat=document-currentscript
				// #boomr-if-as works in all browsers if the page uses our standard iframe loader
				// #boomr-scr-as works in all browsers if the page uses our preloader loader
				// BOOMR_script will be undefined on IE for pages that do not use our standard loaders

				// Note that we do not use `w.document` or `d` here because we need the current execution context
				var BOOMR_script = (document.currentScript || document.getElementById("boomr-if-as") || document.getElementById("boomr-scr-as"));

				if (BOOMR_script) {
					return BOOMR_script.src;
				}

				// For IE 6-10 users on pages not using the standard loader, we iterate through all scripts backwards
				var scripts = document.getElementsByTagName("script"), i;

				// i-- is both a decrement as well as a condition, ie, the loop will terminate when i goes from 0 to -1
				for (i = scripts.length; i--;) {
					// We stop at the first script that has its readyState set to interactive indicating that it is currently executing
					if (scripts[i].readyState === "interactive") {
						return scripts[i].src;
					}
				}

				// For IE 11, we throw an Error and inspect its stack property in the catch block
				// This also works on IE10, but throwing is disruptive so we try to avoid it and use
				// the less disruptive script iterator above
				try {
					throw new Error();
				}
				catch (e) {
					if ("stack" in e) {
						stack = this.arrayFilter(e.stack.split(/\n/), function(l) { return l.match(/https?:\/\//); });
						if (stack && stack.length) {
							return stack[0].replace(/.*(https?:\/\/.+?)(:\d+)+\D*$/m, "$1");
						}
					}
					// FWIW, on IE 8 & 9, the Error object does not contain a stack property, but if you have an uncaught error,
					// and a `window.onerror` handler (not using addEventListener), then the second argument to that handler is
					// the URL of the script that threw. The handler needs to `return true;` to prevent the default error handler
					// This flow is asynchronous though (due to the event handler), so won't work in a function return scenario
					// like this (we can't use promises because we would only need this hack in browsers that don't support promises).
				}

				return "";
			},

			/*
			 * Gets the Scroll x and y (rounded) for a page
			 *
			 * @returns {object} Scroll x and y coordinates
			 */
			scroll: function() {
				// Adapted from:
				// https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY
				var supportPageOffset = w.pageXOffset !== undefined;
				var isCSS1Compat = ((w.document.compatMode || "") === "CSS1Compat");

				var ret = {
					x: 0,
					y: 0
				};

				if (supportPageOffset) {
					if (typeof w.pageXOffset === "function") {
						ret.x = w.pageXOffset();
						ret.y = w.pageYOffset();
					}
					else {
						ret.x = w.pageXOffset;
						ret.y = w.pageYOffset;
					}
				}
				else if (isCSS1Compat) {
					ret.x = w.document.documentElement.scrollLeft;
					ret.y = w.document.documentElement.scrollTop;
				}
				else {
					ret.x = w.document.body.scrollLeft;
					ret.y = w.document.body.scrollTop;
				}

				// round to full numbers
				if (typeof ret.sx === "number") {
					ret.sx = Math.round(ret.sx);
				}

				if (typeof ret.sy === "number") {
					ret.sy = Math.round(ret.sy);
				}

				return ret;
			},

			/**
			 * Gets the window height
			 *
			 * @returns {number} Window height
			 */
			windowHeight: function() {
				return w.innerHeight || w.document.documentElement.clientHeight || w.document.body.clientHeight;
			},

			/**
			 * Gets the window width
			 *
			 * @returns {number} Window width
			 */
			windowWidth: function() {
				return w.innerWidth || w.document.documentElement.clientWidth || w.document.body.clientWidth;
			},

			/**
			 * Determines if the function is native or not
			 *
			 * @param {function} fn Function
			 *
			 * @returns {boolean} True when the function is native
			 */
			isNative: function(fn) {
				return !!fn &&
				    fn.toString &&
				    !fn.hasOwnProperty("toString") &&
				    /\[native code\]/.test(String(fn));
			},

			/**
			 * Overwrites a function on the specified object.
			 *
			 * When the Boomerang IFRAME unloads, it will swap the old
			 * function back in, so calls to the functions are successful.
			 *
			 * If this isn't done, callers of the overwritten functions may still
			 * call into freed Boomerang code or the IFRAME that is partially unloaded,
			 * leading to "Freed script" errors or exceptions from accessing
			 * unloaded DOM properties.
			 *
			 * This tracking isn't needed if Boomerang is loaded in the root
			 * document, as everthing will be cleaned up along with Boomerang
			 * on unload.
			 *
			 * @param {object} obj Object whose property will be overwritten
			 * @param {string} functionName Function name
			 * @param {function} newFn New function
			 */
			overwriteNative: function(obj, functionName, newFn) {
				// bail if the object doesn't exist
				if (!obj || !newFn) {
					return;
				}

				// we only need to keep track if we're running Boomerang in
				// an IFRAME
				if (BOOMR.boomerang_frame !== BOOMR.window) {
					// note we overwrote this
					impl.nativeOverwrites.push({
						obj: obj,
						functionName: functionName,
						origFn: obj[functionName]
					});
				}

				obj[functionName] = newFn;
			},

			/**
			 * Determines if the given input is an Integer.
			 * Relies on standard Number.isInteger() function that available
			 * is most browsers except IE. For IE, this relies on the polyfill
			 * provided by MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger#Polyfill
			 *
			 * @param {number} input dat
			 *
			 * @returns {string} Random ID
			 *
			 * @memberof BOOMR.utils
			 *
			 */
			isInteger: function(data) {
				var isInt = Number.isInteger || function(value) {
					return typeof value === "number" &&
						isFinite(value) &&
						Math.floor(value) === value;
				};

				return isInt(data);
			}


		}, // closes `utils`

		/**
		 * Browser feature detection flags.
		 *
		 * @class BOOMR.browser
		 */
		browser: {
			results: {},

			/**
			 * Whether or not the browser supports 'passive' mode for event
			 * listeners
			 *
			 * @returns {boolean} True if the browser supports passive mode
			 */
			supportsPassive: function() {
				if (typeof BOOMR.browser.results.supportsPassive === "undefined") {
					BOOMR.browser.results.supportsPassive = false;

					if (!Object.defineProperty) {
						return false;
					}

					try {
						var opts = Object.defineProperty({}, "passive", {
							get: function() {
								BOOMR.browser.results.supportsPassive = true;
							}
						});
						window.addEventListener("test", null, opts);
					}
					catch (e) {
						// NOP
					}
				}

				return BOOMR.browser.results.supportsPassive;
			}
		},

		/**
		 * Initializes Boomerang by applying the specified configuration.
		 *
		 * All plugins' `init()` functions will be called with the same config as well.
		 *
		 * @param {object} config Configuration object
		 * @param {boolean} [config.autorun] By default, boomerang runs automatically
		 * and attaches its `page_ready` handler to the `window.onload` event.
		 * If you set `autorun` to `false`, this will not happen and you will
		 * need to call {@link BOOMR.page_ready} yourself.
		 * @param {string} config.beacon_auth_key Beacon authorization key value
		 * @param {string} config.beacon_auth_token Beacon authorization token.
		 * @param {boolean} config.beacon_with_credentials Sends beacon with credentials
		 * @param {boolean} config.beacon_disable_sendbeacon Disables `navigator.sendBeacon()` support
		 * @param {string} config.beacon_url The URL to beacon results back to.
		 * If not set, no beacon will be sent.
		 * @param {boolean} config.beacon_url_force_https Forces protocol-relative Beacon URLs to HTTPS
		 * @param {string} config.beacon_type `GET`, `POST` or `AUTO`
		 * @param {string} [config.site_domain] The domain that all cookies should be set on
		 * Boomerang will try to auto-detect this, but unless your site is of the
		 * `foo.com` format, it will probably get it wrong. It's a good idea
		 * to set this to whatever part of your domain you'd like to share
		 * bandwidth and performance measurements across.
		 * Set this to a falsy value to disable all cookies.
		 * @param {boolean} [config.strip_query_string] Whether or not to strip query strings from all URLs (e.g. `u`, `pgu`, etc.)
		 * @param {string} [config.user_ip] Despite its name, this is really a free-form
		 * string used to uniquely identify the user's current internet
		 * connection. It's used primarily by the bandwidth test to determine
		 * whether it should re-measure the user's bandwidth or just use the
		 * value stored in the cookie. You may use IPv4, IPv6 or anything else
		 * that you think can be used to identify the user's network connection.
		 * @param {function} [config.log] Logger to use. Set to `null` to disable logging.
		 * @param {function} [<plugins>] Each plugin has its own section
		 *
		 * @returns {BOOMR} Boomerang object
		 *
		 * @memberof BOOMR
		 */
		init: function(config) {
			var i, k,
			    properties = [
				    "autorun",
				    "beacon_auth_key",
				    "beacon_auth_token",
				    "beacon_with_credentials",
				    "beacon_disable_sendbeacon",
				    "beacon_url",
				    "beacon_url_force_https",
				    "beacon_type",
				    "site_domain",
				    "strip_query_string",
				    "user_ip"
			    ];


			BOOMR_check_doc_domain();

			if (!config) {
				config = {};
			}

			// ensure logging is setup properly (or null'd out for production)
			if (config.log !== undefined) {
				this.log = config.log;
			}

			if (!this.log) {
				this.log = function(/* m,l,s */) {};
			}

			if (!this.pageId) {
				// generate a random page ID for this page's lifetime
				this.pageId = BOOMR.utils.generateId(8);
				
			}

			if (config.primary && impl.handlers_attached) {
				return this;
			}

			if (typeof config.site_domain === "string") {
				this.session.domain = config.site_domain;
			}

			// Set autorun if in config right now, as plugins that listen for page_ready
			// event may fire when they .init() if onload has already fired, and whether
			// or not we should fire page_ready depends on config.autorun.
			if (typeof config.autorun !== "undefined") {
				impl.autorun = config.autorun;
			}


			for (k in this.plugins) {
				if (this.plugins.hasOwnProperty(k)) {
					// config[plugin].enabled has been set to false
					if (config[k] &&
					    config[k].hasOwnProperty("enabled") &&
					    config[k].enabled === false) {
						impl.disabled_plugins[k] = 1;

						if (typeof this.plugins[k].disable === "function") {
							this.plugins[k].disable();
						}

						continue;
					}

					// plugin was previously disabled
					if (impl.disabled_plugins[k]) {

						// and has not been explicitly re-enabled
						if (!config[k] ||
						    !config[k].hasOwnProperty("enabled") ||
						    config[k].enabled !== true) {
							continue;
						}

						if (typeof this.plugins[k].enable === "function") {
							this.plugins[k].enable();
						}

						// plugin is now enabled
						delete impl.disabled_plugins[k];
					}

					// plugin exists and has an init method
					if (typeof this.plugins[k].init === "function") {
						try {

							this.plugins[k].init(config);

						}
						catch (err) {
							BOOMR.addError(err, k + ".init");
						}
					}
				}
			}


			for (i = 0; i < properties.length; i++) {
				if (config[properties[i]] !== undefined) {
					impl[properties[i]] = config[properties[i]];
				}
			}

			// if it's the first call to init (handlers aren't attached) and we're not asked to wait OR
			// it's the second init call (handlers are attached) and we were previously waiting
			// then we set up the page ready autorun functionality
			if ((!impl.handlers_attached && !config.wait) || (impl.handlers_attached && impl.waiting_for_config)) {
				// The developer can override onload by setting autorun to false
				if (!impl.onloadfired && (impl.autorun === undefined || impl.autorun !== false)) {
					if (BOOMR.hasBrowserOnloadFired()) {
						BOOMR.loadedLate = true;
					}
					BOOMR.attach_page_ready(BOOMR.page_ready_autorun);
				}
				impl.waiting_for_config = false;
			}

			// only attach handlers once
			if (impl.handlers_attached) {
				return this;
			}

			if (config.wait) {
				impl.waiting_for_config = true;
			}

			BOOMR.attach_page_ready(function() {
				// if we're not using the loader snippet, save the onload time for
				// browsers that do not support NavigationTiming.
				// This will be later than onload if boomerang arrives late on the
				// page but it's the best we can do
				if (!BOOMR.t_onload) {
					BOOMR.t_onload = BOOMR.now();
				}
			});

			BOOMR.utils.addListener(w, "DOMContentLoaded", function() { impl.fireEvent("dom_loaded"); });

			BOOMR.fireEvent("config", config);
			BOOMR.subscribe("config", function(beaconConfig) {
				if (beaconConfig.beacon_url) {
					impl.beacon_url = beaconConfig.beacon_url;
				}
			});

			BOOMR.subscribe("spa_navigation", impl.spaNavigation, null, impl);

			(function() {
				var forms, iterator;
				if (visibilityChange !== undefined) {
					BOOMR.utils.addListener(d, visibilityChange, function() { impl.fireEvent("visibility_changed"); });

					// save the current visibility state
					impl.lastVisibilityState = BOOMR.visibilityState();

					BOOMR.subscribe("visibility_changed", function() {
						var visState = BOOMR.visibilityState();

						// record the last time each visibility state occurred
						BOOMR.lastVisibilityEvent[visState] = BOOMR.now();
						

						// if we transitioned from prerender to hidden or visible, fire the prerender_to_visible event
						if (impl.lastVisibilityState === "prerender" &&
						    visState !== "prerender") {
							// note that we transitioned from prerender on the beacon for debugging
							BOOMR.addVar("vis.pre", "1");

							// let all listeners know
							impl.fireEvent("prerender_to_visible");
						}

						impl.lastVisibilityState = visState;
					});
				}

				BOOMR.utils.addListener(d, "mouseup", impl.xb_handler("click"));

				forms = d.getElementsByTagName("form");
				for (iterator = 0; iterator < forms.length; iterator++) {
					BOOMR.utils.addListener(forms[iterator], "submit", impl.xb_handler("form_submit"));
				}

				if (!w.onpagehide && w.onpagehide !== null) {
					// This must be the last one to fire
					// We only clear w on browsers that don't support onpagehide because
					// those that do are new enough to not have memory leak problems of
					// some older browsers
					BOOMR.utils.addListener(w, "unload", function() {
						BOOMR.window = w = null;
					});
				}

				// if we were loaded in an IFRAME, try to keep track if the IFRAME was unloaded
				if (BOOMR.boomerang_frame !== BOOMR.window) {
					BOOMR.utils.addListener(BOOMR.boomerang_frame, "unload", impl.onFrameUnloaded);
				}
			}());

			impl.handlers_attached = true;
			return this;
		},

		/**
		 * Attach a callback to the `pageshow` or `onload` event if `onload` has not
		 * been fired otherwise queue it to run immediately
		 *
		 * @param {function} cb Callback to run when `onload` fires or page is visible (`pageshow`)
		 *
		 * @memberof BOOMR
		 */
		attach_page_ready: function(cb) {
			if (BOOMR.hasBrowserOnloadFired()) {
				this.setImmediate(cb, null, null, BOOMR);
			}
			else {
				// Use `pageshow` if available since it will fire even if page came from a back-forward page cache.
				// Browsers that support `pageshow` will not fire `onload` if navigation was through a back/forward button
				// and the page was retrieved from back-forward cache.
				if (w.onpagehide || w.onpagehide === null) {
					BOOMR.utils.addListener(w, "pageshow", cb);
				}
				else {
					BOOMR.utils.addListener(w, "load", cb);
				}
			}
		},

		/**
		 * Sends the `page_ready` event only if `autorun` is still true after
		 * {@link BOOMR.init} is called.
		 *
		 * @param {Event} ev Event
		 *
		 * @memberof BOOMR
		 */
		page_ready_autorun: function(ev) {
			if (impl.autorun) {
				BOOMR.page_ready(ev, true);
			}
		},

		/**
		 * Method that fires the {@link BOOMR#event:page_ready} event. Call this
		 * only if you've set `autorun` to `false` when calling the {@link BOOMR.init}
		 * method. You should call this method when you determine that your page
		 * is ready to be used by your user. This will be the end-time used in
		 * the page load time measurement. Optionally, you can pass a Unix Epoch
		 * timestamp as a parameter or set the global `BOOMR_page_ready` var that will
		 * be used as the end-time instead.
		 *
		 * @param {Event|number} [ev] Ready event or optional load event end timestamp if called manually
		 * @param {boolean} auto True if called by `page_ready_autorun`
		 *
		 * @returns {BOOMR} Boomerang object
		 *
		 * @example
		 * BOOMR.init({ autorun: false, ... });
		 * // wait until the page is ready, i.e. your view has loaded
		 * BOOMR.page_ready();
		 *
		 * @memberof BOOMR
		 */
		page_ready: function(ev, auto) {
			var tm_page_ready;

			// a number can be passed as the first argument if called manually which
			// will be used as the loadEventEnd time
			if (!auto && typeof ev === "number") {
				tm_page_ready = ev;
				ev = null;
			}

			if (!ev) {
				ev = w.event;
			}

			if (!ev) {
				ev = {
					name: "load"
				};
			}

			// if we were called manually or global BOOMR_page_ready was set then
			// add loadEventEnd and note this was 'pr' on the beacon
			if (!auto) {
				ev.timing = ev.timing || {};
				// use timestamp parameter or global BOOMR_page_ready if set, otherwise use
				// the current timestamp
				if (tm_page_ready) {
					ev.timing.loadEventEnd = tm_page_ready;
				}
				else if (typeof w.BOOMR_page_ready === "number") {
					ev.timing.loadEventEnd = w.BOOMR_page_ready;
				}
				else {
					ev.timing.loadEventEnd = BOOMR.now();
				}

				BOOMR.addVar("pr", 1, true);
			}
			else if (typeof w.BOOMR_page_ready === "number") {
				ev.timing = ev.timing || {};
				// the global BOOMR_page_ready will override our loadEventEnd
				ev.timing.loadEventEnd = w.BOOMR_page_ready;

				BOOMR.addVar("pr", 1, true);
			}

			if (impl.onloadfired) {
				return this;
			}

			impl.fireEvent("page_ready", ev);
			impl.onloadfired = true;
			return this;
		},

		/**
		 * Determines whether or not the page's `onload` event has fired
		 *
		 * @returns {boolean} True if page's onload was called
		 */
		hasBrowserOnloadFired: function() {
			var p = BOOMR.getPerformance();
			// if the document is `complete` then the `onload` event has already occurred, we'll fire the callback immediately.
			// When `document.write` is used to replace the contents of the page and inject boomerang, the document `readyState`
			// will go from `complete` back to `loading` and then to `complete` again. The second transition to `complete`
			// doesn't fire a second `pageshow` event in some browsers (e.g. Safari). We need to check if
			// `performance.timing.loadEventStart` or `BOOMR_onload` has occurred to detect this scenario. Will not work for
			// older Safari that doesn't have NavTiming
			return ((d.readyState && d.readyState === "complete") ||
			    (p && p.timing && p.timing.loadEventStart > 0) ||
			    w.BOOMR_onload > 0);
		},

		/**
		 * Determines whether or not the page's `onload` event has fired, or
		 * if `autorun` is false, whether {@link BOOMR.page_ready} was called.
		 *
		 * @returns {boolean} True if `onload` or {@link BOOMR.page_ready} were called
		 *
		 * @memberof BOOMR
		 */
		onloadFired: function() {
			return impl.onloadfired;
		},

		/**
		 * The callback function may return a falsy value to disconnect the observer
		 * after it returns, or a truthy value to keep watching for mutations. If
		 * the return value is numeric and greater than 0, then this will be the new timeout.
		 * If it is boolean instead, then the timeout will not fire any more so
		 * the caller MUST call disconnect() at some point
		 *
		 * @callback BOOMR~setImmediateCallback
		 * @param {object} data The passed in `data` object
		 * @param {object} cb_data The passed in `cb_data` object
		 * @param {Error} callstack An Error object that holds the callstack for
		 * when `setImmediate` was called, used to determine what called the callback
		 */

		/**
		 * Defer the function `fn` until the next instant the browser is free from
		 * user tasks.
		 *
		 * @param {BOOMR~setImmediateCallback} fn The callback function.
		 * @param {object} [data] Any data to pass to the callback function
		 * @param {object} [cb_data] Any passthrough data for the callback function.
		 * This differs from `data` when `setImmediate` is called via an event
		 * handler and `data` is the Event object
		 * @param {object} [cb_scope] The scope of the callback function if it is a method of an object
		 *
		 * @returns nothing
		 *
		 * @memberof BOOMR
		 */
		setImmediate: function(fn, data, cb_data, cb_scope) {
			var cb, cstack;


			cb = function() {
				fn.call(cb_scope || null, data, cb_data || {}, cstack);
				cb = null;
			};

			if (w.requestIdleCallback) {
				// set a timeout since rIC doesn't get called reliably in chrome headless
				w.requestIdleCallback(cb, {timeout: 1000});
			}
			else if (w.setImmediate) {
				w.setImmediate(cb);
			}
			else {
				setTimeout(cb, 10);
			}
		},

		/**
		 * Gets the current time in milliseconds since the Unix Epoch (Jan 1 1970).
		 *
		 * In browsers that support `DOMHighResTimeStamp`, this will be replaced
		 * by a function that adds `performance.now()` to `navigationStart`
		 * (with milliseconds.microseconds resolution).
		 *
		 * @function
		 *
		 * @returns {TimeStamp} Milliseconds since Unix Epoch
		 *
		 * @memberof BOOMR
		 */
		now: (function() {
			return Date.now || function() { return new Date().getTime(); };
		}()),

		/**
		 * Gets the `window.performance` object of the root window.
		 *
		 * Checks vendor prefixes for older browsers (e.g. IE9).
		 *
		 * @returns {Performance|undefined} `window.performance` if it exists
		 *
		 * @memberof BOOMR
		 */
		getPerformance: function() {
			try {
				if (BOOMR.window) {
					if ("performance" in BOOMR.window && BOOMR.window.performance) {
						return BOOMR.window.performance;
					}

					// vendor-prefixed fallbacks
					return BOOMR.window.msPerformance ||
					    BOOMR.window.webkitPerformance ||
					    BOOMR.window.mozPerformance;
				}
			}
			catch (ignore) {
				// empty
			}
		},

		/**
		 * Get high resolution delta timestamp from time origin
		 *
		 * This function needs to approximate the time since the performance timeOrigin
		 * or Navigation Timing API's `navigationStart` time.
		 * If available, `performance.now()` can provide this value.
		 * If not we either get the navigation start time from the RT plugin or
		 * from `t_lstart` or `t_start`. Those values are subtracted from the current
		 * time to derive a time since `navigationStart` value.
		 *
		 * @returns {float} Exact or approximate time since the time origin.
		 */
		hrNow: function() {
			var now, navigationStart, p = BOOMR.getPerformance();

			if (p && p.now) {
				now = p.now();
			}
			else {
				navigationStart = (BOOMR.plugins.RT && BOOMR.plugins.RT.navigationStart &&
					BOOMR.plugins.RT.navigationStart()) || BOOMR.t_lstart || BOOMR.t_start;

				// if navigationStart is undefined, we'll be returning NaN
				now = BOOMR.now() - navigationStart;
			}

			return now;
		},

		/**
		 * Gets the `document.visibilityState`, or `visible` if Page Visibility
		 * is not supported.
		 *
		 * @function
		 *
		 * @returns {string} Visibility state
		 *
		 * @memberof BOOMR
		 */
		visibilityState: (visibilityState === undefined ? function() {
			return "visible";
		} : function() {
			return d[visibilityState];
		}),

		/**
		 * An mapping of visibliity event states to the latest time they happened
		 *
		 * @type {object}
		 *
		 * @memberof BOOMR
		 */
		lastVisibilityEvent: {},

		/**
		 * Registers a Boomerang event.
		 *
		 * @param {string} e_name Event name
		 *
		 * @returns {BOOMR} Boomerang object
		 *
		 * @memberof BOOMR
		 */
		registerEvent: function(e_name) {
			if (impl.events.hasOwnProperty(e_name)) {
				// already registered
				return this;
			}

			// create a new queue of handlers
			impl.events[e_name] = [];

			return this;
		},

		/**
		 * Disables boomerang from doing anything further:
		 * 1. Clears event handlers (such as onload)
		 * 2. Clears all event listeners
		 *
		 * @memberof BOOMR
		 */
		disable: function() {
			impl.clearEvents();
			impl.clearListeners();
		},

		/**
		 * Fires a Boomerang event
		 *
		 * @param {string} e_name Event name
		 * @param {object} data Event payload
		 *
		 * @returns {BOOMR} Boomerang object
		 *
		 * @memberof BOOMR
		 */
		fireEvent: function(e_name, data) {
			return impl.fireEvent(e_name, data);
		},

		/**
		 * @callback BOOMR~subscribeCallback
		 * @param {object} eventData Event data
		 * @param {object} cb_data Callback data
		 */

		/**
		 * Subscribes to a Boomerang event
		 *
		 * @param {string} e_name Event name, i.e. {@link BOOMR#event:page_ready}.
		 * @param {BOOMR~subscribeCallback} fn Callback function
		 * @param {object} cb_data Callback data, passed as the second parameter to the callback function
		 * @param {object} cb_scope Callback scope.  If set to an object, then the
		 * callback function is called as a method of this object, and all
		 * references to `this` within the callback function will refer to `cb_scope`.
		 * @param {boolean} once Whether or not this callback should only be run once
		 *
		 * @returns {BOOMR} Boomerang object
		 *
		 * @memberof BOOMR
		 */
		subscribe: function(e_name, fn, cb_data, cb_scope, once) {
			var i, handler, ev;

			e_name = e_name.toLowerCase();


			// translate old names
			if (impl.translate_events[e_name]) {
				e_name = impl.translate_events[e_name];
			}

			if (!impl.events.hasOwnProperty(e_name)) {
				// allow subscriptions before they're registered
				impl.events[e_name] = [];
			}

			ev = impl.events[e_name];

			// don't allow a handler to be attached more than once to the same event
			for (i = 0; i < ev.length; i++) {
				handler = ev[i];
				if (handler && handler.fn === fn && handler.cb_data === cb_data && handler.scope === cb_scope) {
					return this;
				}
			}

			ev.push({
				fn: fn,
				cb_data: cb_data || {},
				scope: cb_scope || null,
				once: once || false
			});

			// attaching to page_ready after onload fires, so call soon
			if (e_name === "page_ready" && impl.onloadfired && impl.autorun) {
				this.setImmediate(fn, null, cb_data, cb_scope);
			}

			// Attach unload handlers directly to the window.onunload and
			// window.onbeforeunload events. The first of the two to fire will clear
			// fn so that the second doesn't fire. We do this because technically
			// onbeforeunload is the right event to fire, but not all browsers
			// support it.  This allows us to fall back to onunload when onbeforeunload
			// isn't implemented
			if (e_name === "page_unload" || e_name === "before_unload") {
				// Keep track of how many pagehide/unload/beforeunload handlers we're registering
				impl.unloadEventsCount++;

				(function() {
					var unload_handler, evt_idx = ev.length;

					unload_handler = function(evt) {
						if (fn) {
							fn.call(cb_scope, evt || w.event, cb_data);
						}

						// If this was the last pagehide/unload/beforeunload handler,
						// we'll try to send the beacon immediately after it is done.
						// The beacon will only be sent if one of the handlers has queued it.
						if (++impl.unloadEventCalled === impl.unloadEventsCount) {
							BOOMR.real_sendBeacon();
						}
					};

					if (e_name === "page_unload") {
						// pagehide is for iOS devices
						// see http://www.webkit.org/blog/516/webkit-page-cache-ii-the-unload-event/
						if (w.onpagehide || w.onpagehide === null) {
							BOOMR.utils.addListener(w, "pagehide", unload_handler);
						}
						else {
							BOOMR.utils.addListener(w, "unload", unload_handler);
						}
					}
					BOOMR.utils.addListener(w, "beforeunload", unload_handler);
				}());
			}

			return this;
		},

		/**
		 * Logs an internal Boomerang error.
		 *
		 * If the {@link BOOMR.plugins.Errors} plugin is enabled, this data will
		 * be compressed on the `err` beacon parameter.  If not, it will be included
		 * in uncompressed form on the `errors` parameter.
		 *
		 * @param {string|object} err Error
		 * @param {string} [src] Source
		 * @param {object} [extra] Extra data
		 *
		 * @memberof BOOMR
		 */
		addError: function BOOMR_addError(err, src, extra) {
			var str, E = BOOMR.plugins.Errors;


			BOOMR.error("Boomerang caught error: " + err + ", src: " + src + ", extra: " + extra);

			//
			// Use the Errors plugin if it's enabled
			//
			if (E && E.is_supported()) {
				if (typeof err === "string") {
					E.send({
						message: err,
						extra: extra,
						functionName: src,
						noStack: true
					}, E.VIA_APP, E.SOURCE_BOOMERANG);
				}
				else {
					if (typeof src === "string") {
						err.functionName = src;
					}

					if (typeof extra !== "undefined") {
						err.extra = extra;
					}

					E.send(err, E.VIA_APP, E.SOURCE_BOOMERANG);
				}

				return;
			}

			if (typeof err !== "string") {
				str = String(err);
				if (str.match(/^\[object/)) {
					str = err.name + ": " + (err.description || err.message).replace(/\r\n$/, "");
				}
				err = str;
			}
			if (src !== undefined) {
				err = "[" + src + ":" + BOOMR.now() + "] " + err;
			}
			if (extra) {
				err += ":: " + extra;
			}

			if (impl.errors[err]) {
				impl.errors[err]++;
			}
			else {
				impl.errors[err] = 1;
			}
		},

		/**
		 * Determines if the specified Error is a Cross-Origin error.
		 *
		 * @param {string|object} err Error
		 *
		 * @returns {boolean} True if the Error is a Cross-Origin error.
		 *
		 * @memberof BOOMR
		 */
		isCrossOriginError: function(err) {
			// These are expected for cross-origin iframe access.
			// For IE and Edge, we'll also check the error number for non-English browsers
			return err.name === "SecurityError" ||
				(err.name === "TypeError" && err.message === "Permission denied") ||
				(err.name === "Error" && err.message && err.message.match(/^(Permission|Access is) denied/)) ||
				err.number === -2146828218;  // IE/Edge error number for "Permission Denied"
		},

		/**
		 * Add one or more parameters to the beacon.
		 *
		 * This method may either be called with a single object containing
		 * key/value pairs, or with two parameters, the first is the variable
		 * name and the second is its value.
		 *
		 * All names should be strings usable in a URL's query string.
		 *
		 * We recommend only using alphanumeric characters and underscores, but you
		 * can use anything you like.
		 *
		 * Values should be strings (or numbers), and have the same restrictions
		 * as names.
		 *
		 * Parameters will be on all subsequent beacons unless `singleBeacon` is
		 * set.
		 *
		 * @param {string} name Variable name
		 * @param {string|object} val Value
		 * @param {boolean} singleBeacon Whether or not to add to a single beacon
		 * or all beacons
		 *
		 * @returns {BOOMR} Boomerang object
		 *
		 * @example
		 * BOOMR.addVar("page_id", 123);
		 * BOOMR.addVar({"page_id": 123, "user_id": "Person1"});
		 *
		 * @memberof BOOMR
		 */
		 addVar: function(name, value, singleBeacon) {

			if (typeof name === "string") {
				impl.vars[name] = value;
			}
			else if (typeof name === "object") {
				var o = name, k;
				for (k in o) {
					if (o.hasOwnProperty(k)) {
						impl.vars[k] = o[k];
					}
				}
			}

			if (singleBeacon) {
				impl.singleBeaconVars[name] = 1;
			}

			return this;
		},

		/**
		 * Appends data to a beacon.
		 *
		 * If the value already exists, a comma is added and the new data is applied.
		 *
		 * @param {string} name Variable name
		 * @param {string} val Value
		 *
		 * @returns {BOOMR} Boomerang object
		 *
		 * @memberof BOOMR
		 */
		appendVar: function(name, value) {
			var existing = BOOMR.getVar(name) || "";
			if (existing) {
				existing += ",";
			}

			BOOMR.addVar(name, existing + value);

			return this;
		},

		/**
		 * Removes one or more variables from the beacon URL. This is useful within
		 * a plugin to reset the values of parameters that it is about to set.
		 *
		 * Plugins can also use this in the {@link BOOMR#event:beacon} event to clear
		 * any variables that should only live on a single beacon.
		 *
		 * This method accepts either a list of variable names, or a single
		 * array containing a list of variable names.
		 *
		 * @param {string[]|string} name Variable name or list
		 *
		 * @returns {BOOMR} Boomerang object
		 *
		 * @memberof BOOMR
		 */
		removeVar: function(arg0) {
			var i, params;
			if (!arguments.length) {
				return this;
			}

			if (arguments.length === 1 && BOOMR.utils.isArray(arg0)) {
				params = arg0;
			}
			else {
				params = arguments;
			}

			for (i = 0; i < params.length; i++) {
				if (impl.vars.hasOwnProperty(params[i])) {
					delete impl.vars[params[i]];
				}
			}

			return this;
		},

		/**
		 * Determines whether or not the beacon has the specified variable.
		 *
		 * @param {string} name Variable name
		 *
		 * @returns {boolean} True if the variable is set.
		 *
		 * @memberof BOOMR
		 */
		hasVar: function(name) {
			return impl.vars.hasOwnProperty(name);
		},

		/**
		 * Gets the specified variable.
		 *
		 * @param {string} name Variable name
		 *
		 * @returns {object|undefined} Variable, or undefined if it isn't set
		 *
		 * @memberof BOOMR
		 */
		getVar: function(name) {
			return impl.vars[name];
		},

		/**
		 * Sets a variable's priority in the beacon URL.
		 * -1 = beginning of the URL
		 * 0  = middle of the URL (default)
		 * 1  = end of the URL
		 *
		 * @param {string} name Variable name
		 * @param {number} pri Priority (-1 or 1)
		 *
		 * @returns {BOOMR} Boomerang object
		 *
		 * @memberof BOOMR
		 */
		setVarPriority: function(name, pri) {
			if (typeof pri !== "number" || Math.abs(pri) !== 1) {
				return this;
			}

			impl.varPriority[pri][name] = 1;

			return this;
		},

		/**
		 * Sets the Referrers variable.
		 *
		 * @param {string} r Referrer from the document.referrer
		 *
		 * @memberof BOOMR
		 */
		setReferrer: function(r) {
			// document.referrer
			impl.r = r;
		},

		/**
		 * Starts a timer for a dynamic request.
		 *
		 * Once the named request has completed, call `loaded()` to send a beacon
		 * with the duration.
		 *
		 * @example
		 * var timer = BOOMR.requestStart("my-timer");
		 * // do stuff
		 * timer.loaded();
		 *
		 * @param {string} name Timer name
		 *
		 * @returns {object} An object with a `.loaded()` function that you can call
		 *     when the dynamic timer is complete.
		 *
		 * @memberof BOOMR
		 */
		requestStart: function(name) {
			var t_start = BOOMR.now();
			BOOMR.plugins.RT.startTimer("xhr_" + name, t_start);

			return {
				loaded: function(data) {
					BOOMR.responseEnd(name, t_start, data);
				}
			};
		},

		/**
		 * Determines if Boomerang can send a beacon.
		 *
		 * Queryies all plugins to see if they implement `readyToSend()`,
		 * and if so, that they return `true`.
		 *
		 * If not, the beacon cannot be sent.
		 *
		 * @returns {boolean} True if Boomerang can send a beacon
		 *
		 * @memberof BOOMR
		 */
		readyToSend: function() {
			var plugin;

			for (plugin in this.plugins) {
				if (this.plugins.hasOwnProperty(plugin)) {
					if (impl.disabled_plugins[plugin]) {
						continue;
					}

					if (typeof this.plugins[plugin].readyToSend === "function" &&
					    this.plugins[plugin].readyToSend() === false) {
						
						return false;
					}
				}
			}

			return true;
		},

		/**
		 * Sends a beacon for a dynamic request.
		 *
		 * @param {string|object} name Timer name or timer object data.
		 * @param {string} [name.initiator] Initiator, such as `xhr` or `spa`
		 * @param {string} [name.url] URL of the request
		 * @param {TimeStamp} t_start Start time
		 * @param {object} data Request data
		 * @param {TimeStamp} t_end End time
		 *
		 * @memberof BOOMR
		 */
		responseEnd: function(name, t_start, data, t_end) {
			// take the now timestamp for start and end, if unspecified, in case we delay this beacon
			t_start = typeof t_start === "number" ? t_start : BOOMR.now();
			t_end = typeof t_end === "number" ? t_end : BOOMR.now();

			// wait until all plugins are ready to send
			if (!BOOMR.readyToSend()) {
				

				// try again later
				setTimeout(function() {
					BOOMR.responseEnd(name, t_start, data, t_end);
				}, 1000);

				return;
			}

			// Wait until we've sent the Page Load beacon first
			if (!BOOMR.hasSentPageLoadBeacon() &&
			    !BOOMR.utils.inArray(name.initiator, BOOMR.constants.BEACON_TYPE_SPAS)) {
				// wait for a beacon, then try again
				BOOMR.subscribe("page_load_beacon", function() {
					BOOMR.responseEnd(name, t_start, data, t_end);
				}, null, BOOMR, true);

				return;
			}

			// Ensure we don't have two beacons trying to send data at the same time
			if (impl.beaconInQueue) {
				// wait until the beacon is sent, then try again
				BOOMR.subscribe("beacon", function() {
					BOOMR.responseEnd(name, t_start, data, t_end);
				}, null, BOOMR, true);

				return;
			}

			// Lock the beacon queue
			impl.beaconInQueue = true;

			if (typeof name === "object") {
				if (!name.url) {
					
					return;
				}

				impl.fireEvent("xhr_load", name);
			}
			else {
				// flush out any queue'd beacons before we set the Page Group
				// and timers
				BOOMR.real_sendBeacon();

				BOOMR.addVar("xhr.pg", name);
				BOOMR.plugins.RT.startTimer("xhr_" + name, t_start);
				impl.fireEvent("xhr_load", {
					name: "xhr_" + name,
					data: data,
					timing: {
						loadEventEnd: t_end
					}
				});
			}
		},

		//
		// uninstrumentXHR, instrumentXHR, uninstrumentFetch and instrumentFetch
		// are stubs that will be replaced by auto-xhr.js if active.
		//
		/**
		 * Undo XMLHttpRequest instrumentation and reset the original `XMLHttpRequest`
		 * object
		 *
		 * This is implemented in `plugins/auto-xhr.js` {@link BOOMR.plugins.AutoXHR}.
		 *
		 * @memberof BOOMR
		 */
		uninstrumentXHR: function() { },

		/**
		 * Instrument all requests made via XMLHttpRequest to send beacons.
		 *
		 * This is implemented in `plugins/auto-xhr.js` {@link BOOMR.plugins.AutoXHR}.
		 *
		 * @memberof BOOMR
		 */
		instrumentXHR: function() { },

		/**
		 * Undo fetch instrumentation and reset the original `fetch`
		 * function
		 *
		 * This is implemented in `plugins/auto-xhr.js` {@link BOOMR.plugins.AutoXHR}.
		 *
		 * @memberof BOOMR
		 */
		uninstrumentFetch: function() { },

		/**
		 * Instrument all requests made via fetch to send beacons.
		 *
		 * This is implemented in `plugins/auto-xhr.js` {@link BOOMR.plugins.AutoXHR}.
		 *
		 * @memberof BOOMR
		 */
		instrumentFetch: function() { },

		/**
		 * Request boomerang to send its beacon with all queued beacon data
		 * (via {@link BOOMR.addVar}).
		 *
		 * Boomerang may ignore this request.
		 *
		 * When this method is called, boomerang checks all plugins. If any
		 * plugin has not completed its checks (ie, the plugin's `is_complete()`
		 * method returns `false`, then this method does nothing.
		 *
		 * If all plugins have completed, then this method fires the
		 * {@link BOOMR#event:before_beacon} event with all variables that will be
		 * sent on the beacon.
		 *
		 * After all {@link BOOMR#event:before_beacon} handlers return, this method
		 * checks if a `beacon_url` has been configured and if there are any
		 * beacon parameters to be sent. If both are true, it fires the beacon.
		 *
		 * The {@link BOOMR#event:beacon} event is then fired.
		 *
		 * `sendBeacon()` should be called any time a plugin goes from
		 * `is_complete() = false` to `is_complete = true` so the beacon is
		 * sent.
		 *
		 * The actual beaconing is handled in {@link BOOMR.real_sendBeacon} after
		 * a short delay (via {@link BOOMR.setImmediate}).  If other calls to
		 * `sendBeacon` happen before {@link BOOMR.real_sendBeacon} is called,
		 * those calls will be discarded (so it's OK to call this in quick
		 * succession).
		 *
		 * @param {string} [beacon_url_override] Beacon URL override
		 *
		 * @memberof BOOMR
		 */
		sendBeacon: function(beacon_url_override) {
			// This plugin wants the beacon to go somewhere else,
			// so update the location
			if (beacon_url_override) {
				impl.beacon_url_override = beacon_url_override;
			}

			if (!impl.beaconQueued) {
				impl.beaconQueued = true;
				BOOMR.setImmediate(BOOMR.real_sendBeacon, null, null, BOOMR);
			}

			return true;
		},

		/**
		 * Sends a beacon when the beacon queue is empty.
		 *
		 * @param {object} params Beacon parameters to set
		 * @param {function} callback Callback to run when the queue is ready
		 * @param {object} that Function to apply callback to
		 */
		sendBeaconWhenReady: function(params, callback, that) {
			// If we're already sending a beacon, wait until the queue is empty
			if (impl.beaconInQueue) {
				// wait until the beacon is sent, then try again
				BOOMR.subscribe("beacon", function() {
					BOOMR.sendBeaconWhenReady(params, callback, that);
				}, null, BOOMR, true);

				return;
			}

			// Lock the beacon queue
			impl.beaconInQueue = true;

			// add all parameters
			for (var paramName in params) {
				if (params.hasOwnProperty(paramName)) {
					// add this data to a single beacon
					BOOMR.addVar(paramName, params[paramName], true);
				}
			}

			// run the callback
			if (typeof callback === "function" && typeof that !== "undefined") {
				callback.apply(that);
			}

			// send the beacon
			BOOMR.sendBeacon();
		},

		/**
		 * Sends all beacon data.
		 *
		 * This function should be called directly any time a "new" beacon is about
		 * to be constructed.  For example, if you're creating a new XHR or other
		 * custom beacon, you should ensure the existing beacon data is flushed
		 * by calling `BOOMR.real_sendBeacon();` first.
		 *
		 * @memberof BOOMR
		 */
		real_sendBeacon: function() {
			var k, form, url, errors = [], params = [], paramsJoined, varsSent = {}, _if;

			if (!impl.beaconQueued) {
				return false;
			}


			impl.beaconQueued = false;

			

			// At this point someone is ready to send the beacon.  We send
			// the beacon only if all plugins have finished doing what they
			// wanted to do
			for (k in this.plugins) {
				if (this.plugins.hasOwnProperty(k)) {
					if (impl.disabled_plugins[k]) {
						continue;
					}
					if (!this.plugins[k].is_complete(impl.vars)) {
						
						return false;
					}
				}
			}

			// Sanity test that the browser is still available (and not shutting down)
			if (!window || !window.Image || !window.navigator || !BOOMR.window) {
				
				return false;
			}

			// For SPA apps, don't strip hashtags as some SPA frameworks use #s for tracking routes
			// instead of History pushState() APIs. Use d.URL instead of location.href because of a
			// Safari bug.
			var isSPA = BOOMR.utils.inArray(impl.vars["http.initiator"], BOOMR.constants.BEACON_TYPE_SPAS);
			var isPageLoad = typeof impl.vars["http.initiator"] === "undefined" || isSPA;

			if (!impl.vars.pgu) {
				impl.vars.pgu = isSPA ? d.URL : d.URL.replace(/#.*/, "");
			}
			impl.vars.pgu = BOOMR.utils.cleanupURL(impl.vars.pgu);

			// Use the current document.URL if it hasn't already been set, or for SPA apps,
			// on each new beacon (since each SPA soft navigation might change the URL)
			if (!impl.vars.u || isSPA) {
				impl.vars.u = impl.vars.pgu;
			}

			if (impl.vars.pgu === impl.vars.u) {
				delete impl.vars.pgu;
			}

			// Add cleaned-up referrer URLs to the beacon, if available
			if (impl.r) {
				impl.vars.r = BOOMR.utils.cleanupURL(impl.r);
			}
			else {
				delete impl.vars.r;
			}

			impl.vars.v = BOOMR.version;

			// Snippet version, if available
			if (BOOMR.snippetVersion) {
				impl.vars.sv = BOOMR.snippetVersion;
			}

			// Snippet method is IFRAME if not specified (pre-v12 snippets)
			impl.vars.sm = BOOMR.snippetMethod || "i";

			if (BOOMR.session.enabled) {
				impl.vars["rt.si"] = BOOMR.session.ID + "-" + Math.round(BOOMR.session.start / 1000).toString(36);
				impl.vars["rt.ss"] = BOOMR.session.start;
				impl.vars["rt.sl"] = BOOMR.session.length;
			}

			if (BOOMR.visibilityState()) {
				impl.vars["vis.st"] = BOOMR.visibilityState();
				if (BOOMR.lastVisibilityEvent.visible) {
					impl.vars["vis.lv"] = BOOMR.now() - BOOMR.lastVisibilityEvent.visible;
				}
				if (BOOMR.lastVisibilityEvent.hidden) {
					impl.vars["vis.lh"] = BOOMR.now() - BOOMR.lastVisibilityEvent.hidden;
				}
			}

			impl.vars["ua.plt"] = navigator.platform;
			impl.vars["ua.vnd"] = navigator.vendor;

			if (this.pageId) {
				impl.vars.pid = this.pageId;
			}

			// add beacon number
			impl.vars.n = ++this.beaconsSent;

			if (w !== window) {
				_if = "if";  // work around uglifyJS minification that breaks in IE8 and quirks mode
				impl.vars[_if] = "";
			}

			for (k in impl.errors) {
				if (impl.errors.hasOwnProperty(k)) {
					errors.push(k + (impl.errors[k] > 1 ? " (*" + impl.errors[k] + ")" : ""));
				}
			}

			if (errors.length > 0) {
				impl.vars.errors = errors.join("\n");
			}

			impl.errors = {};

			// If we reach here, all plugins have completed
			impl.fireEvent("before_beacon", impl.vars);

			// clone the vars object for two reasons: first, so all listeners of
			// 'beacon' get an exact clone (in case listeners are doing
			// BOOMR.removeVar), and second, to help build our priority list of vars.
			for (k in impl.vars) {
				if (impl.vars.hasOwnProperty(k)) {
					varsSent[k] = impl.vars[k];
				}
			}

			BOOMR.removeVar(["qt", "pgu"]);

			// remove any vars that should only be on a single beacon
			for (var singleVarName in impl.singleBeaconVars) {
				if (impl.singleBeaconVars.hasOwnProperty(singleVarName)) {
					BOOMR.removeVar(singleVarName);
				}
			}

			// clear single beacon vars list
			impl.singleBeaconVars = {};

			// keep track of page load beacons
			if (!impl.hasSentPageLoadBeacon && isPageLoad) {
				impl.hasSentPageLoadBeacon = true;

				// let this beacon go out first
				BOOMR.setImmediate(function() {
					impl.fireEvent("page_load_beacon", varsSent);
				});
			}

			// Stop at this point if we are rate limited
			if (BOOMR.session.rate_limited) {
				
				return false;
			}

			// mark that we're no longer sending a beacon now, as those
			// paying attention to this will trigger at the beacon event
			impl.beaconInQueue = false;

			// send the beacon data
			BOOMR.sendBeaconData(varsSent);


			return true;
		},

		/**
		 * Determines whether or not a Page Load beacon has been sent.
		 *
		 * @returns {boolean} True if a Page Load beacon has been sent.
		 */
		hasSentPageLoadBeacon: function() {
			return impl.hasSentPageLoadBeacon;
		},

		/**
		 * Sends beacon data via the Beacon API, XHR or Image
		 *
		 * @param {object} data Data
		 */
		sendBeaconData: function(data) {
			var urlFirst = [], urlLast = [], params, paramsJoined,
			    url, img, useImg = true, xhr, ret;

			

			// Use the override URL if given
			impl.beacon_url = impl.beacon_url_override || impl.beacon_url;

			// Check that the beacon_url was set first
			if (!impl.beacon_url) {
				
				return false;
			}

			if (!impl.beaconUrlAllowed(impl.beacon_url)) {
				
				return false;
			}

			// Check that we have data to send
			if (data.length === 0) {
				return false;
			}

			// If we reach here, we've figured out all of the beacon data we'll send.
			impl.fireEvent("beacon", data);

			// get high- and low-priority variables first, which remove any of
			// those vars from data
			urlFirst = this.getVarsOfPriority(data, -1);
			urlLast  = this.getVarsOfPriority(data, 1);

			// merge the 3 lists
			params = urlFirst.concat(this.getVarsOfPriority(data, 0), urlLast);
			paramsJoined = params.join("&");

			// If beacon_url is protocol relative, make it https only
			if (impl.beacon_url_force_https && impl.beacon_url.match(/^\/\//)) {
				impl.beacon_url = "https:" + impl.beacon_url;
			}

			// if there are already url parameters in the beacon url,
			// change the first parameter prefix for the boomerang url parameters to &
			url = impl.beacon_url + ((impl.beacon_url.indexOf("?") > -1) ? "&" : "?") + paramsJoined;

			//
			// Try to send an IMG beacon if possible (which is the most compatible),
			// otherwise send an XHR beacon if the  URL length is longer than 2,000 bytes.
			//
			if (impl.beacon_type === "GET") {
				useImg = true;

				if (url.length > BOOMR.constants.MAX_GET_LENGTH) {
					((window.console && (console.warn || console.log)) || function() {})("Boomerang: Warning: Beacon may not be sent via GET due to payload size > 2000 bytes");
				}
			}
			else if (impl.beacon_type === "POST" || url.length > BOOMR.constants.MAX_GET_LENGTH) {
				// switch to a XHR beacon if the the user has specified a POST OR GET length is too long
				useImg = false;
			}

			//
			// Try the sendBeacon API first.
			// But if beacon_type is set to "GET", dont attempt
			// sendBeacon API call
			//
			if (w && w.navigator &&
			    typeof w.navigator.sendBeacon === "function" &&
			    BOOMR.utils.isNative(w.navigator.sendBeacon) &&
			    typeof w.Blob === "function" &&
			    impl.beacon_type !== "GET" &&
			    // As per W3C, The sendBeacon method does not provide ability to pass any
			    // header other than 'Content-Type'. So if we need to send data with
			    // 'Authorization' header, we need to fallback to good old xhr.
			    typeof impl.beacon_auth_token === "undefined" &&
			    !impl.beacon_disable_sendbeacon) {
				// note we're using sendBeacon with &sb=1
				var blobData = new w.Blob([paramsJoined + "&sb=1"], {
					type: "application/x-www-form-urlencoded"
				});

				if (w.navigator.sendBeacon(impl.beacon_url, blobData)) {
					return true;
				}

				// sendBeacon was not successful, try Image or XHR beacons
			}

			// If we don't have XHR available, force an image beacon and hope
			// for the best
			if (!BOOMR.orig_XMLHttpRequest && (!w || !w.XMLHttpRequest)) {
				useImg = true;
			}

			if (useImg) {
				//
				// Image beacon
				//

				// just in case Image isn't a valid constructor
				try {
					img = new Image();
				}
				catch (e) {
					
					return false;
				}

				img.src = url;
			}
			else {
				//
				// XHR beacon
				//

				// Send a form-encoded XHR POST beacon
				xhr = new (BOOMR.window.orig_XMLHttpRequest || BOOMR.orig_XMLHttpRequest || BOOMR.window.XMLHttpRequest)();
				try {
					this.sendXhrPostBeacon(xhr, paramsJoined);
				}
				catch (e) {
					// if we had an exception with the window XHR object, try our IFRAME XHR
					xhr = new BOOMR.boomerang_frame.XMLHttpRequest();
					this.sendXhrPostBeacon(xhr, paramsJoined);
				}
			}

			return true;
		},

		/**
		 * Determines whether or not a Page Load beacon has been sent.
		 *
		 * @returns {boolean} True if a Page Load beacon has been sent.
		 *
		 * @memberof BOOMR
		 */
		hasSentPageLoadBeacon: function() {
			return impl.hasSentPageLoadBeacon;
		},

		/**
		 * Sends a beacon via XMLHttpRequest
		 *
		 * @param {object} xhr XMLHttpRequest object
		 * @param {object} [paramsJoined] XMLHttpRequest.send() argument
		 *
		 * @memberof BOOMR
		 */
		sendXhrPostBeacon: function(xhr, paramsJoined) {
			xhr.open("POST", impl.beacon_url);

			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

			if (typeof impl.beacon_auth_token !== "undefined") {
				if (typeof impl.beacon_auth_key === "undefined") {
					impl.beacon_auth_key = "Authorization";
				}

				xhr.setRequestHeader(impl.beacon_auth_key, impl.beacon_auth_token);
			}

			if (impl.beacon_with_credentials) {
				xhr.withCredentials = true;
			}

			xhr.send(paramsJoined);
		},

		/**
		 * Gets all variables of the specified priority
		 *
		 * @param {object} vars Variables (will be modified for pri -1 and 1)
		 * @param {number} pri Priority (-1, 0, or 1)
		 *
		 * @return {string[]} Array of URI-encoded vars
		 *
		 * @memberof BOOMR
		 */
		getVarsOfPriority: function(vars, pri) {
			var name, url = [],
			    // if we were given a priority, iterate over that list
			    // else iterate over vars
			    iterVars = (pri !== 0 ? impl.varPriority[pri] : vars);

			for (name in iterVars) {
				// if this var is set, add it to our URL array
				if (iterVars.hasOwnProperty(name) && vars.hasOwnProperty(name)) {
					url.push(this.getUriEncodedVar(name, typeof vars[name] === "undefined" ? "" : vars[name]));

					// remove this name from vars so it isn't also added
					// to the non-prioritized list when pri=0 is called
					if (pri !== 0) {
						delete vars[name];
					}
				}
			}

			return url;
		},

		/**
		 * Gets a URI-encoded name/value pair.
		 *
		 * @param {string} name Name
		 * @param {string} value Value
		 *
		 * @returns {string} URI-encoded string
		 *
		 * @memberof BOOMR
		 */
		getUriEncodedVar: function(name, value) {
			if (value === undefined || value === null) {
				value = "";
			}

			if (typeof value === "object") {
				value = BOOMR.utils.serializeForUrl(value);
			}

			var result = encodeURIComponent(name) +
				"=" + encodeURIComponent(value);

			return result;
		},

		/**
		 * Gets the latest ResourceTiming entry for the specified URL.
		 *
		 * Default sort order is chronological startTime.
		 *
		 * @param {string} url Resource URL
		 * @param {function} [sort] Sort the entries before returning the last one
		 * @param {function} [filter] Filter the entries. Will be applied before sorting
		 *
		 * @returns {PerformanceEntry|undefined} Entry, or undefined if ResourceTiming is not
		 *  supported or if the entry doesn't exist
		 *
		 * @memberof BOOMR
		 */
		getResourceTiming: function(url, sort, filter) {
			var entries, p = BOOMR.getPerformance();

			try {
				if (p && typeof p.getEntriesByName === "function") {
					entries = p.getEntriesByName(url);
					if (!entries || !entries.length) {
						return;
					}
					if (typeof filter === "function") {
						entries = BOOMR.utils.arrayFilter(entries, filter);
						if (!entries || !entries.length) {
							return;
						}
					}
					if (entries.length > 1 && typeof sort === "function") {
						entries.sort(sort);
					}
					return entries[entries.length - 1];
				}
			}
			catch (e) {
				BOOMR.warn("getResourceTiming:" + e);
			}
		}

	};

	// if not already set already on BOOMR, determine the URL
	if (!BOOMR.url) {
		boomr.url = boomr.utils.getMyURL();
	}
	else {
		// canonicalize the URL
		var a = BOOMR.window.document.createElement("a");
		a.href = BOOMR.url;
		boomr.url = a.href;
	}

	delete BOOMR_start;

	/**
	 * @global
	 * @type {TimeStamp}
	 * @name BOOMR_lstart
	 * @desc
	 * Time the loader script started fetching boomerang.js (if the asynchronous
	 * loader snippet is used).
	 */
	if (typeof BOOMR_lstart === "number") {
		/**
		 * Time the loader script started fetching boomerang.js (if using the
		 * asynchronous loader snippet) (`BOOMR_lstart`)
		 * @type {TimeStamp}
		 *
		 * @memberof BOOMR
		 */
		boomr.t_lstart = BOOMR_lstart;
		delete BOOMR_lstart;
	}
	else if (typeof BOOMR.window.BOOMR_lstart === "number") {
		boomr.t_lstart = BOOMR.window.BOOMR_lstart;
	}

	/**
	 * Time the `window.onload` event fired (if using the asynchronous loader snippet).
	 *
	 * This timestamp is logged in the case boomerang.js loads after the onload event
	 * for browsers that don't support NavigationTiming.
	 *
	 * @global
	 * @name BOOMR_onload
	 * @type {TimeStamp}
	 */
	if (typeof BOOMR.window.BOOMR_onload === "number") {
		/**
		 * Time the `window.onload` event fired (if using the asynchronous loader snippet).
		 *
		 * This timestamp is logged in the case boomerang.js loads after the onload event
		 * for browsers that don't support NavigationTiming.
		 *
		 * @type {TimeStamp}
		 * @memberof BOOMR
		 */
		boomr.t_onload = BOOMR.window.BOOMR_onload;
	}

	(function() {
		var make_logger;

		if (typeof console === "object" && console.log !== undefined) {
			/**
			 * Logs the message to the console
			 *
			 * @param {string} m Message
			 * @param {string} l Log level
			 * @param {string} [s] Source
			 *
			 * @function log
			 *
			 * @memberof BOOMR
			 */
			boomr.log = function(m, l, s) {
				console.log("(" + BOOMR.now() + ") " +
					"{" + BOOMR.pageId + "}" +
					": " + s +
					": [" + l + "] " +
					m);
			};
		}
		else {
			// NOP for browsers that don't support it
			boomr.log = function() {};
		}

		make_logger = function(l) {
			return function(m, s) {
				this.log(m, l, "boomerang" + (s ? "." + s : ""));
				return this;
			};
		};

		/**
		 * Logs debug messages to the console
		 *
		 * Debug messages are stripped out of production builds.
		 *
		 * @param {string} m Message
		 * @param {string} [s] Source
		 *
		 * @function debug
		 *
		 * @memberof BOOMR
		 */
		boomr.debug = make_logger("debug");

		/**
		 * Logs info messages to the console
		 *
		 * @param {string} m Message
		 * @param {string} [s] Source
		 *
		 * @function info
		 *
		 * @memberof BOOMR
		 */
		boomr.info = make_logger("info");

		/**
		 * Logs warning messages to the console
		 *
		 * @param {string} m Message
		 * @param {string} [s] Source
		 *
		 * @function warn
		 *
		 * @memberof BOOMR
		 */
		boomr.warn = make_logger("warn");

		/**
		 * Logs error messages to the console
		 *
		 * @param {string} m Message
		 * @param {string} [s] Source
		 *
		 * @function error
		 *
		 * @memberof BOOMR
		 */
		boomr.error = make_logger("error");
	}());

	// If the browser supports performance.now(), swap that in for BOOMR.now
	try {
		var p = boomr.getPerformance();
		if (p &&
		    typeof p.now === "function" &&
		    // #545 handle bogus performance.now from broken shims
		    /\[native code\]/.test(String(p.now)) &&
		    p.timing &&
		    p.timing.navigationStart) {
			boomr.now = function() {
				return Math.round(p.now() + p.timing.navigationStart);
			};
		}
	}
	catch (ignore) {
		// empty
	}

	impl.checkLocalStorageSupport();

	(function() {
		var ident;
		for (ident in boomr) {
			if (boomr.hasOwnProperty(ident)) {
				BOOMR[ident] = boomr[ident];
			}
		}

		if (!BOOMR.xhr_excludes) {
			/**
			 * URLs to exclude from automatic `XMLHttpRequest` instrumentation.
			 *
			 * You can put any of the following in it:
			 * * A full URL
			 * * A hostname
			 * * A path
			 *
			 * @example
			 * 
			 * BOOMR.xhr_excludes = {
			 *   "mysite.com": true,
			 *   "/dashboard/": true,
			 *   "https://mysite.com/dashboard/": true
			 * };
			 *
			 * @memberof BOOMR
			 */
			BOOMR.xhr_excludes = {};
		}
	}());


	dispatchEvent("onBoomerangLoaded", { "BOOMR": BOOMR }, true);

}(window));


// end of boomerang beaconing section

/**
 * The roundtrip (RT) plugin measures page load time, or other timers associated with the page.
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## Beacon Parameters
 *
 * This plugin adds the following parameters to the beacon:
 *
 * * `t_done`: Perceived load time of the page.
 * * `t_page`: Time taken from the head of the page to {@link BOOMR#event:page_ready}.
 * * `t_page.inv`: If there was a problem detected with the start/end times of `t_page`.
 *    This can happen due to bugs in NavigationTiming clients, where `responseEnd`
 *    happens after all other NavigationTiming events.
 * * `t_resp`: Time taken from the user initiating the request to the first byte of the response.
 * * `t_other`: Comma separated list of additional timers set by page developer.
 *   Each timer is of the format `name|value`
 * * `t_load`: If the page were prerendered, this is the time to fetch and prerender the page.
 * * `t_prerender`: If the page were prerendered, this is the time from start of
 *   prefetch to the actual page display. It may only be useful for debugging.
 * * `t_postrender`: If the page were prerendered, this is the time from prerender
 *   finish to actual page display. It may only be useful for debugging.
 * * `vis.pre`: `1` if the page transitioned from prerender to visible
 * * `r`: URL of page that set the start time of the beacon.
 * * `nu`: URL of next page if the user clicked a link or submitted a form
 * * `rt.start`: Specifies where the start time came from. May be one of:
 *   - `cookie` for the start cookie
 *   - `navigation` for the W3C NavigationTiming API,
 *   - `csi` for older versions of Chrome or gtb for the Google Toolbar.
 *   - `manual` for XHR beacons
 *   - `none` if the start could not be detected
 * * `rt.tstart`: The start time timestamp.
 * * `rt.nstart`: The `navigationStart` timestamp, if different from `rt.tstart.  This could
 *    happen for XHR beacons, where `rt.tstart` is the start of the XHR fetch, and `nt_nav_st`
 *    won't be on the beacon.  It could also happen for SPA Soft beacons, where `rt.tstart`
 *    is the start of the Soft Navigation.
 * * `rt.cstart`: The start time stored in the cookie if different from rt.tstart.
 * * `rt.bstart`: The timestamp when boomerang started executing.
 * * `rt.blstart`: The timestamp when the boomerang was added to the host page.
 * * `rt.end`: The timestamp when the `t_done` timer ended
 *   (`rt.end - rt.tstart === t_done`)
 * * `rt.bmr`: Several parameters that include resource timing information for
 *   boomerang itself, ie, how long did boomerang take to load
 * * `rt.subres`: Set to `1` if this beacon is for a sub-resource of a primary
 *    page beacon. This is typically set by XHR beacons, and you will need to
 *    use a separate identifier to tie the primary beacon and the subresource
 *    beacon together on the server-side.
 * * `rt.quit`: This parameter will exist (but have no value) if the beacon was
 *    fired as part of the `onbeforeunload` event. This is typically used to
 *    find out how much time the user spent on the page before leaving, and is
 *    not guaranteed to fire.
 * * `rt.abld`: This parameter will exist (but have no value) if the `onbeforeunload`
 *    event fires before the `onload` event fires. This can happen, for example,
 *    if the user left the page before it completed loading.
 * * `rt.ntvu`: This parameter will exist (but have no value) if the `onbeforeunload`
 *    event fires before the page ever became visible. This can happen if the
 *    user opened the page in a background tab, and closed it without viewing it,
 *    and also if the page was pre-rendered, but never made visible. Use this
 *    to check your pre-render success ratio.
 * * `http.method`: For XHR beacons, the HTTP method if not `GET`.
 * * `http.errno`: For XHR beacons, the HTTP result code if not 200.
 * * `http.hdr`: For XHR beacons, headers if available.
 * * `http.type`: For XHR beacons, value of `f` for fetch API requests. Not set for XHRs.
 * * `xhr.sync`: For XHR beacons, `1` if it was sent synchronously.
 * * `http.initiator`: The initiator of the beacon:
 *   - (empty/missing) for the page load beacon
 *   - `xhr` for XHR beacons
 *   - `spa` for SPA Soft Navigations
 *   - `spa_hard` for SPA Hard Navigations
 * * `fetch.bnu`: For XHR beacons from fetch API requests, `1` if fetch response body was not used.
 *
 * ## Cookie
 *
 * The session information is stored within a cookie.
 *
 * You can customise the name of the cookie where the session information
 * will be stored via the {@link BOOMR.plugins.RT.init RT.cookie} option.
 *
 * By default this is set to `RT`.
 *
 * This cookie is set to expire in 7 days. You can change its lifetime using
 * the {@link BOOMR.plugins.RT.init RT.cookie_exp} option.
 *
 * During that time, you can also read the value of the cookie on the server
 * side. Its format is as follows:
 *
 * ```
 * RT="ss=nnnnnnn&si=abc-123...";
 * ```
 *
 * The parameters are defined as:
 *
 * * `ss` [string] [timestamp] Session Start (Base36)
 * * `si` [string] [guid] Session ID
 * * `sl` [string] [count] Session Length (Base36)
 * * `tt` [string] [ms] Sum of Load Times across the session (Base36)
 * * `obo` [string] [count] Number of pages in the session that had no load time (Base36)
 * * `dm` [string] [domain] Cookie domain
 * * `bcn` [string] [URL] Beacon URL
 * * `rl` [number] [boolean] Whether or not the session is Rate Limited
 * * `se` [string] [s] Session expiry (Base36)
 * * `ld` [string] [timestamp] Last load time (Base36, offset by ss)
 * * `ul` [string] [timestamp] Last beforeunload time (Base36, offset by ss)
 * * `hd` [string] [timestamp] Last unload time (Base36, offset by ss)
 * * `cl` [string] [timestamp] Last click time (Base36, offset by ss)
 * * `r` [string] [URL] Referrer URL (hashed, only if NavigationTiming isn't
 * *   supported and if strict_referrer is enabled)
 * * `nu` [string] [URL] Clicked URL (hashed)
 * * `z` [number] [flags] Compression flags
 *
 * @class BOOMR.plugins.RT
 */

// This is the Round Trip Time plugin.  Abbreviated to RT
// the parameter is the window
(function(w) {
	var d, impl,
	    COOKIE_EXP = 60 * 60 * 24 * 7;

	var SESSION_EXP = 60 * 30;

	/**
	 * Whether or not the cookie has compressed timestamps
	 */
	var COOKIE_COMPRESSED_TIMESTAMPS = 0x1;

	
	

	if (BOOMR.plugins.RT) {
		return;
	}

	// private object
	impl = {
		// Set when the page_ready event fires.
		// Use this to determine if unload fires before onload.
		onloadfired: false,

		// Set when the first unload event fires.
		// Use this to make sure we don't beacon twice for beforeunload and
		// unload.
		unloadfired: false,

		// Set when page becomes visible (for browsers that support it).
		// Use this to determine if user bailed without opening the tab.
		visiblefired: false,

		// Set when init has completed to prevent double initialization.
		initialized: false,

		// Set when this plugin has completed.
		complete: false,

		// Whether or not Boomerang is set to run at onload.
		autorun: true,

		// Custom timers that the developer can use.
		// Format for each timer is { start: XXX, end: YYY, delta: YYY-XXX }
		timers: {},

		// Name of the cookie that stores the start time and referrer.
		cookie: "RT",

		// Cookie expiry in seconds (7 days)
		cookie_exp: COOKIE_EXP,

		// Session expiry in seconds (30 minutes)
		session_exp: SESSION_EXP,

		// By default, don't beacon if referrers don't match.
		// If set to false, beacon both referrer values and let the back-end decide.
		strict_referrer: true,

		// Navigation Type from the NavTiming API.  We mainly care if this was
		// BACK_FORWARD since cookie time will be incorrect in that case.
		navigationType: 0,

		// Navigation Start time.
		navigationStart: undefined,

		// Response Start time.
		responseStart: undefined,

		// Total load time for the user session.
		loadTime: 0,

		// Number of pages in the session that had no load time.
		oboError: 0,

		// t_start that came off the cookie.
		t_start: undefined,

		// Cached value of t_start once we know its real value.
		cached_t_start: undefined,

		// Cached value of xhr t_start once we know its real value.
		cached_xhr_start: undefined,

		// Approximate first byte time for browsers that don't support NavigationTiming.
		t_fb_approx: undefined,

		// Referrer (hash) from the cookie.
		r: undefined,

		// Beacon server for the current session.
		// This could get reset at the end of the session.
		beacon_url: undefined,

		// beacon_url to use when session expires.
		next_beacon_url: undefined,

		// These timers are added directly as beacon variables.
		basic_timers: {
			t_done: 1,
			t_resp: 1,
			t_page: 1
		},

		// Whether or not this is a Cross-Domain load and we're sending session
		// details.
		crossdomain_sending: false,

		// Vars that were added to the beacon that we can remove after beaconing
		addedVars: [],

		/**
		 * Merge new cookie `params` onto current cookie, and set `timer` param on cookie to current timestamp
		 *
		 * @param {object} params Object containing keys & values to merge onto current cookie.  A value of `undefined`
		 *     will remove the key from the cookie
		 * @param {string} timer String key name that will be set to the current timestamp on the cookie
		 *
		 * @returns {boolean} true if the cookie was updated, false if the cookie could not be set for any reason
		 */
		updateCookie: function(params, timer) {
			var t_end, t_start, subcookies, k;

			// Disable use of RT cookie by setting its name to a falsy value
			if (!this.cookie) {
				return false;
			}

			// Get the cookie (don't decompress the values)
			subcookies = BOOMR.utils.getSubCookies(BOOMR.utils.getCookie(this.cookie)) || {};

			// Numeric indices were a bug, we need to clean it up
			for (k in subcookies) {
				if (subcookies.hasOwnProperty(k)) {
					if (!isNaN(parseInt(k, 10))) {
						delete subcookies[k];
					}
				}
			}

			if (typeof params === "object") {
				for (k in params) {
					if (params.hasOwnProperty(k)) {
						if (params[k] === undefined) {
							if (subcookies.hasOwnProperty(k)) {
								delete subcookies[k];
							}
						}
						else {
							subcookies[k] = params[k];
						}
					}
				}
			}

			// compresion level
			subcookies.z = COOKIE_COMPRESSED_TIMESTAMPS;

			// domain
			subcookies.dm = BOOMR.session.domain;

			// session ID
			subcookies.si = BOOMR.session.ID;

			// session start
			subcookies.ss = BOOMR.session.start.toString(36);

			// session length
			subcookies.sl = BOOMR.session.length.toString(36);

			// session expiry
			if (impl.session_exp !== SESSION_EXP) {
				subcookies.se = impl.session_exp.toString(36);
			}

			// rate limited
			if (BOOMR.session.rate_limited) {
				subcookies.rl = 1;
			}

			// total time
			subcookies.tt = this.loadTime.toString(36);

			// off-by-one
			if (this.oboError > 0) {
				subcookies.obo = this.oboError.toString(36);
			}
			else {
				delete subcookies.obo;
			}

			t_start = BOOMR.now();

			// sub-timer
			if (timer) {
				subcookies[timer] = (t_start - BOOMR.session.start).toString(36);
				impl.lastActionTime = t_start;
			}

			// If we got a beacon_url from config, set it into the cookie
			if (this.beacon_url) {
				subcookies.bcn = this.beacon_url;
			}

			
			if (!BOOMR.utils.setCookie(this.cookie, subcookies, this.cookie_exp)) {
				BOOMR.error("cannot set start cookie", "rt");
				return false;
			}

			t_end = BOOMR.now();
			if (t_end - t_start > 50) {
				// It took > 50ms to set the cookie
				// The user Most likely has cookie prompting turned on so
				// t_start won't be the actual unload time
				// We bail at this point since we can't reliably tell t_done
				BOOMR.utils.removeCookie(this.cookie);

				// at some point we may want to log this info on the server side
				BOOMR.error("took more than 50ms to set cookie... aborting: " +
					t_start + " -> " + t_end, "rt");
			}

			return true;
		},

		/**
		 * Update in memory session with values from the cookie.
		 *
		 * For server-driven Boomerang, many of these values might come through
		 * a configuration file (config.json), but we need them before config.json comes through,
		 * or in cases where we're rate limited, or the server is down, config.json may never
		 * come through, so we hold them in a cookie.
		 *
		 * @param subcookies  [optional] object containing cookie keys & values. If not set, will use current cookie value.
		 * Recognised keys:
		 * - ss: sesion start
		 * - si: session ID
		 * - sl: session length
		 * - tt: sum of load times across session
		 * - obo: pages in session that did not have a load time
		 * - dm: domain to use when setting cookies
		 * - se: session expiry time
		 * - bcn: URL that beacons should be sent to
		 * - rl: rate limited flag. 1 if rate limited
		 */
		refreshSession: function(subcookies) {
			if (!subcookies) {
				subcookies = BOOMR.plugins.RT.getCookie();
			}

			if (!subcookies) {
				return;
			}

			if (subcookies.ss) {
				BOOMR.session.start = subcookies.ss;
			}
			else {
				// If the cookie didn't have a good session start time, we'll use the earliest
				// time that we know about... either when the boomerang loader showed up on page
				// or when the first bytes of boomerang loaded up.
				BOOMR.session.start = BOOMR.t_lstart || BOOMR.t_start;
			}

			if (subcookies.si && subcookies.si.match(/-/)) {
				BOOMR.session.ID = subcookies.si;
			}

			if (subcookies.sl) {
				BOOMR.session.length = subcookies.sl;
			}

			if (subcookies.tt) {
				this.loadTime = subcookies.tt;
			}

			if (subcookies.obo) {
				this.oboError = subcookies.obo;
			}

			if (subcookies.dm && !BOOMR.session.domain) {
				BOOMR.session.domain = subcookies.dm;
			}

			if (subcookies.se) {
				impl.session_exp = subcookies.se;
			}

			if (subcookies.bcn) {
				this.beacon_url = subcookies.bcn;
			}

			if (subcookies.rl && subcookies.rl === "1") {
				BOOMR.session.rate_limited = true;
			}
		},

		/**
		 * Determine if session has expired or not, and if so, reset session values to a new session.
		 *
		 * @param t_done  The timestamp right now.  Used to determine if the session is too old
		 * @param t_start The timestamp when this page was requested (or undefined if unknown).  Used to reset session start time
		 *
		 */
		maybeResetSession: function(t_done, t_start) {
			
			

			// determine the average page session length, which is the session length over # of pages
			var avgSessionLength = 0;
			if (BOOMR.session.start && BOOMR.session.length) {
				avgSessionLength = (BOOMR.now() - BOOMR.session.start) / BOOMR.session.length;
			}

			var sessionExp = impl.session_exp * 1000;

			// if session hasn't started yet, or if it's been more than thirty minutes since the last beacon,
			// reset the session (note 30 minutes is an industry standard limit on idle time for session expiry)

			// no start time
			if (!BOOMR.session.start ||
			    // or we have a better start time
			    (t_start && BOOMR.session.start > t_start) ||
			    // or it's been more than session_exp since the last action
			    t_done - (impl.lastActionTime || BOOMR.t_start) > sessionExp ||
			    // or the average page session length is longer than the session exp
			    (avgSessionLength > sessionExp)
			) {
				// Now we reset the session
				BOOMR.session.start = t_start || BOOMR.t_lstart || BOOMR.t_start;
				BOOMR.session.length = 0;
				BOOMR.session.rate_limited = false;
				impl.loadTime = 0;
				impl.oboError = 0;
				impl.beacon_url = impl.next_beacon_url;
				impl.lastActionTime = t_done;

				// Update the cookie with these new values
				// we also reset the rate limited flag since
				// new sessions do not inherit the rate limited
				// state of old sessions
				impl.updateCookie({
					"rl": undefined,
					"sl": BOOMR.session.length,
					"ss": BOOMR.session.start,
					"tt": impl.loadTime,
					"obo": undefined, // since it's 0
					"bcn": impl.beacon_url
				});
			}

			
			
		},

		/**
		 * Read initial values from cookie and clear out cookie values it cares about after reading.
		 * This makes sure that other pages (eg: loaded in new tabs) do not get an invalid cookie time.
		 * This method should only be called from init, and may be called more than once.
		 *
		 * Request start time is the greater of last page beforeunload or last click time
		 * If start time came from a click, we check that the clicked URL matches the current URL
		 * If it came from a beforeunload, we check that cookie referrer matches document.referrer
		 *
		 * If we had a pageHide time or unload time, we use that as a proxy for first byte on non-navtiming
		 * browsers.
		 */
		initFromCookie: function() {
			var urlHash, docReferrerHash, subcookies;
			subcookies = BOOMR.plugins.RT.getCookie();

			if (!this.cookie) {
				BOOMR.session.enabled = false;
			}
			if (!subcookies) {
				return;
			}

			subcookies.s = Math.max(+subcookies.ld || 0, Math.max(+subcookies.ul || 0, +subcookies.cl || 0));

			

			// If we have a start time, and either a referrer, or a clicked on URL,
			// we check if the start time is usable.
			if (subcookies.s && (subcookies.r || subcookies.nu)) {
				this.r = subcookies.r;
				urlHash = BOOMR.utils.MD5(d.URL);
				docReferrerHash = BOOMR.utils.MD5((d && d.referrer) || "");

				// Either the URL of the page setting the cookie needs to match document.referrer
				

				// Or the start timer was no more than 15ms after a click or form submit
				// and the URL clicked or submitted to matches the current page's URL
				// (note the start timer may be later than click if both click and beforeunload fired
				// on the previous page)
				if (subcookies.cl) {
					
				}
				if (subcookies.nu) {
					
				}

				if (!this.strict_referrer ||
					(subcookies.cl && subcookies.nu && subcookies.nu === urlHash && subcookies.s < +subcookies.cl + 15) ||
					(subcookies.s === +subcookies.ul && this.r === docReferrerHash)
				) {
					this.t_start = subcookies.s;

					// additionally, if we have a pagehide, or unload event, that's a proxy
					// for the first byte of the current page, so use that wisely
					if (+subcookies.hd > subcookies.s) {
						this.t_fb_approx = subcookies.hd;
					}
				}
				else {
					this.t_start = this.t_fb_approx = undefined;
				}
			}

			// regardless of whether the start time was usable or not, it's the last action that
			// we measured, so use that for the session
			if (subcookies.s) {
				this.lastActionTime = subcookies.s;
			}

			this.refreshSession(subcookies);

			// Now that we've pulled out the timers, we'll clear them so they don't pollute future calls
			this.updateCookie({
				// timers
				s: undefined,  // start timer
				ul: undefined, // onbeforeunload time
				cl: undefined, // onclick time
				hd: undefined, // onunload or onpagehide time
				ld: undefined, // last load time

				// session info
				rl: undefined, // rate limited

				// URLs
				r: undefined,  // referrer
				nu: undefined, // clicked url

				// deprecated
				sh: undefined  // session history
			});

			this.maybeResetSession(BOOMR.now());
		},

		/**
		 * Increment session length, and either session.obo or session.loadTime whichever is appropriate for this page
		 */
		incrementSessionDetails: function() {
			
			BOOMR.session.length++;

			if (isNaN(impl.timers.t_done.delta)) {
				impl.oboError++;
			}
			else {
				impl.loadTime += impl.timers.t_done.delta;
			}
		},

		/**
		 * Figure out how long boomerang and other URLs took to load using
		 * ResourceTiming if available, or built in timestamps.
		 */
		getBoomerangTimings: function() {
			var res, urls, url, startTime, data;

			function trimTiming(time, st) {
				// strip from microseconds to milliseconds only
				var timeMs = Math.round(time ? time : 0),
				    startTimeMs = Math.round(st ? st : 0);

				timeMs = (timeMs === 0 ? 0 : (timeMs - startTimeMs));

				return timeMs ? timeMs : "";
			}

			if (BOOMR.t_start) {
				// How long does it take Boomerang to load up and execute (fb to lb)?
				BOOMR.plugins.RT.startTimer("boomerang", BOOMR.t_start);
				BOOMR.plugins.RT.endTimer("boomerang", BOOMR.t_end);	// t_end === null defaults to current time

				// How long did it take from page request to boomerang fb?
				BOOMR.plugins.RT.endTimer("boomr_fb", BOOMR.t_start);

				if (BOOMR.t_lstart) {
					// when did the boomerang loader start loading boomerang on the page?
					BOOMR.plugins.RT.endTimer("boomr_ld", BOOMR.t_lstart);
					// What was the network latency for boomerang (request to first byte)?
					BOOMR.plugins.RT.setTimer("boomr_lat", BOOMR.t_start - BOOMR.t_lstart);
				}
			}

			// use window and not w because we want the inner iframe
			try {
				if (window &&
				    "performance" in window &&
				    window.performance &&
				    typeof window.performance.getEntriesByName === "function") {
					urls = { "rt.bmr": BOOMR.url };

					if (BOOMR.config_url) {
						urls["rt.cnf"] = BOOMR.config_url;
					}

					for (url in urls) {
						if (urls.hasOwnProperty(url) && urls[url]) {
							res = window.performance.getEntriesByName(urls[url]);
							if (!res || res.length === 0 || !res[0]) {
								continue;
							}

							res = res[0];

							startTime = trimTiming(res.startTime, 0);
							data = [
								startTime,
								trimTiming(res.responseEnd, startTime),
								trimTiming(res.responseStart, startTime),
								trimTiming(res.requestStart, startTime),
								trimTiming(res.connectEnd, startTime),
								trimTiming(res.secureConnectionStart, startTime),
								trimTiming(res.connectStart, startTime),
								trimTiming(res.domainLookupEnd, startTime),
								trimTiming(res.domainLookupStart, startTime),
								trimTiming(res.redirectEnd, startTime),
								trimTiming(res.redirectStart, startTime)
							].join(",").replace(/,+$/, "");

							BOOMR.addVar(url, data);
							impl.addedVars.push(url);
						}
					}
				}
			}
			catch (e) {
				BOOMR.addError(e, "rt.getBoomerangTimings");
			}
		},

		/**
		 * Check if we're in a prerender state, and if we are, set additional timers.
		 * In Chrome/IE, a prerender state is when a page is completely rendered in an in-memory buffer, before
		 * a user requests that page.  We do not beacon at this point because the user has not shown intent
		 * to view the page.  If the user opens the page, the visibility state changes to visible, and we
		 * fire the beacon at that point, including any timing details for prerendering.
		 *
		 * Sets the `t_load` timer to the actual value of page load time (request initiated by browser to onload)
		 *
		 * @returns true if this is a prerender state, false if not (or not supported)
		 */
		checkPreRender: function() {
			if (BOOMR.visibilityState() !== "prerender") {
				return false;
			}

			// This means that onload fired through a pre-render.  We'll capture this
			// time, but wait for t_done until after the page has become either visible
			// or hidden (ie, it moved out of the pre-render state)
			// http://code.google.com/chrome/whitepapers/pagevisibility.html
			// http://www.w3.org/TR/2011/WD-page-visibility-20110602/
			// http://code.google.com/chrome/whitepapers/prerender.html

			BOOMR.plugins.RT.startTimer("t_load", this.navigationStart);
			BOOMR.plugins.RT.endTimer("t_load");					// this will measure actual onload time for a prerendered page
			BOOMR.plugins.RT.startTimer("t_prerender", this.navigationStart);
			BOOMR.plugins.RT.startTimer("t_postrender");				// time from prerender to visible or hidden

			return true;
		},

		/**
		 * Initialise timers from the NavigationTiming API.  This method looks at various sources for
		 * Navigation Timing, and also patches around bugs in various browser implementations.
		 * It sets the beacon parameter `rt.start` to the source of the timer
		 */
		initFromNavTiming: function() {
			var ti, p, source;

			if (this.navigationStart) {
				return;
			}

			// Get start time from WebTiming API see:
			// https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/NavigationTiming/Overview.html
			// http://blogs.msdn.com/b/ie/archive/2010/06/28/measuring-web-page-performance.aspx
			// http://blog.chromium.org/2010/07/do-you-know-how-slow-your-web-page-is.html
			p = BOOMR.getPerformance();

			if (p && p.navigation) {
				this.navigationType = p.navigation.type;
			}

			if (p && p.timing) {
				ti = p.timing;
			}
			else if (w.chrome && w.chrome.csi && w.chrome.csi().startE) {
				// Older versions of chrome also have a timing API that's sort of documented here:
				// http://ecmanaut.blogspot.com/2010/06/google-bom-feature-ms-since-pageload.html
				// source here:
				// http://src.chromium.org/viewvc/chrome/trunk/src/chrome/renderer/loadtimes_extension_bindings.cc?view=markup
				ti = {
					navigationStart: w.chrome.csi().startE
				};
				source = "csi";
			}
			else if (w.gtbExternal && w.gtbExternal.startE()) {
				// The Google Toolbar exposes navigation start time similar to old versions of chrome
				// This would work for any browser that has the google toolbar installed
				ti = {
					navigationStart: w.gtbExternal.startE()
				};
				source = "gtb";
			}

			if (ti) {
				// Always use navigationStart since it falls back to fetchStart (not with redirects)
				// If not set, we leave t_start alone so that timers that depend
				// on it don't get sent back.  Never use requestStart since if
				// the first request fails and the browser retries, it will contain
				// the value for the new request.
				BOOMR.addVar("rt.start", source || "navigation");
				this.navigationStart = ti.navigationStart || ti.fetchStart || undefined;
				this.fetchStart = ti.fetchStart || undefined;
				this.responseStart = ti.responseStart || undefined;

				// bug in Firefox 7 & 8 https://bugzilla.mozilla.org/show_bug.cgi?id=691547
				if (navigator.userAgent.match(/Firefox\/[78]\./)) {
					this.navigationStart = ti.unloadEventStart || ti.fetchStart || undefined;
				}
			}
			else {
				BOOMR.warn("This browser doesn't support the WebTiming API", "rt");
			}

			return;
		},

		/**
		 * Validate that the time we think is the load time is correct.  This can be wrong if boomerang was loaded
		 * after onload, so in that case, if navigation timing is available, we use that instead.
		 */
		validateLoadTimestamp: function(t_now, data, ename) {
			var p;

			// beacon with detailed timing information
			if (data && data.timing && data.timing.loadEventEnd) {
				return data.timing.loadEventEnd;
			}
			else if (ename === "xhr" && (!data || !BOOMR.utils.inArray(data.initiator, BOOMR.constants.BEACON_TYPE_SPAS))) {
				// if this is an XHR event, trust the input end "now" timestamp
				return t_now;
			}
			else {
				// use loadEventEnd from NavigationTiming
				p = BOOMR.getPerformance();

				// We have navigation timing,
				if (p && p.timing) {
					// and the loadEventEnd timestamp
					if (p.timing.loadEventEnd) {
						return p.timing.loadEventEnd;
					}
				}
				// We don't have navigation timing,
				else {
					// So we'll just use the time when boomerang was added to the page
					// Assuming that this means boomerang was added in onload.  If we logged the
					// onload timestamp (via loader snippet), use that first.
					return BOOMR.t_onload || BOOMR.t_lstart || BOOMR.t_start || t_now;
				}
			}

			// default to now
			return t_now;
		},

		/**
		 * Set timers appropriate at page load time.  This method should be called from done() only when
		 * the page_ready event fires.  It sets the following timer values:
		 *		- t_resp:	time from request start to first byte
		 *		- t_page:	time from first byte to load
		 *		- t_postrender	time from prerender state to visible state
		 *		- t_prerender	time from navigation start to visible state
		 *
		 * @param ename  The Event name that initiated this control flow
		 * @param t_done The timestamp when the done() method was called
		 * @param data   Event data passed in from the caller.  For xhr beacons, this may contain detailed timing information
		 *
		 * @returns true if timers were set, false if we're in a prerender state, caller should abort on false.
		 */
		setPageLoadTimers: function(ename, t_done, data) {
			var t_resp_start, t_fetch_start, p, navSt;

			if (ename !== "xhr") {
				impl.initFromCookie();
				impl.initFromNavTiming();

				if (impl.checkPreRender()) {
					return false;
				}
			}

			if (ename === "xhr") {
				if (data.timers) {
					// If we were given a list of timers, set those first
					for (var timerName in data.timers) {
						if (data.timers.hasOwnProperty(timerName)) {
							BOOMR.plugins.RT.setTimer(timerName, data.timers[timerName]);
						}
					}
				}
				else if (data && data.timing) {
					// Use details from XHR object to figure out responce latency and page time. Use
					// responseEnd (instead of responseStart) since it's not until responseEnd
					// that the browser can consume the data, and responseEnd is the only guarateed
					// timestamp with cross-origin XHRs if ResourceTiming is enabled.

					t_fetch_start = data.timing.fetchStart;

					if (typeof t_fetch_start === "undefined" || data.timing.responseEnd >= t_fetch_start) {
						t_resp_start = data.timing.responseEnd;
					}
				}
			}
			else if (impl.responseStart) {
				// Use NavTiming API to figure out resp latency and page time
				// t_resp will use the cookie if available or fallback to NavTiming

				// only use if the time looks legit (after navigationStart/fetchStart)
				if (impl.responseStart >= impl.navigationStart &&
				    impl.responseStart >= impl.fetchStart) {
					t_resp_start = impl.responseStart;
				}
			}
			else if (impl.timers.hasOwnProperty("t_page")) {
				// If the dev has already started t_page timer, we can end it now as well
				BOOMR.plugins.RT.endTimer("t_page");
			}
			else if (impl.t_fb_approx) {
				// If we have an approximate first byte time from the cookie, use it
				t_resp_start = impl.t_fb_approx;
			}

			if (t_resp_start) {
				// if we have a fetch start as well, set the specific timestamps instead of from rt.start
				if (t_fetch_start) {
					BOOMR.plugins.RT.setTimer("t_resp", t_fetch_start, t_resp_start);
				}
				else {
					BOOMR.plugins.RT.endTimer("t_resp", t_resp_start);
				}

				// t_load is the actual time load completed if using prerender
				if (ename === "load" && impl.timers.t_load) {
					BOOMR.plugins.RT.setTimer("t_page", impl.timers.t_load.end - t_resp_start);
				}
				else {
					//
					// Ensure that t_done is after t_resp_start.  If not, set a var so we
					// knew there was an inversion.  This can happen due to bugs in NavTiming
					// clients, where responseEnd happens after all other NavTiming events.
					//
					if (t_done < t_resp_start) {
						BOOMR.addVar("t_page.inv", 1);
					}
					else {
						BOOMR.plugins.RT.setTimer("t_page", t_done - t_resp_start);
					}
				}
			}

			// If a prerender timer was started, we can end it now as well
			if (ename === "load" && impl.timers.hasOwnProperty("t_postrender")) {
				BOOMR.plugins.RT.endTimer("t_postrender");
				BOOMR.plugins.RT.endTimer("t_prerender");
			}

			return true;
		},

		/**
		 * Writes a bunch of timestamps onto the beacon that help in request tracing on the server
		 * - rt.tstart: The value of t_start that we determined was appropriate
		 * - rt.nstart: The value of navigationStart if different from rt.tstart
		 * - rt.cstart: The value of t_start from the cookie if different from rt.tstart
		 * - rt.bstart: The timestamp when boomerang started
		 * - rt.blstart:The timestamp when boomerang was added to the host page
		 * - rt.end:    The timestamp when the t_done timer ended
		 *
		 * @param t_start The value of t_start that we plan to use
		 */
		setSupportingTimestamps: function(t_start) {
			if (t_start) {
				BOOMR.addVar("rt.tstart", t_start);
			}
			if (typeof impl.navigationStart === "number" && impl.navigationStart !== t_start) {
				BOOMR.addVar("rt.nstart", impl.navigationStart);
			}
			if (typeof impl.t_start === "number" && impl.t_start !== t_start) {
				BOOMR.addVar("rt.cstart", impl.t_start);
			}
			BOOMR.addVar("rt.bstart", BOOMR.t_start);
			if (BOOMR.t_lstart) {
				BOOMR.addVar("rt.blstart", BOOMR.t_lstart);
			}
			BOOMR.addVar("rt.end", impl.timers.t_done.end);	// don't just use t_done because dev may have called endTimer before we did
		},

		/**
		 * Determines the best value to use for t_start.
		 * If called from an xhr call, then use the start time for that call
		 * Else, If we have navigation timing, use that
		 * Else, If we have a cookie time, and this isn't the result of a BACK button, use the cookie time
		 * Else, if we have a cached timestamp from an earlier call, use that
		 * Else, give up
		 *
		 * @param ename	The event name that resulted in this call. Special consideration for "xhr"
		 * @param data  Data passed in from the event caller. If the event name is "xhr",
		 *              this should contain the page group name for the xhr call in an attribute called `name`
		 *		and optionally, detailed timing information in a sub-object called `timing`
		 *              and resource information in a sub-object called `resource`
		 *
		 * @returns the determined value of t_start or undefined if unknown
		 */
		determineTStart: function(ename, data) {
			var t_start;
			if (ename === "xhr") {
				if (data && data.name && impl.timers[data.name]) {
					// For xhr timers, t_start is stored in impl.timers.xhr_{page group name}
					// and xhr.pg is set to {page group name}
					t_start = impl.timers[data.name].start;
				}
				else if (data && data.timing && data.timing.requestStart) {
					// For automatically instrumented xhr timers, we have detailed timing information
					t_start = data.timing.requestStart;
				}

				if (typeof t_start === "undefined" && data && BOOMR.utils.inArray(data.initiator, BOOMR.constants.BEACON_TYPE_SPAS)) {
					// if we don't have a start time, set to none so it can possibly be fixed up
					BOOMR.addVar("rt.start", "none");
				}
				else {
					BOOMR.addVar("rt.start", "manual");
				}

				impl.cached_xhr_start = t_start;
			}
			else {
				if (impl.navigationStart) {
					t_start = impl.navigationStart;
				}
				else if (impl.t_start && impl.navigationType !== 2) {
					t_start = impl.t_start;			// 2 is TYPE_BACK_FORWARD but the constant may not be defined across browsers
					BOOMR.addVar("rt.start", "cookie");	// if the user hit the back button, referrer will match, and cookie will match
				}						// but will have time of previous page start, so t_done will be wrong
				else if (impl.cached_t_start) {
					t_start = impl.cached_t_start;
				}
				else {
					BOOMR.addVar("rt.start", "none");
					t_start = undefined;			// force all timers to NaN state
				}

				impl.cached_t_start = t_start;
			}

			
			return t_start;
		},

		page_ready: function() {
			// we need onloadfired because it's possible to reset "impl.complete"
			// if you're measuring multiple xhr loads, but not possible to reset
			// impl.onloadfired
			this.onloadfired = true;
		},

		check_visibility: function() {
			// we care if the page became visible at some point
			if (BOOMR.visibilityState() === "visible") {
				impl.visiblefired = true;
			}
		},

		prerenderToVisible: function() {
			if (impl.onloadfired &&
			    impl.autorun) {
				

				// note that we transitioned from prerender on the beacon for debugging
				BOOMR.addVar("vis.pre", "1");

				// send a beacon
				BOOMR.plugins.RT.done(null, "visible");
			}
		},

		page_unload: function(edata) {
			
			if (!this.unloadfired) {
				// run done on abort or on page_unload to measure session length
				BOOMR.plugins.RT.done(edata, "unload");
			}

			//
			// Set cookie with r (the referrer) of this page, but only if the
			// browser doesn't support NavigationTiming.  The referrer is used
			// in non-NT browsers to decide if the "ul" or "hd" timestamps can
			// be used as the start of the navigation.  Don't set if strict_referrer
			// is disabled either.
			//
			// We use document.URL instead of location.href because of a bug in safari 4
			// where location.href is URL decoded
			//
			this.updateCookie(
				(!impl.navigationStart && impl.strict_referrer) ? {
					"r": BOOMR.utils.MD5(d.URL)
				} : null,
				edata.type === "beforeunload" ? "ul" : "hd"
			);

			this.unloadfired = true;
		},

		_iterable_click: function(name, element, etarget, value_cb) {
			var value;
			if (!etarget) {
				return;
			}
			
			while (etarget && etarget.nodeName && etarget.nodeName.toUpperCase() !== element) {
				etarget = etarget.parentNode;
			}
			if (etarget && etarget.nodeName && etarget.nodeName.toUpperCase() === element) {
				

				// we might need to reset the session first, as updateCookie()
				// below sets the lastActionTime
				this.refreshSession();
				this.maybeResetSession(BOOMR.now());

				// user event, they may be going to another page
				// if this page is being opened in a different tab, then
				// our unload handler won't fire, so we need to set our
				// cookie on click or submit
				value = value_cb(etarget);

				this.updateCookie(
					{
						"nu": BOOMR.utils.MD5(value)
					},
					"cl");

				//BOOMR.addVar("nu", BOOMR.utils.cleanupURL(value));

				//impl.addedVars.push("nu");
			}
		},

		onclick: function(etarget) {
			impl._iterable_click("Click", "A", etarget, function(t) { return t.href; });
		},

		markComplete: function() {
			if (this.onloadfired) {
				// allow error beacons to send outside of page load without adding
				// RT variables to the beacon
				impl.complete = true;
			}
		},

		onsubmit: function(etarget) {
			impl._iterable_click("Submit", "FORM", etarget, function(t) {
				var v = (typeof t.getAttribute === "function" && t.getAttribute("action")) || d.URL || "";
				return v.match(/\?/) ? v : v + "?";
			});
		},

		onconfig: function(config) {
			if (config.beacon_url) {
				impl.beacon_url = config.beacon_url;
			}

			if (config.RT) {
				if (config.RT.oboError && !isNaN(config.RT.oboError) && config.RT.oboError > impl.oboError) {
					impl.oboError = config.RT.oboError;
				}

				if (config.RT.loadTime && !isNaN(config.RT.loadTime) && config.RT.loadTime > impl.loadTime) {
					impl.loadTime = config.RT.loadTime;

					if (impl.timers.t_done && !isNaN(impl.timers.t_done.delta)) {
						impl.loadTime += impl.timers.t_done.delta;
					}
				}
			}
		},

		domloaded: function() {
			BOOMR.plugins.RT.endTimer("t_domloaded");
		},

		clear: function() {
			BOOMR.removeVar("rt.start");
			if (impl.addedVars && impl.addedVars.length > 0) {
				BOOMR.removeVar(impl.addedVars);
				impl.addedVars = [];
			}
		},

		spaNavigation: function() {
			// a SPA navigation occured, force onloadfired to true
			impl.onloadfired = true;
		}
	};

	BOOMR.plugins.RT = {
		/**
		 * Initializes the plugin.
		 *
		 * @param {object} config Configuration
		 * @param {string} [config.RT.cookie] The name of the cookie in which to store
		 * the start time for measuring page load time.
		 *
		 * The default name is `RT`.
		 *
		 * Set this to a falsy value to ignore cookies and depend completely on
		 * the NavigationTiming API for the start time.
		 * @param {string} [config.RT.cookie_exp] The lifetime in seconds of the roundtrip cookie.
		 *
		 * This only needs to live for as long as it takes for a single page to load.
		 *
		 * Something like 10 seconds or so should be good for most cases, but to be safe,
		 * and to cover people with really slow connections, or users that are geographically
		 * far away from you, keep it to a few minutes.
		 *
		 * The default is set to 10 minutes.
		 * @param {string} [config.RT.strict_referrer] By default, boomerang will not measure a
		 * page's roundtrip time if the URL in the RT cookie doesn't match the
		 * current page's `document.referrer`.
		 *
		 * This is because it generally means that the user visited a third page
		 * while their RT cookie was still valid, and this could render the page
		 * load time invalid.
		 *
		 * There may be cases, though, when this is a valid flow - for example,
		 * you have an SSL page in between and the referrer isn't passed through.
		 *
		 * In this case, you'll want to set `strict_referrer` to `false`.
		 *
		 * The default is `true.`
		 *
		 * @returns {@link BOOMR.plugins.RT} The RT plugin for chaining
		 * @memberof BOOMR.plugins.RT
		 */
		init: function(config) {
			
			if (w !== BOOMR.window) {
				w = BOOMR.window;
			}

			if (config && config.CrossDomain && config.CrossDomain.sending) {
				impl.crossdomain_sending = true;
			}

			// protect against undefined window/document
			if (!w || !w.document) {
				return;
			}

			d = w.document;

			BOOMR.utils.pluginConfig(impl, config, "RT",
						["cookie", "cookie_exp", "session_exp", "strict_referrer"]);

			if (config && typeof config.autorun !== "undefined") {
				impl.autorun = config.autorun;
			}

			// If we received a beacon URL from the server, we'll use it, unless of course
			// we already had a beacon URL, in which case we'll hold on to it until our session
			// expires, and then use it.
			// It's possible that a beacon collector dies while a session is active, and in that
			// case we might end up sending beacons to a blackhole until the next config.js
			// request tells us to force the new beacon url
			if (config && config.beacon_url) {
				if (!impl.beacon_url || config.force_beacon_url) {
					impl.beacon_url = config.beacon_url;
				}
				impl.next_beacon_url = config.beacon_url;
			}

			// A beacon may be fired automatically on page load or if the page dev fires
			// it manually with their own timers.  It may not always contain a referrer
			// (eg: XHR calls).  We set default values for these cases.
			// This is done before reading from the cookie because the cookie overwrites
			// impl.r
			if (typeof d !== "undefined") {
				impl.r = BOOMR.utils.hashQueryString(d.referrer, true);
			}

			// Now pull out start time information and session information from the cookie
			// We'll do this every time init is called, and every time we call it, it will
			// overwrite values already set (provided there are values to read out)
			impl.initFromCookie();

			// only initialize once.  we still collect config and check/set cookies
			// every time init is called, but we attach event handlers only once
			if (impl.initialized) {
				return this;
			}

			impl.complete = false;
			impl.timers = {};

			impl.check_visibility();

			BOOMR.subscribe("page_ready", impl.page_ready, null, impl);
			BOOMR.subscribe("visibility_changed", impl.check_visibility, null, impl);
			BOOMR.subscribe("prerender_to_visible", impl.prerenderToVisible, null, impl);
			BOOMR.subscribe("page_ready", this.done, "load", this);
			BOOMR.subscribe("xhr_load", this.done, "xhr", this);
			BOOMR.subscribe("dom_loaded", impl.domloaded, null, impl);
			BOOMR.subscribe("page_unload", impl.page_unload, null, impl);
			BOOMR.subscribe("click", impl.onclick, null, impl);
			BOOMR.subscribe("form_submit", impl.onsubmit, null, impl);
			BOOMR.subscribe("before_beacon", this.addTimersToBeacon, "beacon", this);
			BOOMR.subscribe("beacon", impl.clear, null, impl);
			BOOMR.subscribe("error", impl.markComplete, null, impl);
			BOOMR.subscribe("config", impl.onconfig, null, impl);
			BOOMR.subscribe("spa_navigation", impl.spaNavigation, null, impl);
			BOOMR.subscribe("interaction", impl.markComplete, null, impl);

			// Override any getBeaconURL method to make sure we return the one from the
			// cookie and not the one hardcoded into boomerang
			BOOMR.getBeaconURL = function() { return impl.beacon_url; };

			impl.initialized = true;
			return this;
		},

		/**
		 * Starts the timer named `timer_name`.
		 *
		 * Timers count in milliseconds.
		 *
		 * You must call {@link BOOMR.plugins.RT.endTimer} when this timer has
		 * completed for the measurement to be recorded in the beacon.
		 *
		 * If passed in, the optional second parameter `time_value` is the timestamp
		 * in milliseconds to set the timer's start time to. This is useful if you
		 * need to record a timer that started before boomerang was loaded.
		 *
		 * @param {string} timer_name The name of the timer to start
		 * @param {TimeStamp} [time_value] If set, the timer's start time will be
		 * set explicitly to this value. If not set, the current timestamp is used.
		 *
		 * @returns {@link BOOMR.plugins.RT} The RT plugin for chaining
		 * @memberof BOOMR.plugins.RT
		 */
		startTimer: function(timer_name, time_value) {
			if (timer_name) {
				if (timer_name === "t_page") {
					this.endTimer("t_resp", time_value);
				}
				impl.timers[timer_name] = {start: (typeof time_value === "number" ? time_value : BOOMR.now())};
			}

			return this;
		},

		/**
		 * Stops the timer named `timer_name`.
		 *
		 * It is not necessary for the timer to have been started before you call `endTimer()`.
		 *
		 * If a timer with this name was not started, then the unload time of the
		 * previous page is used instead. This allows you to measure the time across pages.
		 *
		 * @param {string} timer_name The name of the timer to start
		 * @param {TimeStamp} [time_value] If set, the timer's stop time will be
		 * set explicitly to this value. If not set, the current timestamp is used.
		 *
		 * @returns {@link BOOMR.plugins.RT} The RT plugin for chaining
		 * @memberof BOOMR.plugins.RT
		 */
		endTimer: function(timer_name, time_value) {
			if (timer_name) {
				impl.timers[timer_name] = impl.timers[timer_name] || {};
				if (impl.timers[timer_name].end === undefined) {
					impl.timers[timer_name].end =
							(typeof time_value === "number" ? time_value : BOOMR.now());
				}
			}

			return this;
		},

		/**
		 * Clears (removes) the specified timer
		 *
		 * @param {string} timer_name Timer name
		 * @memberof BOOMR.plugins.RT
		 */
		clearTimer: function(timer_name) {
			if (timer_name) {
				delete impl.timers[timer_name];
			}

			return this;
		},

		/**
		 * Sets the timer named `timer_name` to an explicit time measurement `time_value`.
		 *
		 * You'd use this method if you measured time values within your page before
		 * boomerang was loaded and now need to pass those values to the {@link BOOMR.plugins.RT}
		 * plugin for inclusion in the beacon.
		 *
		 * It is not necessary to call `startTimer()` or `endTimer()` before
		 * calling `setTimer()`.
		 *
		 * If you do, the old values will be ignored and the value passed in to
		 * this function will be used.
		 *
		 * @param {string} timer_name The name of the timer to start
		 * @param {number} time_value The value in milliseconds to set this timer to.
		 *
		 * @returns {@link BOOMR.plugins.RT} The RT plugin for chaining
		 * @memberof BOOMR.plugins.RT
		 */
		setTimer: function(timer_name, time_delta_or_start, timer_end) {
			if (timer_name) {
				if (typeof timer_end !== "undefined") {
					// in this case, we were given three args, the name, start, and end,
					// so time_delta_or_start is the start time
					impl.timers[timer_name] = {
						start: time_delta_or_start,
						end: timer_end,
						delta: timer_end - time_delta_or_start
					};
				}
				else {
					// in this case, we were just given two args, the name and delta
					impl.timers[timer_name] = { delta: time_delta_or_start };
				}
			}

			return this;
		},

		/**
		 * Adds all known timers to the beacon
		 *
		 * @param {object} vars (unused)
		 * @param {string} source Source
		 *
		 * @memberof BOOMR.plugins.RT
		 */
		addTimersToBeacon: function(vars, source) {
			var t_name, timer,
			    t_other = [];

			for (t_name in impl.timers) {
				if (impl.timers.hasOwnProperty(t_name)) {
					timer = impl.timers[t_name];

					// if delta is a number, then it was set using setTimer
					// if not, then we have to calculate it using start & end
					if (typeof timer.delta !== "number") {
						if (typeof timer.start !== "number") {
							timer.start = source === "xhr" ? impl.cached_xhr_start : impl.cached_t_start;
						}
						timer.delta = timer.end - timer.start;
					}

					// If the caller did not set a start time, and if there was no start cookie
					// Or if there was no end time for this timer,
					// then timer.delta will be NaN, in which case we discard it.
					if (isNaN(timer.delta)) {
						continue;
					}

					if (impl.basic_timers.hasOwnProperty(t_name)) {
						BOOMR.addVar(t_name, timer.delta);
						impl.addedVars.push(t_name);
					}
					else {
						t_other.push(t_name + "|" + timer.delta);
					}
				}
			}

			if (t_other.length) {
				BOOMR.addVar("t_other", t_other.join(","));
				impl.addedVars.push("t_other");
			}

			if (source === "beacon") {
				impl.timers = {};
				impl.complete = false;	// reset this state for the next call
			}
		},

		/**
		 * Called when the page has reached a "usable" state.  This may be when the
		 * `onload` event fires, or it could be at some other moment during/after page
		 * load when the page is usable by the user
		 *
		 * @param {object} edata Event data
		 * @param {string} ename Event name
		 *
		 * @returns {@link BOOMR.plugins.RT} The RT plugin for chaining
		 *
		 * @memberof BOOMR.plugins.RT
		 */
		done: function(edata, ename) {
			

			var t_start, t_done, t_now = BOOMR.now(),
			    subresource = false;

			// We may have to rerun if this was a pre-rendered page, so set complete to false, and only set to true when we're done
			impl.complete = false;

			t_done = impl.validateLoadTimestamp(t_now, edata, ename);

			if (ename === "load" || ename === "visible" || ename === "xhr") {
				if (!impl.setPageLoadTimers(ename, t_done, edata)) {
					return this;
				}
			}

			if (ename === "load" ||
			    ename === "visible" ||
			    (ename === "xhr" && edata && edata.initiator === "spa_hard")) {
				// Only add Boomerang timings to page load and SPA beacons
				impl.getBoomerangTimings();
			}

			t_start = impl.determineTStart(ename, edata);

			impl.refreshSession();

			impl.maybeResetSession(t_done, t_start);

			// If the dev has already called endTimer, then this call will do nothing
			// else, it will stop the page load timer
			this.endTimer("t_done", t_done);

			// For XHR events, ensure t_done is set with the proper start, end, and
			// delta timestamps.  Until Issue #195 is fixed, if this XHR is firing
			// a beacon very quickly after a previous XHR, the previous XHR might
			// not yet have had time to fire a beacon and clear its own t_done,
			// so the preceeding endTimer() wouldn't have set this XHR's timestamps.
			if (edata && edata.initiator === "xhr") {
				this.setTimer("t_done", edata.timing.requestStart, edata.timing.loadEventEnd);
			}

			// make sure old variables don't stick around
			BOOMR.removeVar(
				"t_done", "t_page", "t_resp", "t_postrender", "t_prerender", "t_load", "t_other",
				"rt.tstart", "rt.nstart", "rt.cstart", "rt.bstart", "rt.end", "rt.subres",
				"http.errno", "http.method", "http.type", "xhr.sync", "fetch.bnu",
				"rt.ss", "rt.sl", "rt.tt", "rt.lt"
			);

			impl.setSupportingTimestamps(t_start);

			this.addTimersToBeacon(null, ename);

			BOOMR.setReferrer(impl.r);

			if (ename === "xhr" && edata) {
				if (edata && edata.data) {
					edata = edata.data;
				}
			}

			if (ename === "xhr" && edata) {
				subresource = edata.subresource;

				if (edata.url) {
					BOOMR.addVar("u", BOOMR.utils.cleanupURL(edata.url.replace(/#.*/, "")));
					impl.addedVars.push("u");
				}

				if (edata.status && (edata.status < -1 || edata.status >= 400)) {
					BOOMR.addVar("http.errno", edata.status);
				}

				if (edata.method && edata.method !== "GET") {
					BOOMR.addVar("http.method", edata.method);
				}

				if (edata.type && edata.type !== "xhr") {
					BOOMR.addVar("http.type", edata.type[0]);  // just send first char
				}

				if (edata.headers) {
					BOOMR.addVar("http.hdr", edata.headers);
				}

				if (edata.synchronous) {
					BOOMR.addVar("xhr.sync", 1);
				}

				if (edata.initiator) {
					BOOMR.addVar("http.initiator", edata.initiator);
				}

				if (edata.responseBodyNotUsed) {
					BOOMR.addVar("fetch.bnu", 1);
				}

				impl.addedVars.push("http.errno", "http.method", "http.hdr", "xhr.sync", "http.initiator", "fetch.bnu");
			}

			// This is an explicit subresource
			if (subresource && subresource !== "passive") {
				BOOMR.addVar("rt.subres", 1);
				impl.addedVars.push("rt.subres");
			}

			// we're in onload
			if (ename === "load" || ename === "visible" ||
			    // xhr beacon and this is not a subresource
			    (ename === "xhr" && !subresource) ||
			    // unload fired before onload
			    (ename === "unload" && !impl.onloadfired && impl.autorun) && !impl.crossdomain_sending) {
				impl.incrementSessionDetails();

				// save a last-loaded timestamp in the cookie
				impl.updateCookie(null, "ld");
			}

			BOOMR.addVar({
				"rt.tt": impl.loadTime,
				"rt.obo": impl.oboError
			});

			impl.addedVars.push("rt.tt", "rt.obo");

			impl.updateCookie();

			if (ename === "unload") {
				BOOMR.addVar("rt.quit", "");

				if (!impl.onloadfired) {
					BOOMR.addVar("rt.abld", "");
					impl.addedVars.push("rt.abld");
				}

				if (!impl.visiblefired) {
					BOOMR.addVar("rt.ntvu", "");
				}
			}

			impl.complete = true;

			BOOMR.sendBeacon(impl.beacon_url);

			return this;
		},

		/**
		 * Whether or not this plugin is complete
		 *
		 * @returns {boolean} `true` if the plugin is complete
		 * @memberof BOOMR.plugins.RT
		 */
		is_complete: function(vars) {
			// allow error beacons to go through even if we're not complete
			return impl.complete || (vars && vars["http.initiator"] === "error");
		},

		/**
		 * Updates the RT cookie.
		 *
		 * @memberof BOOMR.plugins.RT
		 */
		updateCookie: function() {
			impl.updateCookie();
		},

		/**
		 * Gets RT cookie data from the cookie and returns it as an object.
		 *
		 * Also decompresses the cookie if it has been compressed.
		 *
		 * @returns {(RTCookie|false)} an object containing RT Cookie data or false if no cookie is available
		 *
		 * @memberof BOOMR.plugins.RT
		 */
		getCookie: function() {
			var subcookies, base, epoch;

			// Disable use of RT cookie by setting its name to a falsy value
			if (!impl.cookie) {
				return false;
			}

			subcookies = BOOMR.utils.getSubCookies(BOOMR.utils.getCookie(impl.cookie)) || {};

			// decompress or parse cookie
			if (subcookies) {
				if (subcookies.z & COOKIE_COMPRESSED_TIMESTAMPS) {
					// Timestamps and durations are compressed
					base = 36;
					epoch = parseInt(subcookies.ss || 0, 36);
				}
				else {
					// Not compressed
					base = 10;
					epoch = 0;
				}

				// ss (Session Start)
				subcookies.ss = parseInt(subcookies.ss || 0, base);

				// tt (Total Time), sl (Session Length) and obo (Off By One)
				subcookies.tt = parseInt(subcookies.tt || 0, base);
				subcookies.obo = parseInt(subcookies.obo || 0, base);
				subcookies.sl = parseInt(subcookies.sl || 0, base);

				// session expiry
				if (subcookies.se) {
					subcookies.se = parseInt(subcookies.se, base) || SESSION_EXP;
				}

				// ld, ul, cl, hd (timestamps)
				if (subcookies.ld) {
					subcookies.ld = epoch + parseInt(subcookies.ld, base);
				}

				if (subcookies.ul) {
					subcookies.ul = epoch + parseInt(subcookies.ul, base);
				}

				if (subcookies.cl) {
					subcookies.cl = epoch + parseInt(subcookies.cl, base);
				}

				if (subcookies.hd) {
					subcookies.hd = epoch + parseInt(subcookies.hd, base);
				}
			}

			return subcookies;
		},

		incrementSessionDetails: function() {
			impl.incrementSessionDetails();
		},

		/**
		 * Gets the Navigation Start time
		 *
		 * @returns {TimeStamp} Navigation start
		 *
		 * @memberof BOOMR.plugins.RT
		 */
		navigationStart: function() {
			if (!impl.navigationStart) {
				impl.initFromNavTiming();
			}
			return impl.navigationStart;
		}
	};

}(window));

// End of RT plugin

/**
 * The PaintTiming plugin collects paint metrics exposed by the W3C
 * [Paint Timing]{@link https://www.w3.org/TR/paint-timing/} specification.
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## Beacon Parameters
 *
 * All beacon parameters are prefixed with `pt.`.
 *
 * This plugin adds the following parameters to the beacon:
 *
 * * `pt.fp`: `first-paint` in `DOMHighResTimestamp`
 * * `pt.fcp`: `first-contentful-paint` in `DOMHighResTimestamp`
 * * `pt.hid`: The document was loaded hidden (at some point), so FP and FCP are
 *             user-driven events, and thus won't be added to the beacon.
 *
 * @see {@link https://www.w3.org/TR/paint-timing/}
 * @class BOOMR.plugins.PaintTiming
 */
(function() {
	
	

	if (BOOMR.plugins.PaintTiming) {
		return;
	}

	/**
	 * Map of Paint Timing API names to `pt.*` beacon parameters
	 *
	 * https://www.w3.org/TR/paint-timing/
	 */
	var PAINT_TIMING_MAP = {
		"first-paint": "fp",
		"first-contentful-paint": "fcp"
	};

	/**
	 * Private implementation
	 */
	var impl = {
		/**
		 * Whether or not we've initialized yet
		 */
		initialized: false,

		/**
		 * Whether or not we've added data to the beacon
		 */
		complete: false,

		/**
		 * Whether or not the browser supports PaintTiming (cached value)
		 */
		supported: null,

		/**
		 * Cached PaintTiming values
		 */
		timingCache: {},

		/**
		 * Executed on `page_ready`, `xhr_load` and `before_unload`
		 */
		done: function(edata, ename) {
			var p, paintTimings, i;

			if (this.complete) {
				// we've already added data to the beacon
				return this;
			}

			//
			// Don't add PaintTimings to SPA Soft or XHR beacons --
			// Only add to Page Load (ename: load) and SPA Hard (ename: xhr
			// and initiator: spa_hard) beacons.
			//
			if (ename !== "load" && (!edata || edata.initiator !== "spa_hard")) {
				this.complete = true;

				return this;
			}

			p = BOOMR.getPerformance();
			if (!p || typeof p.getEntriesByType !== "function") {
				// can't do anything if window.performance isn't available
				this.complete = true;

				return;
			}

			//
			// Get First Paint, First Contentful Paint, etc from Paint Timing API
			// https://www.w3.org/TR/paint-timing/
			//
			paintTimings = p.getEntriesByType("paint");

			if (paintTimings && paintTimings.length) {
				BOOMR.info("This user agent supports PaintTiming", "pt");

				for (i = 0; i < paintTimings.length; i++) {
					// cache it for others who want to use it
					impl.timingCache[paintTimings[i].name] = paintTimings[i].startTime;

					if (PAINT_TIMING_MAP[paintTimings[i].name]) {
						// add pt.* to a single beacon
						BOOMR.addVar(
							"pt." + PAINT_TIMING_MAP[paintTimings[i].name],
							Math.floor(paintTimings[i].startTime),
							true);
					}
				}

				this.complete = true;

				BOOMR.sendBeacon();
			}
		}
	};

	//
	// Exports
	//
	BOOMR.plugins.PaintTiming = {
		/**
		 * Initializes the plugin.
		 *
		 * This plugin does not have any configuration.
		 *
		 * @returns {@link BOOMR.plugins.PaintTiming} The PaintTiming plugin for chaining
		 * @memberof BOOMR.plugins.PaintTiming
		 */
		init: function() {
			// skip initialization if not supported
			if (!this.is_supported()) {
				impl.complete = true;
				impl.initialized = true;
			}

			// If we haven't added PaintTiming data and the page is currently
			// hidden, don't add anything to the beacon as the paint might
			// happen only when the visitor makes the document visible.
			if (!impl.complete && BOOMR.visibilityState() === "hidden") {
				BOOMR.addVar("pt.hid", 1, true);

				impl.complete = true;
			}

			if (!impl.initialized) {
				// we'll add data to the beacon on whichever happens first
				BOOMR.subscribe("page_ready", impl.done, "load", impl);
				BOOMR.subscribe("xhr_load", impl.done, "xhr", impl);
				BOOMR.subscribe("before_unload", impl.done, null, impl);

				impl.initialized = true;
			}

			return this;
		},

		/**
		 * Whether or not this plugin is complete
		 *
		 * @returns {boolean} `true` if the plugin is complete
		 * @memberof BOOMR.plugins.PaintTiming
		 */
		is_complete: function() {
			return true;
		},

		/**
		 * Whether or not this plugin is enabled and PaintTiming is supported.
		 *
		 * @returns {boolean} `true` if PaintTiming plugin is enabled and supported.
		 * @memberof BOOMR.plugins.PaintTiming
		 */
		is_enabled: function() {
			return impl.initialized && this.is_supported();
		},

		/**
		 * Whether or not PaintTiming is supported in this browser.
		 *
		 * @returns {boolean} `true` if PaintTiming is supported.
		 * @memberof BOOMR.plugins.PaintTiming
		 */
		is_supported: function() {
			var p;

			if (impl.supported !== null) {
				return impl.supported;
			}

			// check for getEntriesByType and the entry type existing
			var p = BOOMR.getPerformance();
			impl.supported = p &&
				typeof window.PerformancePaintTiming !== "undefined" &&
				typeof p.getEntriesByType === "function";

			return impl.supported;
		},

		/**
		 * Gets the PaintTiming timestamp for the specified name
		 *
		 * @param {string} timingName PaintTiming name
		 *
		 * @returns {DOMHighResTimestamp} Timestamp
		 * @memberof BOOMR.plugins.PaintTiming
		 */
		getTimingFor: function(timingName) {
			var p, paintTimings, i;

			// look in our cache first
			if (impl.timingCache[timingName]) {
				return impl.timingCache[timingName];
			}

			// skip if not supported
			if (!this.is_supported()) {
				return;
			}

			// need to get the window.performance interface
			var p = BOOMR.getPerformance();
			if (!p || typeof p.getEntriesByType !== "function") {
				return;
			}

			// get all Paint Timings
			paintTimings = p.getEntriesByType("paint");

			if (paintTimings && paintTimings.length) {
				for (i = 0; i < paintTimings.length; i++) {
					if (paintTimings[i].name === timingName) {
						// cache the value since it'll never change
						impl.timingCache[timingName] = paintTimings[i].startTime;

						return impl.timingCache[timingName];
					}
				}
			}
		}
	};

}());

/*
 * Copyright (c), Buddy Brewer.
 */
/**
 * The Navigation Timing plugin collects performance metrics collected by modern
 * user agents that support the W3C [NavigationTiming]{@link http://www.w3.org/TR/navigation-timing/}
 * specification.
 *
 * This plugin also adds similar [ResourceTiming]{@link https://www.w3.org/TR/resource-timing-1/}
 * metrics for any XHR beacons.
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## Beacon Parameters
 *
 * All beacon parameters are prefixed with `nt_`.
 *
 * This plugin adds the following parameters to the beacon for Page Loads:
 *
 * * `nt_red_cnt`: `performance.navigation.redirectCount`
 * * `nt_nav_type`: `performance.navigation.type`
 * * `nt_nav_st`: `performance.timing.navigationStart`
 * * `nt_red_st`: `performance.timing.redirectStart`
 * * `nt_red_end`: `performance.timing.redirectEnd`
 * * `nt_fet_st`: `performance.timing.fetchStart`
 * * `nt_dns_st`: `performance.timing.domainLookupStart`
 * * `nt_dns_end`: `performance.timing.domainLookupEnd`
 * * `nt_con_st`: `performance.timing.connectStart`
 * * `nt_con_end`: `performance.timing.connectEnd`
 * * `nt_req_st`: `performance.timing.requestStart`
 * * `nt_res_st`: `performance.timing.responseStart`
 * * `nt_res_end`: `performance.timing.responseEnd`
 * * `nt_domloading`: `performance.timing.domLoading`
 * * `nt_domint`: `performance.timing.domInteractive`
 * * `nt_domcontloaded_st`: `performance.timing.domContentLoadedEventStart`
 * * `nt_domcontloaded_end`: `performance.timing.domContentLoadedEventEnd`
 * * `nt_domcomp`: `performance.timing.domComplete`
 * * `nt_load_st`: `performance.timing.loadEventStart`
 * * `nt_load_end`: `performance.timing.loadEventEnd`
 * * `nt_unload_st`: `performance.timing.unloadEventStart`
 * * `nt_unload_end`: `performance.timing.unloadEventEnd`
 * * `nt_ssl_st`: `performance.timing.secureConnectionStart`
 * * `nt_spdy`: `1` if page was loaded over SPDY, `0` otherwise.  Only available
 *   in Chrome when it _doesn't_ support NavigationTiming2.  If NavigationTiming2
 *   is supported, `nt_protocol` will be added instead.
 * * `nt_first_paint`: The time when the first paint happened. If the browser
 *   supports the Paint Timing API, this is the `first-paint` time in milliseconds
 *   since the epoch. Else, on Internet Explorer, this is the `msFirstPaint`
 *   value, in milliseconds since the epoch. On Chrome, this is using
 *   `loadTimes().firstPaintTime` and is converted from seconds.microseconds
 *   into milliseconds since the epoch.
 * * `nt_cinf`: Chrome `chrome.loadTimes().connectionInfo`.  Only available
 *   in Chrome when it _doesn't_ support NavigationTiming2.  If NavigationTiming2
 *   is supported, `nt_protocol` will be added instead.
 * * `nt_protocol`: NavigationTiming2's `nextHopProtocol`
 * * `nt_bad`: If we detected that any NavigationTiming metrics looked odd,
 *   such as `responseEnd` in the far future or `fetchStart` before `navigationStart`.
 * * `nt_worker_start`: NavigationTiming2 `workerStart`
 * * `nt_enc_size`: NavigationTiming2 `encodedBodySize`
 * * `nt_dec_size`: NavigationTiming2 `decodedBodySize`
 * * `nt_trn_size`: NavigationTiming2 `transferSize`
 *
 * For XHR beacons, the following parameters are added (via ResourceTiming):
 *
 * * `nt_red_st`: `redirectStart`
 * * `nt_red_end`: `redirectEnd`
 * * `nt_fet_st`: `fetchStart`
 * * `nt_dns_st`: `domainLookupStart`
 * * `nt_dns_end`: `domainLookupEnd`
 * * `nt_con_st`: `connectStart`
 * * `nt_con_end`: `connectEnd`
 * * `nt_req_st`: `requestStart`
 * * `nt_res_st`: `responseStart`
 * * `nt_res_end`: `responseEnd`
 * * `nt_load_st`: `loadEventStart`
 * * `nt_load_end`: `loadEventEnd`
 * * `nt_ssl_st`: `secureConnectionStart`
 *
 * @see {@link http://www.w3.org/TR/navigation-timing/}
 * @see {@link https://www.w3.org/TR/resource-timing-1/}
 * @class BOOMR.plugins.NavigationTiming
 */
(function() {
	
	

	if (BOOMR.plugins.NavigationTiming) {
		return;
	}

	/**
	 * Calculates a NavigationTiming timestamp for the beacon, in milliseconds
	 * since the Unix Epoch.
	 *
	 * The offset should be 0 if using a timestamp from performance.timing (which
	 * are already in milliseconds since Unix Epoch), or the value of navigationStart
	 * if using getEntriesByType("navigation") (which are DOMHighResTimestamps).
	 *
	 * The number is stripped of any decimals.
	 *
	 * @param {number} offset navigationStart offset (0 if using NavTiming1)
	 * @param {number} val DOMHighResTimestamp
	 *
	 * @returns {number} Timestamp for beacon
	 */
	function calcNavTimingTimestamp(offset, val) {
		if (typeof val !== "number" || val === 0) {
			return undefined;
		}

		return Math.floor((offset || 0) + val);
	}

	// A private object to encapsulate all your implementation details
	var impl = {
		complete: false,
		fullySent: false,
		sendBeacon: function() {
			this.complete = true;
			BOOMR.sendBeacon();
		},
		xhr_done: function(edata) {
			var p;

			if (edata && edata.initiator === "spa_hard") {
				// Single Page App - Hard refresh: Send page's NavigationTiming data, if
				// available.
				impl.done(edata);
				return;
			}
			else if (edata && edata.initiator === "spa") {
				// Single Page App - Soft refresh: The original hard navigation is no longer
				// relevant for this soft refresh, nor is the "URL" for this page, so don't
				// add NavigationTiming or ResourceTiming metrics.
				impl.sendBeacon();
				return;
			}

			var w = BOOMR.window, res, data = {}, k;

			if (!edata) {
				return;
			}

			if (edata.data) {
				edata = edata.data;
			}

			p = BOOMR.getPerformance();

			// if we previously saved the correct ResourceTiming entry, use it
			if (p && edata.restiming) {
				data = {
					nt_red_st: edata.restiming.redirectStart,
					nt_red_end: edata.restiming.redirectEnd,
					nt_fet_st: edata.restiming.fetchStart,
					nt_dns_st: edata.restiming.domainLookupStart,
					nt_dns_end: edata.restiming.domainLookupEnd,
					nt_con_st: edata.restiming.connectStart,
					nt_con_end: edata.restiming.connectEnd,
					nt_req_st: edata.restiming.requestStart,
					nt_res_st: edata.restiming.responseStart,
					nt_res_end: edata.restiming.responseEnd
				};

				if (edata.restiming.secureConnectionStart) {
					// secureConnectionStart is OPTIONAL in the spec
					data.nt_ssl_st = edata.restiming.secureConnectionStart;
				}

				for (k in data) {
					if (data.hasOwnProperty(k) && data[k]) {
						data[k] += p.timing.navigationStart;

						// don't need to send microseconds
						data[k] = Math.floor(data[k]);
					}
				}
			}

			if (edata.timing) {
				res = edata.timing;
				if (!data.nt_req_st) {
					// requestStart will be 0 if Timing-Allow-Origin header isn't set on the xhr response
					data.nt_req_st = res.requestStart;
				}
				if (!data.nt_res_st) {
					// responseStart will be 0 if Timing-Allow-Origin header isn't set on the xhr response
					data.nt_res_st = res.responseStart;
				}
				if (!data.nt_res_end) {
					data.nt_res_end = res.responseEnd;
				}
				data.nt_domint = res.domInteractive;
				data.nt_domcomp = res.domComplete;
				data.nt_load_st = res.loadEventEnd;
				data.nt_load_end = res.loadEventEnd;
			}

			for (k in data) {
				if (data.hasOwnProperty(k) && !data[k]) {
					delete data[k];
				}
			}

			BOOMR.addVar(data);

			try { impl.addedVars.push.apply(impl.addedVars, Object.keys(data)); }
			catch (ignore) { /* empty */ }

			impl.sendBeacon();
		},

		done: function() {
			var w = BOOMR.window, p, pn, chromeTimes, pt, data = {}, offset = 0, i,
			    paintTiming, k;

			if (this.complete) {
				return this;
			}

			impl.addedVars = [];

			p = BOOMR.getPerformance();

			if (p) {
				if (typeof p.getEntriesByType === "function") {
					pt = p.getEntriesByType("navigation");
					if (pt && pt.length) {
						BOOMR.info("This user agent supports NavigationTiming2", "nt");

						pt = pt[0];

						// ensure DOMHighResTimestamps are added to navigationStart
						offset = p.timing ? p.timing.navigationStart : 0;
					}
					else {
						pt = undefined;
					}
				}

				if (!pt && p.timing) {
					BOOMR.info("This user agent supports NavigationTiming", "nt");
					pt = p.timing;
				}

				if (pt) {
					data = {
						// start is `navigationStart` on .timing, `startTime` is always 0 on timeline entry
						nt_nav_st: p.timing ? p.timing.navigationStart : 0,

						// all other entries have the same name on .timing vs timeline entry
						nt_red_st: calcNavTimingTimestamp(offset, pt.redirectStart),
						nt_red_end: calcNavTimingTimestamp(offset, pt.redirectEnd),
						nt_fet_st: calcNavTimingTimestamp(offset, pt.fetchStart),
						nt_dns_st: calcNavTimingTimestamp(offset, pt.domainLookupStart),
						nt_dns_end: calcNavTimingTimestamp(offset, pt.domainLookupEnd),
						nt_con_st: calcNavTimingTimestamp(offset, pt.connectStart),
						nt_con_end: calcNavTimingTimestamp(offset, pt.connectEnd),
						nt_req_st: calcNavTimingTimestamp(offset, pt.requestStart),
						nt_res_st: calcNavTimingTimestamp(offset, pt.responseStart),
						nt_res_end: calcNavTimingTimestamp(offset, pt.responseEnd),
						nt_domloading: calcNavTimingTimestamp(offset, pt.domLoading),
						nt_domint: calcNavTimingTimestamp(offset, pt.domInteractive),
						nt_domcontloaded_st: calcNavTimingTimestamp(offset, pt.domContentLoadedEventStart),
						nt_domcontloaded_end: calcNavTimingTimestamp(offset, pt.domContentLoadedEventEnd),
						nt_domcomp: calcNavTimingTimestamp(offset, pt.domComplete),
						nt_load_st: calcNavTimingTimestamp(offset, pt.loadEventStart),
						nt_load_end: calcNavTimingTimestamp(offset, pt.loadEventEnd),
						nt_unload_st: calcNavTimingTimestamp(offset, pt.unloadEventStart),
						nt_unload_end: calcNavTimingTimestamp(offset, pt.unloadEventEnd)
					};

					// domLoading doesn't exist on NavigationTiming2, so fetch it
					// from performance.timing if available.
					if (!data.nt_domloading && p && p.timing && p.timing.domLoading) {
						// value on performance.timing will be in Unix Epoch milliseconds
						data.nt_domloading = p.timing.domLoading;
					}

					if (pt.secureConnectionStart) {
						// secureConnectionStart is OPTIONAL in the spec
						data.nt_ssl_st = calcNavTimingTimestamp(offset, pt.secureConnectionStart);
					}

					if (p.timing && p.timing.msFirstPaint) {
						// msFirstPaint is IE9+ http://msdn.microsoft.com/en-us/library/ff974719
						// and is in Unix Epoch format
						data.nt_first_paint = p.timing.msFirstPaint;
					}

					if (pt.workerStart) {
						// ServiceWorker time
						data.nt_worker_start = calcNavTimingTimestamp(offset, pt.workerStart);
					}

					// Need to check both decodedSize and transferSize as
					// transferSize is 0 for cached responses and
					// decodedSize is 0 for empty responses (eg: beacons, 204s, etc.)
					if (pt.decodedBodySize || pt.transferSize) {
						data.nt_enc_size = pt.encodedBodySize;
						data.nt_dec_size = pt.decodedBodySize;
						data.nt_trn_size = pt.transferSize;
					}

					if (pt.nextHopProtocol) {
						data.nt_protocol = pt.nextHopProtocol;
					}
				}

				//
				// Get First Paint from Paint Timing API
				// https://www.w3.org/TR/paint-timing/
				//
				if (!data.nt_first_paint && BOOMR.plugins.PaintTiming) {
					paintTiming = BOOMR.plugins.PaintTiming.getTimingFor("first-paint");

					if (paintTiming) {
						data.nt_first_paint = calcNavTimingTimestamp(offset, paintTiming);
					}
				}

				//
				// Chrome provides window.chrome.loadTimes(), but this is deprecated
				// in Chrome 64+ and will be removed at some point.  The data it
				// provides may be available in more modern performance APIs:
				//
				// * .connectionInfo (nt_cinf): Navigation Timing 2 nextHopProtocol
				// * .wasFetchedViaSpdy (nt_spdy): Could be calculated via above,
				//       so we don't need to add if it's not available directly
				// * .firstPaintTime (nt_first_paint): Paint Timing's first-paint
				//
				// If we've already queried that data, don't also query
				// loadTimes() as it will generate a console warning.
				//
				if ((!data.nt_protocol || !data.nt_first_paint) &&
				    (!pt || pt.nextHopProtocol !== "") &&
				    w.chrome &&
				    typeof w.chrome.loadTimes === "function") {
					chromeTimes = w.chrome.loadTimes();
					if (chromeTimes) {
						data.nt_spdy = (chromeTimes.wasFetchedViaSpdy ? 1 : 0);
						data.nt_cinf = chromeTimes.connectionInfo;

						// Chrome firstPaintTime is in seconds.microseconds, so
						// we need to multiply it by 1000 to be consistent with
						// msFirstPaint and other NavigationTiming timestamps that
						// are in milliseconds.microseconds.
						if (typeof chromeTimes.firstPaintTime === "number" && chromeTimes.firstPaintTime !== 0) {
							data.nt_first_paint = Math.round(chromeTimes.firstPaintTime * 1000);
						}
					}
				}

				//
				// Navigation Type and Redirect Count
				//
				if (p.navigation) {
					pn = p.navigation;

					data.nt_red_cnt  = pn.redirectCount;
					data.nt_nav_type = pn.type;
				}

				// Remove any properties that are undefined
				for (k in data) {
					if (data.hasOwnProperty(k) && data[k] === undefined) {
						delete data[k];
					}
				}

				BOOMR.addVar(data);
				BOOMR.removeVar("nt_protocol");

				//
				// Basic browser bug detection for known cases where NavigationTiming
				// timestamps might not be trusted.
				//
				if (pt && (
				    (pt.requestStart && pt.navigationStart && pt.requestStart < pt.navigationStart) ||
				    (pt.responseStart && pt.navigationStart && pt.responseStart < pt.navigationStart) ||
				    (pt.responseStart && pt.fetchStart && pt.responseStart < pt.fetchStart) ||
				    (pt.navigationStart && pt.fetchStart < pt.navigationStart) ||
				    (pt.responseEnd && pt.responseEnd > BOOMR.now() + 8.64e+7)
				)) {
					BOOMR.addVar("nt_bad", 1);
					impl.addedVars.push("nt_bad");
				}

				// ensure all vars are removed at beacon
				try {
					impl.addedVars.push.apply(impl.addedVars, Object.keys(data));
				}
				catch (ignore) {
					/* empty */
				}

				if (data.nt_load_end > 0) {
					this.fullySent = true;
				}
			}

			impl.sendBeacon();
		},

		clear: function() {
			if (impl.addedVars && impl.addedVars.length > 0) {
				BOOMR.removeVar(impl.addedVars);
				impl.addedVars = [];
			}
			// if we ever sent the full data, we're complete for all times
			this.complete = this.fullySent;
		},

		prerenderToVisible: function() {
			// ensure we add our data to the beacon even if we had added it
			// during prerender (in case another beacon went out in between)
			this.complete = false;

			// add our data to the beacon
			this.done();
		}
	};

	//
	// Exports
	//
	BOOMR.plugins.NavigationTiming = {
		/**
		 * Initializes the plugin.
		 *
		 * This plugin does not have any configuration.
		 * @returns {@link BOOMR.plugins.NavigationTiming} The NavigationTiming plugin for chaining
		 * @memberof BOOMR.plugins.NavigationTiming
		 */
		init: function() {
			if (!impl.initialized) {
				// we'll fire on whichever happens first
				BOOMR.subscribe("page_ready", impl.done, null, impl);
				BOOMR.subscribe("prerender_to_visible", impl.prerenderToVisible, null, impl);
				BOOMR.subscribe("xhr_load", impl.xhr_done, null, impl);
				BOOMR.subscribe("before_unload", impl.done, null, impl);
				BOOMR.subscribe("beacon", impl.clear, null, impl);

				impl.initialized = true;
			}
			return this;
		},

		/**
		 * Whether or not this plugin is complete
		 *
		 * @returns {boolean} `true` if the plugin is complete
		 * @memberof BOOMR.plugins.NavigationTiming
		 */
		is_complete: function() {
			return true;
		}
	};

}());

/**
 * Plugin to collect metrics from the W3C [ResourceTiming]{@link http://www.w3.org/TR/resource-timing/}
 * API.
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## Beacon Parameters
 *
 * This plugin adds the following parameters to the beacon for Page Loads:
 *
 * * `restiming`: Compressed ResourceTiming data
 *
 * The ResourceTiming plugin adds an object named `restiming` to the beacon data.
 *
 *  `restiming` is an optimized [Trie]{@link http://en.wikipedia.org/wiki/Trie} structure,
 * where the keys are the ResourceTiming URLs, and the values correspond to those URLs'
 * [PerformanceResourceTiming]{@link http://www.w3.org/TR/resource-timing/#performanceresourcetiming}
 * timestamps:
 *
 *     { "[url]": "[data]"}
 *
 * The Trie structure is used to minimize the data transmitted from the ResourceTimings.
 *
 * Keys in the Trie are the ResourceTiming URLs. For example, with a root page and three resources:
 *
 * * http://abc.com/
 * * http://abc.com/js/foo.js
 * * http://abc.com/css/foo.css
 * * http://abc.com/css/foo.png (downloaded twice)
 *
 * Then the Trie might look like this:
 *
 *     // Example 1
 *     {
 *       "http://abc.com/":
 *       {
 *         "|": "0,2",
 *         "js/foo.js": "3a,1",
 *         "css/": {
 *           "foo.css": "2b,2",
 *           "foo.png": "1c,3|1d,a"
 *         }
 *       }
 *     }
 *
 * If a resource's URL is a prefix of another resource, then it terminates with a
 * pipe symbol (`|`). In Example 1, `http://abc.com` (the root page) is a
 * prefix of `http://abc.com/js/foo.js`, so it is listed as `http://abc.com|` in
 * the Trie.
 *
 * If there is more than one ResourceTiming entry for a URL, each entry is
 * separated by a pipe symbol (`|`) in the `data`. In Example 1 above, `foo.png`
 * has been downloaded twice, so it is listed with two separate page loads, `1c,3` and `1d,a`.
 *
 * The value of each key is a string, which contains the following components:
 *
 *     data = "[initiatorType][timings]"
 *
 * `initiatorType` is a simple map from the PerformanceResourceTiming
 * `initiatorType` (which is a string) to an integer, according to the
 * {@link BOOMR.plugins.ResourceTiming.INITAITOR_TYPES} enum.
 *
 * `timings` is a string of [Base-36]{@link http://en.wikipedia.org/wiki/Base_36}
 * encoded timestamps from the PerformanceResourceTiming interface. The values in
 * the string are separated by commas:
 *
 *     timings = "[startTime],[responseEnd],[responseStart],[requestStart],[connectEnd],[secureConnectionStart],[connectStart],[domainLookupEnd],[domainLookupStart],[redirectEnd],[redirectStart]"
 *
 * `startTime` is a [DOMHighResTimeStamp]{@link http://www.w3.org/TR/hr-time/#domhighrestimestamp}
 * from when the resource started (Base 36).
 *
 * All other timestamps are offsets (rounded to milliseconds) from `startTime`
 * (Base 36). For example, `responseEnd` is calculated as:
 *
 *     responseEnd: base36(round(responseEnd - startTime))
 *
 * If the resulting timestamp is `0`, it is replaced with an empty string (`""`).
 *
 * All trailing commas are removed from the final string. This compresses the timing
 * string from timestamps that are often `0`. For example, here is what a fully-redirected
 * resource might look like:
 *
 *     { "http://abc.com/this-resource-was-redirected": "01,1,1,1,1,1,1,1,1,1,1" }
 *
 * While a resource that was loaded from the cache (and thus only has `startTime`
 * and `responseEnd` timestamps) might look like this:
 *
 *     { "http://abc.com/this-resource-was-redirected": "01,1" }
 *
 * Note that some of the metrics are restricted and will not be provided cross-origin
 * unless the Timing-Allow-Origin header permits.
 *
 * Putting this all together, let's look at `http://abc.com/css/foo.png` in Example 1.
 * We find it was downloaded twice `"1c,3|1d,a"`:
 *
 * * 1c,3:
 *     * `1`: `initiatorType` = `1` (IMG)
 *     * `c`: `startTime` = `c` (12ms)
 *     * `3`: `responseEnd` = `3` (3ms from startTime, or at 15ms)
 * * 1d,a:
 *     * `1`: `initiatorType` = `1` (IMG)
 *     * `d`: `startTime` = `d` (13ms)
 *     * `2`: `responseEnd` = `a` (10ms from startTime, or at 23ms)
 *
 * @see {@link http://www.w3.org/TR/resource-timing/}
 * @class BOOMR.plugins.ResourceTiming
 */
(function() {
	var impl;

	
	

	if (BOOMR.plugins.ResourceTiming) {
		return;
	}

	//
	// Constants
	//

	/**
	 * @enum {number}
	 * @memberof BOOMR.plugins.ResourceTiming
	 */
	var INITIATOR_TYPES = {
		/** Unknown type */
		"other": 0,
		/** IMG element (or IMAGE element inside a SVG for IE, Edge and Firefox) */
		"img": 1,
		/** LINK element (i.e. CSS) */
		"link": 2,
		/** SCRIPT element */
		"script": 3,
		/** Resource referenced in CSS */
		"css": 4,
		/** XMLHttpRequest */
		"xmlhttprequest": 5,
		/** The root HTML page itself */
		"html": 6,
		/** IMAGE element inside a SVG */
		"image": 7,
		/** [sendBeacon]{@link https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon} */
		"beacon": 8,
		/** [Fetch API]{@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API} */
		"fetch": 9,
		/** An IFRAME */
		"iframe": "a",
		/** IE11 and Edge (some versions) send "subdocument" instead of "iframe" */
		"subdocument": "a"
	};

	/**
	 * These are the only `rel` types that might be reference-able from
	 * ResourceTiming.
	 *
	 * https://html.spec.whatwg.org/multipage/links.html#linkTypes
	 *
	 * @enum {number}
	 * @memberof BOOMR.plugins.ResourceTiming
	 */
	var REL_TYPES = {
		"prefetch": 1,
		"preload": 2,
		"prerender": 3,
		"stylesheet": 4
	};

	var RT_FIELDS_TIMESTAMPS = [
		"startTime",
		"redirectStart",
		"redirectEnd",
		"fetchStart",
		"domainLookupStart",
		"domainLookupEnd",
		"connectStart",
		"secureConnectionStart",
		"connectEnd",
		"requestStart",
		"responseStart",
		"responseEnd",
		"workerStart"
	];

	// Words that will be broken (by ensuring the optimized trie doesn't contain
	// the whole string) in URLs, to ensure NoScript doesn't think this is an XSS attack
	var DEFAULT_XSS_BREAK_WORDS = [
		/(h)(ref)/gi,
		/(s)(rc)/gi,
		/(a)(ction)/gi
	];

	// Delimiter to use to break a XSS word
	var XSS_BREAK_DELIM = "\n";

	// Maximum number of characters in a URL
	var DEFAULT_URL_LIMIT = 500;

	// Any ResourceTiming data time that starts with this character is not a time,
	// but something else (like dimension data)
	var SPECIAL_DATA_PREFIX = "*";

	// Dimension data special type
	var SPECIAL_DATA_DIMENSION_TYPE = "0";

	// Dimension data special type
	var SPECIAL_DATA_SIZE_TYPE = "1";

	// Script attributes
	var SPECIAL_DATA_SCRIPT_ATTR_TYPE = "2";
	// The following make up a bitmask
	var ASYNC_ATTR = 0x1;
	var DEFER_ATTR = 0x2;
	var LOCAT_ATTR = 0x4;	// 0 => HEAD, 1 => BODY

	// Dimension data special type
	var SPECIAL_DATA_SERVERTIMING_TYPE = "3";

	// Link attributes
	var SPECIAL_DATA_LINK_ATTR_TYPE = "4";

	// Namespaced data
	var SPECIAL_DATA_NAMESPACED_TYPE = "5";

	/**
	 * Converts entries to a Trie (`splitAtPath=true`) or Radix
	 * Trie (`splitAtPath=false`):
	 * https://en.wikipedia.org/wiki/Trie
	 * https://en.wikipedia.org/wiki/Radix_tree
	 *
	 * Assumptions:
	 * 1) All entries have unique keys
	 * 2) Keys cannot have "|" in their name.
	 * 3) All key's values are strings
	 *
	 * Leaf nodes in the tree are the key's values.
	 *
	 * If key A is a prefix to key B, key A will be suffixed with "|".
	 *
	 * By default, the Trie is constructed "perfectly" (a Radix Trie) by looking
	 * at every letter of each URL.  If `splitAtPath` is specified, the URL is
	 * split up into groups based on the path separator. This will create a
	 * non-optimal Trie but will speed up the Trie construction significantly
	 * (taking less than a half or third of the time on large data sets).
	 *
	 * @param {object} entries Performance entries
	 * @param {boolean} [splitAtPath] Whether to split at path separator vs every character
	 *
	 * @returns {object} A trie
	 */
	function convertToTrie(entries, splitAtPath) {
		var trie = {}, url, urlFixed, i, value, letters, letter, cur, node;

		/**
		 * Builds an array of path components.
		 *
		 * @param {number} addSlashUntil Length of path components
		 */
		function splitUrlPaths(addSlashUntil) {
			return function(accumulator, currentValue, currentIndex) {
				var parts, j;

				// if this component has the XSS_BREAK_DELIM character in it, we need
				// to break it up
				if (currentValue.indexOf(XSS_BREAK_DELIM) !== -1) {
					// break at that character
					parts = currentValue.split(XSS_BREAK_DELIM);

					// add everything but the last one with special XSS_BREAK_DELIM nodes
					for (j = 0; j < parts.length - 1; j++) {
						// add this component
						accumulator.push(parts[j]);

						// add back in the XSS_BREAK_DELIM
						accumulator.push(XSS_BREAK_DELIM);
					}

					// add the last part
					currentValue = parts.slice(-1);
				}

				// add a '/' for everything but the last one
				if (typeof addSlashUntil === "number" && currentIndex < addSlashUntil) {
					currentValue += "/";
				}

				return accumulator.concat(currentValue);
			};
		}

		for (url in entries) {
			urlFixed = url;

			// find any strings to break
			for (i = 0; i < impl.xssBreakWords.length; i++) {
				// Add a XSS_BREAK_DELIM character after the first letter.  optimizeTrie will
				// ensure this sequence doesn't get combined.
				urlFixed = urlFixed.replace(impl.xssBreakWords[i], "$1" + XSS_BREAK_DELIM + "$2");
			}

			if (!entries.hasOwnProperty(url)) {
				continue;
			}

			value = entries[url];

			if (splitAtPath) {
				//
				// Split the Trie based on the path (less CPU, less optimial result)
				//
				letters = urlFixed.split("/");

				letters = [
					// protocol
					letters[0] + "//",

					// hostname and optional slash
					letters[2] + (letters.length > 3 ? "/" : "")

				// all of the path parts
				].concat(letters.slice(3).reduce(splitUrlPaths(letters.length - 4), []));
			}
			else {
				//
				// Split at every letter (more CPU, perfect result)
				//
				letters = urlFixed.split("");
			}

			// start at the top of the Trie
			cur = trie;

			for (i = 0; i < letters.length; i++) {
				letter = letters[i];
				node = cur[letter];

				if (typeof node === "undefined") {
					// nothing exists yet, create either a leaf if this is the end of the word,
					// or a branch if there are letters to go
					cur = cur[letter] = (i === (letters.length - 1) ? value : {});
				}
				else if (typeof node === "string") {
					// this is a leaf, but we need to go further, so convert it into a branch
					cur = cur[letter] = { "|": node };
				}
				else {
					if (i === (letters.length - 1)) {
						// this is the end of our key, and we've hit an existing node.  Add our timings.
						cur[letter]["|"] = value;
					}
					else {
						// continue onwards
						cur = cur[letter];
					}
				}
			}
		}

		return trie;
	}

	/**
	 * Optimize the Trie by combining branches with no leaf
	 *
	 * @param {object} cur Current Trie branch
	 * @param {boolean} top Whether or not this is the root node
	 *
	 * @returns {object} Optimized Trie
	 */
	function optimizeTrie(cur, top) {
		var num = 0, node, ret, topNode;

		// capture trie keys first as we'll be modifying it
		var keys = [];

		for (node in cur) {
			if (cur.hasOwnProperty(node)) {
				keys.push(node);
			}
		}

		for (var i = 0; i < keys.length; i++) {
			node = keys[i];
			if (typeof cur[node] === "object") {
				// optimize children
				ret = optimizeTrie(cur[node], false);
				if (ret) {
					// swap the current leaf with compressed one
					delete cur[node];

					if (node === XSS_BREAK_DELIM) {
						// If this node is a newline, which can't be in a regular URL,
						// it's due to the XSS patch.  Remove the placeholder character,
						// and make sure this node isn't compressed by incrementing
						// num to be greater than one.
						node = ret.name;
						num++;
					}
					else {
						node = node + ret.name;
					}
					cur[node] = ret.value;
				}
			}
			num++;
		}

		if (num === 1) {
			// compress single leafs
			if (top) {
				// top node gets special treatment so we're not left with a {node:,value:} at top
				topNode = {};
				topNode[node] = cur[node];
				return topNode;
			}
			else {
				// other nodes we return name and value separately
				return { name: node, value: cur[node] };
			}
		}
		else if (top) {
			// top node with more than 1 child, return it as-is
			return cur;
		}
		else {
			// more than two nodes and not the top, we can't compress any more
			return false;
		}
	}

	/**
	 * Trims the timing, returning an offset from the startTime in ms
	 *
	 * @param {number} time Time
	 * @param {number} startTime Start time
	 * @returns {number} Number of ms from start time
	 */
	function trimTiming(time, startTime) {
		if (typeof time !== "number") {
			time = 0;
		}

		if (typeof startTime !== "number") {
			startTime = 0;
		}

		// strip from microseconds to milliseconds only
		var timeMs = Math.round(time ? time : 0),
		    startTimeMs = Math.round(startTime ? startTime : 0);

		return timeMs === 0 ? 0 : (timeMs - startTimeMs);
	}

	/**
	 * Checks if the current execution context can access the specified frame.
	 *
	 * Note: In Safari, this will still produce a console error message, even
	 * though the exception is caught.

	 * @param {Window} frame The frame to check if access can haz
	 * @returns {boolean} true if true, false otherwise
	 */
	function isFrameAccessible(frame) {
		var dummy;

		try {
			// Try to access location.href first to trigger any Cross-Origin
			// warnings.  There's also a bug in Chrome ~48 that might cause
			// the browser to crash if accessing X-O frame.performance.
			// https://code.google.com/p/chromium/issues/detail?id=585871
			// This variable is not otherwise used.
			dummy = frame.location && frame.location.href;

			// Try to access frame.document to trigger X-O exceptions with that
			dummy = frame.document;

			if (("performance" in frame) && frame.performance) {
				return true;
			}
		}
		catch (e) {
			// empty
		}

		return false;
	}

	/**
	 * Attempts to get the navigationStart time for a frame.
	 * @returns navigationStart time, or 0 if not accessible
	 */
	function getNavStartTime(frame) {
		var navStart = 0;

		if (isFrameAccessible(frame) && frame.performance.timing && frame.performance.timing.navigationStart) {
			navStart = frame.performance.timing.navigationStart;
		}

		return navStart;
	}

	/**
	 * Gets all of the performance entries for a frame and its subframes
	 *
	 * @param {Frame} frame Frame
	 * @param {boolean} top This is the top window
	 * @param {string} offset Offset in timing from root IFRAME
	 * @param {number} depth Recursion depth
	 * @param {number[]} [frameDims] position and size of the frame if it is visible as returned by getVisibleEntries
	 * @returns {PerformanceEntry[]} Performance entries
	 */
	function findPerformanceEntriesForFrame(frame, isTopWindow, offset, depth, frameDims) {
		var entries = [], i, navEntries, navStart, frameNavStart, frameOffset, subFrames, subFrameDims,
		    navEntry, t, rtEntry, visibleEntries, scripts = {}, links = {}, a;

		if (typeof isTopWindow === "undefined") {
			isTopWindow = true;
		}

		if (typeof offset === "undefined") {
			offset = 0;
		}

		if (typeof depth === "undefined") {
			depth = 0;
		}

		if (depth > 10) {
			return entries;
		}

		try {
			if (!isFrameAccessible(frame)) {
				return entries;
			}

			navStart = getNavStartTime(frame);

			// gather visible entries on the page
			visibleEntries = getVisibleEntries(frame, frameDims);

			a = frame.document.createElement("a");

			// get all scripts as an object keyed on script.src
			collectResources(a, scripts, "script");
			collectResources(a, links, "link");

			subFrames = frame.document.getElementsByTagName("iframe");

			// get sub-frames' entries first
			if (subFrames && subFrames.length) {
				for (i = 0; i < subFrames.length; i++) {
					frameNavStart = getNavStartTime(subFrames[i].contentWindow);
					frameOffset = 0;
					if (frameNavStart > navStart) {
						frameOffset = offset + (frameNavStart - navStart);
					}

					a.href = subFrames[i].src;	// Get canonical URL

					entries = entries.concat(findPerformanceEntriesForFrame(subFrames[i].contentWindow, false, frameOffset, depth + 1, visibleEntries[a.href]));
				}
			}

			if (typeof frame.performance.getEntriesByType !== "function") {
				return entries;
			}

			function readServerTiming(entry) {
				return (impl.serverTiming && entry.serverTiming) || [];
			}

			// add an entry for the top page
			if (isTopWindow) {
				navEntries = frame.performance.getEntriesByType("navigation");
				if (navEntries && navEntries.length === 1) {
					navEntry = navEntries[0];

					// replace document with the actual URL
					entries.push({
						name: frame.location.href,
						startTime: 0,
						initiatorType: "html",
						redirectStart: navEntry.redirectStart,
						redirectEnd: navEntry.redirectEnd,
						fetchStart: navEntry.fetchStart,
						domainLookupStart: navEntry.domainLookupStart,
						domainLookupEnd: navEntry.domainLookupEnd,
						connectStart: navEntry.connectStart,
						secureConnectionStart: navEntry.secureConnectionStart,
						connectEnd: navEntry.connectEnd,
						requestStart: navEntry.requestStart,
						responseStart: navEntry.responseStart,
						responseEnd: navEntry.responseEnd,
						workerStart: navEntry.workerStart,
						encodedBodySize: navEntry.encodedBodySize,
						decodedBodySize: navEntry.decodedBodySize,
						transferSize: navEntry.transferSize,
						serverTiming: readServerTiming(navEntry)
					});
				}
				else if (frame.performance.timing) {
					// add a fake entry from the timing object
					t = frame.performance.timing;

					//
					// Avoid browser bugs:
					// 1. navigationStart being 0 in some cases
					// 2. responseEnd being ~2x what navigationStart is
					//    (ensure the end is within 60 minutes of start)
					//
					if (t.navigationStart !== 0 &&
						t.responseEnd <= (t.navigationStart + (60 * 60 * 1000))) {
						entries.push({
							name: frame.location.href,
							startTime: 0,
							initiatorType: "html",
							redirectStart: t.redirectStart ? (t.redirectStart - t.navigationStart) : 0,
							redirectEnd: t.redirectEnd ? (t.redirectEnd - t.navigationStart) : 0,
							fetchStart: t.fetchStart ? (t.fetchStart - t.navigationStart) : 0,
							domainLookupStart: t.domainLookupStart ? (t.domainLookupStart - t.navigationStart) : 0,
							domainLookupEnd: t.domainLookupEnd ? (t.domainLookupEnd - t.navigationStart) : 0,
							connectStart: t.connectStart ? (t.connectStart - t.navigationStart) : 0,
							secureConnectionStart: t.secureConnectionStart ? (t.secureConnectionStart - t.navigationStart) : 0,
							connectEnd: t.connectEnd ? (t.connectEnd - t.navigationStart) : 0,
							requestStart: t.requestStart ? (t.requestStart - t.navigationStart) : 0,
							responseStart: t.responseStart ? (t.responseStart - t.navigationStart) : 0,
							responseEnd: t.responseEnd ? (t.responseEnd - t.navigationStart) : 0
						});
					}
				}
			}

			// offset all of the entries by the specified offset for this frame
			var frameEntries = frame.performance.getEntriesByType("resource"),
			    frameFixedEntries = [];
			if (frame === BOOMR.window && impl.collectedEntries) {
				Array.prototype.push.apply(frameEntries, impl.collectedEntries);
				impl.collectedEntries = [];
			}

			for (i = 0; frameEntries && i < frameEntries.length; i++) {
				t = frameEntries[i];
				rtEntry = {
					name: t.name,
					initiatorType: t.initiatorType,
					encodedBodySize: t.encodedBodySize,
					decodedBodySize: t.decodedBodySize,
					transferSize: t.transferSize,
					serverTiming: readServerTiming(t),
					visibleDimensions: visibleEntries[t.name],
					latestTime: getResourceLatestTime(t)
				};
				for (var field = 0; field < RT_FIELDS_TIMESTAMPS.length; field++) {
					var key = RT_FIELDS_TIMESTAMPS[field];
					rtEntry[key] = ((key === "startTime") || t[key]) ? (t[key] + offset) : 0;
				}

				if (t.hasOwnProperty("_data")) {
					rtEntry._data = t._data;
				}

				// If this is a script, set its flags
				if ((t.initiatorType === "script" || t.initiatorType === "link") && scripts[t.name]) {
					var s = scripts[t.name];

					// Add async & defer based on attribute values
					rtEntry.scriptAttrs = (s.async ? ASYNC_ATTR : 0) | (s.defer ? DEFER_ATTR : 0);

					while (s.nodeType === 1 && s.nodeName !== "BODY") {
						s = s.parentNode;
					}

					// Add location by traversing up the tree until we either hit BODY or document
					rtEntry.scriptAttrs |= (s.nodeName === "BODY" ? LOCAT_ATTR : 0);
				}

				// If this is a link, set its flags
				if (t.initiatorType === "link" && links[t.name]) {
					// split on ASCII whitespace
					BOOMR.utils.arrayFind(links[t.name].rel.split(/[\u0009\u000A\u000C\u000D\u0020]+/), function(rel) { //eslint-disable-line no-loop-func
						// `rel`s are case insensitive
						rel = rel.toLowerCase();

						// only report the `rel` if it's from the known list
						if (REL_TYPES[rel]) {
							rtEntry.linkAttrs = REL_TYPES[rel];
							return true;
						}
					});
				}

				frameFixedEntries.push(rtEntry);
			}

			entries = entries.concat(frameFixedEntries);
		}
		catch (e) {
			return entries;
		}

		return entries;
	}

	/**
	 * Collect external resources by tagName
	 *
	 * @param {Element} a an anchor element
	 * @param {Object} obj object of resources where the key is the url
	 * @param {string} tagName tag name to collect
	 */
	function collectResources(a, obj, tagName) {
		Array.prototype
			.forEach
			.call(a.ownerDocument.getElementsByTagName(tagName), function(r) {
				// Get canonical URL
				a.href = r.currentSrc ||
					r.src ||
					(typeof r.getAttribute === "function" && r.getAttribute("xlink:href")) ||
					r.href;

				// only get external resource
				if (a.href.match(/^https?:\/\//)) {
					obj[a.href] = r;
				}
			});
	}

	/**
	 * Converts a number to base-36.
	 *
	 * If not a number or a string, or === 0, return "". This is to facilitate
	 * compression in the timing array, where "blanks" or 0s show as a series
	 * of trailing ",,,," that can be trimmed.
	 *
	 * If a string, return a string.
	 *
	 * @param {number} n Number
	 * @returns {string} Base-36 number, empty string, or string
	 */
	function toBase36(n) {
		return (typeof n === "number" && n !== 0) ?
			n.toString(36) :
			(typeof n === "string" ? n : "");
	}

	/**
	 * Finds all remote resources in the selected window that are visible, and returns an object
	 * keyed by the url with an array of height,width,top,left as the value
	 *
	 * @param {Window} win Window to search
	 * @param {number[]} [winDims] position and size of the window if it is an embedded iframe in the format returned by this function
	 * @returns {Object} Object with URLs of visible assets as keys, and Array[height, width, top, left, naturalHeight, naturalWidth] as value
	 */
	function getVisibleEntries(win, winDims) {
		// lower-case tag names should be used: https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByTagName
		var els = ["img", "iframe", "image"], entries = {}, x, y, doc = win.document, a = doc.createElement("A");

		winDims = winDims || [0, 0, 0, 0];

		// https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollX
		// https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
		x = winDims[3] + (win.pageXOffset !== undefined) ? win.pageXOffset : (doc.documentElement || doc.body.parentNode || doc.body).scrollLeft;
		y = winDims[2] + (win.pageYOffset !== undefined) ? win.pageYOffset : (doc.documentElement || doc.body.parentNode || doc.body).scrollTop;

		// look at each IMG and IFRAME
		els.forEach(function(elname) {
			var elements = doc.getElementsByTagName(elname), el, i, rect, src;

			for (i = 0; i < elements.length; i++) {
				el = elements[i];

				if (!el) {
					continue;
				}

				// look at this element if it has a src attribute or xlink:href, and we haven't already looked at it
				// currentSrc = IMG inside a PICTURE element or IMG srcset
				// src = IMG, IFRAME
				// xlink:href = svg:IMAGE
				src = el.currentSrc ||
					el.src ||
					(typeof el.getAttribute === "function" &&
						(el.getAttribute("src")) || el.getAttribute("xlink:href"));

				// make src absolute
				a.href = src;
				src = a.href;

				if (!src || entries[src]) {
					continue;
				}

				rect = el.getBoundingClientRect();

				// Require both height & width to be non-zero
				// IE <= 8 does not report rect.height/rect.width so we need offsetHeight & width
				if ((rect.height || el.offsetHeight) && (rect.width || el.offsetWidth)) {
					entries[src] = [
						rect.height || el.offsetHeight,
						rect.width || el.offsetWidth,
						Math.round(rect.top + y),
						Math.round(rect.left + x)
					];

					// If this is an image, it has a naturalHeight & naturalWidth
					// if these are different from its display height and width, we should report that
					// because it indicates scaling in HTML
					if (!el.naturalHeight && !el.naturalWidth) {
						continue;
					}

					// If the image came from a srcset, then the naturalHeight/Width will be density corrected.
					// We get the actual physical dimensions by assigning the image to an uncorrected Image object.
					// This should load from in-memory cache, so there should be no extra load.
					var realImg, nH, nW;

					if (el.currentSrc && (el.srcset || (el.parentNode && el.parentNode.nodeName && el.parentNode.nodeName.toUpperCase() === "PICTURE"))) {
						// We need to create this Image in the window that contains the element, and not
						// the boomerang window.
						realImg = el.isConnected ? el.ownerDocument.createElement("IMG") : new BOOMR.window.Image();
						realImg.src = src;
					}
					else {
						realImg = el;
					}

					nH = realImg.naturalHeight || el.naturalHeight;
					nW = realImg.naturalWidth  || el.naturalWidth;

					if ((nH || nW) && (entries[src][0] !== nH || entries[src][1] !== nW)) {
						entries[src].push(nH, nW);
					}
				}
			}
		});

		return entries;
	}

	/**
	 * Gathers a filtered list of performance entries.
	 *
	 * @param {number} from Only get timings from
	 * @param {number} to Only get timings up to
	 * @param {string[]} initiatorTypes Array of initiator types
	 *
	 * @returns {ResourceTiming[]} Matching ResourceTiming entries
	 * @memberof BOOMR.plugins.ResourceTiming
	 */
	function getFilteredResourceTiming(from, to, initiatorTypes) {
		var entries = findPerformanceEntriesForFrame(BOOMR.window, true, 0, 0),
		    i, e,
		    navStart = getNavStartTime(BOOMR.window), countCollector = {};

		if (!entries || !entries.length) {
			return {
				entries: []
			};
		}

		// sort entries by start time
		entries.sort(function(a, b) {
			return a.startTime - b.startTime;
		});

		var filteredEntries = [];
		for (i = 0; i < entries.length; i++) {
			e = entries[i];

			// skip non-resource URLs
			if (e.name.indexOf("http:") !== 0 &&
			    e.name.indexOf("https:") !== 0) {
				continue;
			}

			// skip boomerang.js and config URLs
			if (e.name.indexOf(BOOMR.url) > -1 ||
			    e.name.indexOf(BOOMR.config_url) > -1 ||
			    (typeof BOOMR.getBeaconURL === "function" && BOOMR.getBeaconURL() && e.name.indexOf(BOOMR.getBeaconURL()) > -1)) {
				continue;
			}

			// if the user specified a "from" time, skip resources that started before then
			if (from && (navStart + e.startTime) < from) {
				continue;
			}

			// if we were given a final timestamp, don't add any resources that started after it
			if (to && (navStart + e.startTime) > to) {
				// We can also break at this point since the array is time sorted
				break;
			}

			// if given an array of initiatorTypes to include, skip anything else
			if (typeof initiatorTypes !== "undefined" && initiatorTypes !== "*" && initiatorTypes.length) {
				if (!e.initiatorType || !BOOMR.utils.inArray(e.initiatorType, initiatorTypes)) {
					continue;
				}
			}

			accumulateServerTimingEntries(countCollector, e.serverTiming);
			filteredEntries.push(e);
		}

		var lookup = compressServerTiming(countCollector);
		return {
			entries: filteredEntries,
			serverTiming: {
				lookup: lookup,
				indexed: indexServerTiming(lookup)
			}
		};
	}

	/**
	 * Gets compressed content and transfer size information, if available
	 *
	 * @param {ResourceTiming} resource ResourceTiming object
	 *
	 * @returns {string} Compressed data (or empty string, if not available)
	 */
	function compressSize(resource) {
		var sTrans, sEnc, sDec, sizes;

		// check to see if we can add content sizes
		if (resource.encodedBodySize ||
			resource.decodedBodySize ||
			resource.transferSize) {
			//
			// transferSize: how many bytes were over the wire. It can be 0 in the case of X-O,
			// or if it was fetched from a cache.
			//
			// encodedBodySize: the size after applying encoding (e.g. gzipped size).  It is 0 if X-O or no content (eg: beacon).
			//
			// decodedBodySize: the size after removing encoding (e.g. the original content size).  It is 0 if X-O or no content (eg: beacon).
			//
			// Here are the possible combinations of values: [encodedBodySize, transferSize, decodedBodySize]
			//
			// Cross-Origin resources w/out Timing-Allow-Origin set: [0, 0, 0] -> [0, 0, 0] -> [empty]
			// 204: [0, t, 0] -> [0, t, 0] -> [e, t-e] -> [, t]
			// 304: [e, t: t <=> e, d: d>=e] -> [e, t-e, d-e]
			// 200 non-gzipped: [e, t: t>=e, d: d=e] -> [e, t-e]
			// 200 gzipped: [e, t: t>=e, d: d>=e] -> [e, t-e, d-e]
			// retrieved from cache non-gzipped: [e, 0, d: d=e] -> [e]
			// retrieved from cache gzipped: [e, 0, d: d>=e] -> [e, _, d-e]
			//
			sTrans = resource.transferSize;
			sEnc = resource.encodedBodySize;
			sDec = resource.decodedBodySize;

			// convert to an array
			sizes = [sEnc, sTrans ? sTrans - sEnc : "_", sDec ? sDec - sEnc : 0];

			// change everything to base36 and remove any trailing ,s
			return sizes.map(toBase36).join(",").replace(/,+$/, "");
		}
		else {
			return "";
		}
	}


	/**
	 * Trims the URL according to the specified URL trim patterns,
	 * then applies a length limit.
	 *
	 * @param {string} url URL to trim
	 * @param {string} urlsToTrim List of URLs (strings or regexs) to trim
	 * @returns {string} Trimmed URL
	 */
	function trimUrl(url, urlsToTrim) {
		var i, urlIdx, trim;

		if (url && urlsToTrim) {
			// trim the payload from any of the specified URLs
			for (i = 0; i < urlsToTrim.length; i++) {
				trim = urlsToTrim[i];

				if (typeof trim === "string") {
					urlIdx = url.indexOf(trim);
					if (urlIdx !== -1) {
						url = url.substr(0, urlIdx + trim.length) + "...";
						break;
					}
				}
				else if (trim instanceof RegExp) {
					if (trim.test(url)) {
						// replace the URL with the first capture group
						url = url.replace(trim, "$1") + "...";
					}
				}
			}
		}

		// apply limits
		return BOOMR.utils.cleanupURL(url, impl.urlLimit);
	}

	/**
	 * Get the latest timepoint for this resource from ResourceTiming. If the resource hasn't started downloading yet, return Infinity
	 * @param {PerformanceResourceEntry} res The resource entry to get the latest time for
	 * @returns {number} latest timepoint for the resource or now if the resource is still in progress
	 */
	function getResourceLatestTime(res) {
		// If responseEnd is non zero, return it
		if (res.responseEnd) {
			return res.responseEnd;
		}

		// If responseStart is non zero, assume it accounts for 80% of the load time, and bump it by 20%
		if (res.responseStart && res.startTime) {
			return res.responseStart + (res.responseStart - res.startTime) * 0.2;
		}

		// If the resource hasn't even started loading, assume it will come at some point in the distant future (after the beacon)
		// we'll let the server determine what to do
		return Infinity;
	}

	/**
	 * Given a 2D array representing the screen and a list of rectangular dimension tuples, turn on the screen pixels that match the dimensions.
	 * Previously set pixels that are also set with the current call will be overwritten with the new value of pixelValue
	 * @param {number[][]} currentPixels A 2D sparse array of numbers representing set pixels or undefined if no pixels are currently set.
	 * @param {number[][]} dimList A list of rectangular dimension tuples in the form [height, width, top, left] for resources to be painted on the virtual screen
	 * @param {number} pixelValue The numeric value to set all new pixels to
	 * @returns {number[][]} An updated version of currentPixels.
	 */
	function mergePixels(currentPixels, dimList, pixelValue) {
		var s = BOOMR.window.screen,
		    h = s.height, w = s.width;

		return dimList.reduce(
			function(acc, val) {
				var x_min, x_max,
				    y_min, y_max,
				    x, y;

				x_min = Math.max(0, val[3]);
				y_min = Math.max(0, val[2]);
				x_max = Math.min(val[3] + val[1], w);
				y_max = Math.min(val[2] + val[0], h);

				// Object is off-screen
				if (x_min >= x_max || y_min >= y_max) {
					return acc;
				}

				// We fill all pixels of this resource with a true
				// this is needed to correctly account for overlapping resources
				for (y = y_min; y < y_max; y++) {
					if (!acc[y]) {
						acc[y] = [];
					}

					for (x = x_min; x < x_max; x++) {
						acc[y][x] = pixelValue;
					}
				}

				return acc;
			},
			currentPixels || []
		);
	}

	/**
	 * Counts the number of pixels that are set in the given 2D array representing the screen
	 * @param {number[][]} pixels A 2D boolean array representing the screen with painted pixels set to true
	 * @param {number} [rangeMin] If included, will only count pixels >= this value
	 * @param {number} [rangeMax] If included, will only count pixels <= this value
	 * @returns {number} The number of pixels set in the passed in array
	 */
	function countPixels(pixels, rangeMin, rangeMax) {
		rangeMin = rangeMin || 0;
		rangeMax = rangeMax || Infinity;

		return pixels
			.reduce(function(acc, val) {
				return acc +
					val.filter(function(v) {
						return rangeMin <= v && v <= rangeMax;
					}).length;
			},
			0
		);
	}

	/**
	 * Returns a compressed string representation of a hash of timepoints to painted pixel count and finalized pixel count.
	 * - Timepoints are reduced to milliseconds relative to the previous timepoint while pixel count is reduced to pixels relative to the previous timepoint. Finalized pixels are reduced to be relative (negated) to full pixels for that timepoint
	 * - The relative timepoint and relative pixels are then each Base36 encoded and combined with a ~
	 * - Finally, the list of timepoints is merged, separated by ! and returned
	 * @param {object} timePoints An object in the form { "<timePoint>" : [ <object dimensions>, <object dimensions>, ...], <timePoint>: [...], ...}, where <object dimensions> is [height, width, top, left]
	 * @returns {string} The serialized compressed timepoint object with ! separating individual triads and ~ separating timepoint and pixels within the triad. The elements of the triad are the timePoint, number of pixels painted at that point, and the number of pixels finalized at that point (ie, no further paints). If the third part of the triad is 0, it is omitted, if the second part of the triad is 0, it is omitted and the repeated ~~ is replaced with a -
	 */
	function getOptimizedTimepoints(timePoints) {
		var i, roundedTimePoints = {}, timeSequence, tPixels,
		    t_prev, t, p_prev, p, f_prev, f,
		    comp, result = [];

		// Round timepoints to the nearest integral ms
		timeSequence = Object.keys(timePoints);

		for (i = 0; i < timeSequence.length; i++) {
			t = Math.round(Number(timeSequence[i]));
			if (typeof roundedTimePoints[t] === "undefined") {
				roundedTimePoints[t] = [];
			}

			// Merge
			Array.prototype.push.apply(roundedTimePoints[t], timePoints[timeSequence[i]]);
		}

		// Get all unique timepoints nearest ms sorted in ascending order
		timeSequence = Object.keys(roundedTimePoints).map(Number).sort(function(a, b) { return a - b; });

		if (timeSequence.length === 0) {
			return {};
		}

		// First loop identifies pixel first paints
		for (i = 0; i < timeSequence.length; i++) {
			t = timeSequence[i];
			tPixels = mergePixels(tPixels, roundedTimePoints[t], t);

			p = countPixels(tPixels);
			timeSequence[i] = [t, p];
		}

		// We'll make all times and pixel counts relative to the previous ones
		t_prev = 0;
		p_prev = 0;
		f_prev = 0;

		// Second loop identifies pixel final paints
		for (i = 0; i < timeSequence.length; i++) {
			t = timeSequence[i][0];
			p = timeSequence[i][1];
			f = countPixels(tPixels, 0, t);

			if (p > p_prev || f > f_prev) {
				comp = (t === Infinity ? "" : toBase36(Math.round(t - t_prev))) + "~" + toBase36(p - p_prev) + "~" + toBase36(p - f);

				comp = comp.replace(/~~/, "-").replace(/~$/, "");

				result.push(comp);

				t_prev = t;
				p_prev = p;
				f_prev = f;
			}
		}

		return result.join("!").replace(/!+$/, "");
	}

	/**
	 * Gathers performance entries and compresses the result.
	 *
	 * @param {number} from Only get timings from
	 * @param {number} to Only get timings up to
	 *
	 * @returns {object} An object containing the Optimized performance entries trie and
	 * the optimized server timing lookup
	 * @memberof BOOMR.plugins.ResourceTiming
	 */
	function getCompressedResourceTiming(from, to) {
		/*eslint no-script-url:0*/
		var i, e, results = {}, initiatorType, url, data, timePoints = {};

		var ret = getFilteredResourceTiming(from, to, impl.trackedResourceTypes);
		var entries = ret.entries, serverTiming = ret.serverTiming;

		if (!entries || !entries.length) {
			return {
				restiming: {},
				servertiming: []
			};
		}

		for (i = 0; i < entries.length; i++) {
			e = entries[i];

			//
			// Compress the RT data into a string:
			//
			// 1. Start with the initiator type, which is mapped to a number.
			// 2. Put the timestamps into an array in a set order (reverse chronological order),
			//    which pushes timestamps that are more likely to be zero (duration since
			//    startTime) towards the end of the array (eg redirect* and domainLookup*).
			// 3. Convert these timestamps to Base36, with empty or zero times being an empty string
			// 4. Join the array on commas
			// 5. Trim all trailing empty commas (eg ",,,")
			//

			// prefix initiatorType to the string
			initiatorType = INITIATOR_TYPES[e.initiatorType];
			if (typeof initiatorType === "undefined") {
				initiatorType = 0;
			}

			data = initiatorType + [
				trimTiming(e.startTime, 0),
				trimTiming(e.responseEnd, e.startTime),
				trimTiming(e.responseStart, e.startTime),
				trimTiming(e.requestStart, e.startTime),
				trimTiming(e.connectEnd, e.startTime),
				trimTiming(e.secureConnectionStart, e.startTime),
				trimTiming(e.connectStart, e.startTime),
				trimTiming(e.domainLookupEnd, e.startTime),
				trimTiming(e.domainLookupStart, e.startTime),
				trimTiming(e.redirectEnd, e.startTime),
				trimTiming(e.redirectStart, e.startTime)
			].map(toBase36).join(",").replace(/,+$/, ""); // this `replace()` removes any trailing commas

			// add content and transfer size info
			var compSize = compressSize(e);
			if (compSize !== "") {
				data += SPECIAL_DATA_PREFIX + SPECIAL_DATA_SIZE_TYPE + compSize;
			}

			if (e.hasOwnProperty("scriptAttrs")) {
				data += SPECIAL_DATA_PREFIX + SPECIAL_DATA_SCRIPT_ATTR_TYPE + e.scriptAttrs;
			}

			if (e.serverTiming && e.serverTiming.length) {
				data += SPECIAL_DATA_PREFIX + SPECIAL_DATA_SERVERTIMING_TYPE +
					e.serverTiming.reduce(function(stData, entry, entryIndex) {
						// The numeric of the entry is `value` for Chrome 61, `duration` after that
						var duration = String(typeof entry.duration !== "undefined" ? entry.duration : entry.value);
						if (duration.substring(0, 2) === "0.") {
							// lop off the leading 0
							duration = duration.substring(1);
						}
						// The name of the entry is `metric` for Chrome 61, `name` after that
						var name = entry.name || entry.metric;
						var lookupKey = identifyServerTimingEntry(serverTiming.indexed[name].index,
							serverTiming.indexed[name].descriptions[entry.description]);
						stData += (entryIndex > 0 ? "," : "") + duration + lookupKey;
						return stData;
					}, "");
			}

			if (e.hasOwnProperty("linkAttrs")) {
				data += SPECIAL_DATA_PREFIX + SPECIAL_DATA_LINK_ATTR_TYPE + e.linkAttrs;
			}

			url = trimUrl(e.name, impl.trimUrls);

			if (!e.hasOwnProperty("_data")) {
				// if this entry already exists, add a pipe as a separator
				if (results[url] !== undefined) {
					results[url] += "|" + data;
				}
				else if (e.visibleDimensions) {
					// We use * as an additional separator to indicate it is not a new resource entry
					// The following characters will not be URL encoded:
					// *!-.()~_ but - and . are special to number representation so we don't use them
					// After the *, the type of special data (ResourceTiming = 0) is added
					results[url] =
						SPECIAL_DATA_PREFIX +
						SPECIAL_DATA_DIMENSION_TYPE +
						e.visibleDimensions.map(Math.round).map(toBase36).join(",").replace(/,+$/, "") +
						"|" +
						data;
				}
				else {
					results[url] = data;
				}
			}
			else {
				var namespacedData = "";
				for (var key in e._data) {
					if (e._data.hasOwnProperty(key)) {
						namespacedData += SPECIAL_DATA_PREFIX + SPECIAL_DATA_NAMESPACED_TYPE + key + ":" + e._data[key];
					}
				}

				if (typeof results[url] === "undefined") {
					// we haven't seen this resource yet, treat this potential stub as the canonical version
					results[url] = data + namespacedData;
				}
				else {
					// we have seen this resource before
					// forget the timing data of `e`, just supplement the previous entry with the new `namespacedData`
					results[url] += namespacedData;
				}
			}

			if (e.visibleDimensions) {
				if (!timePoints[e.latestTime]) {
					timePoints[e.latestTime] = [];
				}
				timePoints[e.latestTime].push(e.visibleDimensions);
			}
		}

		return {
			restiming: optimizeTrie(convertToTrie(results, impl.splitAtPath), true),
			servertiming: serverTiming.lookup
		};
	}

	/**
	 * Compresses an array of ResourceTiming-like objects (those with a fetchStart
	 * and a responseStart/responseEnd) by reducing multiple objects with the same
	 * fetchStart down to a single object with the longest duration.
	 *
	 * Array must be pre-sorted by fetchStart, then by responseStart||responseEnd
	 *
	 * @param {ResourceTiming[]} resources ResourceTiming-like resources, with just
	 *  a fetchStart and responseEnd
	 *
	 * @returns Duration, in milliseconds
	 */
	function reduceFetchStarts(resources) {
		var times = [];

		if (!resources || !resources.length) {
			return times;
		}

		for (var i = 0; i < resources.length; i++) {
			var res = resources[i];

			// if there is a subsequent resource with the same fetchStart, use
			// its value instead (since pre-sort guarantee is that it's end
			// will be >= this one)
			if (i !== resources.length - 1 &&
				res.fetchStart === resources[i + 1].fetchStart) {
				continue;
			}

			// track just the minimum fetchStart and responseEnd
			times.push({
				fetchStart: res.fetchStart,
				responseEnd: res.responseStart || res.responseEnd
			});
		}

		return times;
	}

	/**
	 * Calculates the union of durations of the specified resources.  If
	 * any resources overlap, those timeslices are not double-counted.
	 *
	 * @param {ResourceTiming[]} resources Resources
	 *
	 * @returns Duration, in milliseconds
	 * @memberof BOOMR.plugins.ResourceTiming
	 */
	function calculateResourceTimingUnion(resources) {
		var i;

		if (!resources || !resources.length) {
			return 0;
		}

		// First, sort by start time, then end time
		resources.sort(function(a, b) {
			if (a.fetchStart !== b.fetchStart) {
				return a.fetchStart - b.fetchStart;
			}
			else {
				var ae = a.responseStart || a.responseEnd;
				var be = b.responseStart || b.responseEnd;

				return ae - be;
			}
		});

		// Next, find all resources with the same start time, and reduce
		// them to the largest end time.
		var times = reduceFetchStarts(resources);

		// Third, for every resource, if the start is less than the end of
		// any previous resource, change its start to the end.  If the new start
		// time is more than the end time, we can discard this one.
		var times2 = [];
		var furthestEnd = 0;

		for (i = 0; i < times.length; i++) {
			var res = times[i];

			if (res.fetchStart < furthestEnd) {
				res.fetchStart = furthestEnd;
			}

			// as long as this resource has > 0 duration, add it to our next list
			if (res.fetchStart < res.responseEnd) {
				times2.push(res);

				// keep track of the furthest end point
				furthestEnd = res.responseEnd;
			}
		}

		// Reduce down again to same start times again, and now we should
		// have no overlapping regions
		var times3 = reduceFetchStarts(times2);

		// Finally, calculate the overall time from our non-overlapping regions
		var totalTime = 0;
		for (i = 0; i < times3.length; i++) {
			totalTime += times3[i].responseEnd - times3[i].fetchStart;
		}

		return totalTime;
	}

	/**
	 * Adds 'restiming' and 'servertiming' to the beacon
	 *
	 * @param {number} from Only get timings from
	 * @param {number} to Only get timings up to
	 *
	 * @memberof BOOMR.plugins.ResourceTiming
	 */
	function addResourceTimingToBeacon(from, to) {
		var r;

		// Can't send if we don't support JSON
		if (typeof JSON === "undefined") {
			return;
		}

		BOOMR.removeVar("restiming");
		BOOMR.removeVar("servertiming");


		r = getCompressedResourceTiming(from, to);


		if (r) {
			BOOMR.info("Client supports Resource Timing API", "restiming");
			addToBeacon(r);
		}
	}

	/**
	 * Given an array of server timing entries (from the resource timing entry),
	 * [initialize and] increment our count collector of the following format: {
	 *   "metric-one": {
	 *     count: 3,
	 *     counts: {
	 *       "description-one": 2,
	 *       "description-two": 1,
	 *     }
	 *   }
	 * }
	 *
	 * @param {Object} countCollector Per-beacon collection of counts
	 * @param {Array} serverTimingEntries Server Timing Entries from a Resource Timing Entry
	 * @returns nothing
	 */
	function accumulateServerTimingEntries(countCollector, serverTimingEntries) {
		(serverTimingEntries || []).forEach(function(entry) {
			var name = entry.name || entry.metric;
			if (typeof countCollector[name] === "undefined") {
				countCollector[name] = {
					count: 0,
					counts: {}
				};
			}
			var metric = countCollector[name];
			metric.counts[entry.description] = metric.counts[entry.description] || 0;
			metric.counts[entry.description]++;
			metric.count++;
		});
	}

	/**
	 * Given our count collector of the format: {
	 *   "metric-two": {
	 *     count: 1,
	 *     counts: {
	 *       "description-three": 1,
	 *     }
	 *   },
	 *   "metric-one": {
	 *     count: 3,
	 *     counts: {
	 *       "description-one": 1,
	 *       "description-two": 2,
	 *     }
	 *   }
	 * }
	 *
	 * , return the lookup of the following format: [
	 *   ["metric-one", "description-two", "description-one"],
	 *   ["metric-two", "description-three"],
	 * ]
	 *
	 * Note: The order of these arrays of arrays matters: there are more server timing entries with
	 * name === "metric-one" than "metric-two", and more "metric-one"/"description-two" than
	 * "metric-one"/"description-one".
	 *
	 * @param {Object} countCollector Per-beacon collection of counts
	 * @returns {Array} compressed lookup array
	 */
	function compressServerTiming(countCollector) {
		return Object.keys(countCollector).sort(function(metric1, metric2) {
			return countCollector[metric2].count - countCollector[metric1].count;
		}).reduce(function(array, name) {
			var sorted = Object.keys(countCollector[name].counts).sort(function(description1, description2) {
				return countCollector[name].counts[description2] -
					countCollector[name].counts[description1];
			});

			array.push(sorted.length === 1 && sorted[0] === "" ?
				name : // special case: no non-empty descriptions
				[name].concat(sorted));
			return array;
		}, []);
	}

	/**
	 * Given our lookup of the format: [
	 *   ["metric-one", "description-one", "description-two"],
	 *   ["metric-two", "description-three"],
	 * ]
	 *
	 * , create a O(1) name/description to index values lookup dictionary of the format: {
	 *   metric-one: {
	 *     index: 0,
	 *     descriptions: {
	 *       "description-one": 0,
	 *       "description-two": 1,
	 *     }
	 *   }
	 *   metric-two: {
	 *     index: 1,
	 *     descriptions: {
	 *       "description-three": 0,
	 *     }
	 *   }
	 * }
	 *
	 * @param {Array} lookup compressed lookup array
	 * @returns {Object} indexed version of the compressed lookup array
	 */
	function indexServerTiming(lookup) {
		return lookup.reduce(function(serverTimingIndex, compressedEntry, entryIndex) {
			var name, descriptions;
			if (Array.isArray(compressedEntry)) {
				name = compressedEntry[0];
				descriptions = compressedEntry.slice(1).reduce(function(descriptionCollector, description, descriptionIndex) {
					descriptionCollector[description] = descriptionIndex;
					return descriptionCollector;
				}, {});
			}
			else {
				name = compressedEntry;
				descriptions = {
					"": 0
				};
			}

			serverTimingIndex[name] = {
				index: entryIndex,
				descriptions: descriptions
			};
			return serverTimingIndex;
		}, {});
	}

	/**
	 * Given entryIndex and descriptionIndex, create the shorthand key into the lookup
	 * response format is ":<entryIndex>.<descriptionIndex>"
	 * either/both entryIndex or/and descriptionIndex can be omitted if equal to 0
	 * the "." can be ommited if descriptionIndex is 0
	 * the ":" can be ommited if entryIndex and descriptionIndex are 0
	 *
	 * @param {Integer} entryIndex index of the entry
	 * @param {Integer} descriptionIndex index of the description
	 * @returns {String} key into the compressed lookup
	 */
	function identifyServerTimingEntry(entryIndex, descriptionIndex) {
		var s = "";
		if (entryIndex) {
			s += entryIndex;
		}
		if (descriptionIndex) {
			s += "." + descriptionIndex;
		}
		if (s.length) {
			s = ":" + s;
		}
		return s;
	}

	/**
	 * Adds optimized performance entries trie and (conditionally) the optimized server timing lookup to the beacon
	 *
	 * @param {Object} r An object containing the optimized performance entries trie and the optimized server timing
	 *  lookup
	 */
	function addToBeacon(r) {
		BOOMR.addVar("restiming", JSON.stringify(r.restiming));
		if (r.servertiming.length) {
			BOOMR.addVar("servertiming", BOOMR.utils.serializeForUrl(r.servertiming));
		}
	}

	/**
	 * Given our lookup of the format: [
	 *   ["metric-one", "description-one", "description-two"],
	 *   ["metric-two", "description-three"],
	 * ]
	 *
	 * , and a key of the format: duration:entryIndex.descriptionIndex,
	 * return the decompressed server timing entry (name, duration, description)
	 *
	 * Note: code only included as POC
	 *
	 * @param {Array} lookup compressed lookup array
	 * @param {Integer} key key into the compressed lookup
	 * @returns {Object} decompressed resource timing entry (name, duration, description)
	 */

	impl = {
		complete: false,
		sentNavBeacon: false,
		initialized: false,
		supported: null,
		xhr_load: function() {
			if (this.complete) {
				return;
			}

			// page load might not have happened, or will happen later, so
			// set us as complete so we don't hold the page load
			this.complete = true;
			BOOMR.sendBeacon();
		},
		xssBreakWords: DEFAULT_XSS_BREAK_WORDS,
		urlLimit: DEFAULT_URL_LIMIT,

		// overridable
		clearOnBeacon: false,
		trimUrls: [],
		serverTiming: true,
		monitorClearResourceTimings: false,
		splitAtPath: false,
		// overridable

		/**
		 * Array of resource types to track, or "*" for all.
		 *  @type {string[]|string}
		 */
		trackedResourceTypes: "*",
		done: function() {
			// Stop if we've already sent a nav beacon (both xhr and spa* beacons
			// add restiming manually).
			if (this.sentNavBeacon) {
				return;
			}

			addResourceTimingToBeacon();

			this.complete = true;
			this.sentNavBeacon = true;

			BOOMR.sendBeacon();
		},

		onBeacon: function(vars) {
			var p = BOOMR.getPerformance();

			// clear metrics
			if (vars.hasOwnProperty("restiming")) {
				BOOMR.removeVar("restiming");
			}
			if (vars.hasOwnProperty("servertiming")) {
				BOOMR.removeVar("servertiming");
			}

			if (impl.clearOnBeacon && p) {
				var clearResourceTimings = p.clearResourceTimings || p.webkitClearResourceTimings;
				if (clearResourceTimings && typeof clearResourceTimings === "function") {
					clearResourceTimings.call(p);
				}
			}
		},

		prerenderToVisible: function() {
			// ensure we add our data to the beacon even if we had added it
			// during prerender (in case another beacon went out in between)
			this.sentNavBeacon = false;

			// add our data to the beacon
			this.done();
		}
	};

	BOOMR.plugins.ResourceTiming = {
		/**
		 * Initializes the plugin.
		 *
		 * @param {object} config Configuration
		 * @param {string[]} [config.ResourceTiming.xssBreakWorks] Words that will be broken (by
		 * ensuring the optimized trie doesn't contain the whole string) in URLs,
		 * to ensure NoScript doesn't think this is an XSS attack.
		 *
		 * Defaults to `DEFAULT_XSS_BREAK_WORDS`.
		 * @param {boolean} [config.ResourceTiming.clearOnBeacon] Whether or not to clear ResourceTiming
		 * data on each beacon.
		 * @param {number} [config.ResourceTiming.urlLimit] URL length limit, after which `...` will be used
		 * @param {string[]|RegExp[]} [config.ResourceTiming.trimUrls] List of strings of RegExps
		 * to trim from URLs.
		 * @param {boolean} [config.ResourceTiming.monitorClearResourceTimings] Whether or not to instrument
		 * `performance.clearResourceTimings`.
		 * @param {boolean} [config.ResourceTiming.splitAtPath] Whether or not to split the ResourceTiming
		 * compressed Trie at the path separator (faster processing, but larger result).
		 *
		 * @returns {@link BOOMR.plugins.ResourceTiming} The ResourceTiming plugin for chaining
		 * @memberof BOOMR.plugins.ResourceTiming
		 */
		init: function(config) {
			BOOMR.utils.pluginConfig(impl, config, "ResourceTiming",
				["xssBreakWords", "clearOnBeacon", "urlLimit", "trimUrls", "trackedResourceTypes", "serverTiming",
					"monitorClearResourceTimings", "splitAtPath"]);

			if (impl.initialized) {
				return this;
			}

			if (this.is_supported()) {
				BOOMR.subscribe("page_ready", impl.done, null, impl);
				BOOMR.subscribe("prerender_to_visible", impl.prerenderToVisible, null, impl);
				BOOMR.subscribe("xhr_load", impl.xhr_load, null, impl);
				BOOMR.subscribe("beacon", impl.onBeacon, null, impl);
				BOOMR.subscribe("before_unload", impl.done, null, impl);

				if (impl.monitorClearResourceTimings) {
					var self = this;
					BOOMR.window.performance.clearResourceTimings = (function(_){
						return function() {
							self.addResources(BOOMR.window.performance.getEntriesByType("resource"));
							_.apply(BOOMR.window.performance, arguments);
						};
					})(BOOMR.window.performance.clearResourceTimings);
				}
			}
			else {
				impl.complete = true;
			}

			impl.initialized = true;

			return this;
		},

		/**
		 * Whether or not this plugin is complete
		 *
		 * @returns {boolean} `true` if the plugin is complete
		 * @memberof BOOMR.plugins.ResourceTiming
		 */
		is_complete: function() {
			return true;
		},

		/**
		 * Whether or not this ResourceTiming is enabled and supported.
		 *
		 * @returns {boolean} `true` if ResourceTiming plugin is enabled.
		 * @memberof BOOMR.plugins.ResourceTiming
		 */
		is_enabled: function() {
			return impl.initialized && this.is_supported();
		},

		/**
		 * Whether or not ResourceTiming is supported in this browser.
		 *
		 * @returns {boolean} `true` if ResourceTiming is supported.
		 * @memberof BOOMR.plugins.ResourceTiming
		 */
		is_supported: function() {
			var p;

			if (impl.supported !== null) {
				return impl.supported;
			}

			// check for getEntriesByType and the entry type existing
			var p = BOOMR.getPerformance();
			impl.supported = p &&
			    typeof p.getEntriesByType === "function" &&
			    typeof window.PerformanceResourceTiming !== "undefined";

			return impl.supported;
		},

		/**
		 * Saves an array of `PerformanceResourceTiming`-shaped objects which we will later insert into the trie.
		 *
		 * @param {array<object>} resources Array of objects that are shaped like `PerformanceResourceTiming`s
		 * @param {high-resolution-timestamp} epoch Optional epoch for all of the timestamps of all of the resources
		 *
		 * @memberof BOOMR.plugins.ResourceTiming
		 */
		addResources: function(resources, epoch) {
			if (!this.is_supported() || !BOOMR.utils.isArray(resources)) {
				return;
			}

			impl.collectedEntries = impl.collectedEntries || [];
			if (typeof epoch === "number") {
				var topEpoch = BOOMR.window.performance.timeOrigin || BOOMR.window.performance.timing.navigationStart;
				var offset = epoch - topEpoch;
				resources = BOOMR.utils.arrayFilter(resources, function(entry) {
					for (var field = 0; field < RT_FIELDS_TIMESTAMPS.length; field++) {
						var key = RT_FIELDS_TIMESTAMPS[field];
						if (entry.hasOwnProperty(key)) {
							entry[key] += offset;
						}
					}
					return true;
				});
			}
			Array.prototype.push.apply(impl.collectedEntries, resources);
		},

		//
		// Public Exports
		//
		getCompressedResourceTiming: getCompressedResourceTiming,
		getFilteredResourceTiming: getFilteredResourceTiming,
		calculateResourceTimingUnion: calculateResourceTimingUnion,
		addResourceTimingToBeacon: addResourceTimingToBeacon,
		addToBeacon: addToBeacon

		//
		// Test Exports (only for debug)
		//
	};

}());

/**
 * Plugin to collect memory, page construction (DOM), screen, CPU and battery metrics (when available).
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## Beacon Parameters
 *
 * * Resources:
 *   * `dom.res`: Number of resources fetched in the main frame (via ResourceTiming)
 *   * `dom.doms`: Number of unique domains in the main page (via ResourceTiming)
 * * Memory
 *   * `mem.total`: [`memory.totalJSHeapSize`](https://webplatform.github.io/docs/apis/timing/properties/memory/)
 *   * `mem.limit`: [`memory.jsHeapSizeLimit`](https://webplatform.github.io/docs/apis/timing/properties/memory/)
 *   * `mem.used`: [`m.usedJSHeapSize`](https://webplatform.github.io/docs/apis/timing/properties/memory/)
 *   * `mem.lssz`: Number of localStorage bytes used
 *   * `mem.lsln`: Number of localStorage keys used
 *   * `mem.sssz`: Number of sessionStorage bytes used
 *   * `mem.ssln`: Number of sessionStorage keys used
 * * Screen
 *   * `scr.xy`: [`screen.width`](https://developer.mozilla.org/en-US/docs/Web/API/Screen/width)
 *     and [`screen.height`](https://developer.mozilla.org/en-US/docs/Web/API/Screen/height) (e.g. `100x200`)
 *   * `scr.bpp`: [`screen.colorDepth`](https://developer.mozilla.org/en-US/docs/Web/API/Screen/colorDepth)
 *     and [`screen.pixelDepth`](https://developer.mozilla.org/en-US/docs/Web/API/Screen/pixelDepth) (e.g. `32/24`)
 *   * `scr.dpx`: [`screen.devicePixelRatio`](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio)
 *   * `scr.orn`: [`screen.orientation.angle`](https://developer.mozilla.org/en-US/docs/Web/API/Screen/orientation) and
 *     [`screen.orientation.type`](https://developer.mozilla.org/en-US/docs/Web/API/Screen/type) (e.g. `90/landscape-primary`)
 *   * `scr.sxy`: [`window.scrollX`](https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollX) and
 *     [`window.scrollY`](https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY) (e.g. `0x1000`)
 * * Hardware
 *   * `scr.mtp`: [`navigator.maxTouchPoints`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/maxTouchPoints)
 *   * `cpu.cnc`: [`navigator.hardwareConcurrency`](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorConcurrentHardware/hardwareConcurrency)
 *   * `bat.lvl`: [Battery API](https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API) level
 * * DOM
 *   * `dom.ln`: Number of DOM nodes in the main frame
 *   * `dom.sz`: Number of HTML bytes of of the main frame
 *   * `dom.ck`: Number of bytes stored as cookies available to JavaScript on the current domain
 *   * `dom.img`: Number of `IMG` nodes in the main frame
 *   * `dom.img.ext`: Number of external (e.g. not `data:` URI) `IMG` nodes in the main frame
 *   * `dom.img.uniq`: Number of unique `IMG src` nodes in the main frame
 *   * `dom.script`: Number of `SCRIPT` nodes in the main frame
 *   * `dom.script.ext`: Number of external (e.g. not inline or `data:` URI) `SCRIPT` nodes in the main frame
 *   * `dom.script.uniq`: Number of unique `SCRIPT src` nodes in the main frame
 *   * `dom.iframe`: Number of `IFRAME` nodes in the main frame
 *   * `dom.iframe.ext`: Number of external (e.g. not `javascript:` or `about:` URI) `IFRAME` nodes in the main frame
 *   * `dom.iframe.uniq`: Number of unique `IFRAME src` nodes in the main frame
 *   * `dom.link`: Number of `LINK` nodes in the main frame
 *   * `dom.link.css`: Number of `rel="stylesheet"` `LINK` nodes in the main frame
 *   * `dom.link.css.uniq`: Number of unique `rel="stylesheet"` `LINK` nodes in the main frame
 *
 * @class BOOMR.plugins.Memory
 */
(function() {
	var w, p = {}, d, m, s, n, b, ls, ss, impl;

	
	

	if (BOOMR.plugins.Memory) {
		return;
	}

	/**
	 * Count elements of a given type and return the count or an object with the
	 * `key` mapped to the `count` if a `key` is specified. If one or more filters
	 * are included, apply them incrementally to the `element` array, assigning
	 * each intermediate count to the corresponding `key` in the return object
	 *
	 * @param {string} type Element type to search DOM for
	 * @param {string[]} [keys] List of keys for return object.
	 * If not included, just the tag count is returned.
	 *
	 * If included then an object is returned with each element in this array as
	 * a key, and the element count as the value.
	 *
	 * For keys[1] onwards, the element count is the number of elements returned
	 * from each corresponding filter function.
	 * @param {function} [filter] List of filters to apply incrementally to element array.
	 * This is NOT an array.
	 *
	 * The input to each function in the argument list is the array returned by the previous function
	 *
	 * The first function receives the array returned by the `getElementsByTagName` function
	 *
	 * Each function MUST return a NodeList or an Array with a `length` property
	 *
	 * @returns {number|object}
	 * If only one argument is passed in, returns a nodeCount matching that element type.
	 * If multiple arguments are passed in, returns an object with key to count
	 * mapping based on the rules above.
	 */
	function nodeCount(type, keys /*, filter...*/) {
		var tags, r, o, i, filter;
		try {
			tags = d.getElementsByTagName(type);
			r = tags.length;

			if (keys && keys.length) {
				o = {};
				o[keys[0]] = r;

				// Iterate through all remaining arguments checking for filters
				// Remember that keys.length will be at least 1 and arguments.length will be at least 2
				// so the first key we use is keys[1] for arguments[2]
				for (i = 2; r > 0 && i < arguments.length && i - 1 < keys.length; i++) {
					filter = arguments[i];

					if (typeof filter !== "function") {
						continue;
					}

					try {
						tags = BOOMR.utils.arrayFilter(tags, filter);
						// Only add this if different from the previous
						if (tags.length !== r) {
							r = tags.length;
							o[keys[i - 1]] = r;
						}
					}
					catch (err) {
						BOOMR.addError(err, "Memory.nodeList." + type + ".filter[" + (i - 2) + "]");
					}
				}

			}
			return o || r;
		}
		catch (err) {
			BOOMR.addError(err, "Memory.nodeList." + type);
			return 0;
		}
	}

	/**
	 * Wraps a callback for error reporting
	 *
	 * @param {boolean} condition Condition
	 * @param {function} callback Callback
	 * @param {string} component Component name
	 */
	function errorWrap(condition, callback, component) {
		if (condition) {
			try {
				callback();
			}
			catch (err) {
				BOOMR.addError(err, "Memory.done." + component);
			}
		}
	}

	// A private object to encapsulate all your implementation details
	impl = {
		done: function() {
			if (!w) {
				// this can happen for an unload beacon
				return;
			}

			// If we have resource timing, get number of resources
			BOOMR.removeVar("dom.res");
			errorWrap(true,
				function() {
					var res, doms = {}, a;

					if (!p || typeof p.getEntriesByType !== "function") {
						return;
					}

					res = p.getEntriesByType("resource");
					if (!res || !res.length) {
						return;
					}

					BOOMR.addVar("dom.res", res.length);

					a = BOOMR.window.document.createElement("a");

					[].forEach.call(res, function(r) {
						a.href = r.name;
						doms[a.hostname] = true;
					});

					BOOMR.addVar("dom.doms", Object.keys(doms).length);
				},
				"resources"
			);

			if (m) {
				BOOMR.addVar({
					"mem.total": m.totalJSHeapSize,
					"mem.limit": m.jsHeapSizeLimit,
					"mem.used": m.usedJSHeapSize
				});
			}

			errorWrap(ls && ss,
				function() {
					BOOMR.addVar({
						"mem.lsln": ls.length,
						"mem.ssln": ss.length
					});

					if (window.JSON && typeof JSON.stringify === "function") {
						BOOMR.addVar({
							"mem.lssz": JSON.stringify(ls).length,
							"mem.sssz": JSON.stringify(ss).length
						});
					}
				},
				"localStorage"
			);

			errorWrap(s,
				function() {
					var sx, sy;
					BOOMR.addVar({
						"scr.xy": s.width + "x" + s.height,
						"scr.bpp": s.colorDepth + "/" + (s.pixelDepth || "")
					});
					if (s.orientation) {
						BOOMR.addVar("scr.orn", s.orientation.angle + "/" + s.orientation.type);
					}
					if (w.devicePixelRatio > 1) {
						BOOMR.addVar("scr.dpx", w.devicePixelRatio);
					}

					var scroll = BOOMR.utils.scroll();
					if (scroll.x || scroll.y) {
						BOOMR.addVar("scr.sxy", scroll.x + "x" + scroll.y);
					}
				},
				"screen"
			);

			errorWrap(n,
				function() {
					if (n.hardwareConcurrency) {
						BOOMR.addVar("cpu.cnc", n.hardwareConcurrency);
					}
					if (n.maxTouchPoints) {
						BOOMR.addVar("scr.mtp", n.maxTouchPoints);
					}
				},
				"navigator"
			);

			errorWrap(b,
				function() {
					if (b && typeof b.level === "number") {
						BOOMR.addVar("bat.lvl", b.level);
					}
				},
				"battery"
			);

			errorWrap(true,
				function() {
					var uniqUrls;

					BOOMR.addVar({
						"dom.ln": nodeCount("*"),
						"dom.sz": d.documentElement.innerHTML.length,
						"dom.ck": d.cookie.length
					});

					uniqUrls = {};
					BOOMR.addVar(nodeCount(
						"img",
						["dom.img", "dom.img.ext", "dom.img.uniq"],
						function(el) {
							return el.src && !el.src.toLowerCase().match(/^(?:about:|javascript:|data:|#)/);
						},
						function(el) {
							return !(uniqUrls[el.currentSrc || el.src] = uniqUrls.hasOwnProperty(el.currentSrc || el.src));
						}
					));

					uniqUrls = {};
					BOOMR.addVar(nodeCount(
						"script",
						["dom.script", "dom.script.ext", "dom.script.uniq"],
						function(el) {
							return el.src && !el.src.toLowerCase().match(/^(?:about:|javascript:|#)/);
						},
						function(el) {
							return !(uniqUrls[el.src] = uniqUrls.hasOwnProperty(el.src));
						}
					));

					uniqUrls = {};
					BOOMR.addVar(nodeCount(
						"iframe",
						["dom.iframe", "dom.iframe.ext", "dom.iframe.uniq"],
						function(el) {
							return el.src && !el.src.toLowerCase().match(/^(?:about:|javascript:|#)/);
						},
						function(el) {
							return !(uniqUrls[el.src] = uniqUrls.hasOwnProperty(el.src));
						}
					));

					uniqUrls = {};
					BOOMR.addVar(nodeCount(
						"link",
						["dom.link", "dom.link.css", "dom.link.css.uniq"],
						function(link) {
							return link.rel && link.rel.toLowerCase() === "stylesheet" &&
								link.href && !link.href.toLowerCase().match(/^(?:about:|javascript:|#)/);
						},
						function(link) {
							return !(uniqUrls[link.href] = uniqUrls.hasOwnProperty(link.href));
						}
					));
				},
				"dom"
			);

			// no need to call BOOMR.sendBeacon because we're called when the beacon is being sent
		}
	};

	//
	// Exports
	//
	BOOMR.plugins.Memory = {
		/**
		 * Initializes the plugin.
		 *
		 * @memberof BOOMR.plugins.Memory
		 */
		init: function() {
			var c;

			try {
				w = BOOMR.window;
				d = w.document;
				p = BOOMR.getPerformance();
				c = w.console;
				s = w.screen;
				n = w.navigator;

				try {
					ls = w.localStorage;
					ss = w.sessionStorage;
				}
				catch (e) {
					// NOP - some browsers will throw on access to var
				}

				if (n && n.battery) {
					b = n.battery;
				}
				// There are cases where getBattery exists but is not a function
				// No need to check for existence because typeof will return undefined anyway
				else if (n && typeof n.getBattery === "function") {
					var batPromise = n.getBattery();

					// some UAs implement getBattery without a promise
					if (batPromise && typeof batPromise.then === "function") {
						batPromise.then(function(battery) {
							b = battery;
						});
					}
					// If batPromise is an object and it has a `level` property, then it's probably the battery object
					else if (typeof batPromise === "object" && batPromise.hasOwnProperty("level")) {
						b = batPromise;
					}
					// else do nothing
				}
			}
			catch (err) {
				BOOMR.addError(err, "Memory.init");
			}

			m = (p && p.memory ? p.memory : (c && c.memory ? c.memory : null));

			if (impl.initialized) {
				return this;
			}

			impl.initialized = true;

			// we do this before sending a beacon to get the snapshot when the beacon is sent
			BOOMR.subscribe("before_beacon", impl.done, null, impl);
			return this;
		},

		/**
		 * This plugin is always complete (ready to send a beacon)
		 *
		 * @returns {boolean} `true`
		 * @memberof BOOMR.plugins.Memory
		 */
		is_complete: function() {
			// Always true since we run on before_beacon, which happens after the check
			return true;
		}
	};

}());

/**
 * Adds support for [MD5](https://en.wikipedia.org/wiki/MD5) to Boomerang
 * (as `BOOMR.utils.md5`).
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## License
 *
 * JavaScript MD5 1.0.1
 * https://github.com/blueimp/JavaScript-MD5
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 *
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 *
 * ## Beacon Parameters
 *
 * This plugin adds no parameters to the beacon.
 *
 * @class BOOMR.utils.MD5
 */

(function() {
	/*jslint bitwise: true */
	/*global unescape*/

	"use strict";

	
	BOOMR.utils = BOOMR.utils || {};

	if (BOOMR.utils && BOOMR.utils.md5) {
		return;
	}

	/*
	* Add integers, wrapping at 2^32. This uses 16-bit operations internally
	* to work around bugs in some JS interpreters.
	*/
	function safe_add(x, y) {
		var lsw = (x & 0xFFFF) + (y & 0xFFFF),
		    msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return (msw << 16) | (lsw & 0xFFFF);
	}

	/*
	* Bitwise rotate a 32-bit number to the left.
	*/
	function bit_rol(num, cnt) {
		return (num << cnt) | (num >>> (32 - cnt));
	}

	/*
	* These functions implement the four basic operations the algorithm uses.
	*/
	function md5_cmn(q, a, b, x, s, t) {
		return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
	}
	function md5_ff(a, b, c, d, x, s, t) {
		return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}
	function md5_gg(a, b, c, d, x, s, t) {
		return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}
	function md5_hh(a, b, c, d, x, s, t) {
		return md5_cmn(b ^ c ^ d, a, b, x, s, t);
	}
	function md5_ii(a, b, c, d, x, s, t) {
		return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
	}

	/*
	* Calculate the MD5 of an array of little-endian words, and a bit length.
	*/
	function binl_md5(x, len) {
		/* append padding */
		x[len >> 5] |= 0x80 << (len % 32);
		x[(((len + 64) >>> 9) << 4) + 14] = len;

		var i, olda, oldb, oldc, oldd,
		    a =  1732584193,
		    b = -271733879,
		    c = -1732584194,
		    d =  271733878;

		for (i = 0; i < x.length; i += 16) {
			olda = a;
			oldb = b;
			oldc = c;
			oldd = d;

			a = md5_ff(a, b, c, d, x[i],       7, -680876936);
			d = md5_ff(d, a, b, c, x[i +  1], 12, -389564586);
			c = md5_ff(c, d, a, b, x[i +  2], 17,  606105819);
			b = md5_ff(b, c, d, a, x[i +  3], 22, -1044525330);
			a = md5_ff(a, b, c, d, x[i +  4],  7, -176418897);
			d = md5_ff(d, a, b, c, x[i +  5], 12,  1200080426);
			c = md5_ff(c, d, a, b, x[i +  6], 17, -1473231341);
			b = md5_ff(b, c, d, a, x[i +  7], 22, -45705983);
			a = md5_ff(a, b, c, d, x[i +  8],  7,  1770035416);
			d = md5_ff(d, a, b, c, x[i +  9], 12, -1958414417);
			c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
			b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
			a = md5_ff(a, b, c, d, x[i + 12],  7,  1804603682);
			d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
			c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
			b = md5_ff(b, c, d, a, x[i + 15], 22,  1236535329);

			a = md5_gg(a, b, c, d, x[i +  1],  5, -165796510);
			d = md5_gg(d, a, b, c, x[i +  6],  9, -1069501632);
			c = md5_gg(c, d, a, b, x[i + 11], 14,  643717713);
			b = md5_gg(b, c, d, a, x[i],      20, -373897302);
			a = md5_gg(a, b, c, d, x[i +  5],  5, -701558691);
			d = md5_gg(d, a, b, c, x[i + 10],  9,  38016083);
			c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
			b = md5_gg(b, c, d, a, x[i +  4], 20, -405537848);
			a = md5_gg(a, b, c, d, x[i +  9],  5,  568446438);
			d = md5_gg(d, a, b, c, x[i + 14],  9, -1019803690);
			c = md5_gg(c, d, a, b, x[i +  3], 14, -187363961);
			b = md5_gg(b, c, d, a, x[i +  8], 20,  1163531501);
			a = md5_gg(a, b, c, d, x[i + 13],  5, -1444681467);
			d = md5_gg(d, a, b, c, x[i +  2],  9, -51403784);
			c = md5_gg(c, d, a, b, x[i +  7], 14,  1735328473);
			b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

			a = md5_hh(a, b, c, d, x[i +  5],  4, -378558);
			d = md5_hh(d, a, b, c, x[i +  8], 11, -2022574463);
			c = md5_hh(c, d, a, b, x[i + 11], 16,  1839030562);
			b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
			a = md5_hh(a, b, c, d, x[i +  1],  4, -1530992060);
			d = md5_hh(d, a, b, c, x[i +  4], 11,  1272893353);
			c = md5_hh(c, d, a, b, x[i +  7], 16, -155497632);
			b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
			a = md5_hh(a, b, c, d, x[i + 13],  4,  681279174);
			d = md5_hh(d, a, b, c, x[i],      11, -358537222);
			c = md5_hh(c, d, a, b, x[i +  3], 16, -722521979);
			b = md5_hh(b, c, d, a, x[i +  6], 23,  76029189);
			a = md5_hh(a, b, c, d, x[i +  9],  4, -640364487);
			d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
			c = md5_hh(c, d, a, b, x[i + 15], 16,  530742520);
			b = md5_hh(b, c, d, a, x[i +  2], 23, -995338651);

			a = md5_ii(a, b, c, d, x[i],       6, -198630844);
			d = md5_ii(d, a, b, c, x[i +  7], 10,  1126891415);
			c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
			b = md5_ii(b, c, d, a, x[i +  5], 21, -57434055);
			a = md5_ii(a, b, c, d, x[i + 12],  6,  1700485571);
			d = md5_ii(d, a, b, c, x[i +  3], 10, -1894986606);
			c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
			b = md5_ii(b, c, d, a, x[i +  1], 21, -2054922799);
			a = md5_ii(a, b, c, d, x[i +  8],  6,  1873313359);
			d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
			c = md5_ii(c, d, a, b, x[i +  6], 15, -1560198380);
			b = md5_ii(b, c, d, a, x[i + 13], 21,  1309151649);
			a = md5_ii(a, b, c, d, x[i +  4],  6, -145523070);
			d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
			c = md5_ii(c, d, a, b, x[i +  2], 15,  718787259);
			b = md5_ii(b, c, d, a, x[i +  9], 21, -343485551);

			a = safe_add(a, olda);
			b = safe_add(b, oldb);
			c = safe_add(c, oldc);
			d = safe_add(d, oldd);
		}
		return [a, b, c, d];
	}

	/*
	* Convert an array of little-endian words to a string
	*/
	function binl2rstr(input) {
		var i,
		    output = "";
		for (i = 0; i < input.length * 32; i += 8) {
			output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
		}
		return output;
	}

	/*
	* Convert a raw string to an array of little-endian words
	* Characters >255 have their high-byte silently ignored.
	*/
	function rstr2binl(input) {
		var i,
		    output = [];
		output[(input.length >> 2) - 1] = undefined;
		for (i = 0; i < output.length; i += 1) {
			output[i] = 0;
		}
		for (i = 0; i < input.length * 8; i += 8) {
			output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
		}
		return output;
	}

	/*
	* Calculate the MD5 of a raw string
	*/
	function rstr_md5(s) {
		return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
	}

	/*
	* Calculate the HMAC-MD5, of a key and some data (raw strings)
	*/
	function rstr_hmac_md5(key, data) {
		var i,
		    bkey = rstr2binl(key),
		    ipad = [],
		    opad = [],
		    hash;
		ipad[15] = opad[15] = undefined;
		if (bkey.length > 16) {
			bkey = binl_md5(bkey, key.length * 8);
		}
		for (i = 0; i < 16; i += 1) {
			ipad[i] = bkey[i] ^ 0x36363636;
			opad[i] = bkey[i] ^ 0x5C5C5C5C;
		}
		hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
		return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
	}

	/*
	* Convert a raw string to a hex string
	*/
	function rstr2hex(input) {
		var hex_tab = "0123456789abcdef",
		    output = "",
		    x,
		    i;
		for (i = 0; i < input.length; i += 1) {
			x = input.charCodeAt(i);
			output += hex_tab.charAt((x >>> 4) & 0x0F) +
				hex_tab.charAt(x & 0x0F);
		}
		return output;
	}

	/*
	* Encode a string as utf-8
	*/
	function str2rstr_utf8(input) {
		return unescape(encodeURIComponent(input));
	}

	/*
	* Take string arguments and return either raw or hex encoded strings
	*/
	function raw_md5(s) {
		return rstr_md5(str2rstr_utf8(s));
	}
	function hex_md5(s) {
		return rstr2hex(raw_md5(s));
	}
	function raw_hmac_md5(k, d) {
		return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d));
	}
	function hex_hmac_md5(k, d) {
		return rstr2hex(raw_hmac_md5(k, d));
	}

	/**
	 * Calculates the MD5 of the specified string and optional key.
	 *
	 * @param {string} string Input string
	 * @param {string} [key] Key
	 * @param {boolean} [raw] Whether or not to return data raw MD5 (versus hex-encoded)
	 *
	 * @returns {string} Raw or hex-encoded MD5 of the input string and key
	 *
	 * @memberof BOOMR.utils.MD5
	 */
	function md5(string, key, raw) {
		if (!key) {
			if (!raw) {
				return hex_md5(string);
			}
			return raw_md5(string);
		}
		if (!raw) {
			return hex_hmac_md5(key, string);
		}
		return raw_hmac_md5(key, string);
	}

	BOOMR.utils.MD5 = md5;
}());

// This code is run after all plugins have initialized
BOOMR.t_end = new Date().getTime();

(function(){'use strict';var f,g=[];function l(a){g.push(a);1==g.length&&f()}function m(){for(;g.length;)g[0](),g.shift()}f=function(){setTimeout(m)};function n(a){this.a=p;this.b=void 0;this.f=[];var b=this;try{a(function(a){q(b,a)},function(a){r(b,a)})}catch(c){r(b,c)}}var p=2;function t(a){return new n(function(b,c){c(a)})}function u(a){return new n(function(b){b(a)})}function q(a,b){if(a.a==p){if(b==a)throw new TypeError;var c=!1;try{var d=b&&b.then;if(null!=b&&"object"==typeof b&&"function"==typeof d){d.call(b,function(b){c||q(a,b);c=!0},function(b){c||r(a,b);c=!0});return}}catch(e){c||r(a,e);return}a.a=0;a.b=b;v(a)}}
function r(a,b){if(a.a==p){if(b==a)throw new TypeError;a.a=1;a.b=b;v(a)}}function v(a){l(function(){if(a.a!=p)for(;a.f.length;){var b=a.f.shift(),c=b[0],d=b[1],e=b[2],b=b[3];try{0==a.a?"function"==typeof c?e(c.call(void 0,a.b)):e(a.b):1==a.a&&("function"==typeof d?e(d.call(void 0,a.b)):b(a.b))}catch(h){b(h)}}})}n.prototype.g=function(a){return this.c(void 0,a)};n.prototype.c=function(a,b){var c=this;return new n(function(d,e){c.f.push([a,b,d,e]);v(c)})};
function w(a){return new n(function(b,c){function d(c){return function(d){h[c]=d;e+=1;e==a.length&&b(h)}}var e=0,h=[];0==a.length&&b(h);for(var k=0;k<a.length;k+=1)u(a[k]).c(d(k),c)})}function x(a){return new n(function(b,c){for(var d=0;d<a.length;d+=1)u(a[d]).c(b,c)})};window.Promise||(window.Promise=n,window.Promise.resolve=u,window.Promise.reject=t,window.Promise.race=x,window.Promise.all=w,window.Promise.prototype.then=n.prototype.c,window.Promise.prototype["catch"]=n.prototype.g);}());

(function(){function l(a,b){document.addEventListener?a.addEventListener("scroll",b,!1):a.attachEvent("scroll",b)}function m(a){document.body?a():document.addEventListener?document.addEventListener("DOMContentLoaded",function c(){document.removeEventListener("DOMContentLoaded",c);a()}):document.attachEvent("onreadystatechange",function k(){if("interactive"==document.readyState||"complete"==document.readyState)document.detachEvent("onreadystatechange",k),a()})};function q(a){this.a=document.createElement("div");this.a.setAttribute("aria-hidden","true");this.a.appendChild(document.createTextNode(a));this.b=document.createElement("span");this.c=document.createElement("span");this.h=document.createElement("span");this.f=document.createElement("span");this.g=-1;this.b.style.cssText="max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";this.c.style.cssText="max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";
this.f.style.cssText="max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";this.h.style.cssText="display:inline-block;width:200%;height:200%;font-size:16px;max-width:none;";this.b.appendChild(this.h);this.c.appendChild(this.f);this.a.appendChild(this.b);this.a.appendChild(this.c)}
function w(a,b){a.a.style.cssText="max-width:none;min-width:20px;min-height:20px;display:inline-block;overflow:hidden;position:absolute;width:auto;margin:0;padding:0;top:-999px;left:-999px;white-space:nowrap;font:"+b+";"}function x(a){var b=a.a.offsetWidth,c=b+100;a.f.style.width=c+"px";a.c.scrollLeft=c;a.b.scrollLeft=a.b.scrollWidth+100;return a.g!==b?(a.g=b,!0):!1}function z(a,b){function c(){var a=k;x(a)&&null!==a.a.parentNode&&b(a.g)}var k=a;l(a.b,c);l(a.c,c);x(a)};function A(a,b){var c=b||{};this.family=a;this.style=c.style||"normal";this.weight=c.weight||"normal";this.stretch=c.stretch||"normal"}var B=null,C=null,D=null;function H(){if(null===C){var a=document.createElement("div");try{a.style.font="condensed 100px sans-serif"}catch(b){}C=""!==a.style.font}return C}function I(a,b){return[a.style,a.weight,H()?a.stretch:"","100px",b].join(" ")}
A.prototype.load=function(a,b){var c=this,k=a||"BESbswy",y=b||3E3,E=(new Date).getTime();return new Promise(function(a,b){null===D&&(D=!!window.FontFace);if(D){var J=new Promise(function(a,b){function e(){(new Date).getTime()-E>=y?b():document.fonts.load(I(c,c.family),k).then(function(c){1<=c.length?a():setTimeout(e,25)},function(){b()})}e()}),K=new Promise(function(a,c){setTimeout(c,y)});Promise.race([K,J]).then(function(){a(c)},function(){b(c)})}else m(function(){function r(){var b;if(b=-1!=f&&
-1!=g||-1!=f&&-1!=h||-1!=g&&-1!=h)(b=f!=g&&f!=h&&g!=h)||(null===B&&(b=/AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent),B=!!b&&(536>parseInt(b[1],10)||536===parseInt(b[1],10)&&11>=parseInt(b[2],10))),b=B&&(f==t&&g==t&&h==t||f==u&&g==u&&h==u||f==v&&g==v&&h==v)),b=!b;b&&(null!==d.parentNode&&d.parentNode.removeChild(d),clearTimeout(G),a(c))}function F(){if((new Date).getTime()-E>=y)null!==d.parentNode&&d.parentNode.removeChild(d),b(c);else{var a=document.hidden;if(!0===a||void 0===
a)f=e.a.offsetWidth,g=n.a.offsetWidth,h=p.a.offsetWidth,r();G=setTimeout(F,50)}}var e=new q(k),n=new q(k),p=new q(k),f=-1,g=-1,h=-1,t=-1,u=-1,v=-1,d=document.createElement("div"),G=0;d.dir="ltr";w(e,I(c,"sans-serif"));w(n,I(c,"serif"));w(p,I(c,"monospace"));d.appendChild(e.a);d.appendChild(n.a);d.appendChild(p.a);document.body.appendChild(d);t=e.a.offsetWidth;u=n.a.offsetWidth;v=p.a.offsetWidth;F();z(e,function(a){f=a;r()});w(e,I(c,'"'+c.family+'",sans-serif'));z(n,function(a){g=a;r()});w(n,I(c,'"'+
c.family+'",serif'));z(p,function(a){h=a;r()});w(p,I(c,'"'+c.family+'",monospace'))})})};"undefined"!==typeof module?module.exports=A:(window.FontFaceObserver=A,window.FontFaceObserver.prototype.load=A.prototype.load);}());

$( document ).ready(function() {
//Making Fontello icons invisible until font loads
	var fontello = new FontFaceObserver('fontelloicons');
	fontello.load(null, 600000).then(function () {
	  //console.log('Font is available');
	  window.document.documentElement.className += " fontello-loaded";	
	}, function () {
	  console.log('Font is not available');
	});
});
var log_methods = [ 'error', 'warn', 'info', 'debug'];	
var log_level = 3;	//Default value.	
//var flag_Postlogs = "true";
var flag_Postlogs = ns("cms").postclientSideLogsFlag;
//console.log("post flag"+flag_Postlogs)
var businesslog = {
log : ''
};

var statuslog={

log:''

}
var profilerlog={

log:''

}
var jsonPayload= { 
businessLogs : [
], 
statusLogs: [],
profilerLogs : []
} 	   

function _getURLParameter(param)
{ 
  var params = window.location.search.substr(1).split('&');
 
  for (var i = 0; i < params.length; i++) {
    var p=params[i].split('=');
	if (p[0] == param) {
	  return decodeURIComponent(p[1]);
	}
  }
  return "";
}

 if(_getURLParameter("logLevel")!= "")
 {
	 window.clLevel = _getURLParameter("logLevel");
	 for(var i=0;i<log_methods.length;i++)
	 { 
		  if(log_methods[i] == clLevel){
			   log_level = i+1;
		       break;
		  }
	 } 					 
  }
   
   
 window.storeLogger = (function(loggerType){
     var sl = {},
     slogs=[];
    
     idx = log_methods.length;
     sl.data = {};
     
     sl['push'] = function(key,value){
	sl.data[key] = value;
      }
     
      sl['pop'] = function(key){
	delete sl.data[key];
      }
     
      sl['get'] = function(key){
	return sl.data[key];
      }    
  while ( --idx >= 0 ) {
    (function( idx, level ){      
      sl[ level ] = function() {
		  
		  var logObj = {};
		  var logStr;

		  
		  if(loggerType && (loggerType=="StatusLogger" || loggerType == "ProfilerLogger"))
		  {
		  	logStr = level.toUpperCase()+" ";

		    logStr += loggerType;		  
		  
		  logObj.type = function(type)
		  {
			  logStr += " type="+type;			 
		      return this;
		  }
		  logObj.key = function(key)
		  {
			  logStr += " key="+key;			 
		      return this;
		  }
		  logObj.state = function(state)
		  {
			  logStr += " state="+state;
			  return this;
		  }
		  logObj.cause = function(cause)
		  {
			  logStr += " cause="+cause;
			  return this;
		  }
		  logObj.action = function(action)
		  {
			  logStr += " action="+action;
			  return this;
		  }
		  logObj.ok = function()
		  {			  
			  logStr += "  STATUS=OK";
			  this.logMessage();              
		  }
		   logObj.not_ok = function()
		  {			 
			  logStr += "  STATUS=NOT_OK";
			  this.logMessage();                           
		  }
		  logObj.addParameter = function(key,value)
		  {
			  logStr += " "+key+"="+value;
			  return this;
		  }		  
		  logObj.logMessage = function()
		  {
			  var val="gsIdCookieParam";
			  if(ns('cms').isHttponlyCookieEnabled != "undefined" && ns('cms').isHttponlyCookieEnabled == 'true') {
				  logStr += " referrer="+encodeURIComponent(location.href)+"   context="+ns('cms').context+"   GSID="+val+" devicetype="+ns('cms').deviceType;  
			  }else{
				  logStr += " referrer="+encodeURIComponent(location.href)+"   context="+ns('cms').context+"   GSID="+getCookieValue("GSID")+" devicetype="+ns('cms').deviceType;
			  }
                       if(_getURLParameter("debug") == "log" && loggerType=="StatusLogger"){
			            var con = window.console;
			            if ( !con || !is_level( idx ) ) { return; }
        
              	        con.firebug ? con[ level ].apply( window, logStr ) : con[ level ] ? con[ level ]( logStr ) : con.log( logStr );			                
                       }

                       if((level=="error" || level == "warn") && loggerType=="StatusLogger"){
                       	console.log("loglevelin status log logMessage function"+level);
                       	//preparing the statusLog error level buffer
              		  	statuslog.log= logStr;
              		  	jsonPayload.statusLogs.push(statuslog);
              		  	//var successmessage = postToSplunk(JSON.stringify(jsonPayload));
              		  	//console.log("success message is"+successmessage);
              		  	/*if( successmessage == "success"){
                        //Making the buffer empty
                        jsonPayload.statusLogs = [];
                    }*/
                }
                if((level=="error" || level == "warn" || level == "info") && loggerType=="ProfilerLogger"){
                        console.log("loglevelin status log logMessage function"+level);
                        //preparing the statusLog error level buffer
                      profilerlog.log= logStr;
                      jsonPayload.profilerLogs.push(profilerlog);
                      //var successmessage = postToSplunk(JSON.stringify(jsonPayload));
                      //console.log("success message is"+successmessage);
                      /*if( successmessage == "success"){
                        //Making the buffer empty
                        jsonPayload.statusLogs = [];
                    }*/
                }
           return this;

		  }

		  logObj.postlogToSplunk = function()
		  {

                   //posting the logs to splunk 
                 //console.log("json Payload"+JSON.stringify(jsonPayload));
                 postToSplunk(JSON.stringify(jsonPayload))
                //clearing the buffer
                 jsonPayload.statusLogs = [];
                 jsonPayload.businessLogs = [];
                 jsonPayload.profilerLogs = [];

		  }

		} else 
		{
			if(loggerType=="BusinessLogger"){

             logStr = "CLIENTSIDE_BUSINESS_"+level.toUpperCase();
             logStr += ", js_timestamp="+getTimeStamp();
             if(ns('cms').isHttponlyCookieEnabled != "undefined" && ns('cms').isHttponlyCookieEnabled == 'true') {
            	 logStr += ", GSID="+"gsIdCookieParam";            	 
             }else{
            	 logStr += ", gsid="+getCookieValue("GSID");
             }
             if(typeof store != 'undefined' && store.acctId != 'undefined' && store.acctId !="" && store.isUserLoggedIn =="true" && store.acctId !="") {
             	// logged in case
             	console.log("accountID"+store.acctId);
             	logStr += ", accountId="+store.acctId;  

             } else {
             	//logged out case
             	  logStr += ", accountId="+'not_available_for_loggedout_scenarios';  

             }
              logObj.key = function(key)
		     {
		     	
			  logStr += ", key="+key;			 
		      return this;
		     }
         
         
             logObj.noodle = function()
		    {
			  logStr += ns('cms').noodle ? ", Noodle="+ns('cms').noodle : " Noodle=null";			 
		      return this;
		     }



		    logObj.env = function()
		    {
                 if(ns('cms').storeEnv){

                 	if(ns('cms').storeEnv=="staging"){

                 		logStr += ", env=qa"
                 	}
                 	if(ns('cms').storeEnv=="regression"){

                 		logStr += ", env=stg"
                 	}
                 	if(ns('cms').storeEnv=="pre-prod"){

                 		logStr += ", env=beta"
                 	}
                 	if(ns('cms').storeEnv=="production"){

                 		logStr += ", env=prod"
                 	}
                 }else {

                  logStr += " env= null";   

                 }
		      return this;
		     }

		     logObj.service = function(service){

               logStr += ", service="+service;
			  return this;
		     }


		     logObj.httpStatusCode = function(httpStatusCode){

               logStr += ", httpStatusCode="+httpStatusCode;
			  return this;
		     }

		     logObj.uri = function(uri){

               logStr += ", uri="+uri;
			  return this;
		     }

		     logObj.uriTemplate = function(uriTemplate){

               logStr += ", uriTemplate="+uriTemplate;
			  return this;
		     }

		     logObj.errorCode = function(errorCode){

               logStr += ", errorCode="+errorCode;
			  return this;
		     }


		     logObj.errorId = function(){
             var d = new Date().getTime();
             var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
             var r = (d + Math.random()*16)%16 | 0;
             d = Math.floor(d/16);
             return (c=='x' ? r : (r&0x3|0x8)).toString(16);
             });

             logStr += ", errorId="+uuid;
			  return this;
		     }


		     logObj.description = function(description){

               logStr += ", description="+description;
			  return this;
		     }

		     logObj.origin = function(origin){

               logStr += ", origin="+origin;
			  return this;
		     }

		      logObj.context = function(){

               logStr += ", context="+(ns('cms').context ? ns('cms').context : "null");
			  return this;
		     }

		     logObj.serviceSpecificFields = function(key,value)
		  {
			  logStr += ", "+key+"="+value;
			  return this;
		  }	


		  logObj.logMessage = function()
		  {
			  var val="gsIdCookieParam";
			  if(ns('cms').isHttponlyCookieEnabled != "undefined" && ns('cms').isHttponlyCookieEnabled == 'true') {
				  logStr += ", referrer="+encodeURIComponent(location.href)+",  GSID="+val+" devicetype="+ns('cms').deviceType;				  
			  }else{
				  logStr += ", referrer="+encodeURIComponent(location.href)+",  GSID="+getCookieValue("GSID")+" devicetype="+ns('cms').deviceType;
			  }

                    if(_getURLParameter("debug") == "businesslog"){
			  var con = window.console;
			  if ( !con || !is_level( idx ) ) { return; }
        
              	        con.firebug ? con[ level ].apply( window, logStr ) : con[ level ] ? con[ level ]( logStr ) : con.log( logStr );			                
                }

                if(level == "error" || level == "warn"){
                         console.log("in error level of businesslog")
                        //preparing the buffer for businesslog
              		  	businesslog.log= logStr;
              		  	jsonPayload.businessLogs.push(businesslog);
              		  	/*var successmessage = postToSplunk(JSON.stringify(jsonPayload));
              		  	console.log("success message is"+successmessage);
              		  	if( successmessage == "success"){
                        //Making the buffer empty
                        logStr= "";

                        jsonPayload.businessLogs = [];

              		  	} */
              		  }
              		  return this;
		  }



		   logObj.postlogToSplunk = function()
		  {

                 //posting the logs to splunk 
                 //console.log("json Payload"+JSON.stringify(jsonPayload));
                 postToSplunk(JSON.stringify(jsonPayload))
                //clearing the buffer
                 jsonPayload.statusLogs = [];
                 jsonPayload.businessLogs = [];
                 jsonPayload.profilerLogs = [];
		  }

            console.log("in busineess loggers method");

	}

	}
		  
		  return logObj;		
      };
      
    })( idx, log_methods[idx] );
     
  }
     
  // Determine if the level is visible given the current log_level.
  function is_level( level ) {
    return (log_level > level);      
  };
   
  return sl;
});




/*var logstr="CLIENTSIDE_BUSINESS_ERROR_NEW , key=commonsspdp.js, Noodle=32152cae-4aca-428e-86b4-c620c27942bf, env=qa, service=store, errorCode=SkuList_is_null, errorId=b2d2cd54-758f-4831-9c94-dec1fbe51a09, description=empty sku list from the resposne, context=/hp/sf/sf-us/snapfish-us, origin=store, referrer=https%3A%2F%2Fus.sf-qa.com%2Fphoto-gift%2Fproduct-details-sspdp%3Fcategory%3DStoreCat_1023%26sku%3DCommerceProduct_9818%26theme%3Dstudio_4421_1439425725_snapfish_us%26debug%3Dbusinesslog%26logLevel%3Derror%23!%2Fpdpview,  GSID=873237cc-e53c-4bf9-a0a9-144c2f3a0815 devicetype=";
businesslog.log= logstr;


statuslog.log="CLIENTSIDE_STATUS_LOG_NEW , key=abc.js, Noodle=32152cae-4aca-428e-86b4-c620c27942bf, env=qa, service=store, errorCode=SkuList_is_null, errorId=b2d2cd54-758f-4831-9c94-dec1fbe51a09, description=empty sku list from the resposne, context=/hp/sf/sf-us/snapfish-us, origin=store, referrer=https%3A%2F%2Fus.sf-qa.com%2Fphoto-gift%2Fproduct-details-sspdp%3Fcategory%3DStoreCat_1023%26sku%3DCommerceProduct_9818%26theme%3Dstudio_4421_1439425725_snapfish_us%26debug%3Dbusinesslog%26logLevel%3Derror%23!%2Fpdpview,  GSID=873237cc-e53c-4bf9-a0a9-144c2f3a0815 devicetype=";

jsonPayload.statusLogs.push(statuslog);
jsonPayload.statusLogs.push(statuslog);
jsonPayload.statusLogs.push(statuslog);
jsonPayload.businessLogs.push(businesslog);
jsonPayload.businessLogs.push(businesslog);
jsonPayload.businessLogs.push(businesslog);
console.log("jsonstringify"+JSON.stringify(jsonPayload));
*/

setInterval(function(){
      if(jsonPayload.businessLogs.length>0 || jsonPayload.statusLogs.length>0 || jsonPayload.profilerLogs.length>0){
     console.log("buffer is not empty - posting the logs");
 	postToSplunk(JSON.stringify(jsonPayload));
  jsonPayload.statusLogs = [];
  jsonPayload.businessLogs = [];
  jsonPayload.profilerLogs = [];
 }

},30000);

function postToSplunk(data){
  var hostnameval = ns("cms").siteHost;
  var pathName = allowedPatternValidation("p1", location.pathname) ? decodeURIComponent(encodeURIComponent(location.pathname)) : '';  
  if(pathName=='/oauth2/auth')
  {
    hostnameval = location.host;
  }
  if(jsonPayload.businessLogs.length>0 || jsonPayload.statusLogs.length>0 || jsonPayload.profilerLogs.length>0){
if(typeof flag_Postlogs!='undefined' && flag_Postlogs && flag_Postlogs !="" && flag_Postlogs == "true"){
 $.ajax({
                    type: 'POST',
                    url : '//'+hostnameval+ns("cms").storeURLPath+'/api/v1/post-clientlogs',
                    //url: ns("cms").apicdnHost + '/api/v1/post-clientlogs',
                    data: data,
                    async: true,
                    headers: {'Content-Type':'application/json','Access-Control-Allow-Origin': '*'},
                    crossDomain: true,
                    dataType: 'json'
                    }).done(function (serverResponse) {
                    console.log("making the buffer empty after posting the logs")
                    jsonPayload.statusLogs = [];
                    jsonPayload.businessLogs = [];
                    jsonPayload.profilerLogs = [];
                     console.log("serverResponse"+serverResponse);
                     return "success";
                    });
                  }

}
}


function getCookieValue(NameOfCookie) {
  if (document.cookie.length > 0) {
    begin = document.cookie.indexOf(NameOfCookie + "=");
    if (begin != -1) {
      begin += NameOfCookie.length + 1;
      end = document.cookie.indexOf(";", begin);
      if (end == -1) end = document.cookie.length;
      return encodeURIComponent(unescape(document.cookie.substring(begin, end)));
    }
  }
  return null;
}

function getTimeStamp(){
     var timeStamp;
	 var d = new Date();
	 timestamp = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()+" "+d.toTimeString();
	 return timestamp;
}

var statusLogger = storeLogger("StatusLogger");
var profilerLogger = storeLogger("ProfilerLogger");
var businessLogger = storeLogger("BusinessLogger");


/*** USAGE:
 * 
 *  statusLogger.debug().type("BspController").key("design-group-api").action("reading-design-groups").state("success").ok();
	statusLogger.error().type("BspController").key("design-group-api").action("reading-design-groups").state("success").cause("error-occured").addParameter("cat","StoreCat_1111").not_ok();
	profilerLogger.info().type("BspController").key("design-group-api").action("reading-design-groups").state("success").addParameter("ExecutionTime",1000).logMessage();
 * 
 */

function logError(details,enableLogging) {
}

!function(a,b,c,d){"use strict";function e(a){var b,c=this;if(this.trackingClick=!1,this.trackingClickStart=0,this.targetElement=null,this.touchStartX=0,this.touchStartY=0,this.lastTouchIdentifier=0,this.touchBoundary=10,this.layer=a,!a||!a.nodeType)throw new TypeError("Layer must be a document node");this.onClick=function(){return e.prototype.onClick.apply(c,arguments)},this.onMouse=function(){return e.prototype.onMouse.apply(c,arguments)},this.onTouchStart=function(){return e.prototype.onTouchStart.apply(c,arguments)},this.onTouchMove=function(){return e.prototype.onTouchMove.apply(c,arguments)},this.onTouchEnd=function(){return e.prototype.onTouchEnd.apply(c,arguments)},this.onTouchCancel=function(){return e.prototype.onTouchCancel.apply(c,arguments)},e.notNeeded(a)||(this.deviceIsAndroid&&(a.addEventListener("mouseover",this.onMouse,!0),a.addEventListener("mousedown",this.onMouse,!0),a.addEventListener("mouseup",this.onMouse,!0)),a.addEventListener("click",this.onClick,!0),a.addEventListener("touchstart",this.onTouchStart,!1),a.addEventListener("touchmove",this.onTouchMove,!1),a.addEventListener("touchend",this.onTouchEnd,!1),a.addEventListener("touchcancel",this.onTouchCancel,!1),Event.prototype.stopImmediatePropagation||(a.removeEventListener=function(b,c,d){var e=Node.prototype.removeEventListener;"click"===b?e.call(a,b,c.hijacked||c,d):e.call(a,b,c,d)},a.addEventListener=function(b,c,d){var e=Node.prototype.addEventListener;"click"===b?e.call(a,b,c.hijacked||(c.hijacked=function(a){a.propagationStopped||c(a)}),d):e.call(a,b,c,d)}),"function"==typeof a.onclick&&(b=a.onclick,a.addEventListener("click",function(a){b(a)},!1),a.onclick=null))}function f(a){return("string"==typeof a||a instanceof String)&&(a=a.replace(/^[\\/'"]+|(;\s?})+|[\\/'"]+$/g,"")),a}0===a("head").has(".foundation-mq-small").length&&a("head").append('<meta class="foundation-mq-small">'),0===a("head").has(".foundation-mq-medium").length&&a("head").append('<meta class="foundation-mq-medium">'),0===a("head").has(".foundation-mq-large").length&&a("head").append('<meta class="foundation-mq-large">'),0===a("head").has(".foundation-mq-xlarge").length&&a("head").append('<meta class="foundation-mq-xlarge">'),0===a("head").has(".foundation-mq-xxlarge").length&&a("head").append('<meta class="foundation-mq-xxlarge">'),e.prototype.deviceIsAndroid=navigator.userAgent.indexOf("Android")>0,e.prototype.deviceIsIOS=/iP(ad|hone|od)/.test(navigator.userAgent),e.prototype.deviceIsIOS4=e.prototype.deviceIsIOS&&/OS 4_\d(_\d)?/.test(navigator.userAgent),e.prototype.deviceIsIOSWithBadTarget=e.prototype.deviceIsIOS&&/OS ([6-9]|\d{2})_\d/.test(navigator.userAgent),e.prototype.needsClick=function(a){switch(a.nodeName.toLowerCase()){case"button":case"select":case"textarea":if(a.disabled)return!0;break;case"input":if(this.deviceIsIOS&&"file"===a.type||a.disabled)return!0;break;case"label":case"video":return!0}return/\bneedsclick\b/.test(a.className)},e.prototype.needsFocus=function(a){switch(a.nodeName.toLowerCase()){case"textarea":case"select":return!0;case"input":switch(a.type){case"button":case"checkbox":case"file":case"image":case"radio":case"submit":return!1}return!a.disabled&&!a.readOnly;default:return/\bneedsfocus\b/.test(a.className)}},e.prototype.sendClick=function(a,d){var e,f;c.activeElement&&c.activeElement!==a&&c.activeElement.blur(),f=d.changedTouches[0],e=c.createEvent("MouseEvents"),e.initMouseEvent("click",!0,!0,b,1,f.screenX,f.screenY,f.clientX,f.clientY,!1,!1,!1,!1,0,null),e.forwardedTouchEvent=!0,a.dispatchEvent(e)},e.prototype.focus=function(a){var b;this.deviceIsIOS&&a.setSelectionRange?(b=a.value.length,a.setSelectionRange(b,b)):a.focus()},e.prototype.updateScrollParent=function(a){var b,c;if(b=a.fastClickScrollParent,!b||!b.contains(a)){c=a;do{if(c.scrollHeight>c.offsetHeight){b=c,a.fastClickScrollParent=c;break}c=c.parentElement}while(c)}b&&(b.fastClickLastScrollTop=b.scrollTop)},e.prototype.getTargetElementFromEventTarget=function(a){return a.nodeType===Node.TEXT_NODE?a.parentNode:a},e.prototype.onTouchStart=function(a){var c,d,e;if(a.targetTouches.length>1)return!0;if(c=this.getTargetElementFromEventTarget(a.target),d=a.targetTouches[0],this.deviceIsIOS){if(e=b.getSelection(),e.rangeCount&&!e.isCollapsed)return!0;if(!this.deviceIsIOS4){if(d.identifier===this.lastTouchIdentifier)return a.preventDefault(),!1;this.lastTouchIdentifier=d.identifier,this.updateScrollParent(c)}}return this.trackingClick=!0,this.trackingClickStart=a.timeStamp,this.targetElement=c,this.touchStartX=d.pageX,this.touchStartY=d.pageY,a.timeStamp-this.lastClickTime<200&&a.preventDefault(),!0},e.prototype.touchHasMoved=function(a){var b=a.changedTouches[0],c=this.touchBoundary;return Math.abs(b.pageX-this.touchStartX)>c||Math.abs(b.pageY-this.touchStartY)>c?!0:!1},e.prototype.onTouchMove=function(a){return this.trackingClick?((this.targetElement!==this.getTargetElementFromEventTarget(a.target)||this.touchHasMoved(a))&&(this.trackingClick=!1,this.targetElement=null),!0):!0},e.prototype.findControl=function(a){return a.control!==d?a.control:a.htmlFor?c.getElementById(a.htmlFor):a.querySelector("button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea")},e.prototype.onTouchEnd=function(a){var d,e,f,g,h,i=this.targetElement;if(!this.trackingClick)return!0;if(a.timeStamp-this.lastClickTime<200)return this.cancelNextClick=!0,!0;if(this.lastClickTime=a.timeStamp,e=this.trackingClickStart,this.trackingClick=!1,this.trackingClickStart=0,this.deviceIsIOSWithBadTarget&&(h=a.changedTouches[0],i=c.elementFromPoint(h.pageX-b.pageXOffset,h.pageY-b.pageYOffset)||i,i.fastClickScrollParent=this.targetElement.fastClickScrollParent),f=i.tagName.toLowerCase(),"label"===f){if(d=this.findControl(i)){if(this.focus(i),this.deviceIsAndroid)return!1;i=d}}else if(this.needsFocus(i))return a.timeStamp-e>100||this.deviceIsIOS&&b.top!==b&&"input"===f?(this.targetElement=null,!1):(this.focus(i),this.deviceIsIOS4&&"select"===f||(this.targetElement=null,a.preventDefault()),!1);return this.deviceIsIOS&&!this.deviceIsIOS4&&(g=i.fastClickScrollParent,g&&g.fastClickLastScrollTop!==g.scrollTop)?!0:(this.needsClick(i)||(a.preventDefault(),this.sendClick(i,a)),!1)},e.prototype.onTouchCancel=function(){this.trackingClick=!1,this.targetElement=null},e.prototype.onMouse=function(a){return this.targetElement?a.forwardedTouchEvent?!0:a.cancelable?!this.needsClick(this.targetElement)||this.cancelNextClick?(a.stopImmediatePropagation?a.stopImmediatePropagation():a.propagationStopped=!0,a.stopPropagation(),a.preventDefault(),!1):!0:!0:!0},e.prototype.onClick=function(a){var b;return this.trackingClick?(this.targetElement=null,this.trackingClick=!1,!0):"submit"===a.target.type&&0===a.detail?!0:(b=this.onMouse(a),b||(this.targetElement=null),b)},e.prototype.destroy=function(){var a=this.layer;this.deviceIsAndroid&&(a.removeEventListener("mouseover",this.onMouse,!0),a.removeEventListener("mousedown",this.onMouse,!0),a.removeEventListener("mouseup",this.onMouse,!0)),a.removeEventListener("click",this.onClick,!0),a.removeEventListener("touchstart",this.onTouchStart,!1),a.removeEventListener("touchmove",this.onTouchMove,!1),a.removeEventListener("touchend",this.onTouchEnd,!1),a.removeEventListener("touchcancel",this.onTouchCancel,!1)},e.notNeeded=function(a){var d;if("undefined"==typeof b.ontouchstart)return!0;if(/Chrome\/[0-9]+/.test(navigator.userAgent)){if(!e.prototype.deviceIsAndroid)return!0;if(d=c.querySelector("meta[name=viewport]"),d&&-1!==d.content.indexOf("user-scalable=no"))return!0}return"none"===a.style.msTouchAction?!0:!1},e.attach=function(a){return new e(a)},"undefined"!=typeof define&&define.amd?define(function(){return e}):"undefined"!=typeof module&&module.exports?(module.exports=e.attach,module.exports.FastClick=e):b.FastClick=e,"undefined"!=typeof e&&e.attach(c.body);var g=function(b,d){return"string"==typeof b?d?a(d.querySelectorAll(b)):a(c.querySelectorAll(b)):a(b,d)};b.matchMedia=b.matchMedia||function(a){var b,c=a.documentElement,d=c.firstElementChild||c.firstChild,e=a.createElement("body"),f=a.createElement("div");return f.id="mq-test-1",f.style.cssText="position:absolute;top:-100em",e.style.background="none",e.appendChild(f),function(a){return f.innerHTML='&shy;<style media="'+a+'"> #mq-test-1 { width: 42px; }</style>',c.insertBefore(e,d),b=42===f.offsetWidth,c.removeChild(e),{matches:b,media:a}}}(c),function(){function a(){c&&(f(a),jQuery.fx.tick())}for(var c,d=0,e=["webkit","moz"],f=b.requestAnimationFrame,g=b.cancelAnimationFrame;d<e.length&&!f;d++)f=b[e[d]+"RequestAnimationFrame"],g=g||b[e[d]+"CancelAnimationFrame"]||b[e[d]+"CancelRequestAnimationFrame"];f?(b.requestAnimationFrame=f,b.cancelAnimationFrame=g,jQuery.fx.timer=function(b){b()&&jQuery.timers.push(b)&&!c&&(c=!0,a())},jQuery.fx.stop=function(){c=!1}):(b.requestAnimationFrame=function(a){var c=(new Date).getTime(),e=Math.max(0,16-(c-d)),f=b.setTimeout(function(){a(c+e)},e);return d=c+e,f},b.cancelAnimationFrame=function(a){clearTimeout(a)})}(jQuery),b.Foundation={name:"Foundation",version:"5.0.0",media_queries:{small:g(".foundation-mq-small").css("font-family").replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g,""),medium:g(".foundation-mq-medium").css("font-family").replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g,""),large:g(".foundation-mq-large").css("font-family").replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g,""),xlarge:g(".foundation-mq-xlarge").css("font-family").replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g,""),xxlarge:g(".foundation-mq-xxlarge").css("font-family").replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g,"")},stylesheet:a("<style></style>").appendTo("head")[0].sheet,init:function(a,b,c,d,e){var f=[a,c,d,e],h=[];if(this.rtl=/rtl/i.test(g("html").attr("dir")),this.scope=a||this.scope,b&&"string"==typeof b&&!/reflow/i.test(b))this.libs.hasOwnProperty(b)&&h.push(this.init_lib(b,f));else for(var i in this.libs)h.push(this.init_lib(i,b));return a},init_lib:function(a,b){return this.libs.hasOwnProperty(a)?(this.patch(this.libs[a]),b&&b.hasOwnProperty(a)?this.libs[a].init.apply(this.libs[a],[this.scope,b[a]]):this.libs[a].init.apply(this.libs[a],b)):function(){}},patch:function(a){a.scope=this.scope,a.data_options=this.lib_methods.data_options,a.bindings=this.lib_methods.bindings,a.S=g,a.rtl=this.rtl},inherit:function(a,b){for(var c=b.split(" "),d=c.length-1;d>=0;d--)this.lib_methods.hasOwnProperty(c[d])&&(this.libs[a.name][c[d]]=this.lib_methods[c[d]])},random_str:function(a){var b="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");a||(a=Math.floor(Math.random()*b.length));for(var c="",d=0;a>d;d++)c+=b[Math.floor(Math.random()*b.length)];return c},libs:{},lib_methods:{throttle:function(a,b){var c=null;return function(){var d=this,e=arguments;clearTimeout(c),c=setTimeout(function(){a.apply(d,e)},b)}},data_options:function(b){function c(a){return!isNaN(a-0)&&null!==a&&""!==a&&a!==!1&&a!==!0}function d(b){return"string"==typeof b?a.trim(b):b}var e,f,g,h,i={},j=b.data("options");if("object"==typeof j)return j;for(g=(j||":").split(";"),h=g.length,e=h-1;e>=0;e--)f=g[e].split(":"),/true/i.test(f[1])&&(f[1]=!0),/false/i.test(f[1])&&(f[1]=!1),c(f[1])&&(f[1]=parseInt(f[1],10)),2===f.length&&f[0].length>0&&(i[d(f[0])]=d(f[1]));return i},delay:function(a,b){return setTimeout(a,b)},empty:function(a){if(a.length&&a.length>0)return!1;if(a.length&&0===a.length)return!0;for(var b in a)if(hasOwnProperty.call(a,b))return!1;return!0},register_media:function(b,c){Foundation.media_queries[b]===d&&(a("head").append('<meta class="'+c+'">'),Foundation.media_queries[b]=f(a("."+c).css("font-family")))},addCustomRule:function(a,b){if(b===d)Foundation.stylesheet.insertRule(a,Foundation.stylesheet.cssRules.length);else{var c=Foundation.media_queries[b];c!==d&&Foundation.stylesheet.insertRule("@media "+Foundation.media_queries[b]+"{ "+a+" }")}},loaded:function(a,b){function c(){b(a[0])}function d(){if(this.one("load",c),/MSIE (\d+\.\d+);/.test(navigator.userAgent)){var a=this.attr("src"),b=a.match(/\?/)?"&":"?";b+="random="+(new Date).getTime(),this.attr("src",a+b)}}return a.attr("src")?(a[0].complete||4===a[0].readyState?c():d.call(a),void 0):(c(),void 0)},bindings:function(b,c){var d=this,e=!g(this).data(this.name+"-init");return"string"==typeof b?this[b].call(this):(g(this.scope).is("[data-"+this.name+"]")?(g(this.scope).data(this.name+"-init",a.extend({},this.settings,c||b,this.data_options(g(this.scope)))),e&&this.events(this.scope)):g("[data-"+this.name+"]",this.scope).each(function(){var e=!g(this).data(d.name+"-init");g(this).data(d.name+"-init",a.extend({},d.settings,c||b,d.data_options(g(this)))),e&&d.events(this)}),void 0)}}},a.fn.foundation=function(){var a=Array.prototype.slice.call(arguments,0);return this.each(function(){return Foundation.init.apply(Foundation,[this].concat(a)),this})}}(jQuery,this,this.document),function(a,b,c){"use strict";Foundation.libs.abide={name:"abide",version:"5.0.0",settings:{focus_on_invalid:!0,timeout:1e3,patterns:{alpha:/[a-zA-Z]+/,alpha_numeric:/[a-zA-Z0-9]+/,integer:/-?\d+/,number:/-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?/,password:/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,card:/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,cvv:/^([0-9]){3,4}$/,email:/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,url:/(https?|ftp|file|ssh):\/\/(((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?/,domain:/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/,datetime:/([0-2][0-9]{3})\-([0-1][0-9])\-([0-3][0-9])T([0-5][0-9])\:([0-5][0-9])\:([0-5][0-9])(Z|([\-\+]([0-1][0-9])\:00))/,date:/(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))/,time:/(0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9]){2}/,dateISO:/\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/,month_day_year:/(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d/,color:/^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/}},timer:null,init:function(a,b,c){this.bindings(b,c)},events:function(b){{var c=this,d=a(b).attr("novalidate","novalidate");d.data("abide-init")}d.off(".abide").on("submit.fndtn.abide validate.fndtn.abide",function(b){var d=/ajax/i.test(a(this).attr("data-abide"));return c.validate(a(this).find("input, textarea, select").get(),b,d)}).find("input, textarea, select").off(".abide").on("blur.fndtn.abide change.fndtn.abide",function(a){c.validate([this],a)}).on("keydown.fndtn.abide",function(b){var d=a(this).closest("form").data("abide-init");clearTimeout(c.timer),c.timer=setTimeout(function(){c.validate([this],b)}.bind(this),d.timeout)})},validate:function(b,c,d){for(var e=this.parse_patterns(b),f=e.length,g=a(b[0]).closest("form"),h=/submit/.test(c.type),i=0;f>i;i++)if(!e[i]&&(h||d))return this.settings.focus_on_invalid&&b[i].focus(),g.trigger("invalid"),a(b[i]).closest("form").attr("data-invalid",""),!1;return(h||d)&&g.trigger("valid"),g.removeAttr("data-invalid"),d?!1:!0},parse_patterns:function(a){for(var b=a.length,c=[],d=b-1;d>=0;d--)c.push(this.pattern(a[d]));return this.check_validation_and_apply_styles(c)},pattern:function(a){var b=a.getAttribute("type"),c="string"==typeof a.getAttribute("required");if(this.settings.patterns.hasOwnProperty(b))return[a,this.settings.patterns[b],c];var d=a.getAttribute("pattern")||"";return this.settings.patterns.hasOwnProperty(d)&&d.length>0?[a,this.settings.patterns[d],c]:d.length>0?[a,new RegExp(d),c]:(d=/.*/,[a,d,c])},check_validation_and_apply_styles:function(b){for(var c=b.length,d=[],e=c-1;e>=0;e--){var f=b[e][0],g=b[e][2],h=f.value,i=f.getAttribute("data-equalto"),j="radio"===f.type,k=g?f.value.length>0:!0;j&&g?d.push(this.valid_radio(f,g)):i&&g?d.push(this.valid_equal(f,g)):b[e][1].test(h)&&k||!g&&f.value.length<1?(a(f).removeAttr("data-invalid").parent().removeClass("error"),d.push(!0)):(a(f).attr("data-invalid","").parent().addClass("error"),d.push(!1))}return d},valid_radio:function(b){for(var d=b.getAttribute("name"),e=c.getElementsByName(d),f=e.length,g=!1,h=0;f>h;h++)e[h].checked&&(g=!0);for(var h=0;f>h;h++)g?a(e[h]).removeAttr("data-invalid").parent().removeClass("error"):a(e[h]).attr("data-invalid","").parent().addClass("error");return g},valid_equal:function(b){var d=c.getElementById(b.getAttribute("data-equalto")).value,e=b.value,f=d===e;return f?a(b).removeAttr("data-invalid").parent().removeClass("error"):a(b).attr("data-invalid","").parent().addClass("error"),f}}}(jQuery,this,this.document),function(a){"use strict";Foundation.libs.accordion={name:"accordion",version:"5.0.1",settings:{active_class:"active",toggleable:!0},init:function(a,b,c){this.bindings(b,c)},events:function(){a(this.scope).off(".accordion").on("click.fndtn.accordion","[data-accordion] > dd > a",function(b){var c=a(this).parent(),d=a("#"+this.href.split("#")[1]),e=a("> dd > .content",d.closest("[data-accordion]")),f=c.parent().data("accordion-init"),g=a("> dd > .content."+f.active_class,c.parent());return b.preventDefault(),g[0]==d[0]&&f.toggleable?d.toggleClass(f.active_class):(e.removeClass(f.active_class),d.addClass(f.active_class),void 0)})},off:function(){},reflow:function(){}}}(jQuery,this,this.document),function(a){"use strict";Foundation.libs.alert={name:"alert",version:"5.0.0",settings:{animation:"fadeOut",speed:300,callback:function(){}},init:function(a,b,c){this.bindings(b,c)},events:function(){a(this.scope).off(".alert").on("click.fndtn.alert","[data-alert] a.close",function(b){var c=a(this).closest("[data-alert]"),d=c.data("alert-init");b.preventDefault(),c[d.animation](d.speed,function(){a(this).trigger("closed").remove(),d.callback()})})},reflow:function(){}}}(jQuery,this,this.document),function(a,b,c,d){"use strict";Foundation.libs.clearing={name:"clearing",version:"5.0.0",settings:{templates:{viewing:'<a href="#" class="clearing-close">&times;</a><div class="visible-img" style="display: none"><img src="//:0"><p class="clearing-caption"></p><a href="#" class="clearing-main-prev"><span></span></a><a href="#" class="clearing-main-next"><span></span></a></div>'},close_selectors:".clearing-close",init:!1,locked:!1},init:function(b,c,d){var e=this;Foundation.inherit(this,"throttle loaded"),this.bindings(c,d),a(this.scope).is("[data-clearing]")?this.assemble(a("li",this.scope)):a("[data-clearing]",this.scope).each(function(){e.assemble(a("li",this))})},events:function(c){var d=this;a(this.scope).off(".clearing").on("click.fndtn.clearing","ul[data-clearing] li",function(b,c,e){var c=c||a(this),e=e||c,f=c.next("li"),g=c.closest("[data-clearing]").data("clearing-init"),h=a(b.target);b.preventDefault(),g||(d.init(),g=c.closest("[data-clearing]").data("clearing-init")),e.hasClass("visible")&&c[0]===e[0]&&f.length>0&&d.is_open(c)&&(e=f,h=a("img",e)),d.open(h,c,e),d.update_paddles(e)}).on("click.fndtn.clearing",".clearing-main-next",function(a){d.nav(a,"next")}).on("click.fndtn.clearing",".clearing-main-prev",function(a){d.nav(a,"prev")}).on("click.fndtn.clearing",this.settings.close_selectors,function(a){Foundation.libs.clearing.close(a,this)}).on("keydown.fndtn.clearing",function(a){d.keydown(a)}),a(b).off(".clearing").on("resize.fndtn.clearing",function(){d.resize()}),this.swipe_events(c)},swipe_events:function(){var b=this;a(this.scope).on("touchstart.fndtn.clearing",".visible-img",function(b){b.touches||(b=b.originalEvent);var c={start_page_x:b.touches[0].pageX,start_page_y:b.touches[0].pageY,start_time:(new Date).getTime(),delta_x:0,is_scrolling:d};a(this).data("swipe-transition",c),b.stopPropagation()}).on("touchmove.fndtn.clearing",".visible-img",function(c){if(c.touches||(c=c.originalEvent),!(c.touches.length>1||c.scale&&1!==c.scale)){var d=a(this).data("swipe-transition");if("undefined"==typeof d&&(d={}),d.delta_x=c.touches[0].pageX-d.start_page_x,"undefined"==typeof d.is_scrolling&&(d.is_scrolling=!!(d.is_scrolling||Math.abs(d.delta_x)<Math.abs(c.touches[0].pageY-d.start_page_y))),!d.is_scrolling&&!d.active){c.preventDefault();var e=d.delta_x<0?"next":"prev";d.active=!0,b.nav(c,e)}}}).on("touchend.fndtn.clearing",".visible-img",function(b){a(this).data("swipe-transition",{}),b.stopPropagation()})},assemble:function(b){var c=b.parent();if(!c.parent().hasClass("carousel")){c.after('<div id="foundationClearingHolder"></div>');var d=a("#foundationClearingHolder"),e=c.data("clearing-init"),f=c.detach(),g={grid:'<div class="carousel">'+f[0].outerHTML+"</div>",viewing:e.templates.viewing},h='<div class="clearing-assembled"><div>'+g.viewing+g.grid+"</div></div>";return d.after(h).remove()}},open:function(b,c,d){var e=d.closest(".clearing-assembled"),f=a("div",e).first(),g=a(".visible-img",f),h=a("img",g).not(b);this.locked()||(h.attr("src",this.load(b)).css("visibility","hidden"),this.loaded(h,function(){h.css("visibility","visible"),e.addClass("clearing-blackout"),f.addClass("clearing-container"),g.show(),this.fix_height(d).caption(a(".clearing-caption",g),b).center(h).shift(c,d,function(){d.siblings().removeClass("visible"),d.addClass("visible")})}.bind(this)))},close:function(b,c){b.preventDefault();var d,e,f=function(a){return/blackout/.test(a.selector)?a:a.closest(".clearing-blackout")}(a(c));return c===b.target&&f&&(d=a("div",f).first(),e=a(".visible-img",d),this.settings.prev_index=0,a("ul[data-clearing]",f).attr("style","").closest(".clearing-blackout").removeClass("clearing-blackout"),d.removeClass("clearing-container"),e.hide()),!1},is_open:function(a){return a.parent().prop("style").length>0},keydown:function(b){var c=a("ul[data-clearing]",".clearing-blackout");39===b.which&&this.go(c,"next"),37===b.which&&this.go(c,"prev"),27===b.which&&a("a.clearing-close").trigger("click")},nav:function(b,c){var d=a("ul[data-clearing]",".clearing-blackout");b.preventDefault(),this.go(d,c)},resize:function(){var b=a("img",".clearing-blackout .visible-img");b.length&&this.center(b)},fix_height:function(b){var c=b.parent().children();return c.each(function(){var b=a(this),c=b.find("img");b.height()>c.outerHeight()&&b.addClass("fix-height")}).closest("ul").width(100*c.length+"%"),this},update_paddles:function(b){var c=b.closest(".carousel").siblings(".visible-img");b.next().length>0?a(".clearing-main-next",c).removeClass("disabled"):a(".clearing-main-next",c).addClass("disabled"),b.prev().length>0?a(".clearing-main-prev",c).removeClass("disabled"):a(".clearing-main-prev",c).addClass("disabled")},center:function(a){return this.rtl?a.css({marginRight:-(a.outerWidth()/2),marginTop:-(a.outerHeight()/2)}):a.css({marginLeft:-(a.outerWidth()/2),marginTop:-(a.outerHeight()/2)}),this},load:function(a){if("A"===a[0].nodeName)var b=a.attr("href");else var b=a.parent().attr("href");return this.preload(a),b?b:a.attr("src")},preload:function(a){this.img(a.closest("li").next()).img(a.closest("li").prev())},img:function(b){if(b.length){var c=new Image,d=a("a",b);c.src=d.length?d.attr("href"):a("img",b).attr("src")}return this},caption:function(a,b){var c=b.data("caption");return c?a.html(c).show():a.text("").hide(),this},go:function(b,c){var d=a(".visible",b),e=d[c]();e.length&&a("img",e).trigger("click",[d,e])},shift:function(a,b,c){var d,e=b.parent(),f=this.settings.prev_index||b.index(),g=this.direction(e,a,b),h=parseInt(e.css("left"),10),i=b.outerWidth();b.index()===f||/skip/.test(g)?/skip/.test(g)&&(d=b.index()-this.settings.up_count,this.lock(),d>0?e.animate({left:-(d*i)},300,this.unlock()):e.animate({left:0},300,this.unlock())):/left/.test(g)?(this.lock(),e.animate({left:h+i},300,this.unlock())):/right/.test(g)&&(this.lock(),e.animate({left:h-i},300,this.unlock())),c()},direction:function(b,c,d){var e,f=a("li",b),g=f.outerWidth()+f.outerWidth()/4,h=Math.floor(a(".clearing-container").outerWidth()/g)-1,i=f.index(d);return this.settings.up_count=h,e=this.adjacent(this.settings.prev_index,i)?i>h&&i>this.settings.prev_index?"right":i>h-1&&i<=this.settings.prev_index?"left":!1:"skip",this.settings.prev_index=i,e},adjacent:function(a,b){for(var c=b+1;c>=b-1;c--)if(c===a)return!0;return!1},lock:function(){this.settings.locked=!0},unlock:function(){this.settings.locked=!1},locked:function(){return this.settings.locked},off:function(){a(this.scope).off(".fndtn.clearing"),a(b).off(".fndtn.clearing")},reflow:function(){this.init()}}}(jQuery,this,this.document),function(a,b){"use strict";Foundation.libs.dropdown={name:"dropdown",version:"5.0.0",settings:{active_class:"open",is_hover:!1,opened:function(){},closed:function(){}},init:function(a,b,c){Foundation.inherit(this,"throttle"),this.bindings(b,c)},events:function(){var c=this;a(this.scope).off(".dropdown").on("click.fndtn.dropdown","[data-dropdown]",function(b){var d=a(this).data("dropdown-init");b.preventDefault(),(!d.is_hover||Modernizr.touch)&&c.toggle(a(this))}).on("mouseenter.fndtn.dropdown","[data-dropdown], [data-dropdown-content]",function(){var b=a(this);if(clearTimeout(c.timeout),b.data("dropdown"))var d=a("#"+b.data("dropdown")),e=b;else{var d=b;e=a("[data-dropdown='"+d.attr("id")+"']")}var f=e.data("dropdown-init");f.is_hover&&c.open.apply(c,[d,e])}).on("mouseleave.fndtn.dropdown","[data-dropdown], [data-dropdown-content]",function(){var b=a(this);c.timeout=setTimeout(function(){if(b.data("dropdown")){var d=b.data("dropdown-init");d.is_hover&&c.close.call(c,a("#"+b.data("dropdown")))}else{var e=a('[data-dropdown="'+a(this).attr("id")+'"]'),d=e.data("dropdown-init");d.is_hover&&c.close.call(c,b)}}.bind(this),150)}).on("click.fndtn.dropdown",function(b){var d=a(b.target).closest("[data-dropdown-content]");if(!a(b.target).data("dropdown")&&!a(b.target).parent().data("dropdown"))return!a(b.target).data("revealId")&&d.length>0&&(a(b.target).is("[data-dropdown-content]")||a.contains(d.first()[0],b.target))?(b.stopPropagation(),void 0):(c.close.call(c,a("[data-dropdown-content]")),void 0)}).on("opened.fndtn.dropdown","[data-dropdown-content]",this.settings.opened).on("closed.fndtn.dropdown","[data-dropdown-content]",this.settings.closed),a(b).off(".dropdown").on("resize.fndtn.dropdown",c.throttle(function(){c.resize.call(c)},50)).trigger("resize")},close:function(b){var c=this;b.each(function(){a(this).hasClass(c.settings.active_class)&&(a(this).css(Foundation.rtl?"right":"left","-99999px").removeClass(c.settings.active_class),a(this).trigger("closed"))})},open:function(a,b){this.css(a.addClass(this.settings.active_class),b),a.trigger("opened")},toggle:function(b){var c=a("#"+b.data("dropdown"));0!==c.length&&(this.close.call(this,a("[data-dropdown-content]").not(c)),c.hasClass(this.settings.active_class)?this.close.call(this,c):(this.close.call(this,a("[data-dropdown-content]")),this.open.call(this,c,b)))},resize:function(){var b=a("[data-dropdown-content].open"),c=a("[data-dropdown='"+b.attr("id")+"']");b.length&&c.length&&this.css(b,c)},css:function(c,d){var e=c.offsetParent(),f=d.offset();if(f.top-=e.offset().top,f.left-=e.offset().left,this.small())c.css({position:"absolute",width:"95%","max-width":"none",top:f.top+d.outerHeight()}),c.css(Foundation.rtl?"right":"left","2.5%");else{if(!Foundation.rtl&&a(b).width()>c.outerWidth()+d.offset().left){var g=f.left;c.hasClass("right")&&c.removeClass("right")}else{c.hasClass("right")||c.addClass("right");var g=f.left-(c.outerWidth()-d.outerWidth())}c.attr("style","").css({position:"absolute",top:f.top+d.outerHeight(),left:g})}return c},small:function(){return matchMedia(Foundation.media_queries.small).matches&&!matchMedia(Foundation.media_queries.medium).matches},off:function(){a(this.scope).off(".fndtn.dropdown"),a("html, body").off(".fndtn.dropdown"),a(b).off(".fndtn.dropdown"),a("[data-dropdown-content]").off(".fndtn.dropdown"),this.settings.init=!1},reflow:function(){}}}(jQuery,this,this.document),function(a,b){"use strict";Foundation.libs.interchange={name:"interchange",version:"5.0.0",cache:{},images_loaded:!1,nodes_loaded:!1,settings:{load_attr:"interchange",named_queries:{"default":Foundation.media_queries.small,small:Foundation.media_queries.small,medium:Foundation.media_queries.medium,large:Foundation.media_queries.large,xlarge:Foundation.media_queries.xlarge,xxlarge:Foundation.media_queries.xxlarge,landscape:"only screen and (orientation: landscape)",portrait:"only screen and (orientation: portrait)",retina:"only screen and (-webkit-min-device-pixel-ratio: 2),only screen and (min--moz-device-pixel-ratio: 2),only screen and (-o-min-device-pixel-ratio: 2/1),only screen and (min-device-pixel-ratio: 2),only screen and (min-resolution: 192dpi),only screen and (min-resolution: 2dppx)"},directives:{replace:function(b,c,d){if(/IMG/.test(b[0].nodeName)){var e=b[0].src;if(new RegExp(c,"i").test(e))return;return b[0].src=c,d(b[0].src)}var f=b.data("interchange-last-path");if(f!=c)return a.get(c,function(a){b.html(a),b.data("interchange-last-path",c),d()})}}},init:function(a,b,c){Foundation.inherit(this,"throttle"),this.data_attr="data-"+this.settings.load_attr,this.bindings(b,c),this.load("images"),this.load("nodes")},events:function(){var c=this;return a(b).off(".interchange").on("resize.fndtn.interchange",c.throttle(function(){c.resize.call(c)},50)),this},resize:function(){var b=this.cache;if(!this.images_loaded||!this.nodes_loaded)return setTimeout(a.proxy(this.resize,this),50),void 0;for(var c in b)if(b.hasOwnProperty(c)){var d=this.results(c,b[c]);d&&this.settings.directives[d.scenario[1]](d.el,d.scenario[0],function(){if(arguments[0]instanceof Array)var a=arguments[0];else var a=Array.prototype.slice.call(arguments,0);d.el.trigger(d.scenario[1],a)})}},results:function(a,b){var c=b.length;if(c>0)for(var d=this.S('[data-uuid="'+a+'"]'),e=c-1;e>=0;e--){var f,g=b[e][2];if(f=this.settings.named_queries.hasOwnProperty(g)?matchMedia(this.settings.named_queries[g]):matchMedia(g),f.matches)return{el:d,scenario:b[e]}}return!1},load:function(a,b){return("undefined"==typeof this["cached_"+a]||b)&&this["update_"+a](),this["cached_"+a]},update_images:function(){var a=this.S("img["+this.data_attr+"]"),b=a.length,c=0,d=this.data_attr;this.cache={},this.cached_images=[],this.images_loaded=0===b;for(var e=b-1;e>=0;e--){if(c++,a[e]){var f=a[e].getAttribute(d)||"";f.length>0&&this.cached_images.push(a[e])}c===b&&(this.images_loaded=!0,this.enhance("images"))}return this},update_nodes:function(){var a=this.S("["+this.data_attr+"]:not(img)"),b=a.length,c=0,d=this.data_attr;this.cached_nodes=[],this.nodes_loaded=0===b;for(var e=b-1;e>=0;e--){c++;var f=a[e].getAttribute(d)||"";f.length>0&&this.cached_nodes.push(a[e]),c===b&&(this.nodes_loaded=!0,this.enhance("nodes"))}return this},enhance:function(c){for(var d=this["cached_"+c].length,e=d-1;e>=0;e--)this.object(a(this["cached_"+c][e]));return a(b).trigger("resize")},parse_params:function(a,b,c){return[this.trim(a),this.convert_directive(b),this.trim(c)]},convert_directive:function(a){var b=this.trim(a);
return b.length>0?b:"replace"},object:function(a){var b=this.parse_data_attr(a),c=[],d=b.length;if(d>0)for(var e=d-1;e>=0;e--){var f=b[e].split(/\((.*?)(\))$/);if(f.length>1){var g=f[0].split(","),h=this.parse_params(g[0],g[1],f[1]);c.push(h)}}return this.store(a,c)},uuid:function(a){function b(){return(65536*(1+Math.random())|0).toString(16).substring(1)}var c=a||"-";return b()+b()+c+b()+c+b()+c+b()+c+b()+b()+b()},store:function(a,b){var c=this.uuid(),d=a.data("uuid");return d?this.cache[d]:(a.attr("data-uuid",c),this.cache[c]=b)},trim:function(b){return"string"==typeof b?a.trim(b):b},parse_data_attr:function(a){for(var b=a.data(this.settings.load_attr).split(/\[(.*?)\]/),c=b.length,d=[],e=c-1;e>=0;e--)b[e].replace(/[\W\d]+/,"").length>4&&d.push(b[e]);return d},reflow:function(){this.load("images",!0),this.load("nodes",!0)}}}(jQuery,this,this.document),function(a,b,c,d){"use strict";Foundation.libs.joyride={name:"joyride",version:"5.0.0",defaults:{expose:!1,modal:!0,tip_location:"bottom",nub_position:"auto",scroll_speed:1500,scroll_animation:"linear",timer:0,start_timer_on_click:!0,start_offset:0,next_button:!0,tip_animation:"fade",pause_after:[],exposed:[],tip_animation_fade_speed:300,cookie_monster:!1,cookie_name:"joyride",cookie_domain:!1,cookie_expires:365,tip_container:"body",tip_location_patterns:{top:["bottom"],bottom:[],left:["right","top","bottom"],right:["left","top","bottom"]},post_ride_callback:function(){},post_step_callback:function(){},pre_step_callback:function(){},pre_ride_callback:function(){},post_expose_callback:function(){},template:{link:'<a href="#close" class="joyride-close-tip">&times;</a>',timer:'<div class="joyride-timer-indicator-wrap"><span class="joyride-timer-indicator"></span></div>',tip:'<div class="joyride-tip-guide"><span class="joyride-nub"></span></div>',wrapper:'<div class="joyride-content-wrapper"></div>',button:'<a href="#" class="small button joyride-next-tip"></a>',modal:'<div class="joyride-modal-bg"></div>',expose:'<div class="joyride-expose-wrapper"></div>',expose_cover:'<div class="joyride-expose-cover"></div>'},expose_add_class:""},init:function(a,b,c){Foundation.inherit(this,"throttle delay"),this.settings=this.defaults,this.bindings(b,c)},events:function(){var c=this;a(this.scope).off(".joyride").on("click.fndtn.joyride",".joyride-next-tip, .joyride-modal-bg",function(a){a.preventDefault(),this.settings.$li.next().length<1?this.end():this.settings.timer>0?(clearTimeout(this.settings.automate),this.hide(),this.show(),this.startTimer()):(this.hide(),this.show())}.bind(this)).on("click.fndtn.joyride",".joyride-close-tip",function(a){a.preventDefault(),this.end()}.bind(this)),a(b).off(".joyride").on("resize.fndtn.joyride",c.throttle(function(){if(a("[data-joyride]").length>0&&c.settings.$next_tip){if(c.settings.exposed.length>0){var b=a(c.settings.exposed);b.each(function(){var b=a(this);c.un_expose(b),c.expose(b)})}c.is_phone()?c.pos_phone():c.pos_default(!1,!0)}},100))},start:function(){var b=this,c=a("[data-joyride]",this.scope),d=["timer","scrollSpeed","startOffset","tipAnimationFadeSpeed","cookieExpires"],e=d.length;!c.length>0||(this.settings.init||this.events(),this.settings=c.data("joyride-init"),this.settings.$content_el=c,this.settings.$body=a(this.settings.tip_container),this.settings.body_offset=a(this.settings.tip_container).position(),this.settings.$tip_content=this.settings.$content_el.find("> li"),this.settings.paused=!1,this.settings.attempts=0,"function"!=typeof a.cookie&&(this.settings.cookie_monster=!1),(!this.settings.cookie_monster||this.settings.cookie_monster&&null===a.cookie(this.settings.cookie_name))&&(this.settings.$tip_content.each(function(c){var f=a(this);this.settings=a.extend({},b.defaults,b.data_options(f));for(var g=e-1;g>=0;g--)b.settings[d[g]]=parseInt(b.settings[d[g]],10);b.create({$li:f,index:c})}),!this.settings.start_timer_on_click&&this.settings.timer>0?(this.show("init"),this.startTimer()):this.show("init")))},resume:function(){this.set_li(),this.show()},tip_template:function(b){var c,d;return b.tip_class=b.tip_class||"",c=a(this.settings.template.tip).addClass(b.tip_class),d=a.trim(a(b.li).html())+this.button_text(b.button_text)+this.settings.template.link+this.timer_instance(b.index),c.append(a(this.settings.template.wrapper)),c.first().attr("data-index",b.index),a(".joyride-content-wrapper",c).append(d),c[0]},timer_instance:function(b){var c;return c=0===b&&this.settings.start_timer_on_click&&this.settings.timer>0||0===this.settings.timer?"":a(this.settings.template.timer)[0].outerHTML},button_text:function(b){return this.settings.next_button?(b=a.trim(b)||"Next",b=a(this.settings.template.button).append(b)[0].outerHTML):b="",b},create:function(b){var c=b.$li.attr("data-button")||b.$li.attr("data-text"),d=b.$li.attr("class"),e=a(this.tip_template({tip_class:d,index:b.index,button_text:c,li:b.$li}));a(this.settings.tip_container).append(e)},show:function(b){var c=null;this.settings.$li===d||-1===a.inArray(this.settings.$li.index(),this.settings.pause_after)?(this.settings.paused?this.settings.paused=!1:this.set_li(b),this.settings.attempts=0,this.settings.$li.length&&this.settings.$target.length>0?(b&&(this.settings.pre_ride_callback(this.settings.$li.index(),this.settings.$next_tip),this.settings.modal&&this.show_modal()),this.settings.pre_step_callback(this.settings.$li.index(),this.settings.$next_tip),this.settings.modal&&this.settings.expose&&this.expose(),this.settings.tip_settings=a.extend({},this.settings,this.data_options(this.settings.$li)),this.settings.timer=parseInt(this.settings.timer,10),this.settings.tip_settings.tip_location_pattern=this.settings.tip_location_patterns[this.settings.tip_settings.tip_location],/body/i.test(this.settings.$target.selector)||this.scroll_to(),this.is_phone()?this.pos_phone(!0):this.pos_default(!0),c=this.settings.$next_tip.find(".joyride-timer-indicator"),/pop/i.test(this.settings.tip_animation)?(c.width(0),this.settings.timer>0?(this.settings.$next_tip.show(),this.delay(function(){c.animate({width:c.parent().width()},this.settings.timer,"linear")}.bind(this),this.settings.tip_animation_fade_speed)):this.settings.$next_tip.show()):/fade/i.test(this.settings.tip_animation)&&(c.width(0),this.settings.timer>0?(this.settings.$next_tip.fadeIn(this.settings.tip_animation_fade_speed).show(),this.delay(function(){c.animate({width:c.parent().width()},this.settings.timer,"linear")}.bind(this),this.settings.tip_animation_fadeSpeed)):this.settings.$next_tip.fadeIn(this.settings.tip_animation_fade_speed)),this.settings.$current_tip=this.settings.$next_tip):this.settings.$li&&this.settings.$target.length<1?this.show():this.end()):this.settings.paused=!0},is_phone:function(){return matchMedia(Foundation.media_queries.small).matches&&!matchMedia(Foundation.media_queries.medium).matches},hide:function(){this.settings.modal&&this.settings.expose&&this.un_expose(),this.settings.modal||a(".joyride-modal-bg").hide(),this.settings.$current_tip.css("visibility","hidden"),setTimeout(a.proxy(function(){this.hide(),this.css("visibility","visible")},this.settings.$current_tip),0),this.settings.post_step_callback(this.settings.$li.index(),this.settings.$current_tip)},set_li:function(a){a?(this.settings.$li=this.settings.$tip_content.eq(this.settings.start_offset),this.set_next_tip(),this.settings.$current_tip=this.settings.$next_tip):(this.settings.$li=this.settings.$li.next(),this.set_next_tip()),this.set_target()},set_next_tip:function(){this.settings.$next_tip=a(".joyride-tip-guide").eq(this.settings.$li.index()),this.settings.$next_tip.data("closed","")},set_target:function(){var b=this.settings.$li.attr("data-class"),d=this.settings.$li.attr("data-id"),e=function(){return d?a(c.getElementById(d)):b?a("."+b).first():a("body")};this.settings.$target=e()},scroll_to:function(){var c,d;c=a(b).height()/2,d=Math.ceil(this.settings.$target.offset().top-c+this.settings.$next_tip.outerHeight()),d>0&&a("html, body").animate({scrollTop:d},this.settings.scroll_speed,"swing")},paused:function(){return-1===a.inArray(this.settings.$li.index()+1,this.settings.pause_after)},restart:function(){this.hide(),this.settings.$li=d,this.show("init")},pos_default:function(c,d){var e=(Math.ceil(a(b).height()/2),this.settings.$next_tip.offset(),this.settings.$next_tip.find(".joyride-nub")),f=Math.ceil(e.outerWidth()/2),g=Math.ceil(e.outerHeight()/2),h=c||!1;if(h&&(this.settings.$next_tip.css("visibility","hidden"),this.settings.$next_tip.show()),"undefined"==typeof d&&(d=!1),/body/i.test(this.settings.$target.selector))this.settings.$li.length&&this.pos_modal(e);else{if(this.bottom()){var i=this.settings.$target.offset().left;Foundation.rtl&&(i=this.settings.$target.offset().width-this.settings.$next_tip.width()+i),this.settings.$next_tip.css({top:this.settings.$target.offset().top+g+this.settings.$target.outerHeight(),left:i}),this.nub_position(e,this.settings.tip_settings.nub_position,"top")}else if(this.top()){var i=this.settings.$target.offset().left;Foundation.rtl&&(i=this.settings.$target.offset().width-this.settings.$next_tip.width()+i),this.settings.$next_tip.css({top:this.settings.$target.offset().top-this.settings.$next_tip.outerHeight()-g,left:i}),this.nub_position(e,this.settings.tip_settings.nub_position,"bottom")}else this.right()?(this.settings.$next_tip.css({top:this.settings.$target.offset().top,left:this.outerWidth(this.settings.$target)+this.settings.$target.offset().left+f}),this.nub_position(e,this.settings.tip_settings.nub_position,"left")):this.left()&&(this.settings.$next_tip.css({top:this.settings.$target.offset().top,left:this.settings.$target.offset().left-this.outerWidth(this.settings.$next_tip)-f}),this.nub_position(e,this.settings.tip_settings.nub_position,"right"));!this.visible(this.corners(this.settings.$next_tip))&&this.settings.attempts<this.settings.tip_settings.tip_location_pattern.length&&(e.removeClass("bottom").removeClass("top").removeClass("right").removeClass("left"),this.settings.tip_settings.tip_location=this.settings.tip_settings.tip_location_pattern[this.settings.attempts],this.settings.attempts++,this.pos_default())}h&&(this.settings.$next_tip.hide(),this.settings.$next_tip.css("visibility","visible"))},pos_phone:function(b){var c=this.settings.$next_tip.outerHeight(),d=(this.settings.$next_tip.offset(),this.settings.$target.outerHeight()),e=a(".joyride-nub",this.settings.$next_tip),f=Math.ceil(e.outerHeight()/2),g=b||!1;e.removeClass("bottom").removeClass("top").removeClass("right").removeClass("left"),g&&(this.settings.$next_tip.css("visibility","hidden"),this.settings.$next_tip.show()),/body/i.test(this.settings.$target.selector)?this.settings.$li.length&&this.pos_modal(e):this.top()?(this.settings.$next_tip.offset({top:this.settings.$target.offset().top-c-f}),e.addClass("bottom")):(this.settings.$next_tip.offset({top:this.settings.$target.offset().top+d+f}),e.addClass("top")),g&&(this.settings.$next_tip.hide(),this.settings.$next_tip.css("visibility","visible"))},pos_modal:function(a){this.center(),a.hide(),this.show_modal()},show_modal:function(){if(!this.settings.$next_tip.data("closed")){var b=a(".joyride-modal-bg");b.length<1&&a("body").append(this.settings.template.modal).show(),/pop/i.test(this.settings.tip_animation)?b.show():b.fadeIn(this.settings.tip_animation_fade_speed)}},expose:function(){var c,d,e,f,g,h="expose-"+Math.floor(1e4*Math.random());if(arguments.length>0&&arguments[0]instanceof a)e=arguments[0];else{if(!this.settings.$target||/body/i.test(this.settings.$target.selector))return!1;e=this.settings.$target}return e.length<1?(b.console&&console.error("element not valid",e),!1):(c=a(this.settings.template.expose),this.settings.$body.append(c),c.css({top:e.offset().top,left:e.offset().left,width:e.outerWidth(!0),height:e.outerHeight(!0)}),d=a(this.settings.template.expose_cover),f={zIndex:e.css("z-index"),position:e.css("position")},g=null==e.attr("class")?"":e.attr("class"),e.css("z-index",parseInt(c.css("z-index"))+1),"static"==f.position&&e.css("position","relative"),e.data("expose-css",f),e.data("orig-class",g),e.attr("class",g+" "+this.settings.expose_add_class),d.css({top:e.offset().top,left:e.offset().left,width:e.outerWidth(!0),height:e.outerHeight(!0)}),this.settings.modal&&this.show_modal(),this.settings.$body.append(d),c.addClass(h),d.addClass(h),e.data("expose",h),this.settings.post_expose_callback(this.settings.$li.index(),this.settings.$next_tip,e),this.add_exposed(e),void 0)},un_expose:function(){var c,d,e,f,g,h=!1;if(arguments.length>0&&arguments[0]instanceof a)d=arguments[0];else{if(!this.settings.$target||/body/i.test(this.settings.$target.selector))return!1;d=this.settings.$target}return d.length<1?(b.console&&console.error("element not valid",d),!1):(c=d.data("expose"),e=a("."+c),arguments.length>1&&(h=arguments[1]),h===!0?a(".joyride-expose-wrapper,.joyride-expose-cover").remove():e.remove(),f=d.data("expose-css"),"auto"==f.zIndex?d.css("z-index",""):d.css("z-index",f.zIndex),f.position!=d.css("position")&&("static"==f.position?d.css("position",""):d.css("position",f.position)),g=d.data("orig-class"),d.attr("class",g),d.removeData("orig-classes"),d.removeData("expose"),d.removeData("expose-z-index"),this.remove_exposed(d),void 0)},add_exposed:function(b){this.settings.exposed=this.settings.exposed||[],b instanceof a||"object"==typeof b?this.settings.exposed.push(b[0]):"string"==typeof b&&this.settings.exposed.push(b)},remove_exposed:function(b){var c,d;b instanceof a?c=b[0]:"string"==typeof b&&(c=b),this.settings.exposed=this.settings.exposed||[],d=this.settings.exposed.length;for(var e=0;d>e;e++)if(this.settings.exposed[e]==c)return this.settings.exposed.splice(e,1),void 0},center:function(){var c=a(b);return this.settings.$next_tip.css({top:(c.height()-this.settings.$next_tip.outerHeight())/2+c.scrollTop(),left:(c.width()-this.settings.$next_tip.outerWidth())/2+c.scrollLeft()}),!0},bottom:function(){return/bottom/i.test(this.settings.tip_settings.tip_location)},top:function(){return/top/i.test(this.settings.tip_settings.tip_location)},right:function(){return/right/i.test(this.settings.tip_settings.tip_location)},left:function(){return/left/i.test(this.settings.tip_settings.tip_location)},corners:function(c){var d=a(b),e=d.height()/2,f=Math.ceil(this.settings.$target.offset().top-e+this.settings.$next_tip.outerHeight()),g=d.width()+d.scrollLeft(),h=d.height()+f,i=d.height()+d.scrollTop(),j=d.scrollTop();return j>f&&(j=0>f?0:f),h>i&&(i=h),[c.offset().top<j,g<c.offset().left+c.outerWidth(),i<c.offset().top+c.outerHeight(),d.scrollLeft()>c.offset().left]},visible:function(a){for(var b=a.length;b--;)if(a[b])return!1;return!0},nub_position:function(a,b,c){"auto"===b?a.addClass(c):a.addClass(b)},startTimer:function(){this.settings.$li.length?this.settings.automate=setTimeout(function(){this.hide(),this.show(),this.startTimer()}.bind(this),this.settings.timer):clearTimeout(this.settings.automate)},end:function(){this.settings.cookie_monster&&a.cookie(this.settings.cookie_name,"ridden",{expires:this.settings.cookie_expires,domain:this.settings.cookie_domain}),this.settings.timer>0&&clearTimeout(this.settings.automate),this.settings.modal&&this.settings.expose&&this.un_expose(),this.settings.$next_tip.data("closed",!0),a(".joyride-modal-bg").hide(),this.settings.$current_tip.hide(),this.settings.post_step_callback(this.settings.$li.index(),this.settings.$current_tip),this.settings.post_ride_callback(this.settings.$li.index(),this.settings.$current_tip),a(".joyride-tip-guide").remove()},off:function(){a(this.scope).off(".joyride"),a(b).off(".joyride"),a(".joyride-close-tip, .joyride-next-tip, .joyride-modal-bg").off(".joyride"),a(".joyride-tip-guide, .joyride-modal-bg").remove(),clearTimeout(this.settings.automate),this.settings={}},reflow:function(){}}}(jQuery,this,this.document),function(a,b){"use strict";Foundation.libs.magellan={name:"magellan",version:"5.0.0",settings:{active_class:"active",threshold:0},init:function(){this.fixed_magellan=a("[data-magellan-expedition]"),this.set_threshold(),this.last_destination=a("[data-magellan-destination]").last(),this.events()},events:function(){var c=this;a(this.scope).off(".magellan").on("arrival.fndtn.magellan","[data-magellan-arrival]",function(){var b=a(this),d=b.closest("[data-magellan-expedition]"),e=d.attr("data-magellan-active-class")||c.settings.active_class;b.closest("[data-magellan-expedition]").find("[data-magellan-arrival]").not(b).removeClass(e),b.addClass(e)}),this.fixed_magellan.off(".magellan").on("update-position.fndtn.magellan",function(){a(this)}).trigger("update-position"),a(b).off(".magellan").on("resize.fndtn.magellan",function(){this.fixed_magellan.trigger("update-position")}.bind(this)).on("scroll.fndtn.magellan",function(){var d=a(b).scrollTop();c.fixed_magellan.each(function(){var b=a(this);"undefined"==typeof b.data("magellan-top-offset")&&b.data("magellan-top-offset",b.offset().top),"undefined"==typeof b.data("magellan-fixed-position")&&b.data("magellan-fixed-position",!1);var e=d+c.settings.threshold>b.data("magellan-top-offset"),f=b.attr("data-magellan-top-offset");b.data("magellan-fixed-position")!=e&&(b.data("magellan-fixed-position",e),e?(b.addClass("fixed"),b.css({position:"fixed",top:0})):(b.removeClass("fixed"),b.css({position:"",top:""})),e&&"undefined"!=typeof f&&0!=f&&b.css({position:"fixed",top:f+"px"}))})}),this.last_destination.length>0&&a(b).on("scroll.fndtn.magellan",function(){var d=a(b).scrollTop(),e=d+a(b).height(),f=Math.ceil(c.last_destination.offset().top);a("[data-magellan-destination]").each(function(){var b=a(this),g=b.attr("data-magellan-destination"),h=b.offset().top-b.outerHeight(!0)-d;h<=c.settings.threshold&&a("[data-magellan-arrival='"+g+"']").trigger("arrival"),e>=a(c.scope).height()&&f>d&&e>f&&a("[data-magellan-arrival]").last().trigger("arrival")})})},set_threshold:function(){"number"!=typeof this.settings.threshold&&(this.settings.threshold=this.fixed_magellan.length>0?this.fixed_magellan.outerHeight(!0):0)},off:function(){a(this.scope).off(".fndtn.magellan"),a(b).off(".fndtn.magellan")},reflow:function(){}}}(jQuery,this,this.document),function(a){"use strict";Foundation.libs.offcanvas={name:"offcanvas",version:"5.0.0",settings:{},init:function(){this.events()},events:function(){a(this.scope).off(".offcanvas").on("click.fndtn.offcanvas",".left-off-canvas-toggle",function(b){b.preventDefault(),a(this).closest(".off-canvas-wrap").toggleClass("move-right")}).on("click.fndtn.offcanvas",".exit-off-canvas",function(b){b.preventDefault(),a(".off-canvas-wrap").removeClass("move-right")}).on("click.fndtn.offcanvas",".right-off-canvas-toggle",function(b){b.preventDefault(),a(this).closest(".off-canvas-wrap").toggleClass("move-left")}).on("click.fndtn.offcanvas",".exit-off-canvas",function(b){b.preventDefault(),a(".off-canvas-wrap").removeClass("move-left")})},reflow:function(){}}}(jQuery,this,this.document),function(a,b,c,d){"use strict";var e=function(){},f=function(e,f){if(e.hasClass(f.slides_container_class))return this;var j,k,l,m,n,o,p=this,q=e,r=0,s=!1;q.children().first().addClass(f.active_slide_class),p.update_slide_number=function(b){f.slide_number&&(k.find("span:first").text(parseInt(b)+1),k.find("span:last").text(q.children().length)),f.bullets&&(l.children().removeClass(f.bullets_active_class),a(l.children().get(b)).addClass(f.bullets_active_class))},p.update_active_link=function(b){var c=a('a[data-orbit-link="'+q.children().eq(b).attr("data-orbit-slide")+'"]');c.parents("ul").find("[data-orbit-link]").removeClass(f.bullets_active_class),c.addClass(f.bullets_active_class)},p.build_markup=function(){q.wrap('<div class="'+f.container_class+'"></div>'),j=q.parent(),q.addClass(f.slides_container_class),f.navigation_arrows&&(j.append(a('<a href="#"><span></span></a>').addClass(f.prev_class)),j.append(a('<a href="#"><span></span></a>').addClass(f.next_class))),f.timer&&(m=a("<div>").addClass(f.timer_container_class),m.append("<span>"),m.append(a("<div>").addClass(f.timer_progress_class)),m.addClass(f.timer_paused_class),j.append(m)),f.slide_number&&(k=a("<div>").addClass(f.slide_number_class),k.append("<span></span> "+f.slide_number_text+" <span></span>"),j.append(k)),f.bullets&&(l=a("<ol>").addClass(f.bullets_container_class),j.append(l),l.wrap('<div class="orbit-bullets-container"></div>'),q.children().each(function(b){var c=a("<li>").attr("data-orbit-slide",b);l.append(c)})),f.stack_on_small&&j.addClass(f.stack_on_small_class),p.update_slide_number(0),p.update_active_link(0)},p._goto=function(b,c){if(b===r)return!1;"object"==typeof o&&o.restart();var d=q.children(),e="next";s=!0,r>b&&(e="prev"),b>=d.length?b=0:0>b&&(b=d.length-1);var g=a(d.get(r)),h=a(d.get(b));g.css("zIndex",2),g.removeClass(f.active_slide_class),h.css("zIndex",4).addClass(f.active_slide_class),q.trigger("before-slide-change.fndtn.orbit"),f.before_slide_change(),p.update_active_link(b);var i=function(){var a=function(){r=b,s=!1,c===!0&&(o=p.create_timer(),o.start()),p.update_slide_number(r),q.trigger("after-slide-change.fndtn.orbit",[{slide_number:r,total_slides:d.length}]),f.after_slide_change(r,d.length)};q.height()!=h.height()&&f.variable_height?q.animate({height:h.height()},250,"linear",a):a()};if(1===d.length)return i(),!1;var j=function(){"next"===e&&n.next(g,h,i),"prev"===e&&n.prev(g,h,i)};h.height()>q.height()&&f.variable_height?q.animate({height:h.height()},250,"linear",j):j()},p.next=function(a){a.stopImmediatePropagation(),a.preventDefault(),p._goto(r+1)},p.prev=function(a){a.stopImmediatePropagation(),a.preventDefault(),p._goto(r-1)},p.link_custom=function(b){b.preventDefault();var c=a(this).attr("data-orbit-link");if("string"==typeof c&&""!=(c=a.trim(c))){var d=j.find("[data-orbit-slide="+c+"]");-1!=d.index()&&p._goto(d.index())}},p.link_bullet=function(){var b=a(this).attr("data-orbit-slide");"string"==typeof b&&""!=(b=a.trim(b))&&p._goto(parseInt(b))},p.timer_callback=function(){p._goto(r+1,!0)},p.compute_dimensions=function(){var b=a(q.children().get(r)),c=b.height();f.variable_height||q.children().each(function(){a(this).height()>c&&(c=a(this).height())}),q.height(c)},p.create_timer=function(){var a=new g(j.find("."+f.timer_container_class),f,p.timer_callback);return a},p.stop_timer=function(){"object"==typeof o&&o.stop()},p.toggle_timer=function(){var a=j.find("."+f.timer_container_class);a.hasClass(f.timer_paused_class)?("undefined"==typeof o&&(o=p.create_timer()),o.start()):"object"==typeof o&&o.stop()},p.init=function(){p.build_markup(),f.timer&&(o=p.create_timer(),o.start()),n=new i(f,q),"slide"===f.animation&&(n=new h(f,q)),j.on("click","."+f.next_class,p.next),j.on("click","."+f.prev_class,p.prev),j.on("click","[data-orbit-slide]",p.link_bullet),j.on("click",p.toggle_timer),f.swipe&&j.on("touchstart.fndtn.orbit",function(a){a.touches||(a=a.originalEvent);var b={start_page_x:a.touches[0].pageX,start_page_y:a.touches[0].pageY,start_time:(new Date).getTime(),delta_x:0,is_scrolling:d};j.data("swipe-transition",b),a.stopPropagation()}).on("touchmove.fndtn.orbit",function(a){if(a.touches||(a=a.originalEvent),!(a.touches.length>1||a.scale&&1!==a.scale)){var b=j.data("swipe-transition");if("undefined"==typeof b&&(b={}),b.delta_x=a.touches[0].pageX-b.start_page_x,"undefined"==typeof b.is_scrolling&&(b.is_scrolling=!!(b.is_scrolling||Math.abs(b.delta_x)<Math.abs(a.touches[0].pageY-b.start_page_y))),!b.is_scrolling&&!b.active){a.preventDefault();var c=b.delta_x<0?r+1:r-1;b.active=!0,p._goto(c)}}}).on("touchend.fndtn.orbit",function(a){j.data("swipe-transition",{}),a.stopPropagation()}),j.on("mouseenter.fndtn.orbit",function(){f.timer&&f.pause_on_hover&&p.stop_timer()}).on("mouseleave.fndtn.orbit",function(){f.timer&&f.resume_on_mouseout&&o.start()}),a(c).on("click","[data-orbit-link]",p.link_custom),a(b).on("resize",p.compute_dimensions),a(b).on("load",p.compute_dimensions),a(b).on("load",function(){j.prev(".preloader").css("display","none")}),q.trigger("ready.fndtn.orbit")},p.init()},g=function(a,b,c){var d,e,f=this,g=b.timer_speed,h=a.find("."+b.timer_progress_class),i=-1;this.update_progress=function(a){var b=h.clone();b.attr("style",""),b.css("width",a+"%"),h.replaceWith(b),h=b},this.restart=function(){clearTimeout(e),a.addClass(b.timer_paused_class),i=-1,f.update_progress(0)},this.start=function(){return a.hasClass(b.timer_paused_class)?(i=-1===i?g:i,a.removeClass(b.timer_paused_class),d=(new Date).getTime(),h.animate({width:"100%"},i,"linear"),e=setTimeout(function(){f.restart(),c()},i),a.trigger("timer-started.fndtn.orbit"),void 0):!0},this.stop=function(){if(a.hasClass(b.timer_paused_class))return!0;clearTimeout(e),a.addClass(b.timer_paused_class);var c=(new Date).getTime();i-=c-d;var h=100-i/g*100;f.update_progress(h),a.trigger("timer-stopped.fndtn.orbit")}},h=function(b){var c=b.animation_speed,d=1===a("html[dir=rtl]").length,e=d?"marginRight":"marginLeft",f={};f[e]="0%",this.next=function(a,b,d){a.animate({marginLeft:"-100%"},c),b.animate(f,c,function(){a.css(e,"100%"),d()})},this.prev=function(a,b,d){a.animate({marginLeft:"100%"},c),b.css(e,"-100%"),b.animate(f,c,function(){a.css(e,"100%"),d()})}},i=function(b){{var c=b.animation_speed;1===a("html[dir=rtl]").length}this.next=function(a,b,d){b.css({margin:"0%",opacity:"0.01"}),b.animate({opacity:"1"},c,"linear",function(){a.css("margin","100%"),d()})},this.prev=function(a,b,d){b.css({margin:"0%",opacity:"0.01"}),b.animate({opacity:"1"},c,"linear",function(){a.css("margin","100%"),d()})}};Foundation.libs=Foundation.libs||{},Foundation.libs.orbit={name:"orbit",orbitSlider:null,version:"5.0.0",settings:{animation:"slide",timer_speed:1e4,pause_on_hover:!0,resume_on_mouseout:!1,animation_speed:500,stack_on_small:!1,navigation_arrows:!0,slide_number:!0,slide_number_text:"of",container_class:"orbit-container",stack_on_small_class:"orbit-stack-on-small",next_class:"orbit-next",prev_class:"orbit-prev",timer_container_class:"orbit-timer",timer_paused_class:"paused",timer_progress_class:"orbit-progress",slides_container_class:"orbit-slides-container",bullets_container_class:"orbit-bullets",bullets_active_class:"active",slide_number_class:"orbit-slide-number",caption_class:"orbit-caption",active_slide_class:"active",orbit_transition_class:"orbit-transitioning",bullets:!0,timer:!0,variable_height:!1,swipe:!0,before_slide_change:e,after_slide_change:e},init:function(b,c){var d=this;if("object"==typeof c&&a.extend(!0,d.settings,c),a(b).is("[data-orbit]")){var e=a(b),g=d.data_options(e);d.orbitSlider=new f(e,a.extend({},d.settings,g))}a("[data-orbit]",b).each(function(b,c){var e=a(c),g=d.data_options(e);d.orbitSlider=new f(e,a.extend({},d.settings,g))})}}}(jQuery,this,this.document),function(a,b,c,d){"use strict";Foundation.libs.reveal={name:"reveal",version:"5.0.0",locked:!1,settings:{animation:"fadeAndPop",animation_speed:250,close_on_background_click:!0,close_on_esc:!0,dismiss_modal_class:"close-reveal-modal",bg_class:"reveal-modal-bg",open:function(){},opened:function(){},close:function(){},closed:function(){},bg:a(".reveal-modal-bg"),css:{open:{opacity:0,visibility:"visible",display:"block"},close:{opacity:1,visibility:"hidden",display:"none"}}},init:function(a,b,c){Foundation.inherit(this,"delay"),this.bindings(b,c)},events:function(){var b=this;return a("[data-reveal-id]",this.scope).off(".reveal").on("click.fndtn.reveal",function(c){if(c.preventDefault(),!b.locked){var d=a(this),e=d.data("reveal-ajax");if(b.locked=!0,"undefined"==typeof e)b.open.call(b,d);else{var f=e===!0?d.attr("href"):e;b.open.call(b,d,{url:f})}}}),a(this.scope).off(".reveal").on("click.fndtn.reveal",this.close_targets(),function(c){if(c.preventDefault(),!b.locked){var d=a("[data-reveal].open").data("reveal-init"),e=a(c.target)[0]===a("."+d.bg_class)[0];if(e&&!d.close_on_background_click)return;b.locked=!0,b.close.call(b,e?a("[data-reveal].open"):a(this).closest("[data-reveal]"))}}),a("[data-reveal]",this.scope).length>0?a(this.scope).on("open.fndtn.reveal",this.settings.open).on("opened.fndtn.reveal",this.settings.opened).on("opened.fndtn.reveal",this.open_video).on("close.fndtn.reveal",this.settings.close).on("closed.fndtn.reveal",this.settings.closed).on("closed.fndtn.reveal",this.close_video):a(this.scope).on("open.fndtn.reveal","[data-reveal]",this.settings.open).on("opened.fndtn.reveal","[data-reveal]",this.settings.opened).on("opened.fndtn.reveal","[data-reveal]",this.open_video).on("close.fndtn.reveal","[data-reveal]",this.settings.close).on("closed.fndtn.reveal","[data-reveal]",this.settings.closed).on("closed.fndtn.reveal","[data-reveal]",this.close_video),a("body").on("keyup.fndtn.reveal",function(b){var c=a("[data-reveal].open"),d=c.data("reveal-init");27===b.which&&d.close_on_esc&&c.foundation("reveal","close")}),!0},open:function(b,c){if(b)if("undefined"!=typeof b.selector)var d=a("#"+b.data("reveal-id"));else{var d=a(this.scope);c=b}else var d=a(this.scope);if(!d.hasClass("open")){var e=a("[data-reveal].open");if("undefined"==typeof d.data("css-top")&&d.data("css-top",parseInt(d.css("top"),10)).data("offset",this.cache_offset(d)),d.trigger("open"),e.length<1&&this.toggle_bg(),"undefined"!=typeof c&&c.url){var f=this,g="undefined"!=typeof c.success?c.success:null;a.extend(c,{success:function(b,c,h){a.isFunction(g)&&g(b,c,h),d.html(b),a(d).foundation("section","reflow"),f.hide(e,f.settings.css.close),f.show(d,f.settings.css.open)}}),a.ajax(c)}else this.hide(e,this.settings.css.close),this.show(d,this.settings.css.open)}},close:function(b){var b=b&&b.length?b:a(this.scope),c=a("[data-reveal].open");c.length>0&&(this.locked=!0,b.trigger("close"),this.toggle_bg(),this.hide(c,this.settings.css.close))},close_targets:function(){var a="."+this.settings.dismiss_modal_class;return this.settings.close_on_background_click?a+", ."+this.settings.bg_class:a},toggle_bg:function(){0===a("."+this.settings.bg_class).length&&(this.settings.bg=a("<div />",{"class":this.settings.bg_class}).appendTo("body")),this.settings.bg.filter(":visible").length>0?this.hide(this.settings.bg):this.show(this.settings.bg)},show:function(c,d){if(d){if(0===c.parent("body").length){var e=c.wrap('<div style="display: none;" />').parent();c.on("closed.fndtn.reveal.wrapped",function(){c.detach().appendTo(e),c.unwrap().unbind("closed.fndtn.reveal.wrapped")}),c.detach().appendTo("body")}if(/pop/i.test(this.settings.animation)){d.top=a(b).scrollTop()-c.data("offset")+"px";var f={top:a(b).scrollTop()+c.data("css-top")+"px",opacity:1};return this.delay(function(){return c.css(d).animate(f,this.settings.animation_speed,"linear",function(){this.locked=!1,c.trigger("opened")}.bind(this)).addClass("open")}.bind(this),this.settings.animation_speed/2)}if(/fade/i.test(this.settings.animation)){var f={opacity:1};return this.delay(function(){return c.css(d).animate(f,this.settings.animation_speed,"linear",function(){this.locked=!1,c.trigger("opened")}.bind(this)).addClass("open")}.bind(this),this.settings.animation_speed/2)}return c.css(d).show().css({opacity:1}).addClass("open").trigger("opened")}return/fade/i.test(this.settings.animation)?c.fadeIn(this.settings.animation_speed/2):c.show()},hide:function(c,d){if(d){if(/pop/i.test(this.settings.animation)){var e={top:-a(b).scrollTop()-c.data("offset")+"px",opacity:0};return this.delay(function(){return c.animate(e,this.settings.animation_speed,"linear",function(){this.locked=!1,c.css(d).trigger("closed")}.bind(this)).removeClass("open")}.bind(this),this.settings.animation_speed/2)}if(/fade/i.test(this.settings.animation)){var e={opacity:0};return this.delay(function(){return c.animate(e,this.settings.animation_speed,"linear",function(){this.locked=!1,c.css(d).trigger("closed")}.bind(this)).removeClass("open")}.bind(this),this.settings.animation_speed/2)}return c.hide().css(d).removeClass("open").trigger("closed")}return/fade/i.test(this.settings.animation)?c.fadeOut(this.settings.animation_speed/2):c.hide()},close_video:function(){var b=a(this).find(".flex-video"),c=b.find("iframe");c.length>0&&(c.attr("data-src",c[0].src),c.attr("src","about:blank"),b.hide())
},open_video:function(){var b=a(this).find(".flex-video"),c=b.find("iframe");if(c.length>0){var e=c.attr("data-src");if("string"==typeof e)c[0].src=c.attr("data-src");else{var f=c[0].src;c[0].src=d,c[0].src=f}b.show()}},cache_offset:function(a){var b=a.show().height()+parseInt(a.css("top"),10);return a.hide(),b},off:function(){a(this.scope).off(".fndtn.reveal")},reflow:function(){}}}(jQuery,this,this.document),function(a){"use strict";Foundation.libs.tab={name:"tab",version:"5.0.1",settings:{active_class:"active"},init:function(a,b,c){this.bindings(b,c)},events:function(){a(this.scope).off(".tab").on("click.fndtn.tab","[data-tab] > dd > a",function(b){b.preventDefault();var c=a(this).parent(),d=a("#"+this.href.split("#")[1]),e=c.siblings(),f=c.closest("[data-tab]").data("tab-init");c.addClass(f.active_class),e.removeClass(f.active_class),d.siblings().removeClass(f.active_class).end().addClass(f.active_class)})},off:function(){},reflow:function(){}}}(jQuery,this,this.document),function(a){"use strict";Foundation.libs.tooltip={name:"tooltip",version:"5.0.0",settings:{additional_inheritable_classes:[],tooltip_class:".tooltip",append_to:"body",touch_close_text:"Tap To Close",disable_for_touch:!1,tip_template:function(a,b){return'<span data-selector="'+a+'" class="'+Foundation.libs.tooltip.settings.tooltip_class.substring(1)+'">'+b+'<span class="nub"></span></span>'}},cache:{},init:function(a,b,c){this.bindings(b,c)},events:function(){var b=this;Modernizr.touch?a(this.scope).off(".tooltip").on("click.fndtn.tooltip touchstart.fndtn.tooltip touchend.fndtn.tooltip","[data-tooltip]",function(c){var d=a.extend({},b.settings,b.data_options(a(this)));d.disable_for_touch||(c.preventDefault(),a(d.tooltip_class).hide(),b.showOrCreateTip(a(this)))}).on("click.fndtn.tooltip touchstart.fndtn.tooltip touchend.fndtn.tooltip",this.settings.tooltip_class,function(b){b.preventDefault(),a(this).fadeOut(150)}):a(this.scope).off(".tooltip").on("mouseenter.fndtn.tooltip mouseleave.fndtn.tooltip","[data-tooltip]",function(c){var d=a(this);/enter|over/i.test(c.type)?b.showOrCreateTip(d):("mouseout"===c.type||"mouseleave"===c.type)&&b.hide(d)})},showOrCreateTip:function(a){var b=this.getTip(a);return b&&b.length>0?this.show(a):this.create(a)},getTip:function(b){var c=this.selector(b),d=null;return c&&(d=a('span[data-selector="'+c+'"]'+this.settings.tooltip_class)),"object"==typeof d?d:!1},selector:function(a){var b=a.attr("id"),c=a.attr("data-tooltip")||a.attr("data-selector");return(b&&b.length<1||!b)&&"string"!=typeof c&&(c="tooltip"+Math.random().toString(36).substring(7),a.attr("data-selector",c)),b&&b.length>0?b:c},create:function(b){var c=a(this.settings.tip_template(this.selector(b),a("<div></div>").html(b.attr("title")).html())),d=this.inheritable_classes(b);c.addClass(d).appendTo(this.settings.append_to),Modernizr.touch&&c.append('<span class="tap-to-close">'+this.settings.touch_close_text+"</span>"),b.removeAttr("title").attr("title",""),this.show(b)},reposition:function(b,c,d){var e,f,g,h,i;if(c.css("visibility","hidden").show(),e=b.data("width"),f=c.children(".nub"),g=f.outerHeight(),h=f.outerHeight(),i=function(a,b,c,d,e,f){return a.css({top:b?b:"auto",bottom:d?d:"auto",left:e?e:"auto",right:c?c:"auto",width:f?f:"auto"}).end()},i(c,b.offset().top+b.outerHeight()+10,"auto","auto",b.offset().left,e),this.small())i(c,b.offset().top+b.outerHeight()+10,"auto","auto",12.5,a(this.scope).width()),c.addClass("tip-override"),i(f,-g,"auto","auto",b.offset().left);else{var j=b.offset().left;Foundation.rtl&&(j=b.offset().left+b.offset().width-c.outerWidth()),i(c,b.offset().top+b.outerHeight()+10,"auto","auto",j,e),c.removeClass("tip-override"),d&&d.indexOf("tip-top")>-1?i(c,b.offset().top-c.outerHeight(),"auto","auto",j,e).removeClass("tip-override"):d&&d.indexOf("tip-left")>-1?i(c,b.offset().top+b.outerHeight()/2-2.5*g,"auto","auto",b.offset().left-c.outerWidth()-g,e).removeClass("tip-override"):d&&d.indexOf("tip-right")>-1&&i(c,b.offset().top+b.outerHeight()/2-2.5*g,"auto","auto",b.offset().left+b.outerWidth()+g,e).removeClass("tip-override")}c.css("visibility","visible").hide()},small:function(){return matchMedia(Foundation.media_queries.small).matches},inheritable_classes:function(b){var c=["tip-top","tip-left","tip-bottom","tip-right","noradius"].concat(this.settings.additional_inheritable_classes),d=b.attr("class"),e=d?a.map(d.split(" "),function(b){return-1!==a.inArray(b,c)?b:void 0}).join(" "):"";return a.trim(e)},show:function(a){var b=this.getTip(a);this.reposition(a,b,a.attr("class")),b.fadeIn(150)},hide:function(a){var b=this.getTip(a);b.fadeOut(150)},reload:function(){var b=a(this);return b.data("fndtn-tooltips")?b.foundationTooltips("destroy").foundationTooltips("init"):b.foundationTooltips("init")},off:function(){a(this.scope).off(".fndtn.tooltip"),a(this.settings.tooltip_class).each(function(b){a("[data-tooltip]").get(b).attr("title",a(this).text())}).remove()},reflow:function(){}}}(jQuery,this,this.document),function(a,b,c){"use strict";Foundation.libs.topbar={name:"topbar",version:"5.0.1",settings:{index:0,sticky_class:"sticky",custom_back_text:!0,back_text:"Back",is_hover:!0,mobile_show_parent_link:!1,scrolltop:!0},init:function(b,c,d){Foundation.inherit(this,"addCustomRule register_media throttle");var e=this;e.register_media("topbar","foundation-mq-topbar"),this.bindings(c,d),a("[data-topbar]",this.scope).each(function(){{var b=a(this),c=b.data("topbar-init");a("section",this),a("> ul",this).first()}b.data("index",0);var d=b.parent();d.hasClass("fixed")||d.hasClass(c.sticky_class)?(e.settings.sticky_class=c.sticky_class,e.settings.stick_topbar=b,b.data("height",d.outerHeight()),b.data("stickyoffset",d.offset().top)):b.data("height",b.outerHeight()),c.assembled||e.assemble(b),c.is_hover?a(".has-dropdown",b).addClass("not-click"):a(".has-dropdown",b).removeClass("not-click"),e.addCustomRule(".f-topbar-fixed { padding-top: "+b.data("height")+"px }"),d.hasClass("fixed")&&a("body").addClass("f-topbar-fixed")})},toggle:function(c){var d=this;if(c)var e=a(c).closest("[data-topbar]");else var e=a("[data-topbar]");var f=e.data("topbar-init"),g=a("section, .section",e);d.breakpoint()&&(d.rtl?(g.css({right:"0%"}),a(">.name",g).css({right:"100%"})):(g.css({left:"0%"}),a(">.name",g).css({left:"100%"})),a("li.moved",g).removeClass("moved"),e.data("index",0),e.toggleClass("expanded").css("height","")),f.scrolltop?e.hasClass("expanded")?e.parent().hasClass("fixed")&&(f.scrolltop?(e.parent().removeClass("fixed"),e.addClass("fixed"),a("body").removeClass("f-topbar-fixed"),b.scrollTo(0,0)):e.parent().removeClass("expanded")):e.hasClass("fixed")&&(e.parent().addClass("fixed"),e.removeClass("fixed"),a("body").addClass("f-topbar-fixed")):(e.parent().hasClass(d.settings.sticky_class)&&e.parent().addClass("fixed"),e.parent().hasClass("fixed")&&(e.hasClass("expanded")?(e.addClass("fixed"),e.parent().addClass("expanded")):(e.removeClass("fixed"),e.parent().removeClass("expanded"),d.update_sticky_positioning())))},timer:null,events:function(){var c=this;a(this.scope).off(".topbar").on("click.fndtn.topbar","[data-topbar] .toggle-topbar",function(a){a.preventDefault(),c.toggle(this)}).on("click.fndtn.topbar","[data-topbar] li.has-dropdown",function(b){var d=a(this),e=a(b.target),f=d.closest("[data-topbar]"),g=f.data("topbar-init");return e.data("revealId")?(c.toggle(),void 0):(c.breakpoint()||(!g.is_hover||Modernizr.touch)&&(b.stopImmediatePropagation(),d.hasClass("hover")?(d.removeClass("hover").find("li").removeClass("hover"),d.parents("li.hover").removeClass("hover")):(d.addClass("hover"),"A"===e[0].nodeName&&e.parent().hasClass("has-dropdown")&&b.preventDefault())),void 0)}).on("click.fndtn.topbar","[data-topbar] .has-dropdown>a",function(b){if(c.breakpoint()){b.preventDefault();var d=a(this),e=d.closest("[data-topbar]"),f=e.find("section, .section"),g=(d.next(".dropdown").outerHeight(),d.closest("li"));e.data("index",e.data("index")+1),g.addClass("moved"),c.rtl?(f.css({right:-(100*e.data("index"))+"%"}),f.find(">.name").css({right:100*e.data("index")+"%"})):(f.css({left:-(100*e.data("index"))+"%"}),f.find(">.name").css({left:100*e.data("index")+"%"})),e.css("height",d.siblings("ul").outerHeight(!0)+e.data("height"))}}),a(b).off(".topbar").on("resize.fndtn.topbar",c.throttle(function(){c.resize.call(c)},50)).trigger("resize"),a("body").off(".topbar").on("click.fndtn.topbar touchstart.fndtn.topbar",function(b){var c=a(b.target).closest("li").closest("li.hover");c.length>0||a("[data-topbar] li").removeClass("hover")}),a(this.scope).on("click.fndtn.topbar","[data-topbar] .has-dropdown .back",function(b){b.preventDefault();var d=a(this),e=d.closest("[data-topbar]"),f=e.find("section, .section"),g=(e.data("topbar-init"),d.closest("li.moved")),h=g.parent();e.data("index",e.data("index")-1),c.rtl?(f.css({right:-(100*e.data("index"))+"%"}),f.find(">.name").css({right:100*e.data("index")+"%"})):(f.css({left:-(100*e.data("index"))+"%"}),f.find(">.name").css({left:100*e.data("index")+"%"})),0===e.data("index")?e.css("height",""):e.css("height",h.outerHeight(!0)+e.data("height")),setTimeout(function(){g.removeClass("moved")},300)})},resize:function(){var b=this;a("[data-topbar]").each(function(){var d,e=a(this),f=(e.data("topbar-init"),e.parent("."+b.settings.sticky_class));if(!b.breakpoint()){var g=e.hasClass("expanded");e.css("height","").removeClass("expanded").find("li").removeClass("hover"),g&&b.toggle(e)}f.length>0&&(f.hasClass("fixed")?(f.removeClass("fixed"),d=f.offset().top,a(c.body).hasClass("f-topbar-fixed")&&(d-=e.data("height")),e.data("stickyoffset",d),f.addClass("fixed")):(d=f.offset().top,e.data("stickyoffset",d)))})},breakpoint:function(){return!matchMedia(Foundation.media_queries.topbar).matches},assemble:function(b){{var c=b.data("topbar-init"),d=a("section",b);a("> ul",b).first()}d.detach(),a(".has-dropdown>a",d).each(function(){var b=a(this),d=b.siblings(".dropdown"),e=b.attr("href");if(c.mobile_show_parent_link&&e&&e.length>1)var f=a('<li class="title back js-generated"><h5><a href="#"></a></h5></li><li><a class="parent-link js-generated" href="'+e+'">'+b.text()+"</a></li>");else var f=a('<li class="title back js-generated"><h5><a href="#"></a></h5></li>');1==c.custom_back_text?a("h5>a",f).html(c.back_text):a("h5>a",f).html("&laquo; "+b.html()),d.prepend(f)}),d.appendTo(b),this.sticky(),this.assembled(b)},assembled:function(b){b.data("topbar-init",a.extend({},b.data("topbar-init"),{assembled:!0}))},height:function(b){var c=0;return a("> li",b).each(function(){c+=a(this).outerHeight(!0)}),c},sticky:function(){var c=(a(b),this);a(b).on("scroll",function(){c.update_sticky_positioning()})},update_sticky_positioning:function(){var c="."+this.settings.sticky_class,d=a(b);if(a(c).length>0){var e=this.settings.sticky_topbar.data("stickyoffset");a(c).hasClass("expanded")||(d.scrollTop()>e?a(c).hasClass("fixed")||(a(c).addClass("fixed"),a("body").addClass("f-topbar-fixed")):d.scrollTop()<=e&&a(c).hasClass("fixed")&&(a(c).removeClass("fixed"),a("body").removeClass("f-topbar-fixed")))}},off:function(){a(this.scope).off(".fndtn.topbar"),a(b).off(".fndtn.topbar")},reflow:function(){}}}(jQuery,this,this.document);
;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.equalizer = {
    name : 'equalizer',

    version : '5.1.0',

    settings : {
    },

    init : function (scope, method, options) {
      var self = this;

      self.bindings(method, options);
    },

    events : function () {
      var self = this;

      // TODO Throttle this event
      self.S(window).off('.equalizer').on('resize.fndtn.equalizer', function(e){
        self.reflow();
      });
    },

    equalize: function(equalizer) {
      var isStacked = false,
          vals = equalizer.find('[data-equalizer-watch]'),
          firstTopOffset = vals.first().offset().top;
      vals.height('inherit');
      vals.each(function(){
        var el = $(this);
        if (el.offset().top !== firstTopOffset) {
          isStacked = true;
        }
      });
      if (isStacked) return;
      
      var heights = vals.map(function(){ return $(this).outerHeight() });
      var max = Math.max.apply(null, heights);
      vals.height(max);
    },

    reflow : function () {
      var self = this;

      self.S('[data-equalizer]', this.scope).each(function(){
        self.equalize($(this));
      });
    }
  };
}(jQuery, this, this.document));
(function(e, t, n, r) {    
    "use strict";
    if (typeof Object.assign != 'function') {
            // Must be writable: true, enumerable: false, configurable: true
            Object.defineProperty(Object, "assign", {
                value: function assign(target, varArgs) { // .length of function is 2
                    'use strict';
                    if (target == null) { // TypeError if undefined or null
                        throw new TypeError('Cannot convert undefined or null to object');
                    }

                    var to = Object(target);

                    for (var index = 1; index < arguments.length; index++) {
                        var nextSource = arguments[index];

                        if (nextSource != null) { // Skip over if undefined or null
                            for (var nextKey in nextSource) {
                                // Avoid bugs when hasOwnProperty is shadowed
                                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                                    to[nextKey] = nextSource[nextKey];
                                }
                            }
                        }
                    }
                    return to;
                },
                writable: true,
                configurable: true
            });
    }
    Foundation.libs.dropdown = Object.assign(Foundation.libs.dropdown,{
        css: function(n, r) {
            var i = n.offsetParent(),
                s = r.offset();
            s.top -= i.offset().top, s.left -= i.offset().left;
            //customising js-ifs=excludeForSmall            
            var efs = true;
            try {
                if((n[0] && n[0].attributes.exclude_for_small && n[0].attributes.exclude_for_small.value === "true")){
                    efs = false;
                }
            } catch (t) {
                
            }
            //end

            if (this.small() && efs) n.css({
                position: "absolute",
                width: "95%",
                "max-width": "none",
                top: s.top + r.outerHeight()
            }), n.css(Foundation.rtl ? "right" : "left", "2.5%");
            else {
                if (!Foundation.rtl && e(t).width() > n.outerWidth() + r.offset().left) {
                    var o = s.left;
                    n.hasClass("right") && n.removeClass("right")
                } else {
                    n.hasClass("right") || n.addClass("right");
                    var o = s.left - (n.outerWidth() - r.outerWidth())
                }
                n.attr("style", "").css({
                    position: "absolute",
                    top: s.top + r.outerHeight(),
                    left: o
                })
            }
            return n
        }
    });
}(jQuery, this, this.document))
/*
 *  jQuery OwlCarousel v1.3.2
 *
 *  Copyright (c) 2013 Bartosz Wojciechowski
 *  http://www.owlgraphic.com/owlcarousel/
 *
 *  Licensed under MIT
 *
 */

/*JS Lint helpers: */
/*global dragMove: false, dragEnd: false, $, jQuery, alert, window, document */
/*jslint nomen: true, continue:true */

if (typeof Object.create !== "function") {
    Object.create = function (obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}
(function ($, window, document) {

    var Carousel = {
        init : function (options, el) {
            var base = this;

            base.$elem = $(el);
            base.options = $.extend({}, $.fn.owlCarousel.options, base.$elem.data(), options);

            base.userOptions = options;
            base.loadContent();
        },

        loadContent : function () {
            var base = this, url;

            function getData(data) {
                var i, content = "";
                if (typeof base.options.jsonSuccess === "function") {
                    base.options.jsonSuccess.apply(this, [data]);
                } else {
                    for (i in data.owl) {
                        if (data.owl.hasOwnProperty(i)) {
                            content += data.owl[i].item;
                        }
                    }
                    base.$elem.html(content);
                }
                base.logIn();
            }

            if (typeof base.options.beforeInit === "function") {
                base.options.beforeInit.apply(this, [base.$elem]);
            }

            if (typeof base.options.jsonPath === "string") {
                url = base.options.jsonPath;
                $.getJSON(url, getData);
            } else {
                base.logIn();
            }
        },

        logIn : function () {
            var base = this;

            base.$elem.data("owl-originalStyles", base.$elem.attr("style"))
                      .data("owl-originalClasses", base.$elem.attr("class"));

            base.$elem.css({opacity: 0});
            base.orignalItems = base.options.items;
            base.checkBrowser();
            base.wrapperWidth = 0;
            base.checkVisible = null;
            base.setVars();
        },

        setVars : function () {
            var base = this;
            if (base.$elem.children().length === 0) {return false; }
            base.baseClass();
            base.eventTypes();
            base.$userItems = base.$elem.children();
            base.itemsAmount = base.$userItems.length;
            base.wrapItems();
            base.$owlItems = base.$elem.find(".owl-item");
            base.$owlWrapper = base.$elem.find(".owl-wrapper");
            base.playDirection = "next";
            base.prevItem = 0;
            base.prevArr = [0];
            base.currentItem = 0;
            base.customEvents();
            base.onStartup();
        },

        onStartup : function () {
            var base = this;
            base.updateItems();
            base.calculateAll();
            base.buildControls();
            base.updateControls();
            base.response();
            base.moveEvents();
            base.stopOnHover();
            base.owlStatus();

            if (base.options.transitionStyle !== false) {
                base.transitionTypes(base.options.transitionStyle);
            }
            if (base.options.autoPlay === true) {
                base.options.autoPlay = 5000;
            }
            base.play();

            base.$elem.find(".owl-wrapper").css("display", "block");

            if (!base.$elem.is(":visible")) {
                base.watchVisibility();
            } else {
                base.$elem.css("opacity", 1);
            }
            base.onstartup = false;
            base.eachMoveUpdate();
            if (typeof base.options.afterInit === "function") {
                base.options.afterInit.apply(this, [base.$elem]);
            }
        },

        eachMoveUpdate : function () {
            var base = this;

            if (base.options.lazyLoad === true) {
                base.lazyLoad();
            }
            if (base.options.autoHeight === true) {
                base.autoHeight();
            }
            base.onVisibleItems();

            if (typeof base.options.afterAction === "function") {
                base.options.afterAction.apply(this, [base.$elem]);
            }
        },

        updateVars : function () {
            var base = this;
            if (typeof base.options.beforeUpdate === "function") {
                base.options.beforeUpdate.apply(this, [base.$elem]);
            }
            base.watchVisibility();
            base.updateItems();
            base.calculateAll();
            base.updatePosition();
            base.updateControls();
            base.eachMoveUpdate();
            if (typeof base.options.afterUpdate === "function") {
                base.options.afterUpdate.apply(this, [base.$elem]);
            }
        },

        reload : function () {
            var base = this;
            window.setTimeout(function () {
                base.updateVars();
            }, 0);
        },

        watchVisibility : function () {
            var base = this;

            if (base.$elem.is(":visible") === false) {
                base.$elem.css({opacity: 0});
                window.clearInterval(base.autoPlayInterval);
                window.clearInterval(base.checkVisible);
            } else {
                return false;
            }
            base.checkVisible = window.setInterval(function () {
                if (base.$elem.is(":visible")) {
                    base.reload();
                    base.$elem.animate({opacity: 1}, 200);
                    window.clearInterval(base.checkVisible);
                }
            }, 500);
        },

        wrapItems : function () {
            var base = this;
            base.$userItems.wrapAll("<div class=\"owl-wrapper\">").wrap("<div class=\"owl-item\"></div>");
            base.$elem.find(".owl-wrapper").wrap("<div class=\"owl-wrapper-outer\">");
            base.wrapperOuter = base.$elem.find(".owl-wrapper-outer");
            base.$elem.css("display", "block");
        },

        baseClass : function () {
            var base = this,
                hasBaseClass = base.$elem.hasClass(base.options.baseClass),
                hasThemeClass = base.$elem.hasClass(base.options.theme);

            if (!hasBaseClass) {
                base.$elem.addClass(base.options.baseClass);
            }

            if (!hasThemeClass) {
                base.$elem.addClass(base.options.theme);
            }
        },

        updateItems : function () {
            var base = this, width, i;

            if (base.options.responsive === false) {
                return false;
            }
            if (base.options.singleItem === true) {
                base.options.items = base.orignalItems = 1;
                base.options.itemsCustom = false;
                base.options.itemsDesktop = false;
                base.options.itemsDesktopSmall = false;
                base.options.itemsTablet = false;
                base.options.itemsTabletSmall = false;
                base.options.itemsMobile = false;
                return false;
            }

            width = $(base.options.responsiveBaseWidth).width();

            if (width > (base.options.itemsDesktop[0] || base.orignalItems)) {
                base.options.items = base.orignalItems;
            }
            if (base.options.itemsCustom !== false) {
                //Reorder array by screen size
                base.options.itemsCustom.sort(function (a, b) {return a[0] - b[0]; });

                for (i = 0; i < base.options.itemsCustom.length; i += 1) {
                    if (base.options.itemsCustom[i][0] <= width) {
                        base.options.items = base.options.itemsCustom[i][1];
                    }
                }

            } else {

                if (width <= base.options.itemsDesktop[0] && base.options.itemsDesktop !== false) {
                    base.options.items = base.options.itemsDesktop[1];
                }

                if (width <= base.options.itemsDesktopSmall[0] && base.options.itemsDesktopSmall !== false) {
                    base.options.items = base.options.itemsDesktopSmall[1];
                }

                if (width <= base.options.itemsTablet[0] && base.options.itemsTablet !== false) {
                    base.options.items = base.options.itemsTablet[1];
                }

                if (width <= base.options.itemsTabletSmall[0] && base.options.itemsTabletSmall !== false) {
                    base.options.items = base.options.itemsTabletSmall[1];
                }

                if (width <= base.options.itemsMobile[0] && base.options.itemsMobile !== false) {
                    base.options.items = base.options.itemsMobile[1];
                }
            }

            //if number of items is less than declared
            if (base.options.items > base.itemsAmount && base.options.itemsScaleUp === true) {
                base.options.items = base.itemsAmount;
            }
        },

        response : function () {
            var base = this,
                smallDelay,
                lastWindowWidth;

            if (base.options.responsive !== true) {
                return false;
            }
            lastWindowWidth = $(window).width();

            base.resizer = function () {
                if ($(window).width() !== lastWindowWidth) {
                    if (base.options.autoPlay !== false) {
                        window.clearInterval(base.autoPlayInterval);
                    }
                    window.clearTimeout(smallDelay);
                    smallDelay = window.setTimeout(function () {
                        lastWindowWidth = $(window).width();
                        base.updateVars();
                    }, base.options.responsiveRefreshRate);
                }
            };
            $(window).resize(base.resizer);
        },

        updatePosition : function () {
            var base = this;
            base.jumpTo(base.currentItem);
            if (base.options.autoPlay !== false) {
                base.checkAp();
            }
        },

        appendItemsSizes : function () {
            var base = this,
                roundPages = 0,
                lastItem = base.itemsAmount - base.options.items;

            base.$owlItems.each(function (index) {
                var $this = $(this);
                $this
                    .css({"width": base.itemWidth})
                    .data("owl-item", Number(index));

                if (index % base.options.items === 0 || index === lastItem) {
                    if (!(index > lastItem)) {
                        roundPages += 1;
                    }
                }
                $this.data("owl-roundPages", roundPages);
            });
        },

        appendWrapperSizes : function () {
            var base = this,
                width = base.$owlItems.length * base.itemWidth;

            base.$owlWrapper.css({
                "width": width * 2,
                "left": 0
            });
            base.appendItemsSizes();
        },

        calculateAll : function () {
            var base = this;
            base.calculateWidth();
            base.appendWrapperSizes();
            base.loops();
            base.max();
        },

        calculateWidth : function () {
            var base = this;
			// if condition added By Srikanth A
			if(base.options.customWidth != false) {
				base.itemWidth = base.options.customWidth;	// Added statement
			}else{				
            	base.itemWidth = Math.round(base.$elem.width() / base.options.items);
			}
        },

        max : function () {
            var base = this,
                maximum = ((base.itemsAmount * base.itemWidth) - base.options.items * base.itemWidth) * -1;
            if (base.options.items > base.itemsAmount) {
                base.maximumItem = 0;
                maximum = 0;
                base.maximumPixels = 0;
            } else {
                base.maximumItem = base.itemsAmount - base.options.items;
                base.maximumPixels = maximum;
            }
            return maximum;
        },

        min : function () {
            return 0;
        },

        loops : function () {
            var base = this,
                prev = 0,
                elWidth = 0,
                i,
                item,
                roundPageNum;

            base.positionsInArray = [0];
            base.pagesInArray = [];

            for (i = 0; i < base.itemsAmount; i += 1) {
                elWidth += base.itemWidth;
                base.positionsInArray.push(-elWidth);

                if (base.options.scrollPerPage === true) {
                    item = $(base.$owlItems[i]);
                    roundPageNum = item.data("owl-roundPages");
                    if (roundPageNum !== prev) {
                        base.pagesInArray[prev] = base.positionsInArray[i];
                        prev = roundPageNum;
                    }
                }
            }
        },

        buildControls : function () {
            var base = this;
            if (base.options.navigation === true || base.options.pagination === true) {
                base.owlControls = $("<div class=\"owl-controls\"/>").toggleClass("clickable", !base.browser.isTouch).appendTo(base.$elem);
            }
            if (base.options.pagination === true) {
                base.buildPagination();
            }
            if (base.options.navigation === true) {
                base.buildButtons();
            }
        },

        buildButtons : function () {
            var base = this,
                buttonsWrapper = $("<div class=\"owl-buttons\"/>");
            base.owlControls.append(buttonsWrapper);

            base.buttonPrev = $("<div/>", {
                "class" : "owl-prev",
                "html" : base.options.navigationText[0] || ""
            });

            base.buttonNext = $("<div/>", {
                "class" : "owl-next",
                "html" : base.options.navigationText[1] || ""
            });

            buttonsWrapper
                .append(base.buttonPrev)
                .append(base.buttonNext);

            buttonsWrapper.on("touchstart.owlControls mousedown.owlControls", "div[class^=\"owl\"]", function (event) {
                event.preventDefault();
            });

            buttonsWrapper.on("touchend.owlControls mouseup.owlControls", "div[class^=\"owl\"]", function (event) {
                event.preventDefault();
                if ($(this).hasClass("owl-next")) {
                    base.next();
                } else {
                    base.prev();
                }
            });
        },

        buildPagination : function () {
            var base = this;

            base.paginationWrapper = $("<div class=\"owl-pagination\"/>");
            base.owlControls.append(base.paginationWrapper);

            base.paginationWrapper.on("touchend.owlControls mouseup.owlControls", ".owl-page", function (event) {
                event.preventDefault();
                if (Number($(this).data("owl-page")) !== base.currentItem) {
                    base.goTo(Number($(this).data("owl-page")), true);
                }
            });
        },

        updatePagination : function () {
            var base = this,
                counter,
                lastPage,
                lastItem,
                i,
                paginationButton,
                paginationButtonInner;

            if (base.options.pagination === false) {
                return false;
            }

            base.paginationWrapper.html("");

            counter = 0;
            lastPage = base.itemsAmount - base.itemsAmount % base.options.items;

            for (i = 0; i < base.itemsAmount; i += 1) {
                if (i % base.options.items === 0) {
                    counter += 1;
                    if (lastPage === i) {
                        lastItem = base.itemsAmount - base.options.items;
                    }
                    paginationButton = $("<div/>", {
                        "class" : "owl-page"
                    });
                    paginationButtonInner = $("<span></span>", {
                        "text": base.options.paginationNumbers === true ? counter : "",
                        "class": base.options.paginationNumbers === true ? "owl-numbers" : ""
                    });
                    paginationButton.append(paginationButtonInner);

                    paginationButton.data("owl-page", lastPage === i ? lastItem : i);
                    paginationButton.data("owl-roundPages", counter);

                    base.paginationWrapper.append(paginationButton);
                }
            }
            base.checkPagination();
        },
        checkPagination : function () {
            var base = this;
            if (base.options.pagination === false) {
                return false;
            }
            base.paginationWrapper.find(".owl-page").each(function () {
                if ($(this).data("owl-roundPages") === $(base.$owlItems[base.currentItem]).data("owl-roundPages")) {
                    base.paginationWrapper
                        .find(".owl-page")
                        .removeClass("active");
                    $(this).addClass("active");
                }
            });
        },

        checkNavigation : function () {
            var base = this;

            if (base.options.navigation === false) {
                return false;
            }
            if (base.options.rewindNav === false) {
                if (base.currentItem === 0 && base.maximumItem === 0) {
                    base.buttonPrev.addClass("disabled");
                    base.buttonNext.addClass("disabled");
                } else if (base.currentItem === 0 && base.maximumItem !== 0) {
                    base.buttonPrev.addClass("disabled");
                    base.buttonNext.removeClass("disabled");
                } else if (base.currentItem === base.maximumItem) {
                    base.buttonPrev.removeClass("disabled");
                    base.buttonNext.addClass("disabled");
                } else if (base.currentItem !== 0 && base.currentItem !== base.maximumItem) {
                    base.buttonPrev.removeClass("disabled");
                    base.buttonNext.removeClass("disabled");
                }
            }
        },

        updateControls : function () {
            var base = this;
            base.updatePagination();
            base.checkNavigation();
            if (base.owlControls) {
                if (base.options.items >= base.itemsAmount) {
                    base.owlControls.hide();
                } else {
                    base.owlControls.show();
                }
            }
        },

        destroyControls : function () {
            var base = this;
            if (base.owlControls) {
                base.owlControls.remove();
            }
        },

        next : function (speed) {
            var base = this;

            if (base.isTransition) {
                return false;
            }
	    if(typeof base.currentItem !== "string"){		
	    		base.currentItem += base.options.scrollPerPage === true ? base.options.items : 1;		
		} else {
			var currItm = Number(base.currentItem);
			currItm +=  base.options.scrollPerPage === true ? base.options.items : 1;
			base.currentItem = currItm;	
		}		
            if (base.currentItem > base.maximumItem + (base.options.scrollPerPage === true ? (base.options.items - 1) : 0)) {
                if (base.options.rewindNav === true) {
                    base.currentItem = 0;
                    speed = "rewind";
                } else {
                    base.currentItem = base.maximumItem;
                    return false;
                }
            }
            base.goTo(base.currentItem, speed);
        },

        prev : function (speed) {
            var base = this;

            if (base.isTransition) {
                return false;
            }

            if (base.options.scrollPerPage === true && base.currentItem > 0 && base.currentItem < base.options.items) {
                base.currentItem = 0;
            } else {
                base.currentItem -= base.options.scrollPerPage === true ? base.options.items : 1;
            }
            if (base.currentItem < 0) {
                if (base.options.rewindNav === true) {
                    base.currentItem = base.maximumItem;
                    speed = "rewind";
                } else {
                    base.currentItem = 0;
                    return false;
                }
            }
            base.goTo(base.currentItem, speed);
        },

        goTo : function (position, speed, drag) {
            var base = this,
                goToPixel;

            if (base.isTransition) {
                return false;
            }
            if (typeof base.options.beforeMove === "function") {
                base.options.beforeMove.apply(this, [base.$elem]);
            }
            if (position >= base.maximumItem) {
                position = base.maximumItem;
            } else if (position <= 0) {
                position = 0;
            }		
            base.currentItem = base.owl.currentItem = position;
            if (base.options.transitionStyle !== false && drag !== "drag" && base.options.items === 1 && base.browser.support3d === true) {
                base.swapSpeed(0);
                if (base.browser.support3d === true) {
                    base.transition3d(base.positionsInArray[position]);
                } else {
                    base.css2slide(base.positionsInArray[position], 1);
                }
                base.afterGo();
                base.singleItemTransition();
                return false;
            }
            goToPixel = base.positionsInArray[position];

            if (base.browser.support3d === true) {
                base.isCss3Finish = false;

                if (speed === true) {
                    base.swapSpeed("paginationSpeed");
                    window.setTimeout(function () {
                        base.isCss3Finish = true;
                    }, base.options.paginationSpeed);

                } else if (speed === "rewind") {
                    base.swapSpeed(base.options.rewindSpeed);
                    window.setTimeout(function () {
                        base.isCss3Finish = true;
                    }, base.options.rewindSpeed);

                } else {
                    base.swapSpeed("slideSpeed");
                    window.setTimeout(function () {
                        base.isCss3Finish = true;
                    }, base.options.slideSpeed);
                }
                base.transition3d(goToPixel);
            } else {
                if (speed === true) {
                    base.css2slide(goToPixel, base.options.paginationSpeed);
                } else if (speed === "rewind") {
                    base.css2slide(goToPixel, base.options.rewindSpeed);
                } else {
                    base.css2slide(goToPixel, base.options.slideSpeed);
                }
            }
            base.afterGo();
        },

        jumpTo : function (position) {
            var base = this;
            if (typeof base.options.beforeMove === "function") {
                base.options.beforeMove.apply(this, [base.$elem]);
            }
            if (position >= base.maximumItem || position === -1) {
                position = base.maximumItem;
            } else if (position <= 0) {
                position = 0;
            }
            base.swapSpeed(0);
            if (base.browser.support3d === true) {
                base.transition3d(base.positionsInArray[position]);
            } else {
                base.css2slide(base.positionsInArray[position], 1);
            }
            base.currentItem = base.owl.currentItem = position;
            base.afterGo();
        },

        afterGo : function () {
            var base = this;

            base.prevArr.push(base.currentItem);
            base.prevItem = base.owl.prevItem = base.prevArr[base.prevArr.length - 2];
            base.prevArr.shift(0);

            if (base.prevItem !== base.currentItem) {
                base.checkPagination();
                base.checkNavigation();
                base.eachMoveUpdate();

                if (base.options.autoPlay !== false) {
                    base.checkAp();
                }
            }
            if (typeof base.options.afterMove === "function" && base.prevItem !== base.currentItem) {
                base.options.afterMove.apply(this, [base.$elem]);
            }
        },

        stop : function () {
            var base = this;
            base.apStatus = "stop";
            window.clearInterval(base.autoPlayInterval);
        },

        checkAp : function () {
            var base = this;
            if (base.apStatus !== "stop") {
                base.play();
            }
        },

        play : function () {
            var base = this;
            base.apStatus = "play";
            if (base.options.autoPlay === false) {
                return false;
            }
            window.clearInterval(base.autoPlayInterval);
            base.autoPlayInterval = window.setInterval(function () {
                base.next(true);
            }, base.options.autoPlay);
        },

        swapSpeed : function (action) {
            var base = this;
            if (action === "slideSpeed") {
                base.$owlWrapper.css(base.addCssSpeed(base.options.slideSpeed));
            } else if (action === "paginationSpeed") {
                base.$owlWrapper.css(base.addCssSpeed(base.options.paginationSpeed));
            } else if (typeof action !== "string") {
                base.$owlWrapper.css(base.addCssSpeed(action));
            }
        },

        addCssSpeed : function (speed) {
            return {
                "-webkit-transition": "all " + speed + "ms ease",
                "-moz-transition": "all " + speed + "ms ease",
                "-o-transition": "all " + speed + "ms ease",
                "transition": "all " + speed + "ms ease"
            };
        },

        removeTransition : function () {
            return {
                "-webkit-transition": "",
                "-moz-transition": "",
                "-o-transition": "",
                "transition": ""
            };
        },

        doTranslate : function (pixels) {
            return {
                "-webkit-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-moz-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-o-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-ms-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "transform": "translate3d(" + pixels + "px, 0px,0px)"
            };
        },

        transition3d : function (value) {
            var base = this;
            base.$owlWrapper.css(base.doTranslate(value));
        },

        css2move : function (value) {
            var base = this;
            base.$owlWrapper.css({"left" : value});
        },

        css2slide : function (value, speed) {
            var base = this;

            base.isCssFinish = false;
            base.$owlWrapper.stop(true, true).animate({
                "left" : value
            }, {
                duration : speed || base.options.slideSpeed,
                complete : function () {
                    base.isCssFinish = true;
                }
            });
        },

        checkBrowser : function () {
            var base = this,
                translate3D = "translate3d(0px, 0px, 0px)",
                tempElem = document.createElement("div"),
                regex,
                asSupport,
                support3d,
                isTouch;

            tempElem.style.cssText = "  -moz-transform:" + translate3D +
                                  "; -ms-transform:"     + translate3D +
                                  "; -o-transform:"      + translate3D +
                                  "; -webkit-transform:" + translate3D +
                                  "; transform:"         + translate3D;
            regex = /translate3d\(0px, 0px, 0px\)/g;
            asSupport = tempElem.style.cssText.match(regex);
            //support3d = (asSupport !== null && asSupport.length === 1);
	    support3d = (Modernizr.csstransforms3d);

            isTouch = "ontouchstart" in window || window.navigator.msMaxTouchPoints;

            base.browser = {
                "support3d" : support3d,
                "isTouch" : isTouch
            };
        },

        moveEvents : function () {
            var base = this;
            if (base.options.mouseDrag !== false || base.options.touchDrag !== false) {
                base.gestures();
                base.disabledEvents();
            }
        },

        eventTypes : function () {
            var base = this,
                types = ["s", "e", "x"];

            base.ev_types = {};

            if (base.options.mouseDrag === true && base.options.touchDrag === true) {
                types = [
                    "touchstart.owl mousedown.owl",
                    "touchmove.owl mousemove.owl",
                    "touchend.owl touchcancel.owl mouseup.owl"
                ];
            } else if (base.options.mouseDrag === false && base.options.touchDrag === true) {
                types = [
                    "touchstart.owl",
                    "touchmove.owl",
                    "touchend.owl touchcancel.owl"
                ];
            } else if (base.options.mouseDrag === true && base.options.touchDrag === false) {
                types = [
                    "mousedown.owl",
                    "mousemove.owl",
                    "mouseup.owl"
                ];
            }

            base.ev_types.start = types[0];
            base.ev_types.move = types[1];
            base.ev_types.end = types[2];
        },

        disabledEvents :  function () {
            var base = this;
            base.$elem.on("dragstart.owl", function (event) { event.preventDefault(); });
            base.$elem.on("mousedown.disableTextSelect", function (e) {
                return $(e.target).is('input, textarea, select, option');
            });
        },

        gestures : function () {
            /*jslint unparam: true*/
            var base = this,
                locals = {
                    offsetX : 0,
                    offsetY : 0,
                    baseElWidth : 0,
                    relativePos : 0,
                    position: null,
                    minSwipe : null,
                    maxSwipe: null,
                    sliding : null,
                    dargging: null,
                    targetElement : null
                };

            base.isCssFinish = true;

            function getTouches(event) {
                if (event.touches !== undefined) {
                    return {
                        x : event.touches[0].pageX,
                        y : event.touches[0].pageY
                    };
                }

                if (event.touches === undefined) {
                    if (event.pageX !== undefined) {
                        return {
                            x : event.pageX,
                            y : event.pageY
                        };
                    }
                    if (event.pageX === undefined) {
                        return {
                            x : event.clientX,
                            y : event.clientY
                        };
                    }
                }
            }

            function swapEvents(type) {
                if (type === "on") {
                    $(document).on(base.ev_types.move, dragMove);
                    $(document).on(base.ev_types.end, dragEnd);
                } else if (type === "off") {
                    $(document).off(base.ev_types.move);
                    $(document).off(base.ev_types.end);
                }
            }

            function dragStart(event) {
                var ev = event.originalEvent || event || window.event,
                    position;

                if (ev.which === 3) {
                    return false;
                }
                if (base.itemsAmount <= base.options.items) {
                    return;
                }
                if (base.isCssFinish === false && !base.options.dragBeforeAnimFinish) {
                    return false;
                }
                if (base.isCss3Finish === false && !base.options.dragBeforeAnimFinish) {
                    return false;
                }

                if (base.options.autoPlay !== false) {
                    window.clearInterval(base.autoPlayInterval);
                }

                if (base.browser.isTouch !== true && !base.$owlWrapper.hasClass("grabbing")) {
                    base.$owlWrapper.addClass("grabbing");
                }

                base.newPosX = 0;
                base.newRelativeX = 0;

                $(this).css(base.removeTransition());

                position = $(this).position();
                locals.relativePos = position.left;

                locals.offsetX = getTouches(ev).x - position.left;
                locals.offsetY = getTouches(ev).y - position.top;

                swapEvents("on");

                locals.sliding = false;
                locals.targetElement = ev.target || ev.srcElement;
            }

            function dragMove(event) {
                var ev = event.originalEvent || event || window.event,
                    minSwipe,
                    maxSwipe;

                base.newPosX = getTouches(ev).x - locals.offsetX;
                base.newPosY = getTouches(ev).y - locals.offsetY;
                base.newRelativeX = base.newPosX - locals.relativePos;

                if (typeof base.options.startDragging === "function" && locals.dragging !== true && base.newRelativeX !== 0) {
                    locals.dragging = true;
                    base.options.startDragging.apply(base, [base.$elem]);
                }

                if ((base.newRelativeX > 8 || base.newRelativeX < -8) && (base.browser.isTouch === true)) {
                    if (ev.preventDefault !== undefined) {
                        ev.preventDefault();
                    } else {
                        ev.returnValue = false;
                    }
                    locals.sliding = true;
                }

                if ((base.newPosY > 10 || base.newPosY < -10) && locals.sliding === false) {
                    $(document).off("touchmove.owl");
                }

                minSwipe = function () {
                    return base.newRelativeX / 5;
                };

                maxSwipe = function () {
                    return base.maximumPixels + base.newRelativeX / 5;
                };

                base.newPosX = Math.max(Math.min(base.newPosX, minSwipe()), maxSwipe());
                if (base.browser.support3d === true) {
                    base.transition3d(base.newPosX);
                } else {
                    base.css2move(base.newPosX);
                }
            }

            function dragEnd(event) {
                var ev = event.originalEvent || event || window.event,
                    newPosition,
                    handlers,
                    owlStopEvent;

                ev.target = ev.target || ev.srcElement;

                locals.dragging = false;

                if (base.browser.isTouch !== true) {
                    base.$owlWrapper.removeClass("grabbing");
                }

                if (base.newRelativeX < 0) {
                    base.dragDirection = base.owl.dragDirection = "left";
                } else {
                    base.dragDirection = base.owl.dragDirection = "right";
                }

                if (base.newRelativeX !== 0) {
                    newPosition = base.getNewPosition();
                    base.goTo(newPosition, false, "drag");
                    if (locals.targetElement === ev.target && base.browser.isTouch !== true) {
                        $(ev.target).on("click.disable", function (ev) {
                            ev.stopImmediatePropagation();
                            ev.stopPropagation();
                            ev.preventDefault();
                            $(ev.target).off("click.disable");
                        });
                        handlers = $._data(ev.target, "events").click;
                        owlStopEvent = handlers.pop();
                        handlers.splice(0, 0, owlStopEvent);
                    }
                }
                swapEvents("off");
            }
            base.$elem.on(base.ev_types.start, ".owl-wrapper", dragStart);
        },

        getNewPosition : function () {
            var base = this,
                newPosition = base.closestItem();

            if (newPosition > base.maximumItem) {
                base.currentItem = base.maximumItem;
                newPosition  = base.maximumItem;
            } else if (base.newPosX >= 0) {
                newPosition = 0;
                base.currentItem = 0;
            }
            return newPosition;
        },
        closestItem : function () {
            var base = this,
                array = base.options.scrollPerPage === true ? base.pagesInArray : base.positionsInArray,
                goal = base.newPosX,
                closest = null;

            $.each(array, function (i, v) {
                if (goal - (base.itemWidth / 20) > array[i + 1] && goal - (base.itemWidth / 20) < v && base.moveDirection() === "left") {
                    closest = v;
                    if (base.options.scrollPerPage === true) {
                        base.currentItem = $.inArray(closest, base.positionsInArray);
                    } else {
                        base.currentItem = i;
                    }
                } else if (goal + (base.itemWidth / 20) < v && goal + (base.itemWidth / 20) > (array[i + 1] || array[i] - base.itemWidth) && base.moveDirection() === "right") {
                    if (base.options.scrollPerPage === true) {
                        closest = array[i + 1] || array[array.length - 1];
                        base.currentItem = $.inArray(closest, base.positionsInArray);
                    } else {
                        closest = array[i + 1];
                        base.currentItem = i + 1;
                    }
                }
            });
            return base.currentItem;
        },

        moveDirection : function () {
            var base = this,
                direction;
            if (base.newRelativeX < 0) {
                direction = "right";
                base.playDirection = "next";
            } else {
                direction = "left";
                base.playDirection = "prev";
            }
            return direction;
        },

        customEvents : function () {
            /*jslint unparam: true*/
            var base = this;
            base.$elem.on("owl.next", function () {
                base.next();
            });
            base.$elem.on("owl.prev", function () {
                base.prev();
            });
            base.$elem.on("owl.play", function (event, speed) {
                base.options.autoPlay = speed;
                base.play();
                base.hoverStatus = "play";
            });
            base.$elem.on("owl.stop", function () {
                base.stop();
                base.hoverStatus = "stop";
            });
            base.$elem.on("owl.goTo", function (event, item) {
                base.goTo(item);
            });
            base.$elem.on("owl.jumpTo", function (event, item) {
                base.jumpTo(item);
            });
        },

        stopOnHover : function () {
            var base = this;
            if (base.options.stopOnHover === true && base.browser.isTouch !== true && base.options.autoPlay !== false) {
                base.$elem.on("mouseover", function () {
                    base.stop();
                });
                base.$elem.on("mouseout", function () {
                    if (base.hoverStatus !== "stop") {
                        base.play();
                    }
                });
            }
        },

        lazyLoad : function () {
            var base = this,
                i,
                $item,
                itemNumber,
                $lazyImg,
                follow;

            if (base.options.lazyLoad === false) {
                return false;
            }
            for (i = 0; i < base.itemsAmount; i += 1) {
                $item = $(base.$owlItems[i]);

                if ($item.data("owl-loaded") === "loaded") {
                    continue;
                }

                itemNumber = $item.data("owl-item");
                $lazyImg = $item.find(".lazyOwl");

                if (typeof $lazyImg.data("src") !== "string") {
                    $item.data("owl-loaded", "loaded");
                    continue;
                }
                if ($item.data("owl-loaded") === undefined) {
                    $lazyImg.hide();
                    $item.addClass("loading").data("owl-loaded", "checked");
                }
                if (base.options.lazyFollow === true) {
                    follow = itemNumber >= base.currentItem;
                } else {
                    follow = true;
                }
                if (follow && itemNumber < base.currentItem + base.options.items && $lazyImg.length) {
                    base.lazyPreload($item, $lazyImg);
                }
            }
        },

        lazyPreload : function ($item, $lazyImg) {
            var base = this,
                iterations = 0,
                isBackgroundImg;

            if ($lazyImg.prop("tagName") === "DIV") {
                $lazyImg.css("background-image", "url(" + $lazyImg.data("src") + ")");
                isBackgroundImg = true;
            } else {
                $lazyImg[0].src = $lazyImg.data("src");
            }

            function showImage() {
                $item.data("owl-loaded", "loaded").removeClass("loading");
                $lazyImg.removeAttr("data-src");
                if (base.options.lazyEffect === "fade") {
                    $lazyImg.fadeIn(400);
                } else {
                    $lazyImg.show();
                }
                if (typeof base.options.afterLazyLoad === "function") {
                    base.options.afterLazyLoad.apply(this, [base.$elem]);
                }
            }

            function checkLazyImage() {
                iterations += 1;
                if (base.completeImg($lazyImg.get(0)) || isBackgroundImg === true) {
                    showImage();
                } else if (iterations <= 100) {//if image loads in less than 10 seconds 
                    window.setTimeout(checkLazyImage, 100);
                } else {
                    showImage();
                }
            }

            checkLazyImage();
        },

        autoHeight : function () {
            var base = this,
                $currentimg = $(base.$owlItems[base.currentItem]).find("img"),
                iterations;

            function addHeight() {
                var $currentItem = $(base.$owlItems[base.currentItem]).height();
                base.wrapperOuter.css("height", $currentItem + "px");
                if (!base.wrapperOuter.hasClass("autoHeight")) {
                    window.setTimeout(function () {
                        base.wrapperOuter.addClass("autoHeight");
                    }, 0);
                }
            }

            function checkImage() {
                iterations += 1;
                if (base.completeImg($currentimg.get(0))) {
                    addHeight();
                } else if (iterations <= 100) { //if image loads in less than 10 seconds 
                    window.setTimeout(checkImage, 100);
                } else {
                    base.wrapperOuter.css("height", ""); //Else remove height attribute
                }
            }

            if ($currentimg.get(0) !== undefined) {
                iterations = 0;
                checkImage();
            } else {
                addHeight();
            }
        },

        completeImg : function (img) {
            var naturalWidthType;

            if (!img.complete) {
                return false;
            }
            naturalWidthType = typeof img.naturalWidth;
            if (naturalWidthType !== "undefined" && img.naturalWidth === 0) {
                return false;
            }
            return true;
        },

        onVisibleItems : function () {
            var base = this,
                i;

            if (base.options.addClassActive === true) {
                base.$owlItems.removeClass("active");
            }
            base.visibleItems = [];
            for (i = base.currentItem; i < base.currentItem + base.options.items; i += 1) {
                base.visibleItems.push(i);

                if (base.options.addClassActive === true) {
                    $(base.$owlItems[i]).addClass("active");
                }
            }
            base.owl.visibleItems = base.visibleItems;
        },

        transitionTypes : function (className) {
            var base = this;
            //Currently available: "fade", "backSlide", "goDown", "fadeUp"
            base.outClass = "owl-" + className + "-out";
            base.inClass = "owl-" + className + "-in";
        },

        singleItemTransition : function () {
            var base = this,
                outClass = base.outClass,
                inClass = base.inClass,
                $currentItem = base.$owlItems.eq(base.currentItem),
                $prevItem = base.$owlItems.eq(base.prevItem),
                prevPos = Math.abs(base.positionsInArray[base.currentItem]) + base.positionsInArray[base.prevItem],
                origin = Math.abs(base.positionsInArray[base.currentItem]) + base.itemWidth / 2,
                animEnd = 'webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend';

            base.isTransition = true;

            base.$owlWrapper
                .addClass('owl-origin')
                .css({
                    "-webkit-transform-origin" : origin + "px",
                    "-moz-perspective-origin" : origin + "px",
                    "perspective-origin" : origin + "px"
                });
            function transStyles(prevPos) {
                return {
                    "position" : "relative",
                    "left" : prevPos + "px"
                };
            }

            $prevItem
                .css(transStyles(prevPos, 10))
                .addClass(outClass)
                .on(animEnd, function () {
                    base.endPrev = true;
                    $prevItem.off(animEnd);
                    base.clearTransStyle($prevItem, outClass);
                });

            $currentItem
                .addClass(inClass)
                .on(animEnd, function () {
                    base.endCurrent = true;
                    $currentItem.off(animEnd);
                    base.clearTransStyle($currentItem, inClass);
                });
        },

        clearTransStyle : function (item, classToRemove) {
            var base = this;
            item.css({
                "position" : "",
                "left" : ""
            }).removeClass(classToRemove);

            if (base.endPrev && base.endCurrent) {
                base.$owlWrapper.removeClass('owl-origin');
                base.endPrev = false;
                base.endCurrent = false;
                base.isTransition = false;
            }
        },

        owlStatus : function () {
            var base = this;
            base.owl = {
                "userOptions"   : base.userOptions,
                "baseElement"   : base.$elem,
                "userItems"     : base.$userItems,
                "owlItems"      : base.$owlItems,
                "currentItem"   : base.currentItem,
                "prevItem"      : base.prevItem,
                "visibleItems"  : base.visibleItems,
                "isTouch"       : base.browser.isTouch,
                "browser"       : base.browser,
                "dragDirection" : base.dragDirection
            };
        },

        clearEvents : function () {
            var base = this;
            base.$elem.off(".owl owl mousedown.disableTextSelect");
            $(document).off(".owl owl");
            $(window).off("resize", base.resizer);
        },

        unWrap : function () {
            var base = this;
            if (base.$elem.children().length !== 0) {
                base.$owlWrapper.unwrap();
                base.$userItems.unwrap().unwrap();
                if (base.owlControls) {
                    base.owlControls.remove();
                }
            }
            base.clearEvents();
            base.$elem
                .attr("style", base.$elem.data("owl-originalStyles") || "")
                .attr("class", base.$elem.data("owl-originalClasses"));
        },

        destroy : function () {
            var base = this;
            base.stop();
            window.clearInterval(base.checkVisible);
            base.unWrap();
            base.$elem.removeData();
        },

        reinit : function (newOptions) {
            var base = this,
                options = $.extend({}, base.userOptions, newOptions);
            base.unWrap();
            base.init(options, base.$elem);
        },

        addItem : function (htmlString, targetPosition) {
            var base = this,
                position;

            if (!htmlString) {return false; }

            if (base.$elem.children().length === 0) {
                base.$elem.append(htmlString);
                base.setVars();
                return false;
            }
            base.unWrap();
            if (targetPosition === undefined || targetPosition === -1) {
                position = -1;
            } else {
                position = targetPosition;
            }
            if (position >= base.$userItems.length || position === -1) {
                base.$userItems.eq(-1).after(htmlString);
            } else {
                base.$userItems.eq(position).before(htmlString);
            }

            base.setVars();
        },

        removeItem : function (targetPosition) {
            var base = this,
                position;

            if (base.$elem.children().length === 0) {
                return false;
            }
            if (targetPosition === undefined || targetPosition === -1) {
                position = -1;
            } else {
                position = targetPosition;
            }

            base.unWrap();
            base.$userItems.eq(position).remove();
            base.setVars();
        }

    };

    $.fn.owlCarousel = function (options) {
        return this.each(function () {
            if ($(this).data("owl-init") === true) {
                return false;
            }
            $(this).data("owl-init", true);
            var carousel = Object.create(Carousel);
            carousel.init(options, this);
            $.data(this, "owlCarousel", carousel);
        });
    };

    $.fn.owlCarousel.options = {

        items : 5,
        itemsCustom : false,
        itemsDesktop : [1199, 4],
        itemsDesktopSmall : [979, 3],
        itemsTablet : [768, 2],
        itemsTabletSmall : false,
        itemsMobile : [479, 1],
        singleItem : false,
        itemsScaleUp : false,
		customWidth: false,

        slideSpeed : 200,
        paginationSpeed : 800,
        rewindSpeed : 1000,

        autoPlay : false,
        stopOnHover : false,

        navigation : false,
        navigationText : ["prev", "next"],
        rewindNav : true,
        scrollPerPage : false,

        pagination : true,
        paginationNumbers : false,

        responsive : true,
        responsiveRefreshRate : 200,
        responsiveBaseWidth : window,

        baseClass : "owl-carousel",
        theme : "owl-theme",

        lazyLoad : false,
        lazyFollow : true,
        lazyEffect : "fade",

        autoHeight : false,

        jsonPath : false,
        jsonSuccess : false,

        dragBeforeAnimFinish : true,
        mouseDrag : true,
        touchDrag : true,

        addClassActive : false,
        transitionStyle : false,

        beforeUpdate : false,
        afterUpdate : false,
        beforeInit : false,
        afterInit : false,
        beforeMove : false,
        afterMove : false,
        afterAction : false,
        startDragging : false,
        afterLazyLoad: false
    };
}(jQuery, window, document));

$(document).ready(function () {
    // part of DSTORE-21277, js error fixing
    try {
        if (typeof carousalAutoplay != 'undefined' && $('#owl-prom1').length > 0) {
            $("#owl-prom1").owlCarousel({
                //navigation : true, // Show next and prev buttons
                slideSpeed: 300,
                paginationSpeed: 400,
                singleItem: true,
                pagination: true,
                autoPlay: carousalAutoplay,
                items: 3,
                navigation: false
            });
        }
    } catch (e) {
        console.log('syntax error' + e);
    }
});