define(['core'], function(jq) {
    jq.prototype.append = function(content) {
        if (content) {
            if (content instanceof HTMLElement) {
                this.forEach(function(element) {
                    element.appendChild(content);
                });
            } else if (content instanceof jq) {
                this.forEach(function(element) {
                    content.forEach(function(subcontent) {
                        element.appendChild(subcontent);
                    });
                });                    
            } else if (content && content.length) {
                this.forEach(function(element) {
                    element.innerHTML += content;
                });
            }
        }
        
        return this;
    };

    jq.prototype.prepend = function(content) {
        if (content) {
            if (content instanceof HTMLElement) {
                this.forEach(function(element) {
                    var firstNode = element.childNodes[0];
                    
                    if (firstNode) {
                        element.insertBefore(content, firstNode);
                    } else {
                        element.appendChild(content);
                    }
                });
            } else if (content instanceof jq) {
                this.forEach(function(element) {
                    content.forEach(function(subcontent) {
//                        element.appendChild(subcontent);
                        var firstNode = element.childNodes[0];
                        
                        if (firstNode) {
                            element.insertBefore(subcontent, firstNode);
                        } else {
                            element.appendChild(subcontent);
                        }                        
                    });
                });                    
            } else if (content && content.length) {
                this.forEach(function(element) {
                    element.innerHTML = content + element.innerHTML;
                });
            }
        }
        
        return this;
    };

    jq.prototype.prependTo = function(content) {
        if (content instanceof jq) {
            content.prepend(this);
        } else {
            new jq(content).prepend(this);
        }
        
        return this;
    };
    
    jq.prototype.appendTo = function(content) {
        if (content instanceof jq) {
            content.append(this);
        } else {
            new jq(content).append(this);
        }
        
        return this;
    };
    
    // TODO: remove events as well ?
    // TODO: remove associated cached properties
    // there are not right now
    jq.prototype.detach = function(selector) {
        var removedElements = new jq();
        
        this.forEach(function(element) {
            var parent = element.parentElement;
            
            if (parent && (!selector || element.matchesSelector(selector))) {
                removedElements.push(element);
                parent.removeChild(element);
            }
        });
        
        return removedElements;
    };
    
    jq.prototype.remove = function(selector) {
        this.detach();
        
        // also remove _data stuff
        return this.each(function() { 
            jq._removeData(this);
        });
        
        // TODO: remove events as well
    };

	// FIXME: jq.add([]), jq.add(selector, context) should be in order of DOM
	jq.prototype.add = function(collection, context) {
		var newJq = new jq(this);

		if (collection instanceof jq) {
			collection.forEach(function(element) {
				if (newJq.indexOf(element) === -1) {
					newJq.push(element);
				}
			});
		} else if (typeof collection === 'string') {
			collection = new jq(collection, context);

			collection.forEach(function(element) {
				if (newJq.indexOf(element) === -1) {
					newJq.push(element);
				}
			});
		} else if (Array.isArray(collection)) {
			collection.forEach(function(element) {
				if (newJq.indexOf(element) === -1) {
					newJq.push(element);
				}
			});
		}

		return newJq;
	};
    
    jq.prototype.text = function(text) {
        var res = '';
        
        if (text) {
            this.forEach(function(element) {
                element.innerText = text;
            });
            
            return this;
        } else {
            this.forEach(function(element) {                    
                res += element.innerText;
            });
            
            return res;
        }
    };
    
    jq.prototype.html = function(html) {
        var res = '';
        
        if (html) {
            this.forEach(function(element) {
                element.innerHTML = html;
            });
            
            return this;
        } else {
            return this[0] && this[0].innerHTML || null;
        }
    };
    
    jq.prototype.insertAfter = function(target) {
        var newJq = new jq(),
            i = 0,
            that = this,
            target = jq(target),
            needClone = target.length > 1;
        
        if (this.length) {
            target.each(function(index, element) {
                that.each(function(thisIndex, thisElement) {
                    var newElement = thisElement;
                    if (needClone) {
                        var newElement = jq(thisElement).clone().get(0);
                    }
                    element.parentNode.insertBefore(newElement, element.nextSibling);
                    newJq.push(newElement);                    
                });
            });
            
            if (needClone) {
                newJq.push(this[0]);
            }
        }
        
        return newJq;
    };

    jq.prototype.insertBefore = function(target) {
        var newJq = new jq(),
            i = 0,
            that = this,
            target = jq(target),
            needClone = target.length > 1;
        
        if (this.length) {
            target.each(function(index, element) {
                that.each(function(thisIndex, thisElement) {
                    var newElement = thisElement;
                    if (needClone) {
                        var newElement = jq(thisElement).clone().get(0);
                    }
                    element.parentNode.insertBefore(newElement, element);
                    newJq.push(newElement);                    
                });
            });
            
            if (needClone) {
                newJq.push(this[0]);
            }
        }
        
        return newJq;
    };    
    
    jq.prototype.empty = function() {
        return this.html('');
    };
    
	// TODO: handle with* parameters
	// for now, we use DOMNode.cloneNode() method
	jq.prototype.clone = function(withDataEvents, deepWithDataEvents) {
		var newJq = new jq();

        newJq.source = this;
        
		if (arguments.length) {
			throw 'jq.clone() - parameters not supported yet';
		} else {
			this.forEach(function(element) {
				newJq.push(element.cloneNode(true));
			});
		}

		return newJq;
	};
    
    // TODO: remove duplicates
    jq.prototype.addBack = function() {
        var newJq = this;
        
        if (this.source !== this) {
            newJq = new jq(this.source);
            this.each(function() {
                newJq.push(this);
            });
            return newJq;
        }
        
        return newJq;
    };
    
    // TODO: handle disconnected nodes (jQuery 1.4+)
    // TODO: handle function
    jq.prototype.replaceWith = function(content) {
        var newJq = new jq(content);
        this.forEach(function(element) {
            newJq.insertBefore(element);
            jq(element).remove();
        });
    };
});