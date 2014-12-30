define(['core', 'core/cache'], function(jq, cache) {
    var QueueManager = {
        mkNextFn: function(fn, element, queueName) {
            var that = this,
                binded = fn.bind(element);
            
            function next() {
                that.executeNext(element, queueName);
            };
            
            return function() {
                binded(next);
            };
        },
        executeNext: function(element, queueName, stopCurrent) {
            queueName = queueName || 'fx';
            var fxQueue = cache.getCacheProperty(element, 'queue_' + queueName),
                runningFx = cache.getCacheProperty(element, 'running_' + queueName),
                emptyDef = null,
                newFn = null;
            
            if (stopCurrent === true && runningFx) {
                runningFx.cancel = true;
            }
            
            // queue was reseted ?
            if (typeof fxQueue === 'undefined') {
                return;
            }
            
            // remove current running element if we're working on fx queue
            if (runningFx) {
                if (queueName !== 'fx') {
                    console.log('oops');
                    debugger;
                }
                fxQueue.splice(0, 1);
            }
            
            if (fxQueue.length) {
                if (queueName === 'fx') {
                    cache.setCacheProperty(element, 'running_' + queueName, fxQueue);
                }

                newFn = QueueManager.mkNextFn(fxQueue[0], element, queueName);

                if (queueName !== 'fx') {
                    fxQueue.splice(0, 1);
                }
                
                newFn();
                
                if (queueName === 'fx') {
                    fxQueue[0] = 'inprogress';
                }
            } else {
                emptyDef = cache.getCacheProperty(element, 'empty_queue_' + queueName);
                if (emptyDef) {
                    emptyDef.resolve();
                }
            }
            
            cache.setCacheProperty(element, 'queue_' + queueName, fxQueue);
        },
        
        addToQueue: function(element, fn, queueName) {
            queueName = queueName || 'fx';
            
            var runningFx = cache.getCacheProperty(element, 'running_' + queueName),
                fxQueue = cache.getCacheProperty(element, 'queue_' + queueName),
                runningFn;
            
            if (runningFx || fxQueue) {
                if (fxQueue.length) {
                    fxQueue.push(fn);
                    cache.setCacheProperty(element, 'queue_' + queueName, fxQueue);
                } else {
                    console.log('queue has been cleared, need to stop current running fx');
                    runningFn = fn;
                    
                    if (queueName === 'fx') {
                        cache.getCacheProperty(element, 'running_' + queueName).cancel = true;                        
                        cache.setCacheProperty(element, 'queue_' + queueName, ["inprogress"]);
                        cache.setCacheProperty(element, 'running_' + queueName, runningFn);
                        QueueManager.mkNextFn(fn, element, queueName)();
                    } else {
                        cache.setCacheProperty(element, 'queue_' + queueName, [fn]);
                    }
                }
            } else {
                // run fx
                if (queueName === 'fx') {                
                    QueueManager.mkNextFn(fn, element, queueName)();
                    cache.setCacheProperty(element, 'queue_' + queueName, ["inprogress"]);
                    cache.setCacheProperty(element, 'running_' + queueName, fn);
                } else {
                    cache.setCacheProperty(element, 'queue_' + queueName, [fn]);
                }
            }
            
            return fxQueue || cache.getCacheProperty(element, 'queue_' + queueName);
        },
        
        getQueue: function(element, queueName) {
            queueName = queueName || 'fx';
            return cache.getCacheProperty(element, 'queue_' + queueName);
        },
        
        clearQueue: function(element, queueName) {
            queueName = queueName || 'fx';
            
            cache.setCacheProperty(element, 'queue_' + queueName, []);
        }
    };

    // queue stuff
    jq.queue = function(element, queueName, fn) {
        var queue;
        
        if (typeof fn === 'undefined' && typeof queueName === 'function') {
            fn = queueName;
        }
        
        queueName = typeof queueName === 'string' && queueName || 'fx';
        
        if (arguments.length < 3 && typeof queueName === 'function') {
            fn = queueName;
        }
        
        if (element) {
            queue = QueueManager.getQueue(element, queueName);
            
            if (arguments.length === 3 || typeof fn === 'function') {
                if (typeof fn === 'function') {
                    if (!queue) {
                        queue = QueueManager.addToQueue(element, fn, queueName);
                    } else {
                        QueueManager.addToQueue(element, fn, queueName);
                    }
                } else if (typeof fn !== 'undefined') {
                    setCacheProperty(element, 'queue_' + queueName, fn);
                    queue = QueueManager.mkNextFn(fn, element, queueName);
                }

                return this === jq ? queue : jq(element);
            }
        }
        
        return queue || [];
    }; 
    
    jq.prototype.queue = function() {
        var args = slice.call(arguments, 0),
            that = this,
            res;
                
        args.splice(0, 0, null);
        
        this.each(function() {
            args[0] = this;
            res = jq.queue.apply(that, args);
        });
                         
        return res;
    }
    
    jq.dequeue = function(element, queueName) {
        queueName = queueName || 'fx';
        
        jq(element).dequeue(queueName);
    };
    
    jq.prototype.clearQueue = function(queueName) {
        queueName = queueName || 'fx';
        return this.each(function(i, element) {
            QueueManager.clearQueue(element, queueName);
        });
    };
    // /queue stuff
    

    jq.prototype.dequeue = function(queueName) {
        queueName = queueName || 'fx';
        
        return this.each(function(i, element) {
            QueueManager.executeNext(element, queueName, true);
        });
    };    
    
    return QueueManager;
});