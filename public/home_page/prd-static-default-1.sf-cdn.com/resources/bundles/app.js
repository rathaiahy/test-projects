//You can create your own allowed pattern and pass it as a parameter to allowedPatternValidation()

var allowedPatterns = {
    //allowed pattern for error message
    p1:/^[a-zA-Z0-9-'",_. ]+$/g,
    //Alpha Numerics only
    p2:/^[a-zA-Z0-9]+$/g,
    //Allowed patterns for URL parameter string
    p3:/^[a-zA-Z0-9-'",_.?:/&= ]+$/g,
    //Allowed patterns for location string
    p4:/^[a-zA-Z0-9-'",_.?:/&=|#!{} ]+$/g
};

function allowedPatternValidation(patt,str){
    try{
        if(str.match(allowedPatterns[patt]) ){
        	return true;
        } else {
            return false;
        }
    }
    catch(e){}
}// Foundation JavaScript
// Documentation can be found at: http://foundation.zurb.com/docs
//$(document).foundation();
/*if(typeof($(document).foundation) != "undefined")
{
$(document).foundation({
  orbit: {
    animation: 'slide',
    timer_speed: 1000,
    pause_on_hover: true,
    animation_speed: 500,
    navigation_arrows: true,
    bullets: false,
	  timer: false,
		slide_number: false,
variable_height: true
  }
});

}*/
var initialized = false;
//Favicon
var cdnHost;
if (typeof ns('cms') != 'undefined' && typeof ns('cms').cdn != 'undefined') {
  cdnHost = ns('cms').cdn;
}
if (typeof ns('cms') != 'undefined' && typeof ns('cms').locale != 'undefined') {
  var siteLocale = ns('cms').locale;
}
var langSite = siteLocale.substring(0, 2);

function getCookieVal(NameOfCookie) {
  //console.log("Calling getCookieVal for : " + NameOfCookie);
  if (document.cookie.length > 0) {
    begin = document.cookie.lastIndexOf(NameOfCookie + "=");
    if (begin != -1) {
      begin += NameOfCookie.length + 1;
      end = document.cookie.indexOf(";", begin);
      if (end == -1) end = document.cookie.length;
      return encodeURIComponent(unescape(document.cookie.substring(begin, end)));
    }
  }
  return null;
}

$(document).foundation();

/*$(window).load(function () {
  if (ns('cms').service != 'store' && ns('cms').service != 'create' && ns('cms').service != 'cart') {
    var c = encodeURIComponent(unescape(document.cookie.split(";")));
    var bip = [];

    try {

      var headStart = ns('cms').pageBeginTimer;
      var bodyStart = ns('cms').pageBodyTimer;
      var bodyEnd = ns('cms').pageEndTimer;
      var bodyOpen = bodyStart - headStart;
      var headerClose = ns('cms').pageHeaderTimer - headStart;
      var bodyClose = bodyEnd - headStart;

      if (!String.prototype.trim) {
        String.prototype.trim = function () {
          return this.replace(/^\s+|\s+$/g, '');
        };
      }
      if (!String.prototype.startsWith) {
        Object.defineProperty(String.prototype, 'startsWith', {
          enumerable: false,
          configurable: false,
          writable: false,
          value: function (searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
          }
        });
      }
      for (ii = 0; ii < c.length; ii++) { k = c[ii].split("="); var key = k[0].trim(); if (key.startsWith("bip")) { bip.push(k[1]) } }
      bip = bip.join(";");
      var tmz = new Date().toTimeString().split(" ")[1];
      bip = bip + "&tmz=" + tmz

    } catch (e) {
    }
    if (document.location.href.indexOf("library") != -1) {
      setTimeout(function () {
        BOOMR.init({
          beacon_url: ('https:' == document.location.protocol ? 'https://' : 'http://') + "store.snapfish.com/resources/images/dots.gif?device=" + store.deviceType + "&bip=" + bip + "&bodyOpen=" + bodyOpen + "&bodyClose=" + bodyClose + "&headerClose=" + headerClose + "&context=" + ns('cms').context + "&cdcr=" + store.isCrossDCSession + "&ls="+store.isUserLoggedIn,
          log: null, beacon_type: "GET", ResourceTiming: {
            enabled: false
          }
        });
      }, 2000);
    } else {
      BOOMR.init({
        beacon_url: ('https:' == document.location.protocol ? 'https://' : 'http://') + "store.snapfish.com/resources/images/dots.gif?device=" + store.deviceType + "&bip=" + bip + "&bodyOpen=" + bodyOpen + "&bodyClose=" + bodyClose + "&headerClose=" + headerClose + "&context=" + ns('cms').context + "&cdcr=" + store.isCrossDCSession+ "&ls="+store.isUserLoggedIn,
        log: null, beacon_type: "GET",
        ResourceTiming: {
          enabled: false
        }
      });
    }
  }
  else if (ns('cms').service == 'store') {
    var c = encodeURIComponent(unescape(document.cookie.split(";")));
    var bip = [];

    try {

      var headStart = ns('cms').pageBeginTimer;
      var bodyStart = ns('cms').pageBodyTimer;
      var bodyEnd = ns('cms').pageEndTimer;
      var bodyOpen = bodyStart - headStart;
      var headerClose = ns('cms').pageHeaderTimer - headStart;
      var bodyClose = bodyEnd - headStart;
      var noodle = ns('cms').noodle;

      var componentsResponseTime = "";
      for (key in ns('cms').componentMap) {
        componentsResponseTime = componentsResponseTime.concat("&", key, "=", ns('cms').componentMap[key]);
      }
      //console.log("components response time==>"+componentsResponseTime);


      if (!String.prototype.trim) {
        String.prototype.trim = function () {
          return this.replace(/^\s+|\s+$/g, '');
        };
      }
      if (!String.prototype.startsWith) {
        Object.defineProperty(String.prototype, 'startsWith', {
          enumerable: false,
          configurable: false,
          writable: false,
          value: function (searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
          }
        });
      }
      for (ii = 0; ii < c.length; ii++) { k = c[ii].split("="); var key = k[0].trim(); if (key.startsWith("bip")) { bip.push(k[1]) } }
      bip = bip.join(";");
      var tmz = new Date().toTimeString().split(" ")[1];
      bip = bip + "&tmz=" + tmz

    } catch (e) {
    }

    BOOMR.init({
      beacon_url: ('https:' == document.location.protocol ? 'https://' : 'http://') + ns("cms").siteHost + ns("cms").storeBasePath + "/resources/images/dots.gif?device=" + store.deviceType + "&bip=" + bip + "&bodyOpen=" + bodyOpen + "&bodyClose=" + bodyClose + "&headerClose=" + headerClose + "&noodle=" + noodle + componentsResponseTime + "&context=" + ns('cms').context + "&cdcr=" + store.isCrossDCSession+ "&ls="+store.isUserLoggedIn,
      log: null, beacon_type: "GET", ResourceTiming: {
        enabled: false
      }
    });
  }
});*/
// Product details page: set height to the div based on width

function setImageHeight(divName, listName, ImgName) {
  var divWidth = $(divName).width();

  if (divName == '.product-thumbnails > li') {
    //console.log('Enter 1');
    if (!$('.product-thumbnails > li').length) {
      //	console.log('Enter 2');	
      divWidth = $('.product-thumbnails').width();
    }
  }

  if (divWidth == 0)
    divWidth = $('.pdp-main').width();

  if (listName != "") {
    $(divName).height(divWidth);

    $(listName).height(divWidth);
    $(listName).width(divWidth);
  } else {
    $(divName).height(divWidth);
  }
  $(ImgName).css("max-width", divWidth);
  $(ImgName).css("max-height", divWidth);
}

$(window).load(function () {
  //$(".lockups .tile-carousel").css("max-height",$(".lockups .tile-carousel .product-tiles.owl-carousel .owl-item").height()+"px");
  setImageHeight("#product-height", "#product-height > .active", "#product-height > .active > img");
  setImageHeight(".product-thumbnails > li", ".product-thumbnails > li a", ".product-thumbnails > li > a > img");
  setImageHeight(".product-thumbnails-med > li", ".product-thumbnails-med > li a", ".product-thumbnails-med > li > a > img");
  setImageHeight(".product-thumbnails > li", ".product-thumbnails > li a", ".product-thumbnails > li > a > div.mug-thumb > img");
  setImageHeight(".product-thumbnails-med > li", ".product-thumbnails-med > li a", ".product-thumbnails-med > li > a > div.mug-thumb > img");
  $(".two-tile-video-js-1").css("height", $("#" + $("#two-tile-video-container-1").children().attr("id")).parent().parent().siblings().height() + "px");
  $(".two-tile-video-js-2").css("height", $("#" + $("#two-tile-video-container-2").children().attr("id")).parent().parent().siblings().children().height() + "px");
  $("#owlPdp .owl-item").css("line-height", $("#product-height").height() + "px");

  $(".three-tile-video-js-1").css("height", $("#" + $("#three-tile-video-container-1").children().attr("id")).parent().parent().siblings().height() + "px");
  $(".three-tile-video-js-2").css("height", $("#" + $("#three-tile-video-container-2").children().attr("id")).parent().parent().siblings().height() + "px");
  $(".two-tile-video-js-1").css("height", $("#" + $("#two-tile-video-container-1").children().attr("id")).parent().parent().siblings().height() + "px");
  $(".two-tile-video-js-2").css("height", $("#" + $("#two-tile-video-container-2").children().attr("id")).parent().parent().siblings().children().height() + "px");

  $(window).on("orientationchange resize", function () {
    setTimeout(function () {
      $(".three-tile-video-js-1").css("height", $("#" + $("#three-tile-video-container-1").children().attr("id")).parent().parent().siblings().height() + "px");
      $(".three-tile-video-js-2").css("height", $("#" + $("#three-tile-video-container-2").children().attr("id")).parent().parent().siblings().height() + "px");
      $(".two-tile-video-js-1").css("height", $("#" + $("#two-tile-video-container-1").children().attr("id")).parent().parent().siblings().height() + "px");
      $(".two-tile-video-js-2").css("height", $("#" + $("#two-tile-video-container-2").children().attr("id")).parent().parent().siblings().children().height() + "px");
    }, 1000);
  });

});

//category pages 
var iMemTimerId;
$(document).ready(function () {

  if (initialized) {
    return;
  }
  initialized = true;

  /* Starts : part of DSTORE-17363 */
  if (typeof ns('cms') != 'undefined' && typeof ns('cms').service != 'undefined' && ns('cms').service != "store" && ns('cms').service != "cart") {

    loadFavicon = function (href) {
      var favIconLink = $("<link rel='shortcut icon' type='image/x-icon' href='" + cdnHost + href + "'>");
      $("head").append(favIconLink);
    };

    if (typeof cobrandFavicon != "undefined" && cobrandFavicon != "") {
      loadFavicon(cobrandFavicon);
    } else if (typeof Favicon != "undefined" && Favicon != "") {
      loadFavicon(Favicon);
    }

  }
  /* End : part of DSTORE-17363 */
  if (isDefinedObj(ns('cms')) && isNotEmptyStr(ns('cms').service) && ns('cms').service === "store" && window.location.href.indexOf('/cart/') == -1) {
    //console.log("calling pushMonetateData method from store with page type --->" + ns('cms').monetatePageType);
    pushMonetateData({ "setPageType": ns('cms').monetatePageType });
  }

  $(".three-tile-video-js-1").css("height", $("#" + $("#three-tile-video-container-1").children().attr("id")).parent().parent().siblings().height() + "px");
  $(".three-tile-video-js-2").css("height", $("#" + $("#three-tile-video-container-2").children().attr("id")).parent().parent().siblings().height() + "px");
  //$(".three-tile-video-js-2").css("height",$("#three-tile-video-container-2").parent().siblings().height() + "px");
  $(".two-tile-video-js-1").css("height", $("#" + $("#two-tile-video-container-1").children().attr("id")).parent().parent().siblings().height() + "px");
  $(".two-tile-video-js-2").css("height", $("#" + $("#two-tile-video-container-2").children().attr("id")).parent().parent().siblings().children().height() + "px");

  $(".cms .four-tile-lockup .tile-l4-v1.hide").remove();
  $('.product-tiles.owl-carousel .hide').remove();

  if (document.location.protocol == "https:" && document.location.hostname == 'new.snapfish.com') {
    $('head').append('<link rel="dns-prefetch" href="//store1.snapfish.com"><link rel="dns-prefetch" href="//store2.snapfish.com"><link rel="dns-prefetch" href="//store3.snapfish.com"><link rel="dns-prefetch" href="//store4.snapfish.com">');
  }

  // Setting cookie when user click on pop-out link from Classic site from 2.0
  /*$('#yourAccountClassicSiteLink').click(function() {
    document.cookie = "v2msg=isv1;domain="+location.hostname.substring(location.hostname.indexOf('.'))+";path=/";
  });
*/
  /* cookiePrivacyInfoDiv
  $('.cookiePrivacyInfoDiv a').click(function () {
    var hostName = allowedPatternValidation("p1", window.location.hostname) ? window.location.hostname : '';
    var domainName = hostName.substr(hostName.indexOf('.'));
    domainName = "domain=" + domainName;
    var d = new Date();
    d.setTime(d.getTime() + (180 * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = "cookiePrivacyInfo=show;" + domainName + ";" + expires + ";path=/";
    $('.cookiePrivacyInfoDiv').hide();
  });

  if (typeof getCookieVal != 'undefined') {
    var cookiePrivacyInfoValue = getCookieVal('cookiePrivacyInfo');
    if (cookiePrivacyInfoValue != "show") {
      $('.cookiePrivacyInfoDiv').show();
    }
  }*/

  //Append prettySocial.js based on if social-container div exists
  if ($(".social-container .prettySocial")[0]) {
    appendJSDynamic(cdnHost + '/resources/js/widgets/social-plugins/prettySocial-master/jquery.prettySocial.js', "defer");
  }


  //$('html').attr( "manifest", ns('cms').cdn+"/resources/js/manifest.appcache" );

  //$(".cms-offcanvas").attr("data-offcanvas", "");
  //$(document).foundation('offcanvas', 'reflow');

  // extend the footer when pages has white space below of the footer
  /*
  $(window).load(function(){
    setTimeout(function(){ 
      extendFotter();
    }, 3000);
    $(window).on("resize scroll",function(e){
      if($(".globalfooter").hasClass("extend-to-bottom")){
        $(".extend-to-bottom").css("padding-bottom", '0');
      }
      extendFotter();
    });
    function extendFotter(){
      if($(".globalfooter").hasClass("extend-to-bottom")){
        var windowHeight = $(window).height();
        var pageHeight = $('html').height();
        var diffValue = windowHeight - pageHeight;
        if(diffValue > 0){
          $(".extend-to-bottom").css("padding-bottom", diffValue);
        } else {
          $(".extend-to-bottom").css("padding-bottom", '0');
        }
      }
    }
  });*/

  // show classic tab based on classicSiteFlag (feature.properties)
  // if (typeof ns('cms').classicSiteFlag != 'undefined' && ns('cms').classicSiteFlag == 'true') {
  //   if ($('.classic-tab').hasClass('hide')) {
  //     $('.classic-tab').show();
  //   }
  // }

  // show feeback overlay based on feedbackFlag (feature.properties)
  // if (typeof ns('cms').feedbackFlag != 'undefined' && ns('cms').feedbackFlag == 'true') {
  //   /*$('.help-feedback').hide();
  //   $('.form-panel').hide();
  //   if (!$("link[href*='feedback-classic-site-link']").length) {
  //     var fbhref= cdnHost+'/resources/css/header/feedback-classic-site-link/feedback-classic-site-link.css';
  //       $("<link href='"+fbhref+"' rel='stylesheet'>").appendTo("head");
  //   }*/
  //   if ($('.customer-feedback-form').hasClass('hide')) {
  //     $('.customer-feedback-form').show();
  //   }
  // }

  // Foresee code starts
  /*
  if (
    (typeof ns('cms').foreseeSurveyEnabled != 'undefined')
    && ns('cms').foreseeSurveyEnabled == 'true'
    && location.pathname != '/oauth2/auth'
    && (typeof getCookieVal != 'undefined')
    && getCookieVal('disableForseePopup') != 'false'
  ) {
    // Instructions: please embed this snippet directly into every page in your website template.
    // For optimal performance, this must be embedded directly into the template, not referenced
    // as an external file.

    // Answers Cloud Services Embed Script v1.02
    // DO NOT MODIFY BELOW THIS LINE *****************************************

    var forseeSurveySrc;
    if (typeof ns('cms').storeEnv != 'undefined') {
      if (ns('cms').storeEnv == "production" || ns('cms').storeEnv == "pre-prod") {
        forseeSurveySrc = "//gateway.answerscloud.com/snapfish/production/gateway.min.js";
      } else {
        forseeSurveySrc = "//gateway.answerscloud.com/snapfish/staging/gateway.min.js";
      }
    }

    ; (function (g) {
      var d = document, i, am = d.createElement('script'), h = d.head || d.getElementsByTagName("head")[0],
        aex = {
          "src": forseeSurveySrc,
          "type": "text/javascript",
          "async": "true",
          "data-vendor": "acs",
          "data-role": "gateway"
        };
      for (var attr in aex) { am.setAttribute(attr, aex[attr]); }
      h.appendChild(am);
      g['acsReady'] = function () { var aT = '__acsReady__', args = Array.prototype.slice.call(arguments, 0), k = setInterval(function () { if (typeof g[aT] === 'function') { clearInterval(k); for (i = 0; i < args.length; i++) { g[aT].call(g, function (fn) { return function () { setTimeout(fn, 1) }; }(args[i])); } } }, 50); };
    })(window);
    // DO NOT MODIFY ABOVE THIS LINE *****************************************
  }
  // Foresee staging code end    
*/

  // HeatMap code starts
  /* removing heatmap code, as the account is deactivated and not usefull in production now.
  if (typeof ns('cms').storeEnv != 'undefined' && ns('cms').storeEnv=='production' && typeof ns('cms').cobrand != 'undefined' && ns('cms').cobrand=='snapfish' && location.href.indexOf('/cart/') == -1){
    (function() {
      var hm = document.createElement('script'); hm.type ='text/javascript'; hm.async = true;
      hm.src = ('++u-heatmap-it+log-js').replace(/[+]/g,'/').replace(/-/g,'.');
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(hm, s);
    })();
  }
  */
  // HeatMap code end

  // persistUserSessionOnCrossDomains code starts
  if (typeof ns('cms').persistUserSessionOnCrossDomains != 'undefined' && ns('cms').persistUserSessionOnCrossDomains == 'true') {

    $('.countrylistDropDown .country a').click(function (event) {

      event.preventDefault();

      var countryLink = $(this).attr('href');
      var GSIDCookie;

      if (typeof getCookieVal != 'undefined') {
        GSIDCookie = getCookieVal('GSID');
      }
      if (typeof GSIDCookie != 'undefined' || GSIDCookie.trim() == "" || GSIDCookie == "null") {
        GSIDCookie = store.gsid;
      }

      $("body").append("<form id='countryForm' method='POST' action=''><input type='hidden' id='countryFormGSID' name='GSID' value='' /><input type='hidden' name='countryChanged' value='true' /> </form>");
      $("#countryForm").attr('action', countryLink);
      $("#countryForm #countryFormGSID").attr('value', GSIDCookie);
      $("#countryForm").submit();

    });

  }

  // persistUserSessionOnCrossDomains code end

  //Hide country dropdown for CSR code starts
  if (typeof store != 'undefined' && typeof store.isCsrUser != 'undefined' && store.isCsrUser == 'true') {
    $('.hideCsrCountryDropDown').hide();

  }
  //Hiding contry dropdown for CSR code ends

  // Starts : set dynamic max-height overlays's
  setOverlayContentHeight();

  $(window).resize(function () {
    setOverlayContentHeight();
  });

  function setOverlayContentHeight() {
    if ($('.cms.tacoverlay .overlay-flow')) {
      $('.cms.tacoverlay .overlay-flow').css('max-height', $(window).height() - 100);
    }
  }

  // end : set dynamic max-height overlays's  


  // tool-tip hide and show code start
  var clickedImg = "";
  $(".tool-tip").children("img").on("click", function () {
    if (clickedImg != '' && clickedImg == $(this).attr('id') && $(this).next().css('display') == 'block') {
      $(this).next().hide();
    } else {
      $(".tool-tip-content").hide();
      $(this).next().show();
    }
    clickedImg = $(this).attr('id');

    /*if($(".tool-tip-content").css('display') == 'none'){
      $(".tool-tip-content").show();
    }else{
      $(".tool-tip-content").hide();
    }*/
  });
  $('html').click(function (e) {
    //if clicked element is not your element and parents aren't your div
    if (e.target.id != 'image-tooltip' && $(e.target).parents('#image-tooltip').length == 0) {
      if ($(".tool-tip-content").css('display') == 'block') {
        e.stopPropagation();
      }
    }
  });
  $(document).bind('click touch', function (event) {
    if (!$(event.target).parents().addBack().is($(".tool-tip").children("img"))) {
      $(".tool-tip-content").hide();
    }
  });
  // tool-tip hide and show code end

  if (document.getElementById("feedbackForm")) {
    document.getElementById("feedbackForm").action = "javascript:void(0);";
  }



  /*if (getCookieVal("backdoorlogin") == null
    && typeof store != 'undefined'
    && typeof store.isUserLoggedIn != 'undefined'
    && store.isUserLoggedIn == 'true'
    && typeof store.isUserLoggedIn != 'undefined') {
    refreshIMemAccessToken();

    if (typeof iMemTimerId != "number") {
      iMemTimerId = setInterval(function () {
        refreshIMemAccessToken();
      }, 120000);
    }
  }*/

  function refreshIMemAccessToken() {
    var xmlhttp;
    if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else { // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          console.log(xmlhttp.responseText);
          var response = JSON.parse(xmlhttp.responseText);
          store.iMemAccessToken = response['access_token'];
        } else {
          console.log("Error refreshing the access_token. Status Code : " + xmlhttp.status);
          logout(true);
        }
      }
    }
    xmlhttp.open("POST", "//" + ns("cms").siteHost + ns("cms").storeURLPath + "/api/v1/refreshIMemAccessToken", true);
    //xmlhttp.withCredentials = true;
    xmlhttp.send();
  }

  /******** Header dropdown menu hover event - START ************/
  /* var children = "";
  if (!$('.shop-main-links ul').hasClass('touch-devices')) {
    
    $('.shop-main-links > ul > li').hover(function () {
      $(this).find('.active').focus();
      children = $(this).children('.shop-menu-dropdown');
      var imgEl = $('.shop-menu-dropdown img');
      for (var i = 0; i < imgEl.length; i++) {
        if (typeof imgEl[i].attributes['data-src'] != 'undefined') {
          imgEl[i].setAttribute('src', imgEl[i].attributes['data-src'].value);
          imgEl[i].removeAttribute('data-src');
        }
      }
      window.mytimeout = setTimeout(function () {
        children.css('opacity', 0).show().animate({ opacity: 1 }, 0);
      }, 300);
    }, function () {
      clearTimeout(window.mytimeout);
      try {
        children.css('opacity', 1).hide().animate({ opacity: 0 }, 0);
      } catch (e) {
        //to fix the Uncaught TypeError of children.css 
      }
    });

    $('.shop-main-links > ul > li a.shopmenu-main-links').keydown(function (e) {

      var key = e.which;
      // the Enter, Down Arrow, Up Arrow, Space key code
      if(key == 13 || key == 32 || key == 38 || key == 40 ){

        var imgEl = $('.shop-menu-dropdown img');

        for (var i = 0; i < imgEl.length; i++) {
          if (typeof imgEl[i].attributes['data-src'] != 'undefined') {
            imgEl[i].setAttribute('src', imgEl[i].attributes['data-src'].value);
            imgEl[i].removeAttribute('data-src');
          }
        }
      }

    });


  } */
  /******** Header dropdown menu hover event - END ************/

  /*var csrElement= document.getElementById("SECURITY_CSRFTOKEN");
   if(csrElement)
   {
       csrElement.value= store.securityCSRFToken;
   }*/

  /* omniture tracking enabler code for header links tracking starts */
  var hasBeenTracked = true;
  var elementTracked = null;

  function clickThis(elementTracked) {
    //console.log('click happened 2 ' + $(elementTracked).html());
    elementTracked[0].click();
  }

  function linkClickTrackingAlternate(inputLinkName) {
    if (typeof digitalData != 'undefined') {
      if (typeof digitalData.link != 'undefined') {
        digitalData.link.linkName = inputLinkName;
      } else {
        digitalData.link = {
          linkName: inputLinkName
        };
      }
      var omnitureEventObject = {
        eventInfo: {
          eventName: "linkClick"
        }
      }
      if (typeof digitalData.event != 'undefined') {
        //digitalData.event.push(omnitureEventObject);
      }
    }
  }

  $('.omnituretrackthis').css('cursor', 'pointer').unbind('click')
    .on('click', function (event) {
      try {
        elementTracked = $(this);
        //console.log($(this).html() + hasBeenTracked);
        //console.log("this is " + elementTracked);
        //console.log('click happened 1 ' + $(elementTracked).html());
        if (hasBeenTracked) {
          event.preventDefault();
          if (typeof linkClickTracking != 'undefined') {
            linkClickTracking($(this).attr('omniture-data-id').toUpperCase());
          } else {
            linkClickTrackingAlternate($(this).attr('omniture-data-id').toUpperCase());
          }
          if (!$(elementTracked).attr('data-dropdown') && !(!isNotEmptyStr($(elementTracked).attr('href')) || $(elementTracked).attr('href').indexOf('void(0)') != -1 || $(elementTracked).attr('href') == '#')) {
            hasBeenTracked = false;
            setTimeout(clickThis, 300, elementTracked);
          }
        } else {
          hasBeenTracked = true;
        }
      } catch (e) {
        statusLogger.error().type("app.js").key("Omnituretracking").action("omniture id not exists").state("fail").cause("error-occured").addParameter(e).not_ok();
      }
    });

  /* omniture tracking enabler code for header links tracking ends */


  /* localStorage for login/reg tracking START */

  /*
    var prevLogin = window.localStorage.getItem("snapfish.user.previousLogin");
    if(typeof(prevLogin) == "undefined") {
      if (getCookieVal("oa2") != null) {
        window.localStorage.setItem("snapfish.user.previousLogin", "true");
      }
    } else if(!prevLogin) {
      if (getCookieVal("oa2") != null) {
        window.localStorage.setItem("snapfish.user.previousLogin", "true");
      }
    }
  */

  /* localStorage for login/reg tracking END */
	/*$("#carousal-overlay").css("visibility","visible");
	$("#carousal-overlay").css("display","block");
	$("#carousal-overlay").css("top","90px");*/
  /*
 $("#carousal-overlay").css({
       'visibility':'visible',
       'top': '90px',
       'display': 'block'  
       });
 $("#carousal-overlay").addClass("open");


  if (typeof(currentPage) != "undefined") {
     if (currentPage == 'home') {
   $('.reveal-modal-bg').css("display","block");
 }
   }*/

  /* START - Added to realod the page when browser back button is clicked*/
  var e = document.getElementById("page_refreshed");
  if (e && e.value == "no") e.value = "yes";

  else {
    if (e) {
      e.value = "no";
      if (typeof (store) != 'undefined' && typeof (store.isUserLoggedIn) != "undefined") {
        //if ((store.isUserLoggedIn == "false" && getCookieVal("oa2") != null) || (store.isUserLoggedIn == "true" && getCookieVal("oa2") == null))
        //location.reload();}}}
      }
    }
  }


  /*END - code to reload the page when browser back button is pressed*/

  // add .cms-v2 class if not start 
  if ($('div').hasClass('ls-canvas')) {
    $('.ls-canvas').removeClass("header-off-canvas off-canvas-wrap");
    $('.ls-canvas').closest("html").addClass("header-off-canvas off-canvas-wrap cms-offcanvas");
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      $('.ls-canvas').closest("html").addClass("header-off-canvas off-canvas-wrap cms-offcanvas ios-offcanvas");
    } else {
      $('.ls-canvas').closest("html").addClass("header-off-canvas off-canvas-wrap cms-offcanvas");
    }
    if ($('.cms-v2 .header-container a').hasClass('left-off-canvas-toggle')) {
      $('.ls-canvas').closest("body").addClass("inner-wrap");
    }
    //commenting the following line to fix the DSTORE-21481
    //$('.ls-canvas').closest("body").append('<a class="exit-off-canvas"></a>');
  }
  // add .cms-v2 class if not end

  // Close offcanvas when clicked of main content
  $("a.exit-off-canvas").bind("touchmove", function (e) {
    e.preventDefault();
    if ($(".cms-offcanvas").hasClass("move-right")) {
      $(".cms-offcanvas").removeClass("move-right");
    }
  });

  $(".left-off-canvas-menu").bind("touchmove", function (e) {
    if (!$(e.target).closest('.offcanvas-links').length) {
      e.preventDefault();
    }
  });

  /*$('.offcanvas-links').on('touchstart', function() {
    var el = $(this);
    if ( el.scrollTop() <= 0 ) {
      el.scrollTop(1);
    }
    if ( el.scrollTop() >= el[0].scrollHeight ) {
      el.scrollTop(el[0].scrollHeight - 1);
    }
  });*/

  // off canvas btm-link code end
  $(window).on("orientationchange", function (e) {
    var w = window.innerWidth;
    var h = window.innerHeight;

    if (w > 1023) {
      if ($(".cms-offcanvas").hasClass("move-right")) {
        $(".cms-offcanvas").removeClass("move-right");
      }
    } else {

      switch (window.orientation) {
        case -90:
        case 90:
          $('#carousal-overlay').foundation('reveal', 'close');
          $('#videoModal').foundation('reveal', 'close');
          break;
        default:
          //alert('portrait');
          break;
      }

      $('#userDropDown').css('left', '-99999px');
      // $('#libraryAddPhotos').css('left', '-99999px');
      $('#countrylistDropDown').css('left', '-99999px');
      if ($('#userDropDown').hasClass('open')) {
        $('#userDropDown').removeClass('open');
      }
      // if ($('#libraryAddPhotos').hasClass('open')) {
      //   $('#libraryAddPhotos').removeClass('open');
      // }
      if ($('#countrylistDropDown').hasClass('open')) {
        $('#countrylistDropDown').removeClass('open');
      }
    }
  });

  // In loggin session, append no.projects count to projects link
  if (typeof store != 'undefined' && typeof store.isUserLoggedIn != 'undefined') {
    var cacheBuster = new Date().getTime();  //Get timestamp
    var isUserDetailsOn = ns('cms').isUserDetailsResourceOn;
    //console.log("userdetailsOn : " + isUserDetailsOn + " storeisUserLoggedIn : " + store.isUserLoggedIn);

    if (
      (store.isUserLoggedIn == 'true') ||
      ((typeof (store.isGuestCheckoutEnabled) != 'undefined') && (store.isGuestCheckoutEnabled == "true"))
    ) {

      if (typeof service != 'undefined' && service == 'library') {
        setTimeout(function () {
          if (ns('cms').isHttponlyCookieEnabled != "undefined" && ns('cms').isHttponlyCookieEnabled == 'true') {
            populateHeaderInfoData("//" + ns("cms").siteHost + ns("cms").storeURLPath + "/api/v1/userdetails?cb=" + cacheBuster);
          } else {
            populateHeaderInfoData("//" + ns("cms").siteHost + ns("cms").storeURLPath + "/api/v1/userdetails?GSID=" + getCookieVal("GSID") + "&cb=" + cacheBuster);
          }
        }, 2000);
      }

      else if (typeof service != 'undefined' && service == 'create') {
        if (ns('cms').isHttponlyCookieEnabled != "undefined" && ns('cms').isHttponlyCookieEnabled == 'true') {
          if (isUserDetailsOn == 'true') {
            populateHeaderInfoData("//" + ns("cms").siteHost + ns("cms").storeURLPath + "/api/v1/userdetails?cb=" + cacheBuster);
          } else {
            setHeaderInfoData("//" + ns("cms").siteHost + ns("cms").storeURLPath + "/api/v1/user-info?cb=" + cacheBuster, "firstName");
            setHeaderInfoData("//" + ns("cms").siteHost + ns("cms").storeURLPath + "/api/v1/cart-count?cb=" + cacheBuster, "cartCount");
          }
        }
        else {
          if (isUserDetailsOn == 'true') {
            populateHeaderInfoData("//" + ns("cms").siteHost + ns("cms").storeURLPath + "/api/v1/userdetails?GSID=" + getCookieVal("GSID") + "&cb=" + cacheBuster);
          } else {
            setHeaderInfoData("//" + ns("cms").siteHost + ns("cms").storeURLPath + "/api/v1/user-info?GSID=" + getCookieVal("GSID") + "&cb=" + cacheBuster, "firstName");
            setHeaderInfoData("//" + ns("cms").siteHost + ns("cms").storeURLPath + "/api/v1/cart-count?GSID=" + getCookieVal("GSID") + "&cb=" + cacheBuster, "cartCount");
          }
        }
      }

      else {
        if (ns('cms').isHttponlyCookieEnabled != "undefined" && ns('cms').isHttponlyCookieEnabled == 'true') {
          populateHeaderInfoData("//" + ns("cms").siteHost + ns("cms").storeURLPath + "/api/v1/userdetails?cb=" + cacheBuster);
        } else {
          populateHeaderInfoData("//" + ns("cms").siteHost + ns("cms").storeURLPath + "/api/v1/userdetails?GSID=" + getCookieVal("GSID") + "&cb=" + cacheBuster);
        }
      }
    } else { //store.isUserLoggedIn = 'false'
      $('#carousel-page').removeClass('hide');
    }
  }
  // take sigin/login to loginto page for desktop
  //$('#globalHeaderSignInRegister').click(function(){
  $("#globalHeaderSignInRegister").unbind();
  $('#globalHeaderSignInRegister').on('click', function () {
    redirectURL('loginto');
  });


  // take sigin/login to loginto page for device
  //$('#deviceHeaderSignInRegister').click(function(){
  $('#deviceHeaderSignInRegister').on('click', function () {
    redirectURL('loginto');
  });

  if ($('#globalHeaderMyProjects')) {
    var myProjUrl = ns('cms').libraryProjectsHost;
    //$("#globalHeaderMyProjects").attr("href",pUrl+"?website="+ns('cms').website+"&cobrand="+ns('cms').cobrand+"&locale="+ns('cms').locale);
    $("#globalHeaderMyProjects").attr("href", "javascript:void(0);");
    $("#globalHeaderMyProjects").click(function () {
      checkLoggedInAndOpen(myProjUrl + "?website=" + ns('cms').website + "&cobrand=" + ns('cms').cobrand + "&locale=" + ns('cms').locale);
    });
  }

  if ($('#deviceHeaderMyProjects')) {
    $("#deviceHeaderMyProjects").attr("href", 'javascript:void(0);');
    var myProjUrl = ns('cms').libraryProjectsHost;
    //$("#deviceHeaderMyProjects").attr("href",pUrl+"?website="+ns('cms').website+"&cobrand="+ns('cms').cobrand+"&locale="+ns('cms').locale);
    //$("#deviceHeaderMyProjects").removeAttr("href");
    $("#deviceHeaderMyProjects").click(function () {
      checkLoggedInAndOpen(myProjUrl + "?website=" + ns('cms').website + "&cobrand=" + ns('cms').cobrand + "&locale=" + ns('cms').locale);
    });

  }

  if ($('#globalHeaderMyPhotos')) {
    var myPhotoUrl = ns('cms').libraryPhotosHost;
    //$("#globalHeaderMyPhotos").attr("href",pUrl+"?website="+ns('cms').website+"&cobrand="+ns('cms').cobrand+"&locale="+ns('cms').locale);
    $("#globalHeaderMyPhotos").attr("href", "javascript:void(0);");
    $("#globalHeaderMyPhotos").click(function () {
      checkLoggedInAndOpen(myPhotoUrl + "?website=" + ns('cms').website + "&cobrand=" + ns('cms').cobrand + "&locale=" + ns('cms').locale);
    });
  }

  /* if($('#uploadMyPhotos'))
   {
      var pUrl  = ns('cms').libraryPhotosHost;
      pUrl += "?website="+ns('cms').website+"&cobrand="+ns('cms').cobrand+"&locale="+ns('cms').locale;
      if ($('#albumIdForAlbumsView') )
        pUrl += '{"pgvw":"siav","aid":'+$('#albumIdForAlbumsView').val()+'}';
      $("#uploadMyPhotos").attr("href",pUrl);
   }*/

  if ($('#deviceHeaderMyPhotos')) {
    var myPhotoUrl = ns('cms').libraryPhotosHost;
    //$("#deviceHeaderMyPhotos").attr("href",pUrl+"?website="+ns('cms').website+"&cobrand="+ns('cms').cobrand+"&locale="+ns('cms').locale);
    $("#deviceHeaderMyPhotos").removeAttr("href");
    $("#deviceHeaderMyPhotos").click(function () {
      checkLoggedInAndOpen(myPhotoUrl + "?website=" + ns('cms').website + "&cobrand=" + ns('cms').cobrand + "&locale=" + ns('cms').locale);
    });
  }

  if ($('#myPhotosBtn')) {
    var pUrl = ns('cms').libraryPhotosHost;
    $("#myPhotosBtn").attr("href", pUrl + "?website=" + ns('cms').website + "&cobrand=" + ns('cms').cobrand + "&locale=" + ns('cms').locale);
  }

  if ($('#myProjectsBtn')) {
    var pUrl = ns('cms').libraryProjectsHost;
    $("#myProjectsBtn").attr("href", pUrl + "?website=" + ns('cms').website + "&cobrand=" + ns('cms').cobrand + "&locale=" + ns('cms').locale);
  }

  // show zendeskOffMessage for desktop full + plain headers,offcanvas and footer
  $('#globalHeaderHelp, #deviceHeaderHelp, #globalFooterHelp').on('click', function () {
    if ($('#zendeskOffMessage')) {
      $('#zendeskOffMessage').foundation('reveal', 'open');
    }
  });

  //$('#deviceHeaderBackLink').click(function(){
  $('#deviceHeaderBackLink').on('click', function () {
    window.history.go(-1);
  });
  if (document.getElementById("libraryAddPhotos") != null) {
    var addPhotosMenu = document.getElementById("libraryAddPhotos").cloneNode(true);
    addPhotosMenu.id = "cloneLibAddPhotos";
    var divEl = document.createElement("div");
    divEl.setAttribute("class", "cms-v2");
    divEl.appendChild(addPhotosMenu);
    document.body.appendChild(divEl);
  }

  /* Code to open upload layer on loading the page*/
  var navUrl = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for (var i = 0; i < navUrl.length; i++) {
    var urlparam = navUrl[i].split('=');
    if (urlparam[0] == "libAction") {
      var libActionKey = decodeURIComponent(urlparam[1].toLowerCase());
      if (libActionKey.indexOf('#') != -1) {
        libActionKey = libActionKey.split('#')[0];
      }
      // if (store.library != 'undefined' &&
      //     store.library.addPhotos.flag == true) {
      if (store.library != 'undefined') {
        store.library.addPhotos.open_upload_layer_on_pageLoading(libActionKey);
        console.log("triggered open_upload_layer_on_pageLoading from sf app.js, from on loading the page ");
      }
      break;
    }
  }
  $(window).load(function(){
  // Code to call Monetate Integrate when value in not empty
    if (typeof monetateSrc != "undefined" && monetateSrc != "") {
      appendJSDynamic(monetateSrc, 'async');
    }
  
    // Code to call feedback-v2
    if (typeof feedbackv2Src != "undefined" && feedbackv2Src != "") {
      appendJSDynamic(feedbackv2Src, 'async');
    }
  
    // Code to call smart banner only or Android devices
    if (typeof showsmartbanner != 'undefined' && showsmartbanner == 'true' && navigator.userAgent.match(/Android/i)) {
      appendJSDynamic(sb.JS, "defer");
      appendCSSDynamic(sb.CSS);
    }
  
    // Code to call form-validation.js
    if (typeof formvalidationSrc != "undefined" && formvalidationSrc != "") {
      appendJSDynamic(formvalidationSrc, 'async');
    }
  });
  
  // jQuery('#orderPrints').on('click', function () {
  //   openOrderPrints();
  // });
  // jQuery('#uploadMore').on('click', function () {
  //   uploadMore();
  // });
  // jQuery('#uploadMyPhotos').on('click', function () {
  //   viewPhotos();
  // });
  // jQuery('#uploadMyPhotos-device').on('click', function () {
  //   viewPhotos();
  // });

  /* store locator close event */
  $('.store-locator-link').on('click', function () {
    $('body.inner-wrap').addClass('overite-overflow');
  });
  $('#desktop-banner a').attr("tabindex", 1);
});


$(function () {

  setImageHeight("#product-height", "#product-height > .active", "#product-height > .active > img");
  setImageHeight(".product-thumbnails > li", ".product-thumbnails > li a", ".product-thumbnails > li > a > img");
  setImageHeight(".product-thumbnails-med > li", ".product-thumbnails-med > li a", ".product-thumbnails-med > li > a > img");
  $("#owlPdp .owl-item").css("line-height", $("#product-height").height() + "px");
  $("#product-height .orbit-container").css("overflow", "hidden");
  $("#product-height .orbit-container").height($("#product-height").width());
  $("#product-height .orbit-container").height($("#product-height").width());

  if ($('#header-offcanvas-menu').hasClass('main-offcanvas')) {
    $("body").addClass("f-topbar-fixed");
  }

  /* Offcanvas add scrollbar if window height is lower than the content 
      var windowH = $(window).height();
      var wrapperH = $('ul.off-canvas-list').height();
      $('ul.off-canvas-list').css("overflow-y","scroll");
      if(windowH < wrapperH) {         
          $('ul.off-canvas-list').css({
              'height':($(window).height())-20+'px'
          });
      }   
      
       $(window).resize(function(){
          var windowH = $(window).height();
          var wrapperH = $('ul.off-canvas-list').height();
          if(windowH > wrapperH) {         
              $('ul.off-canvas-list').css({'height':'auto'});
          } else {
              $('ul.off-canvas-list').css({'height':($(window).height())-20+'px'});
          }         
      }); */
});


// Tile Ratio START


var tile4Width = $(".tile-4").width();
var tile4Height = (450 / 690) * tile4Width;
tile4Height = tile4Height.toFixed();

//if(tile4Width)
$(".tile-4 > .variation-1").height(tile4Height);
$(".tile-4 > .variation-2").height(tile4Height);
$(".tile-4 > .variation-1").width(tile4Width);
$(".tile-4 > .variation-2").width(tile4Width);

$(window).resize(function () {

  var tile4Width = $(".tile-4").width();
  var tile4Height = (450 / 690) * tile4Width;
  tile4Height = tile4Height.toFixed();

  $(".tile-4 > .variation-1").height(tile4Height);
  $(".tile-4 > .variation-2").height(tile4Height);
  $(".tile-4 > .variation-1").width(tile4Width);
  $(".tile-4 > .variation-2").width(tile4Width);

  setImageHeight("#product-height", "#product-height > .active", "#product-height > .active > img");
  setImageHeight(".product-thumbnails > li", ".product-thumbnails > li a", ".product-thumbnails > li > a > img");
  setImageHeight(".product-thumbnails-med > li", ".product-thumbnails-med > li a", ".product-thumbnails-med > li > a > img");
  setImageHeight(".product-thumbnails > li", ".product-thumbnails > li a", ".product-thumbnails > li > a > div.mug-thumb > img");
  setImageHeight(".product-thumbnails-med > li", ".product-thumbnails-med > li a", ".product-thumbnails-med > li > a > div.mug-thumb > img");
  $("#product-height .orbit-container").height($("#product-height").width());
  $("#owlPdp .owl-item").css("line-height", $("#product-height").width() + "px");
  $("#product-height").css("height", $("#product-height").width() + "px");
  if (navigator.platform.indexOf("iPhone") != -1) {
    $(".pdp-main").css("margin-bottom", "0px");
    $("#owlPdp .owl-item").css("line-height", $("#owlPdp .owl-item").width() + "px");
    $("#product-height").css("height", "auto");
  }
});


$(window).on("orientationchange", function () {
  setImageHeight("#product-height", "#product-height > .active", "#product-height > .active > img");
  setImageHeight(".product-thumbnails > li", ".product-thumbnails > li a", ".product-thumbnails > li > a > img");
  setImageHeight(".product-thumbnails-med > li", ".product-thumbnails-med > li a", ".product-thumbnails-med > li > a > img");
  if (navigator.platform.indexOf("iPhone") != -1) {
    $(".pdp-main").css("margin-bottom", "0px");
    $("#owlPdp .owl-item").css("line-height", $("#owlPdp").closest('.columns').width() + "px");
    $("#product-height").css("height", "auto");
  }
});

// Tile Ratio END


// Header Dropdown start

$(".dropdown-menu").hover(function () {
  $('.main-dropdown').css("visibility", "visible");
  $('.dropdown-menu > a > .dropdown-arrow').css("visibility", "visible");
});

$(".main-dropdown > .close").click(function () {
  $('.main-dropdown').css("visibility", "hidden");
  $('.dropdown-menu > a > .dropdown-arrow').css("visibility", "hidden");
});

// Header Dropdown end

// Your Account start 
$("dl.account-tabs > dd").click(function () {
  $(this).slideDown(function () {
    $(this).show().parent().append(this);
  });
});

// Your Account end


// Photobooks Page 

$(".link").click(function () {
  if ($(this).hasClass("fadeInForward")) {
    $(this).removeClass("fadeInForward").addClass("fadeOutback");
  }
  if ($(".child").hasClass("slidePageBackLeft")) {
    $(".child").removeClass("slidePageBackLeft").addClass("slidePageInFromRight");
  } else {
    $(".child").addClass("slidePageInFromRight");
  }
});
$(".close").click(function () {
  $(".link").addClass("fadeInForward");
  $(".child").removeClass("slidePageInFromRight").addClass("slidePageBackLeft");
});

$(".tile-3 .variation-1").height($(".tile-3").width());
$(".tile-3 .variation-1 .top-section img").css("max-height", ($(".tile-3").width() / 2) - 10);

$(window).resize(function () {
  $(".tile-3 .variation-1").height($(".tile-3").width());

  $(".tile-3 .variation-1 .top-section img").css("max-height", ($(".tile-3").width() / 2) - 10);
});

// Photobooks page end

//header toggle off-canvas

$(".header-off-canvas #ls-row-2").append('<a class="exit-off-canvas"></a>');
//$(".header-off-canvas #ls-row-1").addClass("headerpadding");

$(".header .left-off-canvas-menu").height($(document).height());

$(window).resize(function () {

  $(".header .left-off-canvas-menu").height($(document).height());
});

// Header off-canvas for library team
$(".header-off-canvas .left-off-canvas-toggle").click(function () {
  // Fix for DSTORE-21319
  $(".tool-tip-content").hide();
  if ($(".photo-Org").hasClass("move-right")) {
    $(".photo-Org").removeClass("move-right");
  } else {
    $(".photo-Org").addClass("move-right");
  }
});

/*alert($(".photo-Org .exit-off-canvas"));
$(".photo-Org .exit-off-canvas").click(function(){
alert("test");
	$(".photo-Org").removeClass("move-right");
});*/

$(".photo-Org .exit-off-canvas").on("click", function () {
  alert("test");
  $(".photo-Org").removeClass("move-right");
});

// Accordion
/*$(".tiles-links.accordion dd").click( function() {
	$('.tile-active').not(this).children('.content').removeClass('active');
	$('.tile-active').not(this).removeClass('tile-active');
	$(this).children('.content').toggleClass('active');
	$(this).toggleClass('tile-active');
});*/

$(".tiles-links.accordion dd").click(function () {
  if ($(this).children('.content').hasClass('active')) {
    $(this).children('.content').removeClass('active');
  } else {
    $(".tiles-links.accordion dd .content").removeClass('active')
    $(this).children('.content').addClass('active');
  }
  $('.tile-active').not(this).removeClass('tile-active');
  $(this).toggleClass('tile-active');
});

$(".category-shipping .accordion dd.accordion-navigation a.shipping-price-accordion").click(function () {
  //$(this).parent().addClass('caret-active'); 
  if ($(this).parent().children('.content').hasClass('active')) {
    $(this).parent().removeClass('caret-active');
  } else {
    $(this).parent().addClass('caret-active');
  }
});

function relative_sticky(id, topSpacing) {

  if (!topSpacing) { var topSpacing = 0; }
  var el_top = parseFloat(document.getElementById(id).getBoundingClientRect().top);
  el_top = el_top - parseFloat(document.getElementById(id).style.top);
  el_top = el_top * (-1);
  el_top = el_top + topSpacing;

  if (el_top > 0) {
    document.getElementById(id).style.top = el_top + "px";
  } else {
    document.getElementById(id).style.top = "0px";
  }
}



//window.onscroll = function(){
//relative_sticky("header-offcanvas-menu", 0);
//$("#header-offcanvas-menu").css("top", $('#header-offcanvas-menu').offset().top);	
//}

//overlay
/*
if($('#pickUpInStore').length) {
	$('.tabs').height($('.panel-container').height());
}*/

/* To remove Default Font based on the cookie starts*/
renderDefaultFont(); // To remove default-font-to-render elements

$(window).load(function () { // To remove the addtional <style> tag added by ModPageSpeedFilter
  renderDefaultFont();
  /* re-initializing foundtion to fix DSTORE-14179 */
  $(document).foundation();
  $(document).foundation("equalizer", "reflow");
  $("html").attr({ "lang": langSite });
});

if (document.cookie.indexOf("async_fl_") == -1) {
  var hostName = allowedPatternValidation("p1", window.location.hostname) ? window.location.hostname : '';
  document.cookie = "async_fl_=true;domain=" + hostName.substring(hostName.indexOf('.')) + ";path=/";
}

function renderDefaultFont() {
  if (document.cookie.indexOf("async_fl_") != -1) { // async_fl_ is true
    checkDefaultFontElements();
  } else { // async_fl_ is false
    console.log("in settimeout");
    setTimeout(function () {
      checkDefaultFontElements();
    }, 1500); // time in milliseconds
  }
}

function checkDefaultFontElements() {
  if (document.getElementsByClassName("default-font-to-render").length > 0) {
    console.log("found: default-font-to-render");
    var elements = document.getElementsByClassName("default-font-to-render");
    console.log("length before remove: " + elements.length);
    while (elements.length > 0) {
      elements[0].parentNode.removeChild(elements[0]);
      console.log("removed: default-font-to-render");
    }
    console.log("length after remove: " + elements.length);
  }
}
/* To remove Default Font based on the cookie ends*/

//To append JS Dynamically to head
function appendJSDynamic(src, attr) {
  var jsref = document.createElement('script');
  jsref.setAttribute("type", "text/javascript");
  if (attr == "defer") {
    jsref.setAttribute("defer", "defer");
  }
  if (attr == "async") {
    jsref.setAttribute("async", "async");
  }
  jsref.setAttribute("src", src);
  document.head.appendChild(jsref);
}

// To append CSS Dynamically to head
function appendCSSDynamic(src) {

  var cb = function () {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = src;
    var h = document.getElementsByTagName('head')[0]; h.parentNode.insertBefore(l, h);
  };
  var raf = requestAnimationFrame || mozRequestAnimationFrame || webkitRequestAnimationFrame || msRequestAnimationFrame;
  if (raf) raf(cb);
  else window.addEventListener('load', cb);
}

function overlayScrollToElement(linkId, triggeredElem, linkTarget) {
  var linkTargetPosition = $("#" + linkTarget.split("#")[1]).position();
  if (linkTargetPosition != null && linkTargetPosition != 'undefined' && linkTargetPosition.top != 'undefined') {
    $('.overlay-flow').stop().animate({
      scrollTop: linkTargetPosition.top
    }, 800);
    try {
      setTimeout(function () { $("#" + linkTarget.split("#")[1] + " a[href='#top']").focus(); }, 100);
    } catch (e) { }
  }
  else {
    if (typeof triggeredElem != 'undefined') {
      try {
        setTimeout(function () { storeWCAG.Utils.focusFirstDescendant(document.getElementById(linkId)); }, 100);
      } catch (e) { }

    }
  }
  $(".overlay-flow a[href='#top']").stop().click(function () {
    $('.overlay-flow').animate({
      scrollTop: 0
    }, 800);
    try {
      storeWCAG.Utils.focusFirstDescendant(document.getElementById(linkId));
    } catch (e) { }
    event.preventDefault();
  });
}

// Copied from footerOverlay.js
//function for dynamic content in overlay
function getOverlayContent(linkId, linkTarget) {
  var triggeredElem = document.activeElement;
  //alert("getOverlayContent");
  if (linkId != 'ConsentOverlay') {
    $('#closerevealmodalId').removeClass('hide');
  }
  if (linkId = 'ConsentOverlay') {
    Foundation.libs.reveal.settings.close_on_esc = false;
  }
  //$(document).foundation();
  var overlayDivs = document.getElementsByClassName("div_id");
  overlayDivs[0].id = linkId;
  //$('#linkId').foundation('reveal', 'open');
  //$("#"+linkId).unbind();
  /*if(service == 'cart') {
    $("#"+linkId).foundation('reveal', 'open');
  }*/
  //if(bgDeactive) {
  //  Foundation.libs.reveal.settings.close_on_background_click = false;
  //		Foundation.libs.reveal.settings.close_on_esc = false;
  //  $(document).foundation();
  //}

  $("#" + linkId).foundation('reveal', 'open');
  var innerDivId = "inner" + linkId;
  var innerDivs = document.getElementsByClassName("inner")
  innerDivs[0].id = innerDivId;
  var targetArray = linkTarget.split(":");
  if (targetArray.length > 1) {
    try {
      storeWCAGOpenDialog(linkId, triggeredElem, $("#" + linkTarget.split("#")[1] + " a[href='#top']"), 'foundation');
    } catch (e) { }
    $.get(targetArray[1], function (data) {
      innerDivs[0].innerHTML = data;
      overlayScrollToElement(linkId, triggeredElem, linkTarget);
    });
  }
  else {
    try {
      storeWCAGOpenDialog(linkId, triggeredElem, null, 'foundation');
    } catch (e) { }
    $.get(targetArray[0], function (data) {
      innerDivs[0].innerHTML = data;
      overlayScrollToElement(linkId, triggeredElem, linkTarget);
    });
  }
  var loadingTextObj = "";
  if (document.getElementById("loadingTxt_hidden") != null)
    loadingTextObj = allowedPatternValidation("p1", document.getElementById("loadingTxt_hidden").value) ? decodeURIComponent(encodeURIComponent(document.getElementById("loadingTxt_hidden").value)) : '';
  if (loadingTextObj == null || loadingTextObj.trim() == "" || loadingTextObj == 'undefined' || loadingTextObj == undefined)
    loadingTextObj = "Loading..."
  innerDivs[0].innerHTML = "<h5 class='text-center'>" + loadingTextObj + "</h5> <br/>";
}

/*
 * changeSEOPageTitle function will take title value and replace the first option in page title
 */

changeSEOPageTitle = function (longTitle) {
  try {
    var pageTitle = document.title;
    var values = pageTitle.split("|");
    values = values.map(Function.prototype.call, String.prototype.trim);

    Array.prototype.contains = function (element) {
      element = element.toString().toLowerCase();
      var thisValue = this.toString().toLowerCase();
      return thisValue.indexOf(element) > -1;
    };

    if (!values.contains(longTitle)) {
      values[0] = longTitle;
      var updateTitle = values.join([separator = ' | ']);
      document.title = updateTitle;
      if ($('meta[property="og:title"]').attr('content').length != 0) {
        $('meta[property="og:title"]').attr('content', updateTitle);
      }
    }
  } catch (e) {
    businessLogger.error().key("app.js").noodle().env().service("store").errorCode("PageTitle_Update_Failed").errorId().description("Failed to updated the page title in PDP pages").context().origin("store").logMessage();
  }
}

// setting acctID coockie for Zendesk SSO
if (typeof store != 'undefined' && typeof store.acctId != 'undefined') {
  var hostName = allowedPatternValidation("p1", window.location.hostname) ? window.location.hostname : '';
  document.cookie = "acctId=" + store.acctId + ";domain=" + hostName.substring(hostName.indexOf('.')) + ";path=/";
}

//Fix to prevent zooming of pages in Ipad version above 10
document.addEventListener('gesturestart', function (e) {
  e.preventDefault();
});
var sizeButton;
/// Global Dropdown START //
var globalDropdownInitialise = function (id) {
  var globalDDWrapper = '#' + id;
  var globalDDUl = '#' + id + '.sf-global-dropdown ul';
  var globalDDListItem = '#' + id + '.sf-global-dropdown .clickable';
  var globalDDSelectedItem = '.selected-option';
  var disabledClassName = 'disabled';
  
  // Adding tabindex to dropdown
  if($(globalDDSelectedItem).hasClass("accessibleDiv")) {
    $(globalDDSelectedItem).attr('tabindex', '0');
    $(globalDDSelectedItem).focus(function(e){
    if($(this).hasClass("accessibleDiv")) {
      try{
      if(!$(this).hasClass("init-done")){
        sizeButton = new storeWCAGMenuButton(this, openSizeDropDown, closeSizeDropDown);
        //sizeButton.init();
        $(this).addClass("init-done");
        //document.getElementById('selectedSizeDiv').trigger('keydown');
      }
      //else
      //{
        //sizeButton.destroy();
        //sizeButton.reinit(this);
      //}
    }catch(e){}
    }
  });
  }
  else
  {
    $(globalDDWrapper).attr('tabindex', '0');
  }
  $(globalDDListItem).attr('tabindex', '0');

  // Toggling the List items
  $(globalDDWrapper).unbind().click(function (e) {
    if (!$(this).hasClass(disabledClassName)) {
      $(e.currentTarget).find('ul').toggle();
      $(this).toggleClass('active');
    }
  });

  // Setting the selected value and adding active on clicking the list items
  $(globalDDListItem).click(function () {
    if (!$(this).hasClass(disabledClassName)) {
      if ($(this).attr('value') != undefined && $(this).attr('value') != 'undefined' && $(this).attr('value') != '') {
        var htmlValue = allowedPatternValidation('p1', $(this).attr('value')) ? decodeURIComponent(encodeURIComponent($(this).attr('value'))) : '';
        $(this).closest(globalDDWrapper).find(globalDDSelectedItem).html(htmlValue);
        $(this).closest(globalDDWrapper).find(globalDDSelectedItem).attr('title', htmlValue);
      }
      $(globalDDListItem).removeClass('active');
      $(this).addClass('active');
    }
  });

  // Removing the active class and closing list item on clicking outside 
  $(document).on("click touchstart", function (event) {
    var $trigger = $(globalDDWrapper);
    if ($trigger !== event.target && !$trigger.has(event.target).length) {
      $(globalDDUl).hide();
      $(globalDDWrapper).removeClass('active');
    }
  });

  // keyboard events for dropdown
  $(document).keypress(function (e) {
    if ($(e.target).hasClass('sf-global-dropdown')) {
      if (e.which == 13 || e.keyCode == 13) {
        $(e.target).find('ul').toggle();
        $(e.target).toggleClass('active');
      }
    }
    if ($(e.target).hasClass('clickable')) {
      if (e.which == 13 || e.keyCode == 13) {
        $(e.target)[0].click();
      }
    }
  });
}
/// Global Dropdown END //

/* Globalheader JS Start */
//JavaScript Document
var noOfProjects = -1;
var noOfPhotos = 0;
var photoUploadType = "";
var replacedCobrandName = ns('cms').cobrand.replace(/[-]/g, "");
if (store.useSessionStorageForUserData == 'true' && location.href.indexOf("signup") == -1 && location.href.indexOf("loginto") == -1) {
  if (localStorage.getItem(ns('cms').storeEnv.replace(/-/g, "") + "_" + replacedCobrandName + "_" + ns('cms').website + "_userData") == undefined) {
    localStorage.setItem(ns('cms').storeEnv.replace(/-/g, "") + "_" + replacedCobrandName + "_" + ns('cms').website + "_userData", JSON.stringify(store));
  }
  else if (Math.floor(Date.now()) - store.timeStamp >= 900000 && ns('cms').service == 'store' && location.href.indexOf("/cart/") == -1 && location.href.indexOf("/library/") == -1 && location.href.indexOf("/create/") == -1 && location.pathname != '/oauth2/auth') {
    $.ajax({
      async: true,
      type: "GET",
      url: "//" + ns("cms").siteHost + ns("cms").storeURLPath + '/api/v1/cd-build-number?context=' + ns('cms').context,
      contentType: "application/json",
      dataType: "json",
      success: function (response) {
        if (localStorage.getItem(ns('cms').storeEnv.replace(/-/g, "") + "_" + replacedCobrandName + "_" + ns('cms').website + "_userData") != undefined) {
          var sessionObj = JSON.parse(localStorage.getItem(ns('cms').storeEnv.replace(/-/g, "") + "_" + replacedCobrandName + "_" + ns('cms').website + "_userData"));
          sessionObj.buildNumber = response;
          sessionObj.timeStamp = Math.floor(Date.now());
          localStorage.setItem(ns('cms').storeEnv.replace(/-/g, "") + "_" + replacedCobrandName + "_" + ns('cms').website + "_userData", JSON.stringify(sessionObj));
          //console.log(response);
        }
      }
    });
  }
}
if (location.href.indexOf("signup") != -1 || location.href.indexOf("loginto") != -1 || location.href.indexOf("receipt") != -1) {
  localStorage.removeItem(ns('cms').storeEnv.replace(/-/g, "") + "_" + replacedCobrandName + "_" + ns('cms').website + "_userData");
}
if (store.isGuestCheckoutEnabled == "true" && getCookieVal("isGuest") == "true") {
  if (localStorage.getItem(ns('cms').storeEnv.replace(/-/g, "") + "_" + replacedCobrandName + "_" + ns('cms').website + "_userData") != undefined) {
    var localStorageStoreObj = JSON.parse(localStorage.getItem(ns('cms').storeEnv.replace(/-/g, "") + "_" + replacedCobrandName + "_" + ns('cms').website + "_userData"));
    if (localStorageStoreObj.isUserLoggedIn == "false" && getCookieVal(replacedCobrandName + "_" + ns('cms').storeEnv.replace(/-/g, "") + "_loggedin") == "true") {
      //console.log("here here");
      document.cookie = replacedCobrandName + "_" + ns('cms').storeEnv.replace(/-/g, "") + "_loggedin" + '=' + "false" + ';domain=' + ns('cms').cookiedomain + '; path=/';
      //$.cookie(, "false", { domain  : ns('cms').cookiedomain});
    }
  }
}
function removeSessionStorageData(targetUrl) {
  localStorage.removeItem(ns('cms').storeEnv.replace(/-/g, "") + "_" + replacedCobrandName + "_" + ns('cms').website + "_userData");
  document.location.href = targetUrl;
}

function loginRegAction(loginRegUrl) {
  localStorage.removeItem(ns('cms').storeEnv.replace(/-/g, "") + "_" + replacedCobrandName + "_" + ns('cms').website + "_userData");
  var landingUrl = document.location.href;
  var targetUrl = "https://" + document.location.host + loginRegUrl + "?next=" + encodeURIComponent(landingUrl);
  document.location.href = targetUrl;
}

$(function () {
  function isiPhone() {
    return (
      (navigator.platform.indexOf("iPhone") != -1) ||
      (navigator.platform.indexOf("iPod") != -1) ||
      (navigator.platform.indexOf("iPad") != -1)
    );
  }

  /*if (isiPhone()) {
    // Fix alignment issues for fixed element when focused on input elements (textfields)
    $globalHeader = $('.global-header');
    $deviceHeader = $('.device-global-header');
    $inputs = $('input');
    $select = $('select');

    $("body").delegate("select", "focus blur", function () {
      var elem = $(this);
      //console.log("fixfixed : " + elem);
      setTimeout(function () {
        $globalHeader.toggleClass("fixfixed", elem.is(":focus"));
        $deviceHeader.toggleClass("fixfixed", elem.is(":focus"));
      }, 0);
    });

    $("body").delegate("input[type=text], input[type=password], input[type=email]", "focus blur", function () {
      var elem = $(this);
      //console.log("fixfixed : " + elem);
      setTimeout(function () {
        $globalHeader.toggleClass("fixfixed", elem.is(":focus"));
        $deviceHeader.toggleClass("fixfixed", elem.is(":focus"));
      }, 0);
    });

    $("body").delegate("textarea", "focus blur", function () {
      var elem = $(this);
      //console.log("fixfixed : " + elem);
      setTimeout(function () {
        $globalHeader.toggleClass("fixfixed", elem.is(":focus"));
        $deviceHeader.toggleClass("fixfixed", elem.is(":focus"));
      }, 0);
    });

  }*/

  var body = $(document.body);
  body.bind("touchstart", function (event) {
    if ((navigator.platform.indexOf("iPhone") != -1) || (navigator.platform.indexOf("iPod") != -1)) {
      var scrollCurTopPos = $(window).scrollTop();
      $(window).scrollTop(scrollCurTopPos - 0.1);
    }
  });

  $(".classic-site-tab .tab").on('touchstart', function () {
    $(".classic-site-tab").hasClass(".classic-site-tab:hover")
    {
      $(".classic-site-tab").removeClass(".classic-site-tab:hover");
      $(".classic-site-tab").addClass(".classic-site-tab active");
    }
  });

  /*$(".global-header .header-row-03 .shop-main-links li").hover(function(){
    //On Hover - Works on ios
    $(this).children(".shop-menu-dropdown").show();
  }, function(){
      //Hover Off - Hover off doesn't seem to work on iOS
    $(this).children(".shop-menu-dropdown").hide();
  });*/


  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {

    $(".global-header .header-row-03 .shop-main-links ul").addClass("touch-devices");

    $('.global-header .header-row-03 .shop-main-links li a.shopmenu-main-links').click(function (e) {
      e.preventDefault();
    });

    $('.global-header .header-row-03 .shop-main-links li a.shopmenu-main-links').on('touchstart', function (e) {
      if ($(e.target).closest("li").hasClass("dropdown-active")) {
        window.location.href = this;
      }
      if ($(".global-header .header-row-03 .shop-main-links li").hasClass("dropdown-active")) {
        $(".global-header .header-row-03 .shop-main-links li").removeClass("dropdown-active");
      }
      $(this).closest("li").addClass("dropdown-active");
    });

    $('body').on('touchstart', function (e) {
      var container = $(".global-header .header-row-03 .shop-main-links ul");
      try{
        header_DM_swapDataSrc();
       }catch (e) {
        console.log("header_DM_swapDataSrc, syntax error Tab/Mobile devices" + e);
       }
      if (!container.is(e.target) && container.has(e.target).length === 0) {
        $(".global-header .header-row-03 .shop-main-links li").removeClass("dropdown-active");
      }
    });

  }

  // Header shrink js code starts
  /* ============== COMMENTED TEMPORARY ==============
    if(location.pathname=="/photo-gift/home"){

      //if (Modernizr.touch) { 
      if(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))
      {
        $('.global-header').addClass('shrink');
        $('.global-header .header-shopnav-inner').css("position", "fixed");
        $('.global-header .header-shopnav .header-mask-02').css("display", "block");
      } else {

      
          $(window).scroll(function() {
          $headerMask01Height = $('.global-header .header-mask-01').height();
          $headerMask02Height = $('.global-header .header-shopnav .header-mask-02').height();

          // get the height of shop sub nav
          $shopShopNavHeight = $(".global-header .header-shopnav").innerHeight(); 
          $shopNavScrollTopPos = $('.global-header .header-shopnav').offset().top;

          if ($(this).scrollTop() > ($shopNavScrollTopPos - $shopShopNavHeight)){  
            $('.global-header .header-shopnav-inner').css('position','fixed');
            $('.global-header .header-shopnav-inner').addClass('shopnav-fixed');
            $('.global-header .header-shopnav .header-mask-02').css("display",'block');
            $('.shop-menu-dropdown').removeAttr('style');
            $('.global-header .header-row-01 .logo').css({
              'opacity' : '1',
              'text-indent' : '0'       
            });
            }else{
            $('.global-header .header-shopnav-inner').removeAttr('style');
            $('.global-header .header-shopnav-inner').removeClass('shopnav-fixed');
            $('.global-header .header-shopnav .header-mask-02').css("display",'none');
            $('.shop-menu-dropdown').css({
              'top': $shopNavScrollTopPos + $shopShopNavHeight - $(window).scrollTop() - 2
              });
            $('.global-header .header-row-01 .logo').removeAttr('style');
            }

        });

      }

    }
  */
  // Header shrink js code end


  // offcanvas - add photos options expand and collapse
  // $("#deviceAddPhotos").closest("li").unbind().click(function () {
  //   //e.preventDefault();
  //   $("#addPhotosOption").slideToggle();
  // });

  // offcanvas - Countrylist expand and collapse
  $("#deviceCountryListActive").closest("li").unbind().click(function () {
    //e.preventDefault();
    $("#deviceCountryListMenu").slideToggle();
  });
  $('#deviceCountryListActive').keydown(function (e) {
    if (e.keyCode == 13) {
      var ariaVal = $("#deviceCountryListActive").attr('aria-expanded');
      if (ariaVal != '' && ariaVal == 'false') {
        $('#deviceCountryListActive').attr('aria-expanded', 'true');
      }
      else {
        $('#deviceCountryListActive').attr('aria-expanded', 'false');
      }
    }
  });
  /*$('#deviceCountryListActive').keydown(function (e) {
    if(e.keyCode == 13) {
      if($($('#deviceCountryListMenu a')[0]).hasClass('wcag-mb-links')) {
        $('#deviceCountryListMenu a').removeClass('wcag-mb-links');
        $("#deviceCountryListMenu").hide();
      }
      else
      {
        $('#deviceCountryListMenu a').addClass('wcag-mb-links');
        $("#deviceCountryListMenu").show();
      }
      if(typeof offcanvasButton !='undefined' && offcanvasButton!=undefined) {
        offcanvasButton.reinit();
      }
      $("#deviceCountryListMenu").slideToggle();

    }
    /*var styleValue = $('#deviceCountryListMenu').attr('style');
    if(e.keyCode == 40 && styleValue!='undefined' && styleValue!='' && styleValue.indexOf('display: block')!=-1) {
      $('#deviceCountryListMenu').find('a')[0].focus();
      e.preventDefault();
      e.stopPropagation();
    }
  });*/

  // close offcanvas if offcanvas is open and clicked on header banners 
  $('.header-banner').click(function (e) {
    if ($('.cms-offcanvas').hasClass('move-right')) {
      $('.cms-offcanvas').removeClass('move-right');
    }
  });

  // off canvas btm-link code starts
  leffOffCanvasBtmLink();

  $(window).resize(function () {
    leffOffCanvasBtmLink();
  });

  /*// get url params code starts
  $.urlParam = function(name) {
    var results = new RegExp('[\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
    return (results != null) ? results[1] : 0;
  }
  if ($.urlParam('theme') === "white") {
    $('body').addClass("theme-white");
  } else {
    if ($('body').hasClass("theme-white")) {

      $('body').removeClass("theme-white");
    }
  }
  // get url params code end*/

  $("#div").addClass("error").delay(1000).queue(function () {
    $(this).removeClass("error").dequeue();
  });


  // shop submenu selected link on hover starts
  /*$('.shop-main-links li').hover(
    function () {
      $(this).delay(2000).queue(function(){
        $(this).addClass("show-menu").dequeue();
    });
    },
    function () {
      $(".shop-main-links li").removeClass("show-menu");
    }
  );*/
  // shop submenu selected link end

});

function redirectURL(url, libAction) {

  if ((document.location.href.indexOf("signup") > 0) && !libAction) {
    document.location.href = document.location.href.replace("signup", "loginto").replace("submit", "sub");
  } else {
    var navUrl = document.location.href;
    var hashBangURL = '';
    if (location.href.indexOf("#!/") != -1) {
      var locationHrefURL = location.href;
      navUrl = navUrl.substring(0, locationHrefURL.indexOf("#!/"));
      hashBangURL = locationHrefURL.substring(locationHrefURL.indexOf("#!/"), locationHrefURL.length);
    }
    if (location.href.indexOf("#/") != -1) {
      var locationHrefURL = location.href;
      navUrl = navUrl.substring(0, locationHrefURL.indexOf("#/"));
      hashBangURL = locationHrefURL.substring(locationHrefURL.indexOf("#/"), locationHrefURL.length);
    }
    if (libAction) {
      if (navUrl.indexOf("?") != -1)
        navUrl += "&libAction=" + libAction;
      else
        navUrl += "?libAction=" + libAction;
    }

    /* Right now we are not supposed to show login / reg based on 
     * if the user has logged in before or not, so commenting it
    if (getCookieVal("snapfish.user.previousLogin") != null &&
      getCookieVal("snapfish.user.previousLogin") == "true") {
      url = "loginto";
    } else {
      url = "signup";
    }
    */

    /*
    var hasLoggedIn = window.localStorage.getItem("snapfish.user.previousLogin");
    if(hasLoggedIn && hasLoggedIn === "true") {
      url = "loginto";
    } else {
      url = "signup";
    }
    */
    url = "https://" + ns('cms').siteHost + ns('cms').storeBasePath + "/" + url;


    if (url === "loginto") {
      url = "https://" + document.location.host + ns('cms').storeBasePath + "/" + url;
    }


    document.location.href = url + "?next=" + encodeURIComponent(navUrl + hashBangURL);
  }
  //  document.location.href = url + "?next=" +encodeURIComponent(document.location.href);
}


var showPromotionPreference = store.showPromotionPreference;

function getAccessToken(name) {
  console.log("Calling getAccessToken for : " + name);
  if (document.cookie.length > 0) {
    var fullCookie = document.cookie;
    var splitCookie = fullCookie.split("; " + name + "=");
    if (splitCookie.length == 2) {
      var cookieValue = splitCookie[1].split("; ")[0];
      return unescape(cookieValue);
    }
  }
  return null;
}

function setHeaderInfoData(url, tag) {
  if (ns('cms').isDEVLSDSHost == "true") {
    url = url.replace("https", "http");
  }
  var gsidIdx = url.indexOf("?GSID=");
  if (url && (url.indexOf("?GSID=") != -1)) {
    var gsid = url.substring(gsidIdx + 6, url.indexOf("&cb="));
    if (gsid && gsid != "null") {
      var xmlhttp;
      if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
      } else { // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
      }
      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          var response = xmlhttp.responseText;
          setDataInDOM(tag, response);

        }
      }
      xmlhttp.open("GET", url, true);
      xmlhttp.send();
    } else {
      setDataInDOM(tag, "");
    }
  }

}

function setDataInDOM(tag, response) {
  if (tag == 'projectCount') {
    if (response && response != "") {
      if ($('#globalHeaderMyProjects').find('span').length == 0) {
        $('#globalHeaderMyProjects').append("<span style='padding-left:3px'>(" + response + ")</span>");
      }
      if (document.getElementById("myProjectsBtn")) {
        $('#myProjectsBtn').append("<span style='padding-left:4px'>(" + response + ")</span>");
      }
      if (document.getElementById("projectHeading")) {
        if (document.getElementById("projCnt")) {
          $('#projCnt').append(response);
        }
        $('#projectHeading').removeAttr('style');
      }
      if ($('#deviceHeaderMyProjects').find('span').length == 0) {
        $('#deviceHeaderMyProjects').append("<span style='padding-left:3px'>(" + response + ")</span>");
      }
      noOfProjects = parseInt(response);
      /*if (noOfProjects == 0 && noOfPhotos == 0) {
            $('#welcome-page').removeClass('hide');
          }*/
      /*if (noOfProjects > 0){
        $('#quickstart-page').removeClass('hide');
        $('#carousel-page').removeClass('hide'); 
        $('#welcome-page').addClass('hide');
      }*/
    }
  }

  if (tag == 'firstName') {
    var gMsg = "";
    var fName = "";
    if (response != null && response != undefined) {
      if ((response == "") && store.firstName)
        fName = store.firstName;
      else
        fName = JSON.parse(response);
    }
    if (document.getElementById("globalHeaderUserMenu")) {
      var firstNode = document.getElementById("globalHeaderUserMenu").childNodes[0];
      if (firstNode.tagName == "SPAN") {
        if (emailOnlyReg && fName == "First Name") {
          gMsg = greetingMsg.replace(",", "");
        } else {
          gMsg = greetingMsg + " " + fName;
        }
        if (fName == null || (fName != null && fName.toLowerCase() == "null")) {
          gMsg = greetingMobMsg.replace(",", "");
        }

        if (navigator.userAgent.match(/(iPad);.*CPU.*OS 7_\d/i)) {
          //alert('ipad');
          $(firstNode).before(gMsg);
          $('.header-row-01 .user-name a').css("text-indent", "1px");
          setTimeout(function () {
            $('.header-row-01 .user-name a').css("text-indent", "");
          }, 10);
        } else {
          $(firstNode).before(gMsg);
          //alert('ipad else');
        }

      }
    }
    if ($('#deviceHeaderUserName').length) {
      if (emailOnlyReg && fName == "First Name") {
        gMsg = greetingMobMsg.replace(",", "");
      } else {
        gMsg = greetingMobMsg + " " + fName;
      }
      if (fName == null || (fName != null && fName.toLowerCase() == "null")) {
        gMsg = greetingMobMsg.replace(",", "");
      }
      $('#deviceHeaderUserName')[0].innerHTML = gMsg;
    }
  }

  if (tag == 'cartCount' && response && (response != "") && response != '0') {
    $('#globalHeaderCart').removeAttr('aria-label');
    if ($('#globalHeaderCart').find('span').length == 0) {

      $('#globalHeaderCart').append("<span>" + response + "<em class='content-for-sr'>" + cartitemsin + "</em>" + "</span>");
    }
    if ($('#deviceHeaderCart').find('span').length == 0) {
      $('#deviceHeaderCart').append("<span>" + response + "</span>");
    }

  }

  if (tag == 'notificationCount' && response && (response != "") && response != '0' && window.location.search.indexOf("tab=tab-5") == -1) {
    $('#globalHeaderUserMenu').removeAttr('aria-label');
    if ($('#globalHeaderUserMenu').find('span').length == 1) {
      console.log("In notification count inner-if" + response);
      $('#globalHeaderUserMenu').append("<span class='count-circle'>" + response + "<em class='content-for-sr'>" + orderitemsin + "</em>" + "</span>");
      $('.unreadCount').text("(" + response + ")");
    }
  }

  /* if (tag == 'photoCount' &&  response && (response != "") && response != '0' ) {  
     photoResponse = JSON.parse(response);
     console.log("In photo count inner-if" + photoResponse["userPhotosCount"]);
     if  (photoResponse["userPhotosCount"] != null)
       noOfPhotos = photoResponse["userPhotosCount"];
     
     if (noOfProjects == 0 && noOfPhotos == 0) {
         $('#welcome-page').removeClass('hide');
       }   
       if (noOfProjects > 0 || noOfPhotos > 0){
         $('#quickstart-page').removeClass('hide');
         $('#carousel-page').removeClass('hide'); 
       }
   }*/

}

function populateHeaderInfoData(url) {
  var xmlhttp;
  if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  } else { // code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      var response = JSON.parse(xmlhttp.responseText);
      Object.keys(response).forEach(function (key) {
        //console.log("api-key:" + key);
        // For ProjectCount
        if (key == 'projectCount') {
          if (response[key] != null && response[key] != undefined && response[key] != '') {
            if ($('#globalHeaderMyProjects').find('span').length == 0) {
              $('#globalHeaderMyProjects').append("<span style='padding-left:3px'>(" + response[key] + ")</span>");
            }
            if (document.getElementById("myProjectsBtn")) {
              $('#myProjectsBtn').append("<span style='padding-left:4px'>(" + response[key] + ")</span>");
            }
            if (document.getElementById("projectHeading")) {
              if (document.getElementById("projCnt")) {
                $('#projCnt').append(response[key]);
              }
              $('#projectHeading').removeAttr('style');
            }
            if ($('#deviceHeaderMyProjects').find('span').length == 0) {
              $('#deviceHeaderMyProjects').append("<span style='padding-left:3px'>(" + response[key] + ")</span>");
            }
            noOfProjects = parseInt(response[key]);
            /*if (noOfProjects == 0 && noOfPhotos == 0) {
                    $('#welcome-page').removeClass('hide');
                }  
                if (noOfProjects > 0 ){
                  $('#quickstart-page').removeClass('hide');
                  $('#carousel-page').removeClass('hide'); 
                  $('#welcome-page').addClass('hide');
                }*/
          }
        }

        if ($('#globalHeaderUserMenu')) {
          $('#globalHeaderUserMenu').removeAttr('aria-label');
        }

        // For CartCount
        if (key == 'cartCount' && response[key] != '0' && response[key] != null && response[key] != undefined && response[key] != '') {
          $('#globalHeaderCart').removeAttr('aria-label');
          if ($('#globalHeaderCart').find('span').length == 0) {
            $('#globalHeaderCart').append("<span>" + response[key] + "<em class='content-for-sr'>" + cartitemsin + "</em>" + "</span>");
          }
          if ($('#deviceHeaderCart').find('span').length == 0) {
            $('#deviceHeaderCart').append("<span>" + response[key] + "</span>");
          }
        }

        // For UserInfo
        if (key == 'firstName') {
          var gMsg = "";
          var fName = "";
          if (response[key] != null && response[key] != undefined) {
            fName = response[key];
          }
          if (document.getElementById("globalHeaderUserMenu")) {
            var firstNode = document.getElementById("globalHeaderUserMenu").childNodes[0];
            if (firstNode.tagName == "SPAN") {
              if (emailOnlyReg && fName == "First Name") {
                gMsg = greetingMsg.replace(",", "");
              } else {
                gMsg = greetingMsg + " " + fName;
              }
              if (fName == null || (fName != null && fName.toLowerCase() == "null")) {
                gMsg = greetingMobMsg.replace(",", "");
              }
              if (navigator.userAgent.match(/(iPad);.*CPU.*OS 7_\d/i)) {
                //alert('ipad');
                $(firstNode).before(gMsg);
                $('.header-row-01 .user-name a').css("text-indent", "1px");
                setTimeout(function () {
                  $('.header-row-01 .user-name a').css("text-indent", "");
                }, 10);
              } else {
                $(firstNode).before(gMsg);
                //alert('ipad else');
              }
            }
          }
          if ($('#deviceHeaderUserName').length) {
            if (emailOnlyReg && fName == "First Name") {
              gMsg = greetingMobMsg.replace(",", "");
            } else {
              gMsg = greetingMobMsg + " " + fName;
            }
            if (fName == null || (fName != null && fName.toLowerCase() == "null")) {
              gMsg = greetingMobMsg.replace(",", "");
            }
            if ($('#deviceHeaderUserName')[0] != undefined) {
              $('#deviceHeaderUserName')[0].innerHTML = gMsg;
            }
          }
        }

        // For NotificationCount
        if (key == 'notificationCount' && response[key] != '0' && response[key] != null & window.location.search.indexOf("tab=tab-5") == -1) {
          $('#globalHeaderUserMenu').removeAttr('aria-label');
          if ($('#globalHeaderUserMenu').find('span').length == 1) {
            console.log("In notification count inner-if" + response[key]);
            $('#globalHeaderUserMenu').append("<span class='count-circle'>" + response[key] + "<em class='content-for-sr'>" + orderitemsin + "</em>" + "</span>");
            $('.unreadCount').text("(" + response[key] + ")");
          }
          if ($('#deviceNotifications') && $('#deviceNotifications').find('span').length == 1) {
            console.log("In notification count inner-if" + response[key]);
            $('.unreadCount').text("(" + response[key] + ")");
          }
        }

        /*if (tag == 'photoCount' &&  response && (response != "") && response != '0' ) {  
            photoResponse = JSON.parse(response);
            console.log("In photo count inner-if" + photoResponse["userPhotosCount"]);
            if  (photoResponse["userPhotosCount"] != null)
              noOfPhotos = photoResponse["userPhotosCount"];
            
            if (noOfProjects == 0 && noOfPhotos == 0) {
              $('#welcome-page').removeClass('hide');
            }   
            if (noOfProjects > 0 || noOfPhotos > 0){
              $('#quickstart-page').removeClass('hide');
              $('#carousel-page').removeClass('hide'); 
            }
          }*/


      });
    }
  }
  xmlhttp.open("GET", url, true);
  xmlhttp.withCredentials = true;
  xmlhttp.send();
}

function loadNotifications(target) {
  console.log("In loadNotifications");
  console.log("link target" + target);
  var xmlhttp;
  if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
    console.log("In if");
    xmlhttp = new XMLHttpRequest();
  } else { // code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      var response = xmlhttp.responseText;
      console.log("In loadNotifications response: " + response);
    }
  }
  if (ns('cms').isHttponlyCookieEnabled != "undefined" && ns('cms').isHttponlyCookieEnabled == 'true') {
    xmlhttp.open("GET", "https://" + ns("cms").siteHost + ns("cms").storeURLPath + "/api/v1/notification-bulkread", true);
  } else {
    xmlhttp.open("GET", "https://" + ns("cms").siteHost + ns("cms").storeURLPath + "/api/v1/notification-bulkread?GSID=" + getCookieVal("GSID"), true);
  }
  xmlhttp.send();
  document.location.href = target;

}
if (typeof isFirstTime === 'undefined' || isFirstTime === null) {
  isFirstTime = true;
}


// function showUploadOrIngestionPopup(libAction, fromAction) {
//   if (libAction.indexOf("#!") != -1)
//     libAction = libAction.substring(0, libAction.indexOf("#!"));
//   if (libAction == "device") {
//     libAction = "computer";
//   }
//   photoUploadType = libAction;

//   if ($('#cloneLibAddPhotos')) {
//     $('#cloneLibAddPhotos').removeClass("open");
//     $('#cloneLibAddPhotos').css("left", "-99999px");
//   }
//   if ($('#libraryAddPhotos')) {
//     $('#libraryAddPhotos').removeClass("open");
//     $('#libraryAddPhotos').css("left", "-99999px");
//   }
//   if (typeof store != 'undefined' && typeof store.isUserLoggedIn != 'undefined') {
//     if (store.isUserLoggedIn != 'false') {
//       if (typeof (uplOrIngUrlsMap) != "undefined") {

//         try {

//           var url = uplOrIngUrlsMap[libAction];
//           //url += (url.indexOf("?") == -1) ? "?" : "&";
//           //url += "website=" + ns('cms').website + "&cobrand=" + ns('cms').cobrand + "&locale=" + ns('cms').locale;

//           /*if (fromAction == 'uploadMore' && photoUploadType == 'computer' && $('#albumIdForAlbumsView') )
//              url += "&albumId="+$('#albumIdForAlbumsView').val();*/

//           /*if (navigator.mimeTypes['application/x-pnacl'] !== undefined) {
//             url += "&clientcomp=true";
//           }

//           var hosturl1 = window.location.hostname;
//           var hosturl2 = ns('cms').siteHost;
//           if (hosturl1.substring(hosturl1.indexOf('.')) === hosturl2.substring(hosturl2.indexOf('.'))) {
//             if (typeof (hostUrl) != "undefined") {
//               url += "&extrd=" + hostUrl + ns('cms').storeBasePath + "/storeuploadconfirm";
//             }
//           }*/

//           var userInfo = '#state={';

//           if (fromAction == 'uploadMore' && photoUploadType == 'computer' && $('#albumIdForAlbumsView')) {
//             userInfo += '"album_id":"' + $('#albumIdForAlbumsView').val() + '",';
//           }

//           if (typeof (window.assetCnt) != "undefined") {
//             if (window.assetCnt > 0) {
//               //url+= "#ownedassets=true";
//               userInfo += '"ownedassets":true,';
//             } else {
//               //url+= "#ownedassets=false";
//               userInfo += '"ownedassets":false,';
//             }
//           }

//           userInfo += '"accountId":"' + store.acctId + '","regType":"' + store.regType + '","userType":"' + store.userType + '"}';
//           url += userInfo;

//           if (typeof (popupExists) != "undefined" && popupExists && !popupExists.closed) {
//             popupExists.focus();
//           } else {
//             var popup;

//             var popupWidth = window.screen.width * 0.6;
//             var popupHeight = window.screen.height * 0.7;
//             var popupLeft = (window.screen.width / 2) - (popupWidth / 2);
//             var popupTop = (window.screen.height / 2) - (popupHeight / 2);

//             if (url.indexOf("ingestion") != -1) {
//               popup = window.open(url, 'Popup', 'resizable=1,location=no,scrollbars=yes,width=' + popupWidth + 'px,height=' + popupHeight + 'px,left = ' + popupLeft + ',top = ' + popupTop + '');
//             } else {
//               popup = window.open(url, 'Popup', 'toolbar=no,scrollbars=yes,location=no,statusbar=no,menubar=no,resizable=0,width=' + popupWidth + 'px,height=' + popupHeight + 'px,left = ' + popupLeft + ',top = ' + popupTop + '');
//             }

//             try {
//               popup.focus();
//             } catch (err) {
//               console.log(err + "Popups are Bloked");
//             }

//             popupExists = popup;
//           }

//         } catch (e) {
//           console.log('An error has occurred while opening Library Upload Window : ' + e);
//         }

//       }
//     } else {
//       redirectURL('loginto', libAction);
//     }
//   }
// }

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds) {
      break;
    }
  }
}

function logout(appendFromShopParam) {
  //Legacy logout
  localStorage.removeItem(ns('cms').storeEnv.replace(/-/g, "") + "_" + replacedCobrandName + "_" + ns('cms').website + "_userData");
  // var logoutIframe = document.getElementById('legacyLogout');
  // if (typeof (legacyHost) != "undefined") {
  //   logoutIframe.src = legacyHost + "/logout";
  // }

  // //wait for 1 seconds for legacy logout to happen.
  // sleep(1000);

  //2.0 logout.
  if (typeof (siteHost) != "undefined") {
    var logoutURL = "https://" + siteHost + ns('cms').storeBasePath + "/logout";
    if (appendFromShopParam) {
      logoutURL += "?fromShop=true";
    }
    document.location.href = logoutURL;
  }

  //wait for 1 seconds for 2.0 logout to happen.
  sleep(1000);
}



// start : adding padding to body while header if fixing.
jQuery(window).load(function () {
  addPaddingToBody();
  leffOffCanvasBtmLink();
  if (typeof (selectedTabName) != "undefined") {
    if (selectedTabName != undefined && selectedTabName != "") {
      selectedTabName = selectedTabName.toUpperCase();
    }
    //console.log("selectedTabName --->> " + selectedTabName);
    /* for CANVAS_+_DECOR,as it is having + symbol jquery is unbale to find element with the id.so wrote normal javascript */
    //if ($("#" + selectedTabName) != undefined && $("#" + selectedTabName).length > 0)
    //$("#" + selectedTabName).addClass("active");

    if (document.getElementById(selectedTabName) != null)
      document.getElementById(selectedTabName).className = "active";
  }
  if (typeof (selectedMainNavTab) != "undefined") {
    if (selectedMainNavTab != undefined && selectedMainNavTab != "")
      selectedMainNavTab = selectedMainNavTab.toLowerCase();
    if ($("#" + selectedMainNavTab) != undefined && $("#" + selectedMainNavTab).length > 0)
      $("#" + selectedMainNavTab).addClass("active");
  }

  function addPaddingToBody() {
    if (false/* Modernizr.mq('(min-width: 1025px)') */) {
      var globalHeaderHeight, globalHeaderLogo, globalShopNav;
      if (location.pathname != undefined && location.pathname.indexOf("/home") != -1) {
        globalHeaderHeight = $('.header-row-01').outerHeight();
        globalHeaderLogo = $('.header-row-02').outerHeight();
        globalShopNav = $('.header-shopnav').outerHeight();
        /*$('body').css('padding-top', (globalHeaderHeight+globalHeaderLogo+globalShopNav));*/
        /*$('.header-row-01').css({
          'position':'fixed',
          'top': '0px',
          'width': '100%',
          'z-index': '1001' 
        });
        $('.global-header').css({
          'position':'fixed'
        });*/
      } else {
        globalHeaderHeight = $('.global-header').height();
        //$('body').css('padding-top',globalHeaderHeight);
        /*$('.global-header').css({
          'position':'fixed'  
        });*/
      }
    } else {
      var deviceHeaderHeight;
      var deviceHeaderBottomLinks;
      deviceHeaderHeight = $('.device-global-header').height();
      /*$('body').css({
        'padding-top': deviceHeaderHeight
      });
      $('.device-global-header').css('position', 'fixed');*/
    }
  }
  $(window).resize(function () {
    addPaddingToBody();
  });

  // show header fontello icons after page ready
  /*if ($('.global-header').hasClass("show-global-header-fontello-icons")) {
    
  } else {
    $('.global-header').addClass("show-global-header-fontello-icons");
  }*/

});
// end : adding padding to body while header if fixing.

// Close reveal modal function by passing overlay ID/CLASS as parameter
function closeRevealModal(id) {
  $(id).foundation('reveal', 'close');
}

// leftOffCanvasBtmLink function
function leffOffCanvasBtmLink() {
  $('.device-global-header .offcanvas-links').css({
    'height': $(window).height() - 30 + 'px',
    'overflow-y': 'auto'
  });
}

/*Fix for dropdown overlapping issue*/
/*
function onDropDownMenuLinkMouseOver( event ) {
  var dropEls = $(".f-dropdown"); 
    if(event){ 
    for(var i=0;i< dropEls.length;i++){
      if(dropEls[i].id != event.data.show_menu){
        dropEls[i].className.replace(/\bopen\b/,'');
        dropEls[i].style.left = '-99999px';
      }
    }
    }
}
*/

function checkLoggedInAndOpen(nextUrl) {
  var navUrl = document.location.href;
  if (typeof store != 'undefined' && typeof store.isUserLoggedIn != 'undefined') {
    if ((store.isUserLoggedIn == 'true') || ((typeof (store.isGuestCheckoutEnabled) != 'undefined') && (store.isGuestCheckoutEnabled == "true"))) {
      if (typeof (nextUrl) != "undefined") {
        document.location.href = nextUrl;
      }
    } else {
      url = "https://" + ns('cms').siteHost + ns('cms').storeBasePath + "/loginto";
      document.location.href = url + "?next=" + encodeURIComponent(nextUrl);
    }
  }
}

// function openOrderPrints() {
//   var pUrl = ns('cms').create + "/builder?sku=" + $('#printSkuId').val() + "&category=prints&albumId=" + $('#albumIdForAlbumsView').val();
//   document.location.href = pUrl;
// }
// function uploadMore() {
//   $('#uploadConfirmationModal').foundation('reveal', 'close');
//   showUploadOrIngestionPopup(photoUploadType, 'uploadMore');
// }
// function viewPhotos() {
//   var pUrl = ns('cms').libraryPhotosHost;
//   pUrl += "?website=" + ns('cms').website + "&cobrand=" + ns('cms').cobrand + "&locale=" + ns('cms').locale;
//   if ($('#albumIdForAlbumsView'))
//     pUrl += '#state={"pgvw":"siav","aid":' + $('#albumIdForAlbumsView').val() + '}';
//   document.location.href = pUrl;
// }

/*$("#uploadMore").click(function(e) {
   uploadMore();
}); 
$(document).on("click", "orderPrints", function(){
   openOrderPrints();
});*/

var storeLocatorCloseEvent = function () {
  $('.stores-overlay-component .close-icon').on('click', function () {
    $('body.inner-wrap').removeClass('overite-overflow');
  });
}
function appendOverFlowToBody() {
  $('body.inner-wrap').addClass('overite-overflow');
}

jQuery(window).load(function () {
  $('#desktop-banner a').attr("tabindex", 1);
  $("#ls-row-2").attr("role", "main");
});

$(function () {
  (function ($) {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

    $.fn.attrchange = function (callback) {
      if (MutationObserver) {
        var options = {
          subtree: false,
          attributes: true
        };

        var observer = new MutationObserver(function (mutations) {
          mutations.forEach(function (e) {
            callback.call(e.target, e.attributeName);
          });
        });

        return this.each(function () {
          observer.observe(this, options);
        });

      }
    }
  })(jQuery);

  //Now you need to append event listener
  /*$('#userDropDown').attrchange(function (attrName) {

    if ($('#userDropDown').hasClass('open')) {
      $("ul#userDropDown.dropdown-menu li a").attr("tabindex", 7);
    } else {
      $("ul#userDropDown.dropdown-menu li a").attr("tabindex", -1);
    }

  });
  $('#countrylistDropDown').attrchange(function (attrName) {

    if ($('#countrylistDropDown').hasClass('open')) {
      $("ul#countrylistDropDown.dropdown-menu li a").attr("tabindex", 6);
    } else {
      $("ul#countrylistDropDown.dropdown-menu li a").attr("tabindex", -1);
    }

  });*/

  // $('#libraryAddPhotos').attrchange(function (attrName) {

  //   if ($('#libraryAddPhotos').hasClass('open')) {
  //     $("ul#libraryAddPhotos.dropdown-menu li a").attr("tabindex", 2);
  //   } else {
  //     $("ul#libraryAddPhotos.dropdown-menu li a").attr("tabindex", -1);
  //   }

  // });
});

/* GlobalHeader JS End */

//tiles equal height

$(window).load(function () {
  var eleIDArr = ['.four-tile-lockup .variation-1 .bottom-border', '.four-tile-lockup .variation-2 .bottom-border', '.two-tile-lockup .variation-6 .bottom-border', '.two-tile-lockup .variation-7 .bottom-border', '.two-tile-lockup .variation-8 .bottom-border']
  eleIDArr.forEach(function (eleID) {
    // Get an array of all element heights
    var elementHeights = $(eleID).map(function () {
      return $(this).height();
    }).get();

    // Math.max takes a variable number of arguments
    // `apply` is equivalent to passing each height as an argument
    var maxHeight = Math.max.apply(null, elementHeights);

    // Set each height to the max height
    $(eleID).height(maxHeight);
  });

});

/* Sticky Global Header starts */
function globalHeaderSticky(value) {
  if ($('.header-container').length && $('.header-container .header-container-mask').length && $('.header-container .header-container-fixed').length) {
    if (value == "delay") {
      setTimeout(function () {
        globalHeaderStickyDom();
      }, 1500);
      //console.log('01 : resize - globalHeaderSticky called');
    } else {
      globalHeaderStickyDom();
      //console.log('02 : regular - globalHeaderSticky called');
    }
  }
}
function globalHeaderStickyDom(value) {
  $('.header-container .header-container-mask').css("height", '');
  $('.header-container .header-container-fixed').css("position", '');

  var topBarHeitht = $('.header-container').height();
  $('.header-container .header-container-mask').css("height", topBarHeitht);
  $('.header-container .header-container-fixed').css("position", 'fixed');
  //console.log('03 : regular - globalHeaderSticky called' + topBarHeitht);
}
$(document).ready(function () {
  globalHeaderSticky();
  //console.log('04 : document.ready - globalHeaderSticky called');

});
$(window).load(function () {
  globalHeaderSticky();
  //console.log('05 : window.load - globalHeaderSticky called');
});
$(window).resize(function () {
  globalHeaderSticky("delay");
  //console.log('06 : window.resize - globalHeaderSticky called');
});
/* Sticky Global Header end */

/*** Site Search START ***/

function getURLParameter(param) {
  var params = window.location.search.substr(1).split('&');

  for (var i = 0; i < params.length; i++) {
    var p = params[i].split('=');
    if (p[0] == param) {
      return decodeURIComponent(p[1]);
    }
  }
  return "";
}

if ($('#site-search').length > 0) {
  $('#site-search input[type=search]').keypress(function (e) {
    var search = $('#site-search input[type=search]').val();
    search = search.replace(/\s+/g, '-');
    if (e.which == 13) {
      window.location.href = '/product-search?q=' + search;
    }
  });
  if ($('#site-search input[type=search]').val() == '') {
    searchStr = getURLParameter('q');
    searchStr = searchStr.replace(/-/g,' ');
    if (searchStr != '') {
      $('#site-search input[type=search]').val(searchStr);
    }
  }
}
/*** Site Search END */
$(document).ready(function() {


    try {


        var children = "";
        if (!$('.shop-main-links ul').hasClass('touch-devices')) {

            var shopMainLinksList = '.shop-main-links > ul > li';
            if(ns('cms').website == 'cvs_us'){
                shopMainLinksList = '.shop-main-links ul > li';
            }

            $(shopMainLinksList).hover(function() {

                children = $(this).children('.shop-menu-dropdown');
                header_DM_swapDataSrc();
                window.mytimeout = setTimeout(function() {
                    children.css('opacity', 0).show().animate({
                        opacity: 1
                    }, 0);
                }, 300);
            }, function() {
                clearTimeout(window.mytimeout);
                try {
                    children.css('opacity', 1).hide().animate({
                        opacity: 0
                    }, 0);
                } catch (e) {
                    //to fix the Uncaught TypeError of children.css 
                }
            });

            $(shopMainLinksList + ' a.shopmenu-main-links').keydown(function(e) {

                var key = e.which;
                // the Enter, Down Arrow, Up Arrow, Space key code
                if (key == 13 || key == 32 || key == 38 || key == 40) {
                    header_DM_swapDataSrc();
                }

            });


        }


    } catch (e) {
        console.log("Header dropdown menu, syntax error" + e);
    }

});

function header_DM_swapDataSrc() {

    try {
        var imgEl = $('.shop-menu-dropdown img');

        for (var i = 0; i < imgEl.length; i++) {
            if (typeof imgEl[i].attributes['data-src'] != 'undefined') {
                imgEl[i].setAttribute('src', imgEl[i].attributes['data-src'].value);
                imgEl[i].removeAttribute('data-src');
            }
        }
    } catch (e) {
        console.log("header_DM_swapDataSrc, syntax error" + e);
    }

}function jpegMini(nmfPath, pexePath) {
    try {
        if (navigator.mimeTypes['application/x-pnacl'] != undefined) {
            var lRef = document.createElement("link");
            if (lRef.relList && lRef.relList.supports("prefetch")) {
                $('<link/>').attr({
                    rel: 'prefetch',
                    href: nmfPath,
                    crossorigin: 'anonymous',
                    onerror: 'jpegMiniError(this)'
                }).appendTo("body");

                $('<link/>').attr({
                    rel: 'prefetch',
                    href: pexePath,
                    crossorigin: 'anonymous',
                    onerror: 'jpegMiniError(this)'
                }).appendTo("body");
            } else {
                $.get(nmfPath, function () {
                    console.log("Uploader nmf file precached");
                }, "text").fail(function () {
                    businessLogger.error().key("uploader-jpegmini.js").noodle().env().service("store").errorCode("Unable_to_preload_JPEGMini").errorId().description("getting file .nmf is failed").context().origin("store").logMessage().postlogToSplunk();
                });
                $.get(pexePath, function () {
                    console.log("Uploader pexe file precached");
                }, "text").fail(function () {
                    businessLogger.error().key("uploader-jpegmini.js").noodle().env().service("store").errorCode("Unable_to_preload_JPEGMini").errorId().description("getting file .pexe is failed").context().origin("store").logMessage().postlogToSplunk();
                });
            }
        }

    } catch (e) {
        console.error("Unable to preload Uploader JPEGMini modules err_desc=\"" + e + "\"  err_stack=\"" + e.stack + "\"");
        businessLogger.error().key("uploader-jpegmini.js").noodle().env().service("store").errorCode("Unable_to_preload_JPEGMini").errorId().description("Unable to preload Uploader JPEGMini modules, JS syntax errors").context().origin("store").logMessage().postlogToSplunk();
    }
}

function jpegMiniError(el) {
    console.log("Uploader file precached");
    businessLogger.error().key("uploader-jpegmini.js").noodle().env().service("store").errorCode("Unable_to_preload_JPEGMini").errorId().description("getting file is failed: " + el.href).context().origin("store").logMessage().postlogToSplunk();
}

function jpegMiniIsHomePage() {
    var str = location.pathname;
    var res = str.split("/");
    var isHomePage = false;
    for (i = 0; i < res.length; i++) {
        if (res[i] == "home") {
            isHomePage = true;
        }
    }
    return isHomePage;
}

$(window).load(function () {
    if (jpegMiniIsHomePage() && typeof store.isUserLoggedIn != 'undefined' && store.isUserLoggedIn == 'true') {
        var pexe = cdnHost + "/library/common/js/jpmup/jpmbp-30082017.pexe";
        var nmf = cdnHost + "/library/common/js/jpmup/jpmc-30082017.nmf";
        setTimeout(function () {
            jpegMini(nmf, pexe);
        }, 1500);
    }
});
$(document).ready(function () {
    //store.isTermAndConditionsAccepted = 'true';
    if (typeof store != 'undefined' && typeof store.isTermAndConditionsAccepted != 'undefined' && store.isTermAndConditionsAccepted == 'false') {
      getOverlayContent("ConsentOverlay","//"+document.location.host+"/"+ns('cms').storeBasePath+"/consent-overlay");
			revealBGDiv();
    }
});

function storeConsentTac() {
  $('#ConsentOverlay .row #TaCData').removeClass('hide');
  $('#ConsentOverlay .row #privacyNoticeData').addClass('hide');
  $('#ConsentOverlay .row #cookieNoticeData').addClass('hide');
	$('#ConsentOverlay .row #TaCData section').attr('id', 'top');
  $('#ConsentOverlay .row #privacyNoticeData section').removeAttr('id');
  $('#ConsentOverlay .row #cookieNoticeData section').removeAttr('id');
}
function storeConsentPrivacy() {
  $('#ConsentOverlay .row #TaCData').addClass('hide');
  $('#ConsentOverlay .row #privacyNoticeData').removeClass('hide');
  $('#ConsentOverlay .row #cookieNoticeData').addClass('hide');
	$('#ConsentOverlay .row #TaCData section').removeAttr('id');;
  $('#ConsentOverlay .row #privacyNoticeData section').attr('id', 'top');
  $('#ConsentOverlay .row #cookieNoticeData section').removeAttr('id');
}
function storeConsentCookie() {
	$('#ConsentOverlay .row #TaCData').addClass('hide');
  $('#ConsentOverlay .row #privacyNoticeData').addClass('hide');
  $('#ConsentOverlay .row #cookieNoticeData').removeClass('hide');
	$('#ConsentOverlay .row #TaCData section').removeAttr('id');
  $('#ConsentOverlay .row #privacyNoticeData section').removeAttr('id');
  $('#ConsentOverlay .row #cookieNoticeData section').attr('id', 'top');
}
function policyAcceptClose(policyAccept) {
  
  $('#ConsentOverlay').foundation('reveal', 'close');
	Foundation.libs.reveal.settings.close_on_esc = true;
  //Foundation.libs.reveal.settings.close_on_background_click = true;	
  $(document).foundation();
  var replacedCobrandName = ns('cms').cobrand.replace(/[-]/g, "");
  if (localStorage.getItem(ns('cms').storeEnv.replace(/-/g, "") + "_" + replacedCobrandName + "_" + ns('cms').website + "_userData") != undefined) {
          var sessionObj = JSON.parse(localStorage.getItem(ns('cms').storeEnv.replace(/-/g, "") + "_" + replacedCobrandName + "_" + ns('cms').website + "_userData"));
          sessionObj.isTermAndConditionsAccepted = 'true';
          localStorage.setItem(ns('cms').storeEnv.replace(/-/g, "") + "_" + replacedCobrandName + "_" + ns('cms').website + "_userData", JSON.stringify(sessionObj));
  }
	//var divRemove = new revealBGDiv();
	$(".reveal-bg-mask").remove();
  $(".reveal-modal-bg").css("display", "none");
  try {
    storeWCAGCloseDialog(policyAccept);
  } catch(e){}
  
  var data = null;
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) { console.log(this.responseText); }
  });

  xhr.open("PUT", "//"+document.location.host+"/"+ns('cms').storeURLPath+"/api/v1/userPolicies/true");
  xhr.setRequestHeader("content-type", "application/json");
  xhr.setRequestHeader("cache-control", "no-cache");

  xhr.send(data);
}

function revealBGDiv() {
		$("<div>", {
    'class': "reveal-bg-mask"		  
		}).appendTo('body');	 
}
/**
 * @namespace store.cookie.notice
 * @desc
 * Store Cookie Notice, have creation of persistency cookie in the browser session.
 * Validate, the persistency cookie to show/hide the header banner.
 */
try {
    //console.log("03 : Cookie Notice Log, Store Object, from cookie-notice JS line " + JSON.stringify(store));
    if (typeof gdpr == 'undefined') {
        //console.log("04 : Cookie Notice Log, Store Object, from cookie-notice JS line " + JSON.stringify(store));
        var gdpr = gdpr || {};
        gdpr.cookieNotice = gdpr.cookieNotice || {};
        gdpr.cookieNotice.flag = false;
        //console.log("05 : Cookie Notice Log, gdpr is undefined, from cookie-notice JS line ");
    }
    gdpr.cookieNotice.selector = ".gdpr.cookie-notice";
    gdpr.cookieNotice.cookieName = "cookie_notice";
    gdpr.cookieNotice.checkCookie = function () {
        var value = getCookieVal(gdpr.cookieNotice.cookieName);
        if (value != "accepted" &&
            typeof store.isUserLoggedIn != 'undefined' &&
            store.isUserLoggedIn == 'true') {
            gdpr.cookieNotice.setCookie();
        } else if (value != "accepted") {
            $(gdpr.cookieNotice.selector).show();
        }
    };
    gdpr.cookieNotice.setCookie = function () {
        var cookieName = ""
        var hostName = allowedPatternValidation("p1", window.location.hostname) ? window.location.hostname : '';
        var domainName = hostName.substr(hostName.indexOf('.'));
        domainName = "domain=" + domainName;
        var d = new Date();
        d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = gdpr.cookieNotice.cookieName + "=accepted;" + domainName + ";" + expires + ";path=/";
        gdpr.cookieNotice.hide();
    };
    gdpr.cookieNotice.show = function () {
        $(gdpr.cookieNotice.selector).show();
        //console.log('08 : cookieNotice, show - globalHeaderSticky called');
        setTimeout(function () {
            if (typeof globalHeaderSticky == 'function') {
                globalHeaderSticky();
                //console.log('07 : cookieNotice - globalHeaderSticky called');
            } else {
                console.log("globalHeaderSticky is not defined");
            }
        }, 1500);
    };
    gdpr.cookieNotice.hide = function () {
        $(gdpr.cookieNotice.selector).hide();
        if (typeof globalHeaderSticky == 'function') {
            globalHeaderSticky();
        } else {
            console.log("globalHeaderSticky is not defined");
        }
    };
} catch (e) {
    console.log("gdpr.cookieNotice. syntax error" + e);
}
$('#gdpr-cookie-accept-close').click(function () {
    gdpr.cookieNotice.setCookie();
});
$(document).ready(function () {
    try {
        if (gdpr != 'undefined' &&
            gdpr.cookieNotice.flag == true) {

            gdpr.cookieNotice.checkCookie();

        } else {
            //console.log("gdpr.cookieNotice.flag :" + gdpr.cookieNotice.flag);
        }
    } catch (e) {
        console.log("document load gdpr.cookieNotice. syntax error");
    }
});/**
 * @namespace store_winback
 * @desc
 * Store Winback, have creation of session cookie in the browser session.
 * Validate, the session cookie to show/hide the different banners on the store pages.
 */
try {
    if (typeof store_winback == 'undefined') {
        var store_winback = store_winback || {};
    }
    var replacedCobName = ns('cms').cobrand.replace(/[-]/g, "");
    var replacedEnv = ns('cms').storeEnv.replace(/-/g, "");
    store_winback.selector = ".archival-notice.v1";
    store_winback.cookieName = replacedCobName+"_"+replacedEnv+"_"+ns('cms').website+"_"+"account_archived";
    store_winback.checkCookie = function(selectorName) {
        if(selectorName && selectorName!=""){
            store_winback.selector = selectorName;
        }
        var value = sessionStorage.getItem(store_winback.cookieName);
        if (value != "accepted") {
            $(store_winback.selector).show();
        }
    };
    store_winback.setCookie = function(selectorName) {
        if(selectorName && selectorName!=""){
            store_winback.selector = selectorName;
        }
        //var hostName = allowedPatternValidation("p1", window.location.hostname) ? window.location.hostname : '';
        //var domainName = hostName.substr(hostName.indexOf('.'));
        //domainName = "domain=" + domainName;
        sessionStorage.setItem(store_winback.cookieName ,"accepted");
        $(store_winback.selector).hide();
    };
} catch (e) {
    console.log("document load archival syntax error");
}

$(document).ready(function() {
    try {
        if (store != 'undefined' &&
            typeof store.isUserLoggedIn != 'undefined' &&
            store.isUserLoggedIn == 'true' &&
            store.acctStatus != 'undefined' &&
            store.acctStatus == 'archived'
        ) {
            if($('.archival-notice.v1').length) {
                $('.archival-notice.v1').appendTo(document.body);
            }
            store_winback.checkCookie();
        if(typeof recentordersflag != 'undefined' && recentordersflag != 'true')
        {
            store_winback.checkCookie('.archival-notice.v2');
        }
        } else {
            //console.log("store_winback is false ");
        }
    } catch (e) {
        console.log("document ready store_winback. syntax error" + e);
    }
});// Starts : Omniture Utilities

if (typeof store.omniture == 'undefined') {
    store.omniture = store.omniture || {};
}


$(document).ready(function() {
    setStoreOmniturePageName();
});


function setStoreOmniturePageName() {
    try {

        if (typeof digitalData != 'undefined') {
            
            //var store.omniture;
            // after page load, stores the current page name value
            store.omniture.currentPageName = digitalData.page.pageInfo.pageName;

            // update pagename
            store.omniture.updatePageName = function(type, name) {
                // if type is Swap
                if (type == "swap" && name != "") {
                    // remove the last substring, after :
                    //var swapName = store.omniture.currentPageName.substring(0, store.omniture.currentPageName.lastIndexOf(":"));
                    //swapName += ":" + name;
                    store.omniture.pushPageName(name, name);
                } else {
                    store.omniture.pushPageName(store.omniture.currentPageName);
                }
            }

            // push to the ominture object
            store.omniture.pushPageName = function(name, eventValue) {
                digitalData.page.pageInfo.pageName = name;
                if (eventValue != "") {
                    var pushPageNameEvent = {
                        eventInfo: {
                            eventName: eventValue
                        }
                    }
                    digitalData.event.push(pushPageNameEvent);
                }
            }

        } else {
            console.log("digitalData is undefined");
        }
    } catch (e) {
        console.log("store.omniture. syntax error" + e);
    }

}
function pushMonetateData(monetateDataObject) {
  if (isDefinedObj(monetateDataObject)) {
    window.monetateQ = window.monetateQ || [];
    var pushTrackData = false;
    if (isNotEmptyStr(monetateDataObject.setPageType)) {
      console.log("setting setPageType with " + monetateDataObject.setPageType);
      pushTrackData = true;
      window.monetateQ.push(["setPageType", monetateDataObject.setPageType]);
    }
    if (isNotEmptyArr(monetateDataObject.addCartRows)) {
      console.log("setting addCartRows with ");
      console.log(monetateDataObject.addCartRows);
      pushTrackData = true;
      window.monetateQ.push(["addCartRows", monetateDataObject.addCartRows]);
    }
    if (isNotEmptyArr(monetateDataObject.addPurchaseRows)) {
      console.log("setting addCartRows with ");
      console.log(monetateDataObject.addPurchaseRows);
      pushTrackData = true;
      window.monetateQ.push([
        "addPurchaseRows",
        monetateDataObject.addPurchaseRows
      ]);
    }
    if (pushTrackData) {
      //console.log("adding trackData to monetateQ object");
      window.monetateQ.push(["trackData"]);
    }
  }
}
/* Floating label text box Start */
$(".gtb-floatlabel input[type='text']").keyup(function(){
	$(this).addClass(' fixedlabel');
});

$(".gtb-floatlabel input[type='text']").focusout(function(){
	if( !$(this).val() ) {
		$(this).removeClass('fixedlabel');
	}
});

/* Floating label text box End */function isDefinedObj(obj) {
  if (typeof obj !== "undefined" && obj !== undefined && null !== obj) {
    return true;
  }
  return false;
}

function isNotEmptyStr(val) {
  if (
    typeof val !== "undefined" &&
    val !== undefined &&
    val !== "" &&
    val != null &&
    val != "undefined" &&
    val != "null"
  ) {
    return true;
  }
  return false;
}

function isNotEmptyArr(arr) {
  if (
    typeof arr !== "undefined" &&
    arr !== undefined &&
    arr !== null &&
    arr instanceof Array &&
    arr.length > 0
  ) {
    return true;
  }
  return false;
}

/* Remove focus outline for mouse click and devices starts */
try {
  //$('html').addClass('focus-none');
  var htmlElement = document.querySelector('html');
  htmlElement.classList.add('focus-none');
  /* Remove focus outline for mouse click starts */
  document.addEventListener('mousedown', function(){
  htmlElement.classList.add('focus-none');
  });

  /* To remove .focus-none and show focus highlight for keyboard navigation */
  document.addEventListener('keyup', function(){
      if(htmlElement.classList.contains('no-touch') && htmlElement.classList.contains('focus-none')) { //remove .focus-none only 
          htmlElement.classList.remove('focus-none');
      }
  });
}
catch(err) {
console.log(err.message);
}
/* Remove focus outline for mouse click end */// Logging SEO Alt text missing count start
var altMissLoggingFeature = "off";
var enabledWebsites = "snapfish_us,walgreens_us";
function altMissLogging() {
    try {
        var altMissLength = $("#ls-canvas img[alt='']").length + $("#ls-canvas img:not([alt])").length;
        var wrongAltPresentLength = 0;
        var srcList = "";
        var imgTags = $("#ls-canvas img[role='presentation']");
        if(imgTags.length > 0) {
            for(var i=0; i < imgTags.length; i++)
            {
                if(imgTags[i].alt != '')
                {
                    wrongAltPresentLength++;
                }
            }
        }
        var altMissTags = $("#ls-canvas img[alt='']");
        if(altMissTags.length > 0) {
            for(var i=0; i < altMissTags.length; i++)
            {
                if($(altMissTags[i]).attr('role') == 'presentation')
                {
                    altMissLength--;
                }
                else
                {
                    srcList += $(altMissTags[i]).attr('src') + ",";
                    console.log("srcList = "+srcList);
                }
            }
        }
        altMissTags = $("#ls-canvas img:not([alt])");
        if(altMissTags.length > 0) {
            for(var i=0; i < altMissTags.length; i++)
            {
                if($(altMissTags[i]).attr('role') == 'presentation')
                {
                    altMissLength--;
                }
                else
                {
                    srcList += $(altMissTags[i]).attr('src') + ",";
                    console.log("srcList = "+srcList);
                }
            }
        }
        var totalAltMissCount = wrongAltPresentLength + altMissLength;
        if( totalAltMissCount >  0) {
            $('body').append("<img class='altMissLoggingImg' style='display:none'/>");
            URL = '//' + ns('cms').siteHost + ns('cms').storeBasePath + '/' + "resources/images/dots.gif?SEO=wrongAltCount&altMissCount=" + altMissLength + "&wrongAltPresentCount=" + wrongAltPresentLength + "&isUserLoggedIn=" + store.isUserLoggedIn + "&service=" + ns('cms').service + "&storeEnv=" + ns('cms').storeEnv  + "&context=" + ns('cms').context+ "&website=" + ns('cms').website+ "&imageSrcs=" + srcList;
            console.log("URL : " + URL);
            $('.altMissLoggingImg').hide().attr('src', URL);
        }
    } catch (err) {
        console.log(err + "altMissLogging");
    }
}

$(document).ready(function () {
    if(document.location.href.indexOf("/home")!=-1 || document.location.href.indexOf("/prints")!=-1 || document.location.href.indexOf("print-")!=-1 || document.location.href.indexOf("prints-")!=-1)
    {
        if(enabledWebsites.indexOf(ns('cms').website)!=-1){
            altMissLoggingFeature = "on";
        }
    }
    if (altMissLoggingFeature === "on" &&
        typeof (store) != 'undefined' &&
        typeof (store.isUserLoggedIn) != 'undefined' &&
        store.isUserLoggedIn != 'true' &&
        typeof (ns('cms')) != 'undefined' &&
        typeof (ns('cms').service) != 'undefined' &&
        ns('cms').service == 'store' && 
        typeof (ns('cms').storeEnv) != 'undefined' &&
        ns('cms').storeEnv == 'regression') {
        altMissLogging();
    }

});
// Logging SEO Alt text missing count end
/**
 * @namespace store.library.addPhotos
 * @desc
 * https://snapfish-llc.atlassian.net/wiki/spaces/PHOT/pages/283706152/Upload+Dropdown+Upload+Confirmation+Integration
 * Upload Dropdown & Upload Confirmation Integration
 */
try {
    /* To invoke the library init function onclick for inline add photos section */
    $('.photoOrg-addPhotos-inline').click(function(e){
        var targetId= $(this).attr('id');
        store.library.addPhotos.init('#'+targetId,'store-no-project-inline');
    });
    
    if (typeof store.library == 'undefined') {
        store.library = store.library || {};
        store.library.addPhotos = store.library.addPhotos || {};
        store.library.addPhotos.flag = false;
    }


    // setting the library URL
    if (store.library != 'undefined' &&
        store.library.addPhotos.flag == true) {
        // if (store.library != 'undefined') {
            store.library.addPhotos.url = ns("cms").cdn + "/library/upload_dropdown_widget.js?oh=" + (ns('cms').siteHost).replace(/\./g, '_');
    }

    // page load, when the page document ready
    // 1. load the Library Js file
    // 2. All photoOrg-addPhotos-inline widgets will be trigger
    store.library.addPhotos.documentReadyLoad = function() {

        /* $.cachedScript(store.library.addPhotos.url).done(function() {
            $('.photoOrg-addPhotos-inline').trigger("click");
            $(".photoOrg-addPhotos-inline").prop("onclick", null).off("click");
        }).fail(function() {
            console.log("Unable_to_load : " + store.library.addPhotos.url);
            businessLogger
                    .error()
                    .key("add-photos-integration.js")
                    .noodle()
                    .env()
                    .service("store")
                    .errorCode("SLSPA_Erros")
                    .errorId()
                    .description("loading library/upload_dropdown_widget.js is failed.")
                    .context()
                    .origin("store")
                    .logMessage();
        }); */

        $.ajax({
            url: store.library.addPhotos.url,
            dataType: "script",
            cache: true
        }).done(function(script, textStatus) {
            $('.photoOrg-addPhotos-inline').trigger("click");
            $(".photoOrg-addPhotos-inline").prop("onclick", null).off("click");
        }).fail(function(jqxhr, textStatus, exception) {
            businessLogger
                .error()
                .key("add-photos-integration.js")
                .noodle()
                .env()
                .service("store")
                .errorCode("add_photos_integration_Errors")
                .errorId()
                .description("documentReadyLoad" + exception + "loading library/upload_dropdown_widget.js is failed.")
                .context()
                .origin("store")
                .logMessage();
        });

    }

    // Addphotos and Upload-buttons click method.
    // triggers this method, while click - and it expects two inputs, elementID and UI type.
    // elementID must be unique for each button to display the dropdown widget with accurate x & y positions on the webpage
    store.library.addPhotos.init = function(elementID, uiType) {
        if (typeof photoOrg != 'undefined' &&
            typeof photoOrg.uploadDropdownWidget != 'undefined') {
            store.library.addPhotos.init.getUI(elementID, uiType);
        } else {
            /* $.cachedScript(store.library.addPhotos.url)
                .done(function(script, textStatus) {
                    store.library.addPhotos.init.getUI(elementID, uiType);
                })
                .fail(function(jqxhr, settings, exception) {
                    businessLogger
                    .error()
                    .key("add-photos-integration.js")
                    .noodle()
                    .env()
                    .service("store")
                    .errorCode("SLSPA_Erros")
                    .errorId()
                    .description("loading library/upload_dropdown_widget.js is failed.")
                    .context()
                    .origin("store")
                    .logMessage();
                }); */

                $.ajax({
                    url: store.library.addPhotos.url,
                    dataType: "script",
                    cache: true
                }).done(function(script, textStatus) {
                    store.library.addPhotos.init.getUI(elementID, uiType);
                }).fail(function(jqxhr, textStatus, exception) {
                    businessLogger
                        .error()
                        .key("add-photos-integration.js")
                        .noodle()
                        .env()
                        .service("store")
                        .errorCode("add_photos_integration_Errors")
                        .errorId()
                        .description("init" + exception + "loading library/upload_dropdown_widget.js is failed.")
                        .context()
                        .origin("store")
                        .logMessage();
                });
        }
    }

    // this method, request the PhotoOrg service to collce the UI
    store.library.addPhotos.init.getUI = function(elementID, uiType) {
        var initObj = {
            "parentId": elementID, // element ID
            "ui": uiType, // Ui type, dropdown || inline
            "cobrand": ns('cms').cobrand
        }
        if (typeof store != 'undefined' &&
            typeof store.isUserLoggedIn != 'undefined' &&
            store.isUserLoggedIn == 'false') {

            if (ns('cms').cobrand == "walgreens") {
                if (typeof redirectToWGLogin != 'undefined') {
                    initObj.redirectTo = redirectToWGLogin; // WG, callback method, where Library used to redirect the user to Login
                }
            } else {
                if (typeof redirectURL != 'undefined') {
                    initObj.redirectTo = redirectURL; // Callback method, where Library used to redirect the user to Login
                }
            }

        }
        photoOrg.uploadDropdownWidget.init(initObj);
    }

    // the following method, will hit while page loading and if url's contains libActionKey parameter from app.js, cvsapp.js and wgapp.js
    store.library.addPhotos.open_upload_layer_on_pageLoading = function(libActionKey) {
        if (typeof photoOrg != 'undefined' &&
            typeof photoOrg.uploadDropdownWidget != 'undefined') {
            if(libActionKey.indexOf('#')!=-1)
            {
                libActionKey = libActionKey.split('#')[0];
            }
            photoOrg.uploadDropdownWidget.init({
                'onloadUploadOption': libActionKey
            });
        } else {
            /* $.cachedScript(store.library.addPhotos.url)
                .done(function(script, textStatus) {
                    console.log("loaded" + store.library.addPhotos.url);
                    photoOrg.uploadDropdownWidget.init({
                        'onloadUploadOption': libActionKey
                    });
                })
                .fail(function(jqxhr, settings, exception) {
                    businessLogger
                    .error()
                    .key("add-photos-integration.js")
                    .noodle()
                    .env()
                    .service("store")
                    .errorCode("SLSPA_Erros")
                    .errorId()
                    .description("loading library/upload_dropdown_widget.js is failed.")
                    .context()
                    .origin("store")
                    .logMessage();
                }); */

                $.ajax({
                    url: store.library.addPhotos.url,
                    dataType: "script",
                    cache: true
                }).done(function(script, textStatus) {
                    photoOrg.uploadDropdownWidget.init({
                        'onloadUploadOption': libActionKey
                    });
                }).fail(function(jqxhr, textStatus, exception) {
                    businessLogger
                        .error()
                        .key("add-photos-integration.js")
                        .noodle()
                        .env()
                        .service("store")
                        .errorCode("add_photos_integration_Errors")
                        .errorId()
                        .description("open_upload_layer_on_pageLoading" + exception + "loading library/upload_dropdown_widget.js is failed.")
                        .context()
                        .origin("store")
                        .logMessage();
                });
        }
    }

    // common method, to load the cached library js file
    /*jQuery.cachedScript = function(url, options) {
        // Allow user to set any option except for dataType, cache, and url
        options = $.extend(options || {}, {
            dataType: "script",
            cache: true,
            url: url
        });

        // Use $.ajax() since it is more flexible than $.getScript
        // Return the jqXHR object so we can chain callbacks
        return jQuery.ajax(options);
    };*/

} catch (e) {
    //console.log("store.library.addPhotos. syntax error" + e);
    businessLogger
        .error()
        .key("add-photos-integration.js")
        .noodle()
        .env()
        .service("store")
        .errorCode("add_photos_integration_Errors")
        .errorId()
        .description(e + "store.library.addPhotos. syntax error")
        .context()
        .origin("store")
        .logMessage();
}

// on DOM ready, load the library widget js file
$(window).load(function() {
    try {
        if (store.library != 'undefined' &&
            store.library.addPhotos.flag == true) {
        // if (store.library != 'undefined') {
            store.library.addPhotos.documentReadyLoad();
        } else {
            //console.log("store.library.addPhotos.flag :" + store.library.addPhotos.flag);
            //Add splunk log here
        }
    } catch (e) {
        console.log("Window load store.addPhotos.app. syntax error");
        businessLogger
        .error()
        .key("add-photos-integration.js")
        .noodle()
        .env()
        .service("store")
        .errorCode("add_photos_integration_Errors")
        .errorId()
        .description("document ready method error : " + e + "store.library.addPhotos. syntax error")
        .context()
        .origin("store")
        .logMessage();
    }
});// Starts :Created for client side performance tracking
var storeApp = storeApp || {};
storeApp.PageLoadTrackingUtils = {
    getPageLoadingTimes: function(){
        if(!window.performance || !window.performance.timing){
            return;
        }
        // Navigation Timing
        var t = window.performance.timing,
            dnsLookupTime = t.domainLookupEnd - t.domainLookupStart,
            connectionTime = t.connectEnd - t.connectStart,
            secureConnectionTime = (t.secureConnectionStart > 0 ? (t.connectEnd - t.secureConnectionStart) : 0),
            serverWaitingTime = t.responseStart - t.requestStart,
            timeToFirstByte = t.responseStart - t.navigationStart,
            responseLoadingTime = t.responseEnd - t.responseStart,
            requestAndResponseWaitTime = t.responseEnd - t.requestStart,
            pageWaitTime = t.responseEnd - t.navigationStart,
            domLoading = t.domLoading - t.navigationStart,
            domInteractive = t.domInteractive - t.navigationStart,
            domContentLoadTime = t.domContentLoadedEventStart - t.navigationStart,
            pageLoadTime = t.loadEventStart - t.navigationStart;
        var firstPaintTime = 0;
        if(window.chrome && window.chrome.loadTimes){
            firstPaintTime = (chrome.loadTimes().firstPaintTime * 1000) - t.navigationStart;
        }else if (t.msFirstPaint) {
            firstPaintTime = t.msFirstPaint - t.navigationStart;
        }
        //if it's in micro-seconds resolutions, convert it into milliseconds
        if(firstPaintTime % 1 !== 0)
            firstPaintTime = (firstPaintTime * 1000);
        return {
            dnsLookupTime : dnsLookupTime,
            connectionTime : connectionTime,
            secureConnectionTime: secureConnectionTime,
            serverWaitingTime : serverWaitingTime,
            timeToFirstByte : timeToFirstByte,
            responseLoadingTime : responseLoadingTime,
            requestAndResponseWaitTime: requestAndResponseWaitTime,
            pageWaitTime: pageWaitTime,
            domContentLoadTime : domContentLoadTime,
            pageLoadTime : pageLoadTime,
            domLoading : domLoading,
            domInteractive : domInteractive,
            firstPaintTime : firstPaintTime
        };
    },
    getPageResourceLoadingTimes: function(upToTime){
        //window.performance.timing.domInteractive - window.performance.timing.navigationStart
        var resourceLoadingTimes = [];
        // Resource Timing
        if(window.performance == undefined || !performance.getEntriesByType)
            return [];
        var resources = performance.getEntriesByType("resource");
        if(resources == undefined || resources.length <= 0)
            return;

        for(var i=0; i < resources.length; i++){
            if((resources[i].startTime || resources[i].fetchStart) && upToTime){
                var startTime = resources[i].startTime || resources[i].fetchStart;
                //log only resources which gets initiated before passed upto time
                if(startTime > upToTime)
                    break;
            }

            var resource = {};
            resource.name = resources[i].name;

            //duration(wait time)
            resource.duration = resources[i].duration;

            /*// Redirect time
            var t = resources[i].redirectEnd - resources[i].redirectStart;
            resource.redirectTime = t;

            // DNS time
            t = resources[i].domainLookupEnd - resources[i].domainLookupStart;
            resource.dnsLookupTime = t;

            // TCP handshake time
            t = resources[i].connectEnd - resources[i].connectStart;
            resource.connectionTime = t;

            // Secure connection time
            t = (resources[i].secureConnectionStart > 0) ? (resources[i].connectEnd - resources[i].secureConnectionStart) : "0";
            resource.secureConnectionTime = t;

            // Response time
            t = resources[i].responseEnd - resources[i].responseStart;
            resource.responseLoadingTime = t;

            // Request start until response end
            t = (resources[i].requestStart > 0) ? (resources[i].responseEnd - resources[i].requestStart) : "0";
            resource.requestAndResponseWaitTime = t;

            // Start until response end
            t = (resources[i].startTime > 0) ? (resources[i].responseEnd - resources[i].startTime) : "0";
            resource.totalResourceWaitTime = t;*/

            resourceLoadingTimes.push(resource);
        }
        return resourceLoadingTimes;
    },
    logPageLoadingPerformanceDetails: function(){        
    	try{
    		var object = {};
	        object.pageLoadingNumbers = this.getPageLoadingTimes();
	        //domLoading ---> firstPaint --> domInteractive --> domContentLoadedEventStart
	        var upToTime = object.pageLoadingNumbers.firstPaintTime || object.pageLoadingNumbers.domContentLoadTime;
	        object.pageResourceLoadingNumbers = this.getPageResourceLoadingTimes(upToTime);
	        if(typeof profilerLogger != "undefined")
	        {
				profilerLogger.info().key("app.js").type("performance-metrics").action("logging performance metrics").state("log metrics data").addParameter("metricsData",JSON.stringify(object)).logMessage().postlogToSplunk();
			}
	        console.log(object);
	        var logger = storeApp.ClientMessageLogger.getLogger('PageLoadTrackingUtils');
	        var keyValuePairs = {};
	        keyValuePairs[ServiceLogConstants.ERROR_CODE] = "PAGE_LOAD_PROFILE_DETAILS";
	        keyValuePairs['DETAILS'] = storeApp.Utils.stringifyJSObjectForSplunk(object);
	        keyValuePairs['DETAILS'] = JSON.stringify(object);
            if(typeof ns('cms') != 'undefined' && typeof ns('cms').service != 'undefined' && ns('cms').service == 'store'){
	           logger.debug("Page performance details",'logPageLoadingPerformanceDetails', keyValuePairs);
            }
    	}catch(e){
    		businessLogger.error().key("app.js").noodle().env().service("store").errorCode("performance-metrics-failed").errorId().description("error in logPageLoadingPerformanceDetails method while execution ").context().origin("store").logMessage().postlogToSplunk();	
    	}
        
    }
};
$( document ).ready(function() {
        try{
            if(typeof ns('cms') != 'undefined' && typeof ns('cms').storeEnv != 'undefined' && (ns('cms').storeEnv == 'regression' || ns('cms').storeEnv == 'production') && (location.href.indexOf("home")!=-1 && location.href.indexOf("home-")==-1)){
                storeApp.PageLoadTrackingUtils.logPageLoadingPerformanceDetails();
            }
        }catch(e){
            businessLogger.error().key("app.js").noodle().env().service("store").errorCode("performance-metrics-failed").errorId().description("Failed to call logPageLoadingPerformanceDetails on document ready ").context().origin("store").logMessage().postlogToSplunk();
        }
});

// End :Created for client side performance tracking//
if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))) {

    /* To load ASYNC webaccessibility js file */
    if ( typeof WCAGSrc != 'undefined' && isNotEmptyStr(WCAGSrc) ) {
        appendJSDynamic(WCAGSrc,'async');
    }

}
// Logging Duplicate IDs start
var duplicateIDLogging = "on";

function duplicateIDDataLogging() {
    try {
        var ids = new Array();
        var dupIds = new Array();
        $('[id]').each(function() { //Get elements that have an id=
        if($(this).attr("id")!=''){
            if(jQuery.inArray($(this).attr("id"), ids) != -1 && jQuery.inArray($(this).attr("id"), dupIds) == -1){
                dupIds.push($(this).attr("id"));
            }else{
                ids.push($(this).attr("id")); //add id to array
            }
        }
    });
    if( dupIds.length >  0) {
            var dupIdsStr = dupIds.toString().replace(/,/g,":");
            $('body').append("<img id='duplicateIDLogging' />");
            var URL = '//' + ns('cms').siteHost + ns('cms').storeBasePath + '/' + "resources/images/dots.gif?event=duplicateIDLogging&dupIDCount=" + dupIds.length + "&dupIDList=" + dupIdsStr + "&isUserLoggedIn=" + store.isUserLoggedIn + "&service=" + ns('cms').service + "&storeEnv=" + ns('cms').storeEnv  + "&context=" + ns('cms').context+ "&website=" + ns('cms').website;
            console.log("URL : " + URL);
            $('#duplicateIDLogging').hide().attr('src', URL);
        }
    } catch (err) {
        console.log(err + "duplicateIDLogging");
    }
}

$(document).ready(function () {
    if (duplicateIDLogging === "on" &&
        typeof (ns('cms')) != 'undefined' &&
        typeof (ns('cms').service) != 'undefined' &&
        ns('cms').service == 'store' && 
        typeof (ns('cms').storeEnv) != 'undefined' &&
        ns('cms').storeEnv == 'regression') {
        duplicateIDDataLogging();
    }

});
// Logging Duplicate IDs end
