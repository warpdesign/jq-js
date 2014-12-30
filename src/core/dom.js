// core/dom.js
define(function() {
    // matchesSelector pollyfill, taken from: https://gist.github.com/jonathantneal/3062955
    (function(window) {this.Element && function(ElementPrototype) {
        ElementPrototype.matchesSelector = ElementPrototype.matchesSelector || 
        ElementPrototype.mozMatchesSelector ||
        ElementPrototype.msMatchesSelector ||
        ElementPrototype.oMatchesSelector ||
        ElementPrototype.webkitMatchesSelector ||
        function (selector) {
            var node = this, nodes = (node.parentNode || node.document).querySelectorAll(selector), i = -1;
     
            while (nodes[++i] && nodes[i] != node);
     
            return !!nodes[i];
        }
    }(Element.prototype)})(window);
    
    return {
        isAttached: function(dom) {
            var htmlFound = false;
    
            while(dom && !htmlFound) {
                htmlFound = (dom.tagName === 'HTML');
                dom = dom.parentElement;
            }
    
            return htmlFound;
        },
    
        isChildOf: function(element, parent) {
            var current = element && element.parentElement || null;
            
            while(current) {
                if (parent === current) {
                    return true;
                }
                current = current.parentElement;
            }
            
            return false;
        }         
    };
});