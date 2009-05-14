$.App = {}

// queue up a module for installation
$.module = function(name, installer) {
    installer($);
}

$.test = function(name, tester) {
    $.test[name] = tester;
}

$.extend({
    // get the keys of an object
    keys: function(obj) {
        var a = [];
        $.each(obj, function(k){ a.push(k) });
        return a;
    },
    
    // clone shorthand
    clone: function(obj, attrs) {
        return $.extend({}, obj, attrs);
    }
    
})

    
$(function() {
   // $.test.View($)
})

