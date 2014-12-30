define(['core', 'filter/filter'], function(jq) {    
    jq.prototype.find = function(selector) {
        var newJq = new jq(selector, this);

		newJq.source = this;

		return newJq;
    };
    
	jq.prototype.end = function() {
		// end of chain reached
		if (this.source === this) {
			return new jq();
		} else {
			return this.source;
		}
	};
    
    jq.prototype.parent = function(selector) {
        var newJQ = new jq();
        
        this.forEach(function(element) {
            if (element.parentNode && newJQ.indexOf(element.parentNode) === -1) {
                if (!selector || element.parentNode.matchesSelector(selector)) {
                    newJQ.push(element.parentNode);
                }
            } else if (element === document.body.parentNode && !selector || element.parentNode.matchesSelector(selector)) {
                newJQ.push(document);
            }
        });
        
		newJQ.source = this;

        return newJQ;
    };

    jq.prototype.parents = function(selector) {
        var newJq = new jq(),
            i = this.length - 1,
            element = null,
            idx = 0;
        
        for (; i >= 0; i--) {
            element = this[i].parentElement;
            
            while(element) {
                if (!selector || element.matchesSelector(selector)) {
                    idx = newJq.indexOf(element);
                    if (idx !== -1) {
                        newJq.splice(idx, 1);
                        newJq.push(element);
                    } else {
                        newJq.push(element);
                    }
                }
                element = element.parentElement;
            }
        }

		newJq.source = this;

        return newJq;
    };

    jq.prototype.parentsUntil = function(selector, filter) {

        var newJq = new jq(),
            i = this.length - 1,
            element = null,
            idx = 0;
        
        for (; i >= 0; i--) {
            element = this[i].parentElement;
            
            while(element) {
                if (!selector || ((typeof selector !== 'string' || !element.matchesSelector(selector)) && element !== selector)) {
                    idx = newJq.indexOf(element);
                    if (idx !== -1) {
                        newJq.splice(idx, 1);
                        newJq.push(element);
                    } else {
                        newJq.push(element);
                    }
                    element = element.parentElement;                    
                } else {
                    break;
                }
            }
        }        
        
		newJq.source = this;

        if (filter) {
            return newJq.filter(filter);
        } else {
            return newJq;
        }
    };
    
	jq.prototype.children = function(selector) {
		var newJq = new jq();

		this.forEach(function(element) {
			var i = 0,
				max = element.childNodes.length;

			for (; i < max; i++) {
				if (element.childNodes[i].nodeType === 1 && (!selector || element.childNodes[i].matchesSelector(selector))) {
					newJq.push(element.childNodes[i]);
				}
			}
		});

		newJq.source = this;

		return newJq;
	};
    
    jq.prototype.nextAll = function(selector) {
        var newJq = new jq();
        
        newJq.source = this;
        
        this.each(function(idx, elt) {
            var sibling = elt.nextElementSibling;
            
            while (sibling) {
                if (!selector || sibling.matchesSelector(selector)) {
                    newJq.push(sibling);
                }
                sibling = sibling.nextElementSibling;
            }
        });
        
        return newJq;
    };
    
	jq.prototype.contents = function() {
		var newJq = new jq();

		this.forEach(function(element) {
			var i = 0,
				max = element.childNodes.length;

			for (;i < max; i++) {
				newJq.push(element.childNodes[i]);
			}
            
            if (element instanceof HTMLFrameElement || element instanceof HTMLIFrameElement) {
                newJq.push(element.ownerDocument);
            }
		});

		newJq.source = this;

		return newJq;
	};    
});