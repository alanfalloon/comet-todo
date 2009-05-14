$.module("Collection", function($) {
    // Basic Collection
    $.Collection = function(elements) {
        this.watches = {};
        this.subscribers = [];
        this.content = elements || [];
    }

    $.Collection.make = function(p) { return new $.Collection(p); }

    $.Collection.prototype = {
        notify: function(event) {
            $.each(this.subscribers, function(idx, callback) {
                callback(event);
            });
        },
        
        push: function(element) {
            var result = this.content.push(element);
            var event = { model: this,
                          action: "insert",
                          index: this.content.length-1,
                          value: element };

            this.notify(event);
            return result;
        },

        pop: function() {
            var result = this.content.pop();
            var event = { model: this,
                          action: "remove",
                          index: this.content.length,
                          value: result };

            this.notify(event);
            return result;
        },
        
        __subscribe: function(key_path, callback, subscribers, n) {
            alert("NOT SUPPORTED FOR COLLECTIONS YET");
        },
        
        subscribe: function(key_path, callback) {
            if (!key_path) {
                this.subscribers.push(callback);

                callback({ model: this,
                           action: "content",
                           content: this.content });
            } else {
                // subscribe *through* the collection
                return this.__subscribe(key_path.split(/\./), callback, [], 1);
            }
        },

        activate: function(key_path, callback) {
            alert("NOT DONE YET");
        }
    }

    return true;
})


$.test("Collection", [], function($) {
    //
    m = Collection.make([2, 3]);
    subscribers = {
        onchange: function(e) { alert("yes!" + e.action + " " + e.index + " " + e.value) }
    };
    m.subscribe("", subscribers.onchange);

    m.push(1);
    m.pop();

})