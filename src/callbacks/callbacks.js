define(['core'], function(jq) {
    jq.Callbacks = function() {
        var supportedFlags = 'once,memory,unique,stopOnFalse',
            arr = [],
            slice = arr.slice,
            callbacks = {};
    
        function getFlags(flags) {
            var flagList = {};

            flags = typeof flags === 'string' && flags || '';
        
            supportedFlags.split(',').forEach(function(flag) {
                flagList[flag] = flags.match(flag) !== null;
            });
        
            return flagList;
        }
    
        var fns = [],
            flags = getFlags(arguments[0]),
            fired = 0,
            lock = false,
            disabled = false;

        function toggleLock() {
            lock = !lock;
        }
        
        function isLocked() {
            return lock === true;
        }
    
        return {
            add: function(fn) {
                if (!lock && (!flags.unique || fns.indexOf(fn) === -1)) {
                    fns.push(fn);
                } else {
                    console.log('attempt to add while lock: what to do ?');
                }
            },
            
            fireWith: function(context) {
                var params = slice.call(arguments, 1);
                
                context = context || this;
                
                if (!lock && !disabled) {
                    toggleLock();
                    if ((!flags.once || !fired)) {
                        fired++;
                        fns.some(function(fn) {
                            var res = fn.apply(context, params);
                            
                            if (flags.stopOnFalse) {
                                return true;
                            }
                        });
                    }
                    toggleLock();                        
                } else {
                    console.log('attempt to fire while lock: what should we do ?');
                }
            },
            
            fire: function() {
                this.fireWith.apply(this, [this].concat(slice.call(arguments, 0)));
            },
            
            remove: function(fn) {
                if (!isLocked()) {
                    var idx = fns.indexOf(fn);
                    
                    if (!flags.unique  || idx > -1) {
                        delete fns[idx];
                    }
                } else {
                    console.log('attempt to remove while lock');
                }
            },
            
            fired: function() {
                return fired > 0;
            },
            
            has: function(fn) {
                return fns.indexOf(fn) > -1;
            },
            
            empty: function() {
                if (!lock) {
                    toggleLock();
                    fns = [];
                    toggleLock();
                } else {
                    console.log('empty: locked');
                }
            },
            
            disable: function() {
                disabled = true;
            },
            
            disabled: function() {
                return disabled === true;
            },
            
            // debug puprpose
            debug: function() {
                console.log(flags, fns);
            }
        };
    }
});