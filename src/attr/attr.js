define(['core'], function(jq) {
    // input text, input hidden, select/options, textarea (?)
    jq.prototype.val = function(val) {
        var val;
        if (typeof val === 'undefined') {
            if (this.length) {
                if (jq.valHooks[this[0].tagName.toLowerCase()] && jq.valHooks[this[0].tagName.toLowerCase()].get) {
                    val = jq.valHooks[this[0].tagName.toLowerCase()].get(this[0]);
                } else {
                    val = this[0].getAttribute('value') !== null && this[0].getAttribute('value') || this[0].value;
                }
                
                return typeof val !== 'undefined' && val || '';
            } else {
                return val;
            }
        } else {
            return this.each(function(obj, idx) {
                var tag = this;
                switch(this.type) {
                    case 'select-one':
                        if (jq.valHooks['select'] && jq.valHooks['select'].set) {
                            jq.valHooks['select'].set(this, val);
                        } else {
                            // find correct option and select it
                            jq.each(this.children, function(index, element){
                                if (element.tagName === 'OPTION' && element.value === val) {
                                    tag.selectedIndex = index;
                                    return false;
                                }
                            });                            
                        }
                    break;
                        
                    case 'textarea':
                    case 'text':
                        if (jq.valHooks[this.type] && jq.valHooks[this.type].set) {
                            jq.valHooks[this.type].set(this, val);                            
                        } else {
                            this.value = val;
                        }
                    break;
                        
                    default:
                        if (jq.valHooks[this.tagName.toLowerCase()] && jq.valHooks[this.tagName.toLowerCase()].set) {
                            jq.valHooks[this.tagName.toLowerCase()].set(this, val);
                        }
                    break;
                }
            });
        }
    };
    
	// TODO: handle check for checkboxes ?
	jq.prototype.attr = jq.prototype.prop = function() {
		var attrName = arguments[0],
			value = arguments[1],
            that = this;

		if (typeof value !== 'undefined') {
			if (this.length) {
				this.each(function() {
					this.setAttribute(attrName, value);
				});
			}
			return this;
		} else if (typeof attrName === 'object') {
             jq.each(attrName, function(name, val) {
                console.log('setting', name, 'to', val);
                that.each(function() {
                    this.setAttribute(name, val);
                });
            });
            return this;
        } else {
			if (this.length) {
				return this[0].getAttribute(attrName);
			} else {
				return undefined;
			}
		}
	}

	jq.prototype.removeAttr = function(attr) {
		if (jq.isArray(attr)) {
			this.each(function() {
				var element = this;
				jq.each(attr, function(attrName) {
					element.removeAttribute(attrName);
				});
			});
		}
	};
    
    jq.valHooks = {};
});