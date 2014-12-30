// core/build.js
define(function() {
    function buildFragment(jdom, html) {
        var parent = document.createElement('div'),
            i = 0,
            max = 0,
            tag = null,
            fragment = document.createDocumentFragment(),
			textarea = '',
			autoCloseReg = /<\s*textarea(.|\s)*?\s*\/>/g,
            tableEltsReg = /^<\s*(tbody|thead|tfoot)\/>/g,
            tbodyEltsReg = /^<\s*(tr|td)\/>/g;
        
        // 
        
		// change autoClose tags since they are mis-intepreted by innerHTML
        // todo: match other autoClose tags: meta, input, img,...
		res = html.match(autoCloseReg);

		if (res && res.length) {
			textarea = res[0].replace(/\s*\/\s*>/, '></textarea>');
			html = html.replace(res[0], textarea);
		}

        // determine parent type (td elements must be inserted into <table/> and not <div/>
        if (html.match(tableEltsReg)) {
            parent = document.createElement('table');
        } else if (html.match(tbodyEltsReg)) {
            parent = document.createElement('tbody');
        }
        
        parent.innerHTML = html;
        
        for (i = 0, max = parent.childNodes.length; i < max; i++) {
            tag = parent.childNodes[0];
            fragment.appendChild(tag);
            jdom.push(fragment.childNodes[i]);
        }
        
        return jdom;
    }
    
    return buildFragment;
});