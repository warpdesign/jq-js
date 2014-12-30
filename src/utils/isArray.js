// utils/isarray
define(function() {
	return function(arr) {
		return Object.prototype.toString.call(arr) === '[object Array]';
	};
});