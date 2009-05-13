
$(function() {
    // clone method for creating new prototypes; takes care of the setting
    // prototype thing, etc.
    var F = function(attrs) { $.extend(this, attrs) };
    Object.prototype.clone = function(attrs) {
        F.prototype = this;
        return new F(attrs);
    }

    // there are two ways to be
    Model = Object.clone({
        make: function(attrs) {
            var obj = this.clone(attrs);
            obj.subscribers = {};
            return obj;
        },

        notify: function(event) {
            $.each(this.subscribers[event.key], function(idx, callback) {
                callback(event);
            });
        },

        createProperty: function(key) {
            // check if a property already
            if (this.subscribers[key]) { return; }
            this.subscribers[key] = [];

            var model = this;
            var value = model[key];
            
            model.__defineGetter__(key, function() { return value });
            model.__defineSetter__(key, function(v) {
                var old_value = value;
                value = v;

                var event = { model: model,
                              key: key,
                              value: value,
                              old_value: old_value };
                
                // 
                model.notify(event);
                return value;
            });
            model[key] = value;
        },

        __addSubscriber: function(key, subscriber, subscribers) {
            // TODO make sure it's not already here
            this.subscribers[key].push(subscriber);
            subscribers.push([this, key, subscriber]);
            // send it an initial event
            subscriber({model: this, key: key, value: this[key], old_value: this[key] });
        },

        __removeSubscriber: function(key, subscriber) {
            var idx = this.subscribers[key].indexOf(subscriber);
            this.subscribers[key].splice(idx, 1);
        },


        __subscribe: function(key_path, callback, subscribers, n) {
            var model = this;
            var key = key_path[0];

            // base case: this object 'owns' the key we are looking for
            if (key_path.length === 1) {
                model.createProperty(key);
                model.__addSubscriber(key, callback, subscribers);
                return;
            }

            // recursive case: traverse down the object path, BUT we also
            // need to watch for when there is a reassignment at this level
            var watcher = function(event) {
                // there are sub-subscribers that have to be removed
                if (n < subscribers.length) {
                    var to_remove = subscribers.slice(n);
                    $.each(to_remove, function(idx, e) {
                        e[0].__removeSubscriber(e[1], e[2]);
                    });
                    subscribers.splice(n);
                }


                // bind the next level in the path
                model[key].__subscribe(key_path.slice(1, key_path.length),
                                       callback,
                                       subscribers,
                                       n+1);
            };
            
            model.createProperty(key);
            model.__addSubscriber(key, watcher, subscribers);
        },

        subscribe: function(key_path, callback) {
            return this.__subscribe(key_path.split(/\./), callback, [], 1);
        },

        // activate jQuery events to watch a key path and trigger a change event
        activate: function(key_path) {
            var event_name = "change." + key_path;
            var model = this;

            // TODO should I worry about dups here?  probably
            var fn = function(event) {
                $(model).trigger(event_name, event);
            }
            model.subscribe(key_path, fn);
        },

        bind: function(event_path, event_handler) {
            var key_path = event_path.split(/change\./)[1];
            this.activate(key_path);
            $(this).bind(event_path, event_handler);
        }

    });

    test_model = Model.make({
        x: 99,
        y: Model.make({ z: 143 })
    });


    test_subscriber = Object.clone({
        onchange: function(d) { alert("YAY!" + d.value); return false; }
    });
    //subs = test_model.subscribe(test_subscriber.onchange, "x");
    subs = test_model.subscribe("y.z", test_subscriber.onchange);
    subs = test_model.subscribe("y.z", test_subscriber.onchange);

//    test_model.activate("y.z");
//    $(test_model).bind("change.y.z", function(a, ev) { alert("WTF?" + ev.key); });

    test_model.bind("change.y.z", function(a, ev) { alert("WTF?" + ev.key); });

    //$.each(subs, function(idx, e) { $(e[0]).unbind($(e[1], e[2])) });
    //test_model.x = 44;
    //old_y = test_model.y;
    test_model.y = Model.make({ z: 81 });
    //old_y.z = 88;
});

