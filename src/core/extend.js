// core/extend
define(function() {
    return function extend(target, source, deep) {
        for (key in source) {
            if (typeof source[key] !== 'undefined') {
                if (deep && target[key] && typeof target[key] === 'object') {
                    extend(target[key], source[key], true);
                } else {
                    target[key] = source[key];
                }
            }
        }
    }
});