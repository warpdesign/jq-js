define(['core'], function(jq) {
    // hardcoded, for testing purposes
    jq.support = {
        ajax: true,
        appendChecked: true,
        boxModel: true,
        boxSizing: true,
        boxSizingReliable: true,
        changeBubbles: true,
        checkClone: true,
        checkOn: true,
        clearCloneStyle: true,
        cors: true,
        cssFloat: true,
        deleteExpando: true,
        doesNotIncludeMarginInBodyOffset: true,
        enctype: true,
        focusinBubbles: false,
        getSetAttribute: true,
        hrefNormalized: true,
        html5Clone: true,
        htmlSerialize: true,
        inlineBlockNeedsLayout: false,
        input: true,
        leadingWhitespace: true,
        noCloneChecked: true,
        noCloneEvent: true,
        opacity: true,
        optDisabled: true,
        optSelected: true,
        pixelPosition: true,
        radioValue: true,
        reliableHiddenOffsets: true,
        reliableMarginRight: true,
        shrinkWrapBlocks: false,
        style: true,
        submitBubbles: true,
        tbody: true
    };
    // /hardcoded
    
	// depreciated in recent jQuery
	$.browser = {
		msie: navigator.userAgent.match(/MSIE/) !== null
	};    
});