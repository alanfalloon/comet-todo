$(function() {
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

    var install = function(init_fn, run_tests) {
        var installed = false;
        var poll = function() {
            if (init_fn()) { clearInterval(id); if (run_tests) { init_fn.test() } }
        };
        var id = setInterval(poll, 50);
    };

    install(initRecord);
    install(initCollection, true);
});
