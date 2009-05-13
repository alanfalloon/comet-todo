Prometheus = { 
    Object: {
        clone: (function() {
            var count = 1;
            function F(s) { this.id = count++ };
            return function(attrs) {
                F.prototype = this;
                var obj = new F();
                // TODO don't use jQuery here, not worth the cost
                $.extend(obj, attrs);
                obj.prototype = this;
                return obj;
            }
        })(),
        
        make: function() {
            function F() {};
            F.prototype = this;

            var obj = new F();
            obj.init.apply(obj, arguments);
            return obj;
        },
        
        init: function(attrs) {
            // TODO or here
            $.extend(this, attrs);
        },

        delegate: function(fn_name) {
            // FIXME can't do this on arguments (sigh)
            var args = arguments.slice(1, arguments.length);
            this.prototype[fn_name].call(this, args);
        }
    }
}

Prometheus.Collection = Prometheus.Object.clone({
    // insert
    // delete
    // get(idx)
    // set(idx, value)

    insert: function(key, value) {
        this.content[key] = value;
        this.notify("insert", key, value);
    },

    notify: function(action, index, value) {
        var self = this;
        $.each(this.subscribers, function(idx, callback) {
            callback(self, action, index, value);
        });
    },

        
    __addSubscriber: function(sub, keyPath, cb) {
        // this will implicitly subscribe to all of the objects in the
        // collection
        var key = keyPath[0];
        
        var self = this;
        // we have a longer keypath, need intermediate observers
        var bookkeeper = function(obj, action, index, value) {
            alert("TODO: " + action + " " + index + " " + value);
            obj.content[index].__addSubscriber(sub, keyPath, cb); 
        };
        
        this.subscribers.push(bookkeeper);
    },
    
    addSubscriber: function(subscriber, keyPath, callback) {
        var callback = callback || subscriber.propertyChanged;
        var key_path = keyPath.split(/\./);
        this.__addSubscriber(subscriber, key_path, callback);
    },
    
    init: function() {
        //delegate("init", arguments[0]);
        //delegate(Prometheus.Object.init, arguments[0]);

        Prometheus.Object.init.call(this, arguments[0]);
        this.subscribers = [];   
        this.content = [];
    }
    
});


Prometheus.Model = Prometheus.Object.clone({
    notify: function(key, value, old_value) {
        var self = this;
        $.each(this.subscribers[key], function(idx, callback) {
            callback(self, key, value, old_value);
        });
    },

    createProperty: function(key, initial_value) {
        // TODO make sure is not a property already
        
        var _v = initial_value;
        //delete this[key];
        
        var self = this;
        this.__defineGetter__(key, function() { return _v; });
        this.__defineSetter__(key, function(v) {
            var old = _v;
            _v = v;
            self.notify(key, _v, old);
        });
        
        self.notify(key, _v, undefined);
    },
    
    __addSubscriber: function(sub, keyPath, cb) {
        var key = keyPath[0];
        this.subscribers[key] = this.subscribers[key] || [];
        
        if (keyPath.length == 1) {
            // TODO better check if this is a collection or not...
            this.subscribers[key].push(cb);
            var _value = this[key];
            delete this[key];
            this.createProperty(key, _value);
            return;
        }
        
        var self = this;
        // we have a longer keypath, need intermediate observers
        var bookkeeper = function(obj, key, value, old_value) {
            alert("TODO: REMOVE OLD OBSERVER... change observer from: " + old_value + " to: " + value);
            self[key].__addSubscriber(sub, keyPath.slice(1, keyPath.length), cb);                
        };
        
        this.subscribers[key].push(bookkeeper);
        var _value = this[key];
        delete this[key];
        this.createProperty(key, _value);
    },
    
    
    addSubscriber: function(subscriber, keyPath, callback) {
        var callback = callback || subscriber.propertyChanged;
        var key_path = keyPath.split(/\./);
        
        this.__addSubscriber(subscriber, key_path, callback);
    },
    
    init: function() {
        Prometheus.Object.init.call(this, arguments[0]);
        this.subscribers = {};   
    }
});


Prometheus.View = Prometheus.Object.clone({
    // Callback is optional; by default, if observing a property, will
    // call this.propertyChanged(model, key, new_value, old_value)
    // If observing collection, will call 
    // this.collectionChanged(model, key, insert/remove, index, item)
    subscribe: function(publisher, keyPath, callback) {
        publisher.addSubscriber(this, keyPath, callback);
    }
});


$(function() {
    var model = function(attrs) { return Prometheus.Model.make(attrs) };

    TestModel = Prometheus.Model.clone({
        init: function(x, y) {
            Prometheus.Model.init.call(this);
            this.x = x;
            this.y = y;
        }
    });

    m1 = TestModel.make(1, model({ a: 2 }) );
    m2 = TestModel.make(3, 4);

    o1 = Prometheus.View.clone({
        propertyChanged: function(obj, key, v, old) { alert("YES: " + v + "(" + old + ")" ); },
        alternate: function() { alert("OH YEAH"); }
    });
        
    o1.subscribe(m1, "x", o1.alternate);
    o1.subscribe(m1, "y.a");

    c = Prometheus.Collection.make();
    v = Prometheus.View.subscribe(c, "x", function(a, b, c) { alert("WOW: " + c); });
    c.insert(0, model({x: 9876}) );

})();
