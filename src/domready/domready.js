// core/domeready
define(['core', 'deferred/deferred'], function(jq, deferred) {
    var onReady = new deferred(),
        holdReady = 0;
    
    jq.isReady = false;
    
	// from: https://github.com/dperini/ContentLoaded/blob/master/src/contentloaded.js
	function contentLoaded() {
		var done = false,
			top = true,

		doc = window.document, root = doc.documentElement,

		add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
		rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
		pre = doc.addEventListener ? '' : 'on',

		init = function(e) {
			if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
			(e.type == 'load' ? window : doc)[rem](pre + e.type, init, false);
			if (!done && (done = true)) {
                jq.isReady = true;
                if (!holdReady) {
                    onReady.resolve(jq);
                }
            }
		},

		poll = function() {
			try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
			init('poll');
		};

		if (doc.readyState == 'complete') {
            jq.isReady = true;
            if  (!holdReady) {
                onReady.resolve(jq);
            }
        } else {
			if (doc.createEventObject && root.doScroll) {
				try { top = !window.frameElement; } catch(e) { }
				if (top) poll();
			}
			doc[add](pre + 'DOMContentLoaded', init, false);
			doc[add](pre + 'readystatechange', init, false);
			window[add](pre + 'load', init, false);
		}
	};
    
    jq.holdReady = function(bool) {
        if ((!jq.isReady || holdReady) && bool === true) {
            holdReady++;
        } else if (bool === false && holdReady) {
            if (--holdReady == 0 && jq.isReady) {
                onReady.resolve(jq);
            }
        }
    };
    
	// TODO: bind ready event on other elements if this != [documentElement]
	jq.prototype.ready = function(fn) {
		if (this.length == 1 && this[0] === window.document) {
			onReady.done(fn.bind(this[0]));
		}
		return this;
	};    

    jq.Deferred = deferred;
    
    contentLoaded();
});