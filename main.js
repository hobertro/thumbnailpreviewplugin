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
    $grid.imagesLoaded(function() { // where does this method come from?
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

    // Set multiple event listeners on all items in the grid. hidePreview() on the cose button. 
    function initItemsEvents ( $items ) {
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
     // gets the window size - width / height
     function getWinSize() {
        winsize = { width: $window.width(), height: $window.height()};
     }
  }
});

Grid();

