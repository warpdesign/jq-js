// utils/inarray
define(function() {    
	 return function(value, array, fromIndex) {
		fromIndex = fromIndex || 0;

		var i = fromIndex - 1;

		while(++i < array.length) {
			if (array[i] === value) {
				return i;
			}
		}

		return -1;
	};
});