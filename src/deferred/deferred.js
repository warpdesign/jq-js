// deferred/deferred
//deferred.always()
//Add handlers to be called when the Deferred object is either resolved or rejected.
//deferred.done()
//Add handlers to be called when the Deferred object is resolved.
//deferred.fail()
//Add handlers to be called when the Deferred object is rejected.
//Also in: Deprecated > Deprecated 1.7
//deferred.isRejected()
//Determine whether a Deferred object has been rejected.
//Also in: Deprecated > Deprecated 1.7
//deferred.isResolved()
//Determine whether a Deferred object has been resolved.
//deferred.notify()
//Call the progressCallbacks on a Deferred object with the given args.
//deferred.notifyWith()
//Call the progressCallbacks on a Deferred object with the given context and args.
//Also in: Deprecated > Deprecated 1.8
//deferred.pipe()
//Utility method to filter and/or chain Deferreds.
//deferred.progress()
//Add handlers to be called when the Deferred object generates progress notifications.
//deferred.promise()
//Return a Deferred’s Promise object.
//deferred.reject()
//Reject a Deferred object and call any failCallbacks with the given args.
//deferred.rejectWith()
//Reject a Deferred object and call any failCallbacks with the given context and args.
//deferred.resolve()
//Resolve a Deferred object and call any doneCallbacks with the given args.
//deferred.resolveWith()
//Resolve a Deferred object and call any doneCallbacks with the given context and args.
//deferred.state()
//Determine the current state of a Deferred object.
//deferred.then()
//Add handlers to be called when the Deferred object is resolved, rejected, or still in progress.
//jQuery.Deferred()
//A constructor function that returns a chainable utility object with methods to register multiple callbacks into callback queues, invoke callback queues, and relay the success or failure state of any synchronous or asynchronous function.
//Also in: Core
//jQuery.when()
//Provides a way to execute callback functions based on one or more objects, usually Deferred objects that represent asynchronous events.
//.promise()
define(['utils/isFunction'], function(isFunction) {
    var slice = Array.prototype.slice,
        toArray = function(arr) {
            return (typeof arr === 'object') ? slice.apply(arr) : arr;
        },
        fire = function(handler, args, ctx) {
            handler.apply(ctx, args);
        };
    
    function D(callback) {
		var state = 'pending',
            fns = [
                [], // done
                [], // fail
                []  // progress
            ],
            resultArgs = [],
            lock = false,
            ctx = null,
            defObj = null,
            promise = {
                promise: function(obj) {
                    if (obj == null) {
                        return promise;
                    } else {
                        for (var i in promise) {
                            obj[i] = promise[i];
                        }
                        return obj;
                    }                    
                }
            },
            def = {
                state: function() {
                    return state;
                },
                
                pipe: function() {
                    var newDef = new D(),
                        that = this,
                        pipeArgs = arguments;
                    
                    [["resolve", "done"],
                     ["reject", "fail"],
                     ["notify", "progress"]].forEach(function(action, i) {
                        that[action[1]](function() {
                            var deferArgs = slice.apply(arguments),
                                pipeRes = null;
                            // TODO: pass the filter
                            if (pipeArgs[i]) {
                                pipeRes = pipeArgs[i].apply(ctx || newDef, deferArgs);
                                // two possible cases here: a value, or a new deferred
                                (function(pipeRes, ctx) {
                                    if (pipeRes && isFunction(pipeRes.fail) && isFunction(pipeRes.done)) {
                                        pipeRes.done(function() {
                                            newDef.resolve.apply(ctx, slice.apply(arguments));
                                        });
                                        pipeRes.fail(function() {
                                            newDef.reject.apply(ctx, slice.apply(arguments));
                                        });
                                    } else {
                                        newDef[action[0]].apply(ctx, [pipeRes]);
                                    }
                                })(pipeRes, ctx || newDef);
                            }
                            // newDef[action[0]].apply(newDef, slice.apply(arguments));
                        });
                    });
                    
                    return newDef.promise();
                }
            };
        
        def.then = def.pipe;
        
        [["resolve", "resolved", "done"],
         ["reject", "rejected", "fail"],
         ["notify", "pending", "progress"],
         [null, null, "always"]].forEach(function(action, i) {
            if (action[0]) {
                def[action[0]] = function() {
                    resultArgs = slice.apply(arguments);
                    if (state === 'pending') {
                        state = action[1];
                        lock = true;
                        fns[i].forEach(function(fn) {
                            fire(fn, resultArgs, deferred);
                        });
                    }
                    return this;
                };
                
                def[action[0] + 'With'] = function() {
                    resultArgs = slice.call(arguments, 1);
                    if (state === 'pending') {
                        state = action[1];
                        lock = true;
                        fns[i].forEach(function(fn) {
                            fire(fn, resultArgs, arguments[0]);
                        });
                    }
                    return this;
                };                
            }
            
            promise[action[2]] = function() {
                var that = this;
                toArray(arguments).forEach(function(fn) {
                    if (state !== 'pending' && (!action[0] || state === action[1])) {
                        fn.apply(ctx || that, resultArgs);
                    }
                    if (action[0]) {
                        fns[i].push(fn.bind(ctx || that));
                    } else {    // always
                        fns[0].push(fn.bind(ctx || that));
                        fns[1].push(fn.bind(ctx || that));
                    }
                });
                return this;
            };
        });
        
        promise['isResolved'] = function() {
            return state === 'resolved';
        }
        
        promise['isRejected'] = function() {
            return state === 'rejected';
        }        
        
        defObj = promise.promise(def);

		if (callback) {
			callback.apply(defObj, [defObj]);
		}        
        
        return defObj;
    };

	D.when = function() {
		if (arguments.length < 2) {
			var obj = arguments.length ? arguments[0] : undefined;
			if (obj && (typeof obj.isResolved === 'function' && typeof obj.isRejected === 'function')) {
				return obj.promise();
			}
			else {
				return D().resolveWith(window, [obj]).promise();
			}
		}
		else {
            // TODO: missing signature: when(def, obj);
			return (function(args){
				var df = D(),
					size = args.length,
					done = 0,
					rp = new Array(size),	// resolve params: params of each resolve, we need to track down them to be able to pass them in the correct order if the master needs to be resolved
                    pp = new Array(size),
                    whenContext = [];

				for (var i = 0; i < args.length; i++) {
                    whenContext[i] = args[i] && args[i].promise ? args[i].promise() : undefined;
					(function(j) {
                        var obj = null;
                        
                        if (!args[j].done) {
                            obj = args[j];
                            args[j] = new D();
                        }
                        args[j].done(function() { 
                            rp[j] = (arguments.length < 2) ? arguments[0] : arguments;
                            if (++done == size) { df.resolve.apply(whenContext, rp); }})
                        .fail(function() { df.reject.apply(whenContext, arguments); });                        

                        args[j].progress(function() {
                            pp[j] = (arguments.length < 2) ? arguments[0] : arguments;
                            df.notify.apply(whenContext, pp);
                        });                        
                        
                        if (obj) {
                            args[j].resolve(obj);
                        }
					})(i);
				}

				return df.promise();
			})(arguments);
		}
	}    
    
	return D;
});