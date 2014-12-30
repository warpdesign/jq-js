define(['core'], function(jq) {
    jq.prototype.hasClass = function(classes) {
        if (this.length) {
            return this[0].classList.contains(classes);
        } else {
            return false;
        }
    };
    
    jq.prototype.addClass = function(classes) {
        this.forEach(function(element) {
            try{
                element.classList.add(classes);
            } catch(err) {
                console.log('could not add classes', classes, 'to', this, 'error', err);
            }
        });
        
        return this;        
    };
    
    jq.prototype.removeClass = function(classes) {
        this.forEach(function(element) {
            element.classList.remove(classes);
        });
        
        return this;        
    };
    
    jq.prototype.toggleClass = function(classes) {
        this.forEach(function(element) {
            element.classList.toggle(classes);
        });
        
        return this;
    };
});