initView = function() {

    CollectionView = function(collection, recordView) {
        this.recordView = recordView;
        // would be nice to install different handles for different event types
        collection.subscribe("", this.update);
    }

    CollectionView.make = function(c, r) { return new CollectionView(c, r); }

    CollectionView.prototype = {
        update: function(event) {
            alert(event.action);
        }
    }
    return true;
}

initView.test = function() {
    var mirror_content = function(jq) {
        return function(ev) { jq.text(ev.value) }
    };


    List = function(collection, make_view) {
        var list = $("<ul></ul>");
        var list_changed = function(event) {
            if (event.action === "content") {
                var elements = $.each(event.content, function(i, m) {
                    list.append($("<li></li>").append(make_view(m)));
                });
            }
        }
        collection.subscribe("", list_changed);
        return list;
    }

    Section = function(model, depth) {
        var container = $("<div class='section'>");
        // TODO control the depth somehow? a dependent property in the Record?
        var h1 = $("<h" + depth + ">");
        var p = $("<p>");

        model.subscribe("title", mirror_content(h1));
        model.subscribe("body", mirror_content(p));
        return container.append(h1).append(p);
    }


    r = Record.make({title: "test", body: "This is the body."});
    x = Section(r, 1);
    $("body").append(x);
    x.append(Section(r, 2));


    r1 = Record.make({body: "This is some text here."});
    r2 = Record.make({body: "This is some text over here."});

    c = Collection.make([r1, r2]);

    var make_mirror = function(key) {
        return function(model) {
            var container = $("<div>");
            model.subscribe(key, mirror_content(container));
            return container;
        }
    }

    l = List(c, make_mirror("body"));
    $("body").append(l);

}
