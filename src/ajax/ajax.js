define(['core', 'deferred/deferred'], function(jq, deferred) {
    var ajaxSettings = {
        async: true,
        beforeSend: function() {},
        cache: true,	// false for dataType 'script' and 'jsonp'
        complete: function() {},
        //contents:
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        converters: {
            "* text": window.String,
            "text html": true,
            "text json": JSON.parse,
            "text xml": undefined
        },
        crossDomain: false,
        data: null,
        dataFilter: function(data, type) { return data; },
        dataType: 'text',
        error: function() {},
        global: true,
        headers: {},
        ifModified: false,
        isLocal: isLocal,
        jsonpCallback: function() {},
        mimeType: null,
        password: null,
        processData: true,
        scriptCharset:  null,
        statusCode: {},
        success: function() {},
        timeout: null,
        // traditionnal
        type: 'GET',
        url: window.location.href,
        username: null,
        xhr: function() { return new XMLHttpRequest(); },
        xhrFields: null
    },
    isLocal = window.location.href.match(/^file\:/) !== null;
    
	jq.prototype.load = function() {
		var fn,
			data,
			that = this;

		if (typeof arguments[0] === 'string') {
			if (this.length) {
				data = arguments[1] && typeof arguments[1] === 'object' || undefined;
				fn = !data && typeof arguments[1] === 'function' && arguments[1] || arguments[2];

				jq.ajax(arguments[0], {
					type: typeof data === 'undefined' ? 'GET' : 'POST',
					data: data,
					success: function(data, textStatus, xhr) {
						that.html(data);
						if (typeof fn === 'function') {
							that.each(function() {
								fn.call(this, data, 'success', xhr);
							});
						}
					},
					error: function(xhr, textStatus, errorStr) {
						if (typeof fn === 'function') {
							that.each(function() {
								fn.call(this, '', 'error', xhr);
							});
						}
					}
				});
			}
		} else {
			this.on.apply(this, ['load'].concat(slice.call(arguments, 0)));
		}

		return this;
	};
    
    // TODO: we should return jqxhr object so we need to extend deferred with xhr attributes
	jq.ajax = function() {
		var settings = jq.extend(true, {}, ajaxSettings, (arguments.length > 1) ? arguments[1] : arguments[0]),
			context = settings.context || settings,
			xhr = settings.xhr(),
			def = new deferred(),
			tt = null;

		if (settings.dataType.match(/script|jsonp/)) {
			settings.cache = false;
		}
	
		if (arguments.length > 1) {
			settings.url = arguments[0];
		}

        // encode data if needed
        if (settings.data !== null && typeof settings.data === 'object') {
            settings.data = JSON.stringify(settings.data);
        }

        console.log('jq.ajax: opening xhr url', settings.url, 'with settings', settings);
        
		xhr.open(settings.type, settings.url, settings.async);

		xhr.onreadystatechange = function(evt) {
			var data;

			if (xhr.readyState == 4 && def.state() === 'pending') {
				if (tt) {
					clearTimeout(tt);
					tt = null;
				}

				if (xhr.status == 200) {
					try{
                        debugger;
						switch(settings.dataType) {
							case 'script':
								eval(xhr.responseText);
								data = xhr.responseText;
							break;

							case 'json':
								data = JSON.parse(xhr.responseText);
							break;

							case 'xml':
								// TODO: return an XML object
							case 'text':
							case 'html':
							default:
								data = xhr.responseText;
							break;
						}

						def.resolve(data, xhr.statusText, xhr);						
						settings.complete.call(settings.context, xhr, "success");
						settings.success.call(settings.context, data, xhr.statusText, xhr);
					} catch(err) {
						def.reject(xhr.responseText, xhr.statusText, xhr);
						settings.complete.call(settings.context, xhr, "parseerror");
						settings.error.call(settings.context, xhr, xhr.statusText);
					}
				} else {
					def.reject(xhr.responseText, xhr.statusText, xhr);
					settings.error.call(settings.context, xhr, xhr.statusText);
					settings.complete.call(settings.context, xhr, "error");
				}
			}
		}

		if (settings.timeout) {
			tt = setTimeout(function() {
				if (def.state() === 'pending') {
					def.reject("", "timeout", xhr);
					settings.error.call(settings.context, xhr, "timeout");
					settings.complete.call(settings.context, xhr, "timeout");
				}
			}, settings.timeout);
		}

		xhr.send(settings.data);

		return def.promise();
	};

    // jQuery.post( url [, data ] [, success(data, textStatus, jqXHR) ] [, dataType ] )
    jq.post = function(url) {
        var data = typeof arguments[1] !== 'undefined' && arguments[1] || null,
            success = typeof arguments[2] === 'function' && arguments[2] || undefined,
            dataType = typeof arguments[3] === 'string' && arguments[3] || undefined;
        
        jq.ajax(url, {
            type: 'POST',
            data: data,
            success: success,
            dataType: dataType
        });
        
    };
    
    jq.ajaxSetup = function(settings) {
		ajaxSettings = jq.extend(true, ajaxSettings, settings);
	};
    
	// jQuery.getScript( url [, success(script, textStatus, jqXHR) ] )
	jq.getScript = function(url, cb) {
		var promise = jq.ajax(url, {
			dataType: 'script'
		});
		
		if (cb) {
			promise.done(cb);
		}

		return promise;
/*		var xhr = new XMLHttpRequest(),
			def = new deferred();

		xhr.open('GET', url, true);
		xhr.onreadystatechange = function(evt) {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					if (cb && jq.isFunction(cb)) {
						cb(xhr.responseText, xhr.statusText, def);
						def.resolve(xhr.responseText, xhr.statusText, def);
					}
				}
			}
		};

		xhr.send(null);

		return def.promise();
*/
	};    
});