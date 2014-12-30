define(['core', 'deferred/deferred', 'core/cache'], function(jq, Deferred, cache) {
    jq.prototype.promise = function() {
        var queueName = typeof arguments[0] === 'string' ? arguments[0] : 'fx',
            obj,
            that = this,
            def = new jq.Deferred(),
            promise,
            fxDefs = [];

        if (typeof arguments[0] === 'object' && arguments[0]) {
            obj = arguments[0];
        }
        
        if (typeof arguments[1] === 'object' && arguments[1]) {
            obj = arguments[1];
        }
        
        promise = def.promise(obj);

        this.each(function(i, element) {
            // console.log(queueName, fxDefs);
            // TODO: in case of running queue, def should come from queue...
            var fxQueue = cache.getCacheProperty(element, 'queue_' + queueName),
                def = new jq.Deferred(),
                emptyDef = cache.getCacheProperty(element, 'empty_queue_' + queueName, def);
            
            fxDefs.push(def);
            
            // immediately resolve the deferred if queue is empty
            if (typeof fxQueue === 'undefined' || fxQueue.length === 0) {
                console.log('resolve right now!!');
                def.resolve(def);
            }
            
            // TODO: check that empty_queue doesn't already exists ??
            if (emptyDef && !emptyDef.isResolved()) {
//                console.log('isResolved', emptyDef.isResolved());
                emptyDef.done(function() {
                    def.resolve(def);
                });
            } else {
                cache.setCacheProperty(element, 'empty_queue_' + queueName, def);
            }
        });
        
        jq.Deferred.when.apply(jq.Deferred, fxDefs).done(function() {
            console.log('when!!', fxDefs.length, fxDefs[0]);
            def.resolve(that);
        });
        
        return promise;
    }    
});