var BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

$.fn.imagesLoaded = function( callback ) {
  var $this = this,
    deferred = $.isFunction($.Deferred) ? $.Deferred() : 0,
    hasNotify = $.isFunction(deferred.notify),
    $images = $this.find('img').add( $this.filter('img') ),
    loaded = [],
    proper = [],
    broken = [];

  // Register deferred callbacks
  if ($.isPlainObject(callback)) {
    $.each(callback, function (key, value) {
      if (key === 'callback') {
        callback = value;
      } else if (deferred) {
        deferred[key](value);
      }
    });
  }

  function doneLoading() {
    var $proper = $(proper),
      $broken = $(broken);

    if ( deferred ) {
      if ( broken.length ) {
        deferred.reject( $images, $proper, $broken );
      } else {
        deferred.resolve( $images );
      }
    }

    if ( $.isFunction( callback ) ) {
      callback.call( $this, $images, $proper, $broken );
    }
  }

  function imgLoaded( img, isBroken ) {
    // don't proceed if BLANK image, or image is already loaded
    if ( img.src === BLANK || $.inArray( img, loaded ) !== -1 ) {
      return;
    }

    // store element in loaded images array
    loaded.push( img );

    // keep track of broken and properly loaded images
    if ( isBroken ) {
      broken.push( img );
    } else {
      proper.push( img );
    }

    // cache image and its state for future calls
    $.data( img, 'imagesLoaded', { isBroken: isBroken, src: img.src } );

    // trigger deferred progress method if present
    if ( hasNotify ) {
      deferred.notifyWith( $(img), [ isBroken, $images, $(proper), $(broken) ] );
    }

    // call doneLoading and clean listeners if all images are loaded
    if ( $images.length === loaded.length ){
      setTimeout( doneLoading );
      $images.unbind( '.imagesLoaded' );
    }
  }

  // if no images, trigger immediately
  if ( !$images.length ) {
    doneLoading();
  } else {
    $images.bind( 'load.imagesLoaded error.imagesLoaded', function( event ){
      // trigger imgLoaded
      imgLoaded( event.target, event.type === 'error' );
    }).each( function( i, el ) {
      var src = el.src;

      // find out if this image has been already checked for status
      // if it was, and src has not changed, call imgLoaded on it
      var cached = $.data( el, 'imagesLoaded' );
      if ( cached && cached.src === src ) {
        imgLoaded( el, cached.isBroken );
        return;
      }

      // if complete is true and browser supports natural sizes, try
      // to check for image status manually
      if ( el.complete && el.naturalWidth !== undefined ) {
        imgLoaded( el, el.naturalWidth === 0 || el.naturalHeight === 0 );
        return;
      }

      // cached images don't fire load sometimes, so we reset src, but only when
      // dealing with IE, or image is complete (loaded) and failed manual check
      // webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
      if ( el.readyState || el.complete ) {
        el.src = BLANK;
        el.src = src;
      }
    });
  }

  return deferred ? deferred.promise( $this ) : $this;
};


var Grid = (function(){
  var $grid  = $("#og-grid"); // cache the grid
  var $items = $grid.children('li'); // cache all li of grid 
  var current = -1; // ??
  var previewPos = -1; // ??
  var scrollExtra = 0; // ??
  var marginExpanded = 10; // ??
  var $window = $(window); //cache global window object
  var winsize;
  var body = $('html, body'); // cache html and body elements
  var transEndEventNames = { // For transitions??
            'WebkitTransition' : 'webkitTransitionEnd',
            'MozTransition' : 'transitionend',
            'OTransition' : 'oTransitionEnd',
            'msTransition' : 'MSTransitionEnd',
            'transition' : 'transitionend'
        };
  var transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ];
        // support for csstransitions
  var support = Modernizr.csstransitions;
        // default settings
  var settings = {
            minHeight : 500,
            speed : 350,
            easing : 'ease'
        };

  console.log("hi");

  // the settings

  function init( config ) {
    settings = $.extend(true, {}, settings, config); // merge in default settings and configuration settings into black object

    // preload all images
    $grid.imagesLoaded(function() { // where does this function come from? ********
        // save item's size and offset
        saveItemInfo(true); // line 59
        // get window's size
        getWinSize(); // line 98
        // initialize some events
        initEvents(); // line 69
    });
  }
  // when is this function executed?
  // add more items to the grid.
  // the new items need to be appended to the grid.
  // after that call Grid.addItems(theItems);
  function addItems ($newItems) {
    $items = $items.add($newItems); // add $newItems to the grid
    $newitems.each (function(){ // for each new item
        var $item = $( this );
        $item.data( { // set the data attribute
            offsetTop: $item.offset().top,
            height : $item.height()
        } );
    } );
    initItemEvents( $newitems ); // line 86
  }
  // *** saves item's into into the data attribute ***
  function saveItemInfo ( saveheight) {
    $items.each ( function() {
        var $item = $( this );
        $item.data( ' offsetTop', $item.offset().top );
        if ( saveheight ) {
            $item.data( 'height', $item.height() );
        }
    });
  }

     // gets the window size - width / height
   function getWinSize(){
      winsize = { width: $window.width(), height: $window.height()};
   }

       // Set multiple event listeners on all items in the grid. hidePreview() on the cose button. 
    function initItemEvents ( $items ) {
        $items.on('click', 'span.og-close', function(){
            hidePreview();
            return false;
        }).children('a').on('click', function(e){ // if any of the children are clicked ..
            var $item = $( this ).parent(); // set $item to the child's parent
            // check if item already opened
            current === $item.index() ? hidePreview() : showPreview($item); // current refers to current global variable
            return false;
        });
    }

  function initEvents() {
    // when clicking an item, show the preview with the item's info and large image.
    // close item if already expanded
    // also close item if closing on the item's cross.
    initItemEvents( $items ); //line 86
    $window.on('debouncedresize', function(){
        scrollExtra = 0;
        previewPos = -1;
        // save item's offset
        saveItemInfo(); // line 59
        getWinSize(); // line 98
        var preview = $.data( this, 'preview');
        if ( typeof preview != 'undefined'){
            hidePreview();
        }
    });


     function showPreview( $item ){
        var preview = $.data( this, 'preview'); // ??
        var position = $item.data('offsetTop');
        var scrollExtra = 0;

        // if a preview exists and previewPos is different (different row) from item´s top then close it
            if (typeof preview != 'undefined'){
                // not in the same row
                if (previewPos !== position){
                  // if position > previewPos then we need to take the current preview's height in consideration when scrolling the window
                  if (position > previewPos) {
                    scrollExtra = preview.height;
                  }
                  hidePreview();
                }
                // same row
                else {
                  preview.update( $item );
                  return false;
                }

            }
         }
         // update previewPos
         previewPos = position;
         // initialize new preview for the clicked item
         preview = $.data( this, 'preview', new Preview( $item) );
         // expand preview overlay
         preview.open();
      }

    function hidePreview(){
      current = -1;
      var preview = $.data( this, 'preview');
      preview.close();
      $.removeData( this, 'preview' );
    }

    

    return { // What does this do?
    init: init,
    additems : addItems
  };
})();



