$(function() {

P = { 
    clone: (function() {
        var count = 1;
        function F(s) { this.id = count++ };
        return function(attrs) {
            F.prototype = this;
            var obj = new F();
            $.extend(obj, attrs);
            return obj;
        }
    })(),

    make: function() {
        var obj = this.clone();
        obj.init.apply(obj, arguments);
        return obj;
    }
}


var cache = [];

// Key-Value Publisher
KVP = P.clone({
    depgraph: [],
    observers: [],
    pending: [],

    propagate: function(name) {
        var deps = this.depgraph[this.id][name];
        for (var dep in deps) {
            var property = deps[dep];
            var obj = property[0];
            var name = property[1];
            obj.notify(name);
        }
    },

    notify: function(name) {
        observers = this.observers[this.id][name];
        var event = [this, name, this[name]];
        for (var idx in observers) { 
            var observer = observers[idx];
            observer.observations.push(event);
            this.pending.push(observer);
        }
    },

    publish: function() {
        while (this.pending.length > 0) {
            var observer = this.pending.pop();
            for (var ev in observer.observations) {
                observer.callback.apply(observer, observer.observations[ev]);
            }

        }

    },

    make_dependent: function(name, fn) {
        this.__defineGetter__(name, fn);
        
        this.observers[this.id][name] = []
        this.depgraph[this.id][name] = []
        cache = [];
        this[name];
        var info = [this, name];
        for (var idx in cache) {
            var dep = cache[idx];
            this.depgraph[dep[0].id][dep[1]].push(info);
        }
        cache = []
    },

    make_property: function(name, value) {
        var _val = value;
        this.__defineGetter__(name, function() { 
            cache.push([this, name]);
            return _val; 
        });
        this.__defineSetter__(name, function(v) { 
            _val = v;
            this.propagate(name);
            this.notify(name);
        });
        this.observers[this.id][name] = []
        this.depgraph[this.id][name] = []
    },

    init: function() {
        this.observers[this.id] = {}
        this.depgraph[this.id] = {}
    },

    // 
    observe: function(key, fn) {
        var observer = P.clone({ callback: fn, observations: [] });
        this.observers[this.id][key].push(observer);
    }

});

k = KVP.make()
k.make_property("a", 88)
k.make_dependent("b", function(o) { return this.a + 4 })

k.observe("b", 
          function(obj, key, value) { alert("YES " + obj + " " + key + " " + value) })


// Key-Value Observer


});
