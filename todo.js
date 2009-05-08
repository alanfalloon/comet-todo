$(function () {
    $("#entry-form").submit(function () {
    
    });
    
    View = P.clone({
        init: function(model) {
            var self = this;

            var title_changed = function(obj, key, value) {
                self.content.find(".item").text(value);
            };

            this.content = $("<li>").append($("<div class='tags'></div>")).append($("<div class='item'>").text(model.title));
            model.observe("title", title_changed);
        }

       
    });


    Model = KVP.clone({
        default_view: View,

        instantiate: function(view) {
            view = view || this.default_view;
            this.view = view.make(this);
            return this.view
        },

        init: function(title) {
            KVP.init.call(this);
            this.make_property("title", title);
        }
    });

    $("#entry-box").bind("keydown", function(e) {
        if (e.keyCode == 13) {
            var title = $("#entry-box").val();
            //m = Model.make();
            dojox.cometd.publish("/User/1", title);

//            $("#todos").append(new_item);
            $("#entry-box").val("");
        }
    });



    m = Model.make("this is an item");
    v = m.instantiate();

    $("#todos").append(v.content);

    m.title = "New title";
    KVP.publish();
    
//     c = Coll.make();
//     cv = CollectionView.make(c);
    
//     c.insert(0, m);
//     Property.publish();

});

