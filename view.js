$.module("View", function($) {
    var V = $.View = {}

    V.mirror_content = function(v) { return function(ev) { v.text(ev.value) } }

    // create a div with the content of the given model key
    V.Mirror = function(model, key) {
        var container = $("<div>");
        model.subscribe(key, V.mirror_content(container)); 
        return container;
    }
    
    V.List = function(collection, make_view) {
        var list = $("<ul></ul>");
        var list_changed = function(event) {
            if (event.action === "content") {
                var elements = $.each(event.content, function(i, m) {
                    list.append($("<li></li>").append(make_view(m)));
                });
            } else if (event.action === "insert") {
                var v = make_view(m);
                list.append($("<li></li>").append(v));
                make_view.events(m, v);
            }
        }
        collection.subscribe("", list_changed);
        return list;
    }
});




$.test("View", function($) {

    Section = function(model, depth) {
        var container = $("<div class='section'>");
        // TODO control the depth somehow? a dependent property in the Record?
        var h1 = $("<h" + depth + ">");
        var p = $("<p>");
        
        model.subscribe("title", $.View.mirror_content(h1));
        model.subscribe("body", $.View.mirror_content(p));
        return container.append(h1).append(p);
    }
    

    r = $.Record.make({title: "test", body: "This is the body."});
    x = Section(r, 1);
    $("body").append(x);
    x.append(Section(r, 2));
    
    
    r1 = $.Record.make({body: "This is some text here."});
    r2 = $.Record.make({body: "This is some text over here."});
    
    c = $.Collection.make([r1, r2]);
    
    var make_mirror = function(key) {
        return function(model) {
            return $.View.Mirror(model, key)
        }
    }
    
    l = $.View.List(c, make_mirror("body"));
    $("body").append(l);
});


