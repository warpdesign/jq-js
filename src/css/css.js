define(['core', 'core/cache', 'core/dom'], function(jq, cache, dom) {
    var prefix = (function () {
        var styles = window.getComputedStyle(document.documentElement, ''),
        pre = (Array.prototype.slice
          .call(styles)
          .join('') 
          .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
        )[1],
        dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
      return {
        dom: dom,
        lowercase: pre,
        css: '-' + pre + '-',
        js: pre[0].toUpperCase() + pre.substr(1)
      };
    })(),
    // these properties may need prefix: since it's changing frequently, we need to generate that at run time
    mayNeedPrefix = "order|border-radius|box-shadow|column-count|transition-property|transform|transition-duration|animation",
    needPrefix = getPrefixRegExp(mayNeedPrefix),// /^(order|column-count)$/g,
    defaultDisplay = {
        "html"     : "block",
        "div"      : "block",
        "p"        : "block",
        "a"        : "inline",
        "code"     : "inline",
        "pre"      : "block",
        "span"     : "inline",
        "table"    : "table",	// old
        "thead"    : "table-header-group",	// old
        "tbody"    : "table-row-group",	// old
        "tr"       : "table-row",	// old
        "th"       : "table-cell",	// old
        "td"       : "table-cell",	// old
        "ul"       : "block",
        "li"       : "list-item",	// old
        "tt"	   : "inline",
        "dfn"	   : "inline"
    };

    console.log('neededPrefixes', needPrefix);

    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
    }
    
    function hyphensToCamel(str) {
        return str.replace(/-([a-z])/g, function (m, w) {
            return w.toUpperCase();
        });
    }
    
    function camelToHyphens(str) {
        return str.replace(/([A-Z])+/g, function(match) {return '-' + match.toLowerCase(); });
    }
    
    function getPrefixRegExp(allPrefixes) {
        var styles = window.getComputedStyle(document.createElement('div'), null),
            properties = [];
        
        mayNeedPrefix.split('|').forEach(function(p) {
            !!!styles.getPropertyValue(p) && properties.push(p);
        });
        
        return new RegExp('^(' + properties.join('|') + ')$', 'g');
    }
    
	function addPrefix(property) {
		return property.replace(needPrefix, prefix.css + '$1')
	}
    
    function fixCssValue(element, property, value, force) {
		var styles,
			reg;

		if ( !element || element.nodeType === 3 || element.nodeType === 8 || !element.style ) {
			return;
		}        
        
        // set
		if (typeof value !== 'undefined') {
			if (property.match(/width|height|padding|margin|top|left|right|bottom|opacity/)) {
				reg = value && value.match && value.match(/\s*(\+|-)\s*=(-)*\s*(\d+\.*\d*)/) || null;
                // handle +=/-=
				if (reg && reg.length > 2) {
					value = parseFloat(fixCssValue(element, property));
					if (reg[1] === '-') {
						if (reg.length > 3 && reg[2]) {
							value += Number(reg[3]);
						} else {
							value -= Number(reg[3]);
						}
					} else {
						if (reg.length > 3 && reg[2]) {
							value -= Number(reg[3]);
						} else {
							value += Number(reg[3]);
						}
					}
				} else if ((!value.toString().length && !dom.isAttached(element)) || (property.match(/width|height|padding|opacity/i) && value < 0)) {
					value = '0';
				}
                    
				if (property !== 'opacity' && !jq.trim(value.toString()).match(/(em|px|%)$/)) {
					value += 'px';
				}
				return value;
			}
        } else {    // get
			// need to get css property value: we need to handle disconnected nodes with a special way
			if (force || !dom.isAttached(element)) {
				value = element.style[hyphensToCamel(addPrefix(property))];
                
				if (property.match(/width|height|padding|margin|top|left|right|bottom|opacity/i) && (!value || !value.length)) {
					value = '0';
					if (property !== 'opacity') {
						value += 'px';
					}
				} else if (!value.length && element === document.documentElement && property === 'display') {    // default style for <html> element is none
                    value = 'none';
                }
                if (force) {
                    return value;
                }
			} else {
				styles = window.getComputedStyle(element, null);
                // Do we need to use prefix when fetching values using getPropertyValue() ?
				value = styles.getPropertyValue(addPrefix(property));
				if (value === null) {
					value = undefined;
				}
			}
            // some attributes with "normal" value should be converted to numeric values
            if (property.match(/letter/) && value === 'normal') {
                value = '0';
            } else if (property.match(/weight/) && value === 'normal') {
                value = '400';
            } else if (property.match(/top|left/) && value.toString().match(/(%)$/)) {
                // fix for webkit bug: jq.css('top') should convert % values to px
                // we get offsetTop in this case (problem: what happens when node is detached ?)
                value = element['offset' + capitalizeFirst(property)] + 'px';
            }
		}

        return value;
    }

    // internal
    jq.style = function() {
        var args = Array.prototype.slice.call(arguments, 0);
        
        for (var i = 0; i <= arguments.length - 2; ++i)
            args.push(undefined);
        
        args.push(true);
        
        return fixCssValue.apply(this, args);
    };
    
    jq.prototype.css = function() {
        var res = this,
			that = this,
            styles = null,
            properties = arguments[0],
            value = arguments[1],
			newValue,
            property,
            newProperty;

        if (arguments.length === 1) {
            if (Array.isArray(properties) && this[0].nodeType === 1) {
                res = {};
                /**** GET */                
                properties.forEach(function(property) {
                    property = jq.cssProps[property] || property;
                    
                    newProperty = camelToHyphens(property);
                    if (jq.cssHooks[property] && jq.cssHooks[property].get) {
                        res[property] = jq.cssHooks[property].get(that[0], true);
                    } else {
                        res[property] = fixCssValue(that[0], newProperty);
                    }
                });
            } else if (typeof properties === 'string' && typeof this[0] === 'undefined') {
                debugger;
            } else if (typeof properties === 'string' && this[0].nodeType === 1) {
                /**** GET */                
                properties = jq.cssProps[properties] || properties;
                newProperty = camelToHyphens(properties);
                if (jq.cssHooks[properties] && jq.cssHooks[properties].get) {
                    res = jq.cssHooks[properties].get(this[0], true);
                } else {
                    res = fixCssValue(this[0], newProperty);
                }                

            } else if (typeof properties === 'object') {
                /**** SET */
                for (var property in properties) {
					if (properties[property] !== null && typeof properties[property] !== 'undefined') {
						this.forEach(function(element, index) {
							if (element.nodeType !== 1) {
								return;
							}
							if (typeof properties[property] === 'function') {
								newValue = properties[property].call(element, index, jq(element).css(property));
							} else {
								newValue = properties[property];
							}

                            property = jq.cssProps[property] || property;
                            
							newProperty = property.replace(/([A-Z])+/g, function(match) {return '-' + match.toLowerCase(); });
                            if (jq.cssHooks[property] && jq.cssHooks[property].set) {
				                jq.cssHooks[property].set(element, newValue);
                            } else {
				                // element.style[addPrefix(newProperty)] = fixCssValue(element, newProperty, newValue);
                                element.style.setProperty(addPrefix(newProperty), fixCssValue(element, newProperty, newValue));
                            }
						});
					}
                }
            }
            
            return res;                
        } else {
            this.forEach(function(element, index) {
				if (element.nodeType !== 1) {
					return;
				}
				if (value !== null && typeof value !== 'undefined')
				{
                    /**** SET */
					if (typeof value === 'function') {
						newValue = value.call(element, index, jq(element).css(properties));
					} else {
						newValue = value;
					}
                    properties = jq.cssProps[properties] || properties;
                    
					newProperty = properties.replace(/([A-Z])+/g, function(match) {return '-' + match.toLowerCase(); });
                    if (jq.cssHooks[properties] && jq.cssHooks[properties].set) {
					   jq.cssHooks[properties].set(element, newValue);
                    } else {
					   // element.style[addPrefix(newProperty)] = fixCssValue(element, newProperty, newValue);
                        element.style.setProperty(addPrefix(newProperty), fixCssValue(element, newProperty, newValue));
                    }
				}
            });
        }
        
        return this;
    };

	// TODO: element must be a tag (no comment, text node,...)
	jq.prototype.offset = function(stopAtElement) {
		var offset = {
				top: 0,
				left: 0
			},
			body = document.body,
			element;

		if (this.length) {
			element = this[0];

			while(element && element !== body) {
				offset.top += element.offsetTop;
				offset.left += element.offsetLeft;
				element = element.offsetParent;
				
				if (stopAtElement === true) {
					break;
				}
			}
		}

		return offset;
	};

	// TODO: test me
	jq.prototype.position = function() {
		return this.offset(true);
	};
    
    // TODO: jq.show([duration] [complete]),
    // TODO: jq.show(options),
    // TODO: jq.show(duration, [easing], [complete]) 
    jq.prototype.show = function() {
        this.forEach(function(element) {
			if (element.nodeType === 3) {
				return;
			}

            var isAttached = dom.isAttached(element),
                currentDisplay = isAttached ? window.getComputedStyle(element, null)['display'] : element.style['display'],
                newDisplay,
                cachedDisplay;
            
            // fall back to inline style if element isn't attached to the DOM yet
            currentDisplay = currentDisplay || "";
            
            // not attached div
            if (!currentDisplay.length) {
                newDisplay = cache.getCacheProperty(element, 'olddisplay') || defaultDisplay[element.tagName.toLowerCase()] || 'block';
            
                element.style['display'] = newDisplay;
            } else if (currentDisplay.match('none')) {  // only show if hidden
                if (element.style.display.match('none')) {
                    element.style.display = '';
                }
                
                // we need to get cached value (if any) first
                cachedDisplay = cache.getCacheProperty(element, 'olddisplay');
                
                if (typeof cachedDisplay === 'string') {
                    element.style['display'] = cachedDisplay;
                } else {
                    // in case of detached element, getComputedStyle can return unpredicatable results
                    // (eg. Firefox will return block for a detached <span>
                    // so we get default display instead
                    if (!isAttached) {
                        newDisplay = defaultDisplay[element.tagName.toLowerCase()] || 'block';
                    } else {
                        currentDisplay = window.getComputedStyle(element, null)['display'];
                        
                        if (currentDisplay.match('none') || !currentDisplay.length) {
                            newDisplay = defaultDisplay[element.tagName.toLowerCase()] || 'block';
                        }
                    }
                    element.style['display'] = newDisplay;
                }
            }
        });
        
        return this;
    };
    
    jq.prototype.width = function() {
        var width = arguments[0];
        
        if (typeof width !== 'undefined') {
            if (typeof width === 'function') {
                this.forEach(function(element, i) {
                    var jdom = jq(element);
                    
                    jdom.css(width.call(element, i, jdom.width()));
                });
            } else {
                this.css('width', width);
            }
            
            return this;
        } else if (this.length) {
            return this[0] === window ? window.document.width : parseFloat(this.eq(0).css('width'));
        } else {
            return null;
        }
    };
    
    jq.prototype.height = function() {
        var height = arguments[0];
        
        if (typeof height !== 'undefined') {
            if (typeof height === 'function') {
                this.forEach(function(element, i) {
                    var jdom = jq(element);
                    
                    jdom.css(height.call(element, i, jdom.height()));
                });
            } else {
                this.css('height', height);
            }
            
            return this;
        } else if (this.length) {
            return this[0] === window ? this[0].innerHeight : parseFloat(this.eq(0).css('height'));
        } else {
            return null;
        }
    };    
    
    jq.prototype.hide = function() {
        this.forEach(function(element) {
			if (element.nodeType === 3) {
				return;
			}
            
            var currentDisplay = "";
        
            // if element is not attached getComputedStyle will return unpredicatable results
            if (!dom.isAttached(element)) {
                currentDisplay = element.style['display'];
            } else {
                currentDisplay = window.getComputedStyle(element, null)['display'];
            }
            
            // do not cache pre-hidden state
            if (currentDisplay.length && currentDisplay !== 'none') {
                cache.setCacheProperty(element, 'olddisplay', currentDisplay);
            }
            
            element.style['display'] = 'none';
        });
        return this;
    };
    
    // TODO: handle other signatures
    jq.prototype.toggle = function() {
        var visibility = typeof arguments[0] === 'boolean' ? arguments[0] : null;
        
        return this.each(function() {
            if (visibility === null) {
                visibility = !jq(this).is(':visible');
            }
            
            if (visibility) {
                jq(this).show();
            } else {
                jq(this).hide();
            }
        });
    };
    
	jq.prototype.outerWidth = function(includeMargin) {
		var jelt,
			width;

		if (this.length) {
			jelt = this.eq(0);
			
			width = jelt.width() + parseFloat(jelt.css('padding-left')) + parseFloat(jelt.css('padding-right'));

			if (includeMargin === true) {
				width += Math.abs(parseFloat(jelt.css('margin-left'))) + Math.abs(parseFloat(jelt.css('margin-right')));
			}
			return width;
		} else {
			return null;
		}
	};

	jq.prototype.outerHeight = function(includeMargin) {
		var jelt,
			height;

		if (this.length) {
			jelt = this.eq(0);
			
			height = jelt.height() + parseFloat(jelt.css('padding-top')) + parseFloat(jelt.css('padding-bottom'));

			if (includeMargin === true) {
				height += Math.abs(parseFloat(jelt.css('margin-top'))) + Math.abs(parseFloat(jelt.css('margin-bottom')));
			}
			return height;
		} else {
			return null;
		}
	};
    
	// not documented: needed for tests ?
	jq.css = function(element, property) {
		if (arguments.length > 2) {
			throw 'jq.css() - 3 arguments not ready';
		} else {
			return fixCssValue(element, property);
		}
	};
    
    jq.cssProps = {};
    jq.cssHooks = {};

    var cssExpansion = ['Top', 'Right', 'Bottom', 'Left'];
    
	jq.each({'margin':'', 'padding': '', 'border': 'Width'}, function(property, sub) {
        jq.cssHooks[property + sub] = {
            'expand': function(val) {
                var values = typeof val === 'string' ? val.split(' ') : [val],
                    i = 0,
                    expanded = {};
                
                for (;i < 4; i++) {
                    expanded[property + cssExpansion[i] + sub] = values[i] || values[i-2] || values[0];
                }
                
                return expanded;
            }
        }
    });

    jq.each({
        'Top': 'pageYOffset',
        'Left': 'pageXOffset'
    }, function(att, winAtt) {
        jq.prototype['scroll' + att] = function(offset) {
            var elt,
                offsetAtt;
    
            if (typeof offset === 'undefined') {
                offsetAtt = this[0] === window ? winAtt : 'scroll' + att;
                
                if (this[0] === window.document) {
                    elt = document.body;
                } else {
                    elt = this[0];
                }
    
                return elt[offsetAtt];
    
            } else if (this.length){
                offset = parseInt(offset);
                return this.each(function() {
                    if (this === window) {
                        this.scrollTo(att === 'Top' ? jq(this).scrollLeft() : offset, att === 'Top' ? offset : jq(this).scrollTop());
                    } else {
                        this.offsetAtt = offset;
                    }                        
                });
            }            
        };
    });    
});