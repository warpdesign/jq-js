define(['core', 'core/cache'], function(jq, cache) {
    var dataCache = [],
        dataCacheIndex = [];
    
    function getData(domElt, key) {
        var idx = dataCacheIndex.indexOf(domElt),
            data = null;
        if (domElt) {
            if (idx === -1) {
                dataCacheIndex.push(domElt);
                idx = dataCacheIndex.length - 1;
                dataCache[idx] = {};
            }
            data = jq.extend({}, domElt.dataset, dataCache[idx]);
        }
        
        return (data && key) ? data[key] : data;
    };
    
    function setData(domElt, key, value) {
        var data = getData(domElt, typeof key === 'string' ? key : undefined),
            idx = dataCacheIndex.indexOf(domElt);
        
        if (arguments.length < 3 && typeof key === 'object') {
            jq.extend(true, dataCache[idx], key);
        } else if (typeof key === 'string' && arguments.length > 2){
            // TODO: should extend object when a object is passed ?
            dataCache[idx][key] = value;
        } else if (typeof key === 'undefined' && arguments.length < 3) {
            // remove all (data(undefined))
            dataCache[idx] = {};
        } else {
            console.warn('oops - unhandled case for setData');
        }
    };
    
    // TODO: string checking, see: http://www.w3.org/TR/html5/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes
    jq.prototype.data = function(key, data) {
        var args = arguments;
        
        // GET
        if ((!arguments.length || (arguments.length === 1 && (typeof key).match(/string|undefined/)))) {
            return getData(this[0], key);
        } else {
            // SET
            return this.each(function(idx, domElt) {
                if (args.length > 1 && typeof data !== 'undefined') {
                    setData(domElt, key, data);
                } else {
                    setData(domElt, key);
                }
            });
        }
    };

    jq.prototype.hasData = function(domElt) {
        return dataCacheIndex.indexOf(domElt) !== -1;
    };
    
    jq.prototype.removeData = function(key) {
        var keys;

        if (!arguments.length) {
            return this.each(function(idx, domElt) {
                setData(domElt, undefined);
            });
        } else if ((typeof key).match(/string|object/)){
            keys = !jq.isArray(key) && key.split(/\s+/) || key;
            
            return this.each(function(idx, domElt) {
                jq.each(keys, function(i, k) {
                    setData(domElt, k, undefined);
                });
            });
        }
        
        return this;
    };
    
    jq.data = function(element) {
        return jq.prototype.data.apply(jq(element), slice.call(arguments, 1));
    };
    
	jq._data = function(element, property) {
		if (element instanceof jq) {
			element = element[0];
		}

		return cache.getCacheProperty(element, property);
	};

	jq._removeData = function(element) {
		cache.delCache(element);
	};    
});