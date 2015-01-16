define(['core/extend', 'core/buildFragment', 'utils/inArray', 'utils/isFunction', 'utils/trim', 'utils/splice', 'utils/slice', 'utils/forEach', 'utils/isArray'], function(extend, build, inArray, isFunction, trim, splice, slice, forEach, isArray) {
    var previous$ = window.$,
		previousjQuery = typeof jQuery !== 'undefined' ? jQuery : undefined;

    window.$ = window.jQuery = jq = function(selector, parent) {
        var selectorString = '',
            parents,
            that = this,
            elements;

		if (isFunction(selector) && jq.holdReady) {
			return new jq(document).ready(selector.bind(document));
		}

        if (!(this instanceof jq)) {
            return new jq(selector, parent);
        }
        
		this.source = this;

        if (typeof selector === 'string') {
            selectorString = selector = trim(selector);
            selectors = selector.split(',');
        } else {
            selectors = selector || [];
        }
        
        if (typeof parent === 'string' && parent.length) {
            parents = document.querySelectorAll(parent);
        } else {    // assume DOM element for now
            parents = parent || [document];
        }
        
        if (typeof selector === 'string' && selector.match(/^</)) {
            return buildFragment(new jq(), selector);
        } else {
            this.selector = selectorString || "";
            
            if (Array.isArray(selectors)) {
                selectors.forEach(function(selector) {
                    forEach.call(parents, function(parent) {
                        var pseudo = '';
                        
                        if (selector.length) {
                            if (selector.match(/\:(first|last)$/)) {
                                pseudo = selector.match(/\:(first|last)$/)[0];
                                
                                elements = parent.querySelectorAll(selector.replace(pseudo, ''));
                                if (elements.length) {
                                    elements = [pseudo === ':first' ? elements[0] : elements[elements.length - 1]];
                                } else {
                                    elements = [];
                                }
                            } else {
                                try{
                                    if (selector.match(/^>/)) {
                                        // TODO: split and each() ?
                                        elements = jq(parent).children(jq.trim(selector.substr(1)));
                                    } else {
                                        elements = parent.querySelectorAll(selector);
                                    }
                                } catch(err) {
                                    console.log('Unsupported selector', selector);
                                    elements = [];
                                }
                            }
                            forEach.call(elements, function(domElt) {
                                if (that.indexOf(domElt) === -1) {
                                    that.push(domElt);
                                }
                            });
                        }
                    });
                });
            } else if (selectors instanceof HTMLElement || inArray(selectors, [window, document]) > -1){    // assume DOM element for now, but could be any type of object
                this[this.length++] = selectors;
            } else if (selectors instanceof jq) {
                selectors.forEach(function(element) {
                    that.push(element);
                });
                that.selector = selectors.selector;
            } else if (typeof selectors === 'object'){
                that.push(selectors);
            }
        }
    }

    if ( typeof define === "function" && define.amd ) {
      define( "jquery", [], function() {
        return jq;
      });
    }
    
	// TODO check me: even if elt is String or Number, fn should be called with an object as this
	jq.each = function(elt, fn) {
		var i = 0,
            max;

		if (arguments.length > 2) {
			throw 'jq.each() not supported with arguments length > 1!';
		} else {
            if ((Array.isArray(elt) || elt instanceof jq)) {
                for (i = 0, max = elt.length; i < max; i++) {
                    if (fn.call(elt[i], i, elt[i]) === false)
                        break;
                }
            } else {
                for (var i in elt) {
                    if (fn.call(elt[i], i, elt[i]) === false)
                        break;
                }
            }
		}

		return elt;
	};
    
    jq.prototype = new Array();

    jq.prototype.each = function(callback) {
        var that = this,
            i = 0,
            max = this.length,
            res = false,
            element = null;
        
        for (i = 0; i < max; i++) {
            element = this[i];
            res = callback.call(element, i, element);
            
            if (res === false) {
                break;
            }
        }
        
        return this;
    };
    
    jq.extend = function() {
        var args = null,
            deep = false,
            target = {};
        
        // remove undefined/null values
        args = slice.call(arguments, 0).filter(function(e) { return e; });
        
        // first argument is true: deep copies, target becomes second one, and targets start at second one
        if (args[0] === true) {
            args = args.slice(2);
            target = arguments[1];
            deep = true;
        } else {
            target = args[0];
            args = args.slice(1);
        }
        
        target = target || {};
                    
        args.forEach(function(argument) {
            extend(target, argument, deep);
        });
        
        return target;
    };

	jq.noConflict = function(removeAll) {
		window.$ = previous$;

		if (removeAll === true) {
			window.jQuery = previousjQuery;
		}

		return jq;
	};

    jq.globalEval = function(str) {
        str && eval.call(window, str);
    };

    jq.now = function() {
        return new Date().getTime();
    };

    // TODO: handle other signature
    jq.prototype.pushStack = function(array) {
        var newJq = new jq();
        if (jq.isArray(array)) {
            array.forEach(function(elt) {
                newJq.push(elt);
            });
        };
        return newJq;
    };
    
	// for compatibility
	jq.fn = jq.prototype;
    
	jq.fn.extend = function(object) {
		return jq.extend(jq.fn, object);
	};

	jq.expr = {
		':': {
		
		}
	};

    jq.modules = {};
    
    jq.fn.jquery = "1.8.0 - jq version @VERSION";
    jq.fn.jq = {
        version: "@VERSION",
        modules: "@MODULES"
    };
    
    return jq;
});
