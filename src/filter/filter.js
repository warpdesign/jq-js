define(['core', 'core/dom'], function(jq, dom) {
    jq.prototype.filter = function(selector) {
        var newJq = new jq(),
            i = 0;
        
        if (typeof selector === 'string') {
            this.forEach(function(element) {
                if (element.matchesSelector(selector)) {
                    newJq.push(element);
                }
            });
        } else if (typeof selector === 'function') {
            this.forEach(function(element) {
                if (selector.call(element, i) === true) {
                    newJq.push(element);
                }
                i++;
            });
        } else if (selector instanceof HTMLElement) {
            this.forEach(function(element) {
                if (element === selector) {
                    newJq.push(element);
                }
            });
        } else if (selector instanceof jq) {
            this.forEach(function(element) {
                if (selector.indexOf(element)) {
                    newJq.push(element);
                };
            });
        }
        
        return newJq;
    };
    
    jq.prototype.get = function(i) {
        if (typeof i === 'undefined') {
            return jq.map(this, function(domElt) {
                return domElt;
            });
        } else {
            if (i < 0) {
                i = this.length + i;
            }

            return this[i];
        }
    };
        
    jq.prototype.eq = function(i) {
        var jqElt = new jq();
        
        if (i < 0) {
            i = this.length + i;
        }
        
        if (i > -1 && i <= this.length -1) {
            jqElt.push(this[i]);
            jqElt.selector = this.selector;
        }
        
        return jqElt;
    };
    
	jq.prototype.first = function() {
		var newJq = new jq();

		if (this.length) {
			newJq.push(this[0]);
		}

		newJq.source = this;

		return newJq;
	};
    
    jq.prototype.not = function() {
        var newJq = new jq(),
            selectors,
            toMatch,
            fn;
        
        if (arguments.length) {
            switch (typeof arguments[0]){
                case 'string':
                    selectors = arguments[0];
                    
                    this.each(function(idx, domElt) {
                        if (!domElt.matchesSelector(selectors) && newJq.indexOf(domElt) === -1) {
                            newJq.push(domElt);
                        }
                    });
                break;
                    
                case 'object':
                    if (arguments[0] instanceof jq) {
                        toMatch = arguments[0];
                        this.each(function(idx, domElt) {
                            if (toMatch.indexOf(domElt) === -1 && newJq.indexOf(domElt) === -1) {
                                newJq.push(domElt);
                            }
                        });
                    } else if (arguments[0] instanceof HTMLElement ) {
                        toMatch = arguments[0];
                        this.each(function(idx, domElt) {
                            if (domElt !== toMatch && newJq.indexOf(domElt) === -1) {
                                newJq.push(domElt);
                            }
                        });
                    }
                break;
                    
                case 'function':
                    fn = arguments[0];
                    
                    this.each(function(idx, domElt) {
                        if (fn.call(domElt, idx) !== true && newJq.indexOf(domElt) === -1) {
                            newJq.push(domElt);
                        }
                    });
                break;
            }
        }
            
        return newJq;
    };
    
	jq.prototype.last = function() {
		var newJq = new jq();

		if (this.length) {
			newJq.push(this[this.length-1]);
		}

		newJq.source = this;

		return newJq;
	};
    
    // TODO: handle :visible like pseudo selectors (throws a DOM Exception right now)    
    // TODO: handle is(jq) signature
    // => type jq('form'), class jq('.foo') and jq('.foo.bar'), attr jq('[type=checkbox]', pseudoclass jq('input:checked')
    jq.prototype.is = function(selector) {
        var match = false,
            parent = null;

        !!selector && selector.match && this.each(function(idx, element) {
			var res = selector.match(/:\s*(visible|hidden)\s*$/),
				visible;

			if (res) {
				visible = dom.isAttached(element) /*&& (element.offsetWidth > 0 || element.offsetHeight > 0)*/ && element.style && element.style.display !== 'none';
                // TODO: we must check for parents as well: if a parent has display set to none, is(':visible') should return false even though the element has display not set to none
                if (visible) {
                    parent = element.parentElement;
                    while(parent) {
                        if (!(dom.isAttached(element) && /*(element.offsetWidth > 0 || element.offsetHeight > 0) &&*/ element.style && element.style.display !== 'none')) {
                            visible = false;
                            break;
                        }
                        parent = parent.parentElement;
                    }
                }
				match = (res[1] === 'visible') ? visible : !visible;
			} else if (element.matchesSelector(selector)) {
				match = true;
            }

			// interrupt loop as soon as we have a match
			if (match) {
				return false;
			}
        });
        
        return match;
    };
    
	jq.prototype.index = function() {
		var elt = this[0],
			element = arguments[0],
			nodes = this[0].parentElement.children,
			i = 0,
			max,
			index = -1;

		if (!arguments.length) {
			for (i = 0, max = nodes.length; i < max; i++) {
				if (elt === nodes[i]) {
					index = i;
					break;
				}
			}
		} else if (element instanceof HTMLElement || element instanceof jq) {
			var toMatch = element instanceof HTMLElement ? element : element[0];

			this.each(function(i) {
				if (this === toMatch) {
					index = i;
					return false;
				}
			});
		} else {
			var toMatch = this[0];

			if (toMatch) {
				jq(element).each(function(i) {
					if (this === toMatch) {
						index = i;
						return false;
					}
				});
			}
		}

		return index;
	};    
});