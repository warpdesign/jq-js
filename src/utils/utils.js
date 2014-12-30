define(['core', 'utils/isFunction', 'utils/inArray', 'utils/trim'], function(jq, isFunction, inArray, trim) {
	jq.isNumeric = function(x) {
		return !isNaN(parseFloat(x))&&isFinite(x);
	};

    jq.trim = trim;

	jq.isFunction = isFunction;

    jq.inArray = inArray;
    
	jq.isArray = function(arr) {
		return Array.isArray(arr);
	};

    jq.isPlainObject = function(obj) {
        return typeof obj === 'object' && (obj !== null && obj !== obj.window) && obj.__proto__ == Object.prototype;
    };
    
    // not documented but seems to be used by (at least) jQuery UI
    jq.camelCase = function(str) {
        return str.replace(/-+(.)?/g, function(reg, c){
            return c && c.toUpperCase() || '';
        });
    };
    
    jq.map = function(obj, callback) {
        var array = [];
        
        jq.each(obj, function(key, val) {
            array.push(callback.call(window, val, key));
        });
            
        return array;
    };

    jq.prototype.map = function(callback) {
        var newJq = new jq();
        
        this.each(function(key, domElt) {
            newJq.push(callback.call(domElt, domElt, key));
        });
        
        return newJq;
    };
    
    // deprecated
    jq.prototype.size = function() {
        return this.length;
    };
    
    jq.prototype.isArray = Array.isArray;
    
    jq.noop = function() {};    
});