// Dependencies: Deferred, Traversing
define(['core', 'core/dom', 'deferred/deferred', 'traversing/traversing'], function(jq, dom) {
    var eventShortcuts = ['blur', 'dblclick', 'change', 'click', 'error', 'focus', 'focusin', 'focusout', 'keydown', 'keypress', 'keyup', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'resize', 'scroll', 'select', 'submit', 'unload'],
        handlers = {},
        bindedElements = [],
        defaultNS = 'default';        
    
    function getFnIdx(callbacks, fn, targetSelector, newfn) {
        var idx = -1,
            max,
            i;
        
        for (i = 0, max = callbacks.length; i < max; i++) {
            if (callbacks[i].originalcb === fn && callbacks[i].targetSelector === targetSelector) {
                return i;
            }
        } 
        
        callbacks.push({
            originalcb: fn,
            cb: newfn,
            targetSelector: targetSelector
        });
        
        return callbacks.length - 1;
    }
    
    function getDomIdx(elt) {
        var i = 0,
            max = bindedElements.length;
        
        for (i = 0; i < max; i++) {
            if (elt === bindedElements[i]) {
                return i;
            }
        }
        
        bindedElements.push(elt);
        
        return i;
    }
    
    function checkEventType(eventType, event, element) {
        if (eventType.match(/mouseenter/)) {
            return (event.fromElement !== element && !dom.isChildOf(event.fromElement, element))
        } else if (eventType.match(/mouseleave/)) {
            return (event.toElement !== element && !dom.isChildOf(event.toElement, element))
        } else {
            return true;
        }
    }
    
    function getRealEventType(askedEvent) {
        if (askedEvent.match(/mouseenter/)) {
            return 'mouseover';
        } else if (askedEvent.match(/mouseleave/)) {
            return 'mouseout';
        } else {
            return askedEvent;
        }
    }
    
    function addEventToElt(eventType, namespace, element, fn, targetSelector) {
        var listener = null,
            that = this,
            key = '',
            callbacks = null,
            idx = -1,
            domIdx = getDomIdx(element),
//            newfn = target && fn.bind(target) || fn.bind(element),
            newfn = fn,
            simulatedEvent;
        
        if (!handlers[domIdx]) {
            handlers[domIdx] = {};
        }
        
        key = handlers[domIdx];
        
        if (!key[eventType]) {
            key[eventType] = {
                defs: [],
                callbacks: [],
                namespace: [],
                listeners: []
            };
        }

        idx = getFnIdx(key[eventType].callbacks, fn, targetSelector, newfn);
        
        if (!key[eventType].namespace[idx]) {
            key[eventType].namespace[idx] = [];
        }
        
        if (!key[eventType].defs[idx]) {
            key[eventType].defs[idx] = new jq.Deferred();
            
            key[eventType].defs[idx].done(function(event, targetElements) {
                key[eventType]['callbacks'].forEach(function(obj) {
                    key[eventType]['namespace'][idx].forEach(function() {
//                        if (!obj['targetSelector'] || (isChildOf(element, targetElement) && targetElement.matchesSelector(obj['targetSelector'])) && checkEventType(eventType, event, element)) {  // obj['target'] === target
                            jq.each(targetElements, function(i, targetElt) {
                                if (obj['cb'].call(targetElt, event) === false) {
                                    event.stopPropagation();
                                    event.stopImmediatePropagation();
                                    event.preventDefault();
                                    return false;                                    
                                }
                            });
//                        }
                    });
                });
            });
            
            key[eventType].listeners[idx] = function(event) {
                var ok = false,
                    parents = jq(event.target).parentsUntil(element, targetSelector),
                    matched;
                
                if (targetSelector && targetSelector.length && event.target.matchesSelector(targetSelector)) {
                    parents.splice(0, 0, event.target);
                }
                
                if (targetSelector.length === 0 && checkEventType(eventType, event, element)) {
                    ok = true;
                    matched = new jq(element);
                } else if (checkEventType(eventType, event, element) && parents.length) {
                    // we need to go through all elements that match the selector
                    // TODO: do we need to send event on every matched element ?
                    ok = true;
                    matched = parents;
                }
                // only call listener if delegated when target is set
//                if (!targetSelector.length || (isChildOf(event.target, element) && event.target.matchesSelector(targetSelector)) && checkEventType(eventType, event, element)) {
                if (ok === true) {
                    key[eventType].defs[idx].resolve(event, matched);
                    
                    key[eventType].defs[idx] = new jq.Deferred().done(function(event, targetElements) {
                        key[eventType]['callbacks'].forEach(function(obj) {
                            key[eventType]['namespace'][idx].forEach(function() {
                                jq.each(targetElements, function(i, targetElt) {
                                    if (obj['cb'].call(targetElt, event) === false) {
                                        event.stopPropagation();
                                        event.preventDefault();
                                        return false;
                                    }
                                });
                            });
                        });
                    });
                }
            };
            
            element.addEventListener(getRealEventType(eventType), key[eventType].listeners[idx]);
        }

        key[eventType].namespace[idx].push({
            namespace: namespace,
            selector: targetSelector
        });
    }
    
    function getEvents(eventStr) {
        var events = eventStr.split(/\s+/),
            eventList = events.map(function(event) {
                var res = event.split('.'),
                    namespace = res.length > 1 ? res.splice(1).join('.') : defaultNS,
                    eventType = res[0];
                
                return {
                    namespace: namespace,
                    eventType: eventType
                };
            });
        
        return eventList;
    }

    // TODO: handle jQuery's plain object call:
    // $('foo').on({
    //     click: function() {},
    //     mouseleave: function() {}
    // });
    jq.prototype.on = function(events) {
        // TODO: jq(arguments[1])[0] what happens if there are several target elements ? forEach targets ?
        if (typeof events === 'object') {
            for (var event in events) {
                var eventList = getEvents(event),
                    fn = events[event],
                    targetSelector = '';
                
                this.forEach(function(elt) {
                    eventList.forEach(function(event) {
                        addEventToElt.call(this, event.eventType, event.namespace, elt, fn, targetSelector);
                    });
                });                
            }
        } else {
            try{
                var eventList = getEvents(events),
                    fn = arguments[arguments.length - 1],
                    targetSelector = arguments[1] && typeof arguments[1] === 'string' ? arguments[1] : '';
                
                this.forEach(function(elt) {
                    eventList.forEach(function(event) {
                        addEventToElt.call(this, event.eventType, event.namespace, elt, fn, targetSelector);
                    });
                });
            } catch(err) { console.log('error registering event using on', err, eventList, this); }
        }

        return this;
    };
    
	jq.prototype.bind = function(events, method) {
		return this.on(events, null, method);
	};
    
    // TODO: handle special last parameter value: false
    // TODO: handle .namespace
    // TODO: handle ** selector
    jq.prototype.off = function(events) {
        var lastParam = slice.call(arguments, arguments.length - 1)[0],
            selector = arguments.length > 0 && typeof arguments[1] === 'string' && arguments[1] || null,
            eventHandler,
            eventList;
        
        if (!arguments.length) {
            this.forEach(function(element) {
                var domIdx = getDomIdx(element);
                
                for (var eventType in handlers[domIdx]) {
                    element.removeEventListener(eventType, handlers[domIdx][eventType].listener, false);
                }    
                handlers[domIdx] = {};
            });
        } else {
            eventList = getEvents(events);
            eventHandler = typeof lastParam === 'function' && lastParam || null;
            
            console.log('1');
            console.log('eventHandler', eventHandler);
            console.log('selector', selector);
            
            this.forEach(function(element) {
                var domIdx = getDomIdx(element);
                
                console.log('2');
                console.log('eventHandler', eventHandler);
                console.log('selector', selector);
                console.log('checking element', element);
                var handlerList = handlers[domIdx];
                // no handler registered for this element
                if (!handlerList) {
                    return;
                }
                console.log('checking eventList');
                
                eventList.forEach(function(event) {
                    console.log('3');
                    console.log('eventHandler', eventHandler);
                    console.log('selector', selector);
                    console.log(event.namespace);
                    var listeners = handlerList[event.eventType],
                        i = 0,                            
                        namespaces = listeners.namespace[i];
                    
                    if (!listeners) {
                        return;
                    }
                    
                    console.log('need to test for listeners', listeners);
                    console.log('*** avant', namespaces.length);
                    
                    listeners.callbacks.forEach(function(obj) {
                        var toRemove = [],
                            j = 0,
                            k = 0;
                        console.log('4');
                        console.log('eventHandler', eventHandler);
                        console.log('selector', selector);                            
                        console.log(eventHandler, listeners, namespaces);
                        if (!eventHandler || eventHandler === obj.originalcb) {
                            namespaces.forEach(function(ns, idx, array) {
                                if ((!selector || selector === ns.selector) && (event.namespace === defaultNS || event.namespace === ns.namespace)) {
                                    console.log('need to remove !');
                                    delete array[idx];
                                    toRemove.push(idx);
                                }
                            });
                        }
                        
                        for (j = 0; j < toRemove.length; j++) {
                            listeners.namespace[i].splice(toRemove[j] - k, 1);
                            k++;
                        }
                    });
                    
                    console.log('*** apres', listeners.namespace[i].length, listeners.namespace[i]);
                    
//                        if (!listeners.namespace[i].length) {
//                            listeners.namespace[i] = null;
//                        }
                    
                    i++;
                    // test:
                    // 1. correct namespace (if specified)
                    // 2. corrector selector (if specified)
                    // 3. correct handler (if specified)
//                        event.namespace.forEach(function(namespace) {
//                            console.log('need to remove', event);
//                        });
                    
                });
            });
        }
        
        return this;
    };
    
    jq.prototype.trigger = function(events) {
        var eventList = typeof events === 'string' ? getEvents(events) : [{ eventType: events.type, namespace: 'default'}],
            that = this;
        
        // TODO: handle namespaces (guess there should be DOM events, and JQ events, and namespace should send DOM event but JQ event only on correct namespace)
        // TODO: we should have a triggerHandler method that only calls events binded through JQ and this method should call this method
        jq.each(eventList, function() {
            var evt = document.createEvent("HTMLEvents");
            
            evt.initEvent(this.eventType, true, true);

            console.log('need to send', this.eventType);
            that.each(function() {
                this.dispatchEvent(evt);
            });
        });
        
        return this;
    };

    // TODO: should factorized with trigger
    // TODO: only support one event ?
    jq.prototype.triggerHandler = function() {
        var eventList = typeof events === 'string' ? getEvents(events) : [{ eventType: events.type, namespace: 'default'}],
            that = this,
            element = this[0],
            canceled = undefined;
        
        jq.each(eventList, function() {
            var evt = document.createEvent("HTMLEvents");
            
            evt.initEvent(this.eventType, false, false);

            console.log('need to send', this.eventType);
            var element = that[0];
            
            if (element) {
                canceled = element.dispatchEvent(evt);
            };
        });
        
        return canceled;
    };    
    
	jq.prototype.delegate = function() {
		var events = arguments[1],
			selector = arguments[0];

		return this.on.apply(this, [events, selector].concat(slice.call(arguments, 2)));
	};
    
	jq.prototype.live = function() {
        console.warn('jq.live - doesn\'t work');
	};
    
	// Create shortcuts, like click(),...
    eventShortcuts.forEach(function(eventName) {
        jq.prototype[eventName] = function() {
            // simulate event
            if (!arguments.length) {
                console.log('simulating event', eventName);
                this.trigger(eventName);
            } else {
                this.on.apply(this, [eventName].concat(slice.call(arguments, 0)));
            }
            
            return this;            
        };
    });

    // special simualated events
    // TODO: these shouldn't be simulated in IE
    jq.prototype.mouseenter = function(cb) {
        return this.on('mouseenter', null, cb);
    };
    
    jq.prototype.mouseleave = function(cb) {
        return this.on('mouseleave', null, cb);
    };    

	jq.prototype.hover = function(mouseoverCb, mouseoutCb) {
		return this.mouseenter(mouseoverCb).mouseleave(mouseoutCb);
	};
    
    /*
    target
    relatedTarget
    pageX
    pageY
    which
    metaKey
    The following properties are also copied to the event object, though some of their values may be undefined depending on the event:
    
    altKey, bubbles, button, cancelable, charCode, clientX, clientY, ctrlKey, currentTarget, data, detail, eventPhase, metaKey, offsetX, offsetY, originalTarget, pageX, pageY, prevValue, relatedTarget, screenX, screenY, shiftKey, target, view, which
    */

    // TODO
    jq.Event = function(eventType) {
        var evt;
        
        console.log('creating event', eventType, arguments);
        if (!(this instanceof jq.Event)) {
            evt = new jq.Event(eventType);
        }
        
        this.isDefaultPrevented = function() { return false; };
    };
    
    // internal stuff needed by jQuery unit tests
    jq.event = {
        global: {}
    };
});