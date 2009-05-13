$(function () {
    $("#entry-form").submit(function () {
    
    });
    
    var app = {
        TodoView: Prometheus.View.clone({
            init: function(model) {
                var self = this;

                var title_changed = function(obj, key, value) {
                    self.content.find(".item").text(value);
                };

                this.content = $("<li>").append($("<div class='tags'></div>")).append($("<div class='item'>").text(model.title));
                this.subscribe(model, "title", title_changed);
            }
        }),

        Todo: Prometheus.Model.clone({
            init: function(title) {
                Prometheus.Model.init.call(this);
                this.title = title;
            }
        })
    }

    $("#entry-box").bind("keydown", function(e) {
        if (e.keyCode == 13) {
            var title = $("#entry-box").val();
            //m = Model.make();
            dojox.cometd.publish("/User/1", title);

//            $("#todos").append(new_item);
            $("#entry-box").val("");
        }
    });

    $.App = app;

    m = app.Todo.make("this is an item");
    v = app.TodoView.make(m);

    $("#todos").append(v.content);

    m.title = "New title";
    

});

