// utils/isFunction
define(function() {
    return function(fn) {
		return typeof fn === 'function';
	};
});