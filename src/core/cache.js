// core/cache.js
define(function() {
    var cachedElements = [],
        cache = [];
    
    return {
        getCachedElements: function() {
            return cachedElements;
        },
        getAllCache: function() {
            return cache;
        },
        getCache: function(element) {
            var idx = cachedElements.indexOf(element);
            
            if (idx > -1) {
                return cache[idx];
            } else {
                return undefined;
            }
        },
        
        delCache: function(element) {
            var idx = cachedElements.indexOf(element);
    
            if (idx > -1) {
                cache[idx] = {};
            }
        },
    
        getCacheProperty: function(element, property) {
            var cache = this.getCache(element);
            
            if (cache && typeof cache[property] !== 'undefined') {
                return cache[property];
            }
            
            return undefined;
        },
        
        setCacheProperty: function(element, property, value) {
            var idx = cachedElements.indexOf(element),
                obj;
    
            if (idx === -1) {
                idx = cachedElements.length;
                
                obj = {};
                obj[property] = value,
    
                cache.push(obj);
                cachedElements.push(element);
            } else {
                cache[idx][property] = value;
            }
        }
    };
});