define(['core', 'core/cache', 'queue/queue', 'utils/slice', 'utils/forEach'], function(jq, cache, QueueManager, slice, forEach) {
	// TODO: handle complex version jq.animate(properties, options) version
	// TODO: no hardcoded values there (400=default duration)
	jq.prototype.animate = function(properties) {
		var duration = ['string', 'number'].indexOf(typeof arguments[1]) !== -1 ? parseInt(arguments[1]) : 400,
			easing = typeof arguments[2] === 'string' && arguments[2] || 'swing',
            complete = typeof arguments[2] === 'function' && arguments[2] || null,
			jqElt = this,
            args = slice.call(arguments, 0),
			interval = jq.fx.interval,
            jqToAnimate = new jq(),
            options;

        options = {
            easing: easing || null,
            interval: interval || null,
            duration: duration || null,
            properties: properties || null,
            queue: 'fx'
        };
        
        complete = typeof arguments[3] === 'function' && arguments[3] || complete;
        
        if (typeof arguments[1] === 'object') {
            jq.extend(options, arguments[1]);            
            if (typeof arguments[1].complete === 'function') {
                complete = arguments[1].complete;
            }
        }
        
		return this.each(function(i, element) {
            var thisDef = new jq.Deferred(),
                waitFor = null,
                fn;

            fn = (function(jqElt, options, callbacks) { 
                var startTime,
                    steps = {},
                    init = function() {
                        startTime = new Date().getTime();
                        
                        jq.each(options.properties, function(property, value) {
                            var current = jqElt.css(property),
                                diff = parseFloat(value) - (parseFloat(current) || 0);
                            
                            try{
                                steps[property] = {
                                    current: parseFloat(current) || 0,
                                    diff: diff,
                                    target: parseFloat(value),
                                    unit: value.toString().match(/(em|px|pt)/g) && value.toString().match(/(em|px|pt)/g)[0] || ''
                                };
                            } catch(err) {
                                debugger;
                                console.log('oops', err);
                            }
                        });
                        
                        func();
                    },
                    func = function() {
                    var animProgress = 0,
                        currentTime = new Date().getTime(),
                        ellapsedTime = currentTime - startTime,
                        t = ellapsedTime / options.duration,
                        properties = {},
                        that = this;

                    if (init.gotoEnd === true) {
                        console.log('need to goto end');
                        animProgress = 1;
                    } else {
                        animProgress = jq.easing[options.easing](t, ellapsedTime, 0, 1, options.duration);
                    }
                        
                    jq.each(steps, function(property, info) {
                        properties[property] = (info['current'] + animProgress * info['diff']) + info['unit'];
                    });
                        
                    jqElt.css(properties);
                    
                    if ((ellapsedTime < options.duration) && !init.cancel) {
                        this.timeout = setTimeout(function() { func(); }, options.interval);
                    } else {
                        if (init.cancel) {
                            console.log('oops need to cancel', init.gotoEnd);
                        }
                        
                        jqElt.each(function() {
                            if (!init.cancel) {
                                callbacks.forEach(function(elt) {
                                    console.log('need to execute end callback', elt);
                                    elt.call(this);
                                });                                
                                
                                try{
                                    QueueManager.executeNext(this);
                                } catch(err) {
                                    console.log(err, err.stack);
                                    debugger;
                                }
                            }
                        });
                    }
                };
                
                init.cancel = false;
                
                return init;
            })(jq(element), options, complete && [complete] || []);
            // *********
            
            console.log('+++++ using queue', options.queue);
            QueueManager.addToQueue(element, fn, options.queue);
        });
	};
    
    
    jq.prototype.slideDown = function() {
        var that = this,
            duration = typeof arguments[0] !== 'function' && arguments['0'] || 400,
            complete = typeof arguments[0] === 'function' && arguments[0] || typeof arguments[1] === 'function' && arguments[1];
        
        if (this.length) {
            var currentOverflow = window.getComputedStyle(element, null)['display'];
            
            // do not cache pre-hidden state
            if (currentDisplay !== 'none') {
                setCacheProperty(element, 'olddisplay', currentDisplay);
            }            
        }
    };

    jq.prototype.slideUp = function() {
        var that = this,
            duration = typeof arguments[0] !== 'function' && arguments['0'] || 400,
            complete = typeof arguments[0] === 'function' && arguments[0] || typeof arguments[1] === 'function' && arguments[1];
        
        if (this.length) {
            return this.each(function() {
                var jqElt = jq(this),
                    that = this;
                setCacheProperty(this, 'oldHeight', this['style'].height);
                console.log('saved height', this['style'].height);
                jqElt.animate({height: 0}, duration, function() {
                    var oldHeight = cache.getCacheProperty(that, 'oldHeight');
                    jqElt.hide();
                    if (oldHeight) {
                        console.log('restoring height', oldHeight);
                        that['style'].height = oldHeight;
                    } else {
                        that['style'].height = '';
                        console.log('no need to restore height');
                    }
                });
            });
        }
    };
    
	// TODO: handle more complex jq.fadein(options) version
	jq.prototype.fadeIn = function() {
		var that = this,
            duration = typeof arguments[0] !== 'function' && arguments['0'] || 400,
            complete = typeof arguments[0] === 'function' && arguments[0] || typeof arguments[1] === 'function' && arguments[1],
            currentOpacity = [];

		if (this.length) {
            
            // FIXME: we should store opacity and restore it, or not if needed
            // ie: if css opacity is set in css, we should set it back with style = ''...
            this.each(function() {
                currentOpacity.push(this.style.opacity);
            });
            
			this.css('opacity', 0);

			this.show();
			
            return this.each(function(index) {
                var previousOpacity = currentOpacity[index];
                jq(this).animate({opacity: previousOpacity > 0 ? previousOpacity : 1}, duration, function() {
                    if (!(previousOpacity > 0)) {
                        jq(this).css('opacity', '');
                    }
                
				    if (typeof complete === 'function') {
                        complete.call(this);
				    }
                });
            });
        }
                             
		return this;
	};

	// TODO: handle more complex jq.fadein(options) version
	jq.prototype.fadeOut = function() {
		var that = this,
            duration = typeof arguments[0] !== 'function' && arguments['0'] || 400,
            complete = typeof arguments[0] === 'function' && arguments[0] || typeof arguments[1] === 'function' && arguments[1];

        // console.log(duration, complete);
        
		if (this.length) {
			jq(this).css('opacity', 1);

			jq(this).show();
			
			return this.animate({opacity: 0}, duration, function() {
                that.css('opacity', '');
                
				that.each(function() {
					jq(this).hide();
					if (typeof complete === 'function') {
						complete.call(this);
					}
				});
			});
		}
		return this;
	};
    
    jq.prototype.stop = function() {
        var clearQueue = typeof arguments[0] === 'boolean' ? arguments[0] : false,
            queueName = typeof arguments[0] === 'string' && arguments[0] || 'fx',
            jumpToEnd = typeof arguments[1] === 'boolean' ? arguments[1] : false;
            
        if (typeof arguments[0] === 'string') {
            clearQueue = typeof arguments[1] === 'boolean' ? arguments[1] : false;
            jumpToEnd = typeof arguments[2] !== 'undefined' ? arguments[2] : false;
        }
        
        return this.each(function(i, element) {
            var running = cache.getCacheProperty(element, 'running_' + queueName);
            
            if (running) {
                running.gotoEnd = jumpToEnd;
                running.cancel = true;
            }

            if (clearQueue === true) {
                jq(element).clearQueue();
            } else {
                QueueManager.executeNext(element, queueName, false);
            }
        });
    };
    
	jq.fx = {
		off: false,
        interval: 13
	};

    jq.easing = {
        linear: function(t) {
            return t;
        },
        swing: function(t) {
            return .5-Math.cos(t*Math.PI)/2;
        },
        easeOutBounce: function(x, t, b, c, d) {
            if ((t/=d) < (1/2.75)) {
                return c*(7.5625*t*t) + b;
            } else if (t < (2/2.75)) {
                return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
            } else if (t < (2.5/2.75)) {
                return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
            } else {
                return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
            }
        },
        easeInBounce: function (x, t, b, c, d) {
		  return c - jq.easing.easeOutBounce (x, d-t, 0, c, d) + b;
	   }
    }
    
    jq.prototype.delay = function(duration, queueName) {
        queueName = queueName || 'fx';
        
        duration = typeof duration !== 'undefined' && duration > 0 ? duration : 0;
        
        return this.each(function() {
            (function(elt) {
                var fn = function() {
                    setTimeout(function() {
                        QueueManager.executeNext(elt);
                    }, duration);
                };
                
                QueueManager.addToQueue(elt, fn, queueName);
            })(this);
        });
//        return this.each(function() {
//            var fxQueue = getCacheProperty(this, 'queue_fx'),
//                thisDef = new jq.Deferred(),
//                oldAction = null,
//                obj;
//            
//            if (typeof fxQueue === 'undefined') {
//                obj[queueName] = {
//                    lastAction: null,
//                    state: 'stop',
//                    queue: [],
//                    delays: [thisDef]
//                };
//                
//                // first call, no fx running, no queue at all
//                setCacheProperty(element, 'fxQueue', obj);
//            } else {
//                fxQueue[queueName].delays.push(thisDef);
//                
//                oldAction = fxQueue[queueName].lastAction;
//                
//                fxQueue[queueName].lastAction = thisDef;
//                
//                // run delay *after* already schedulded effects
//                jq.Deferred.when.apply(jq.Deferred.when, oldAction !== null ? [oldAction] : []).then(function() {
//                    setTimeout(function() {
//                        // remove fx from the queue
//                        fxQueue.fx.delays.splice(0, 1);
//                        
//                        thisDef.resolve();
//                    }, duration);
//                });
//            }
//        });
    };    
});