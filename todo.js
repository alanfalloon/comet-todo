$(function () {
    $("#entry-form").submit(function () {
    
    });
    
    var todo_view = Prometheus.View.clone({
        init: function(model) {
            var self = this;
            
            var title_changed = function(obj, key, value) {
                self.content.find(".item").text(value);
            };
            
            this.content = $("<li>").append($("<div class='tags'></div>")).append($("<div class='item'>").text(model.title));
            this.subscribe(model, "title", title_changed);
            }
    });


    var TodoListView = Prometheus.CollectionView.clone({
        default_view: todo_view,
        on_insert: function(v, coll, idx, obj) {
            $("#todos").append(v.content);            
        }
    });

    var todo_list = Prometheus.Collection.make();

    var app = {
        // "classes"
        TodoListView: TodoListView,
        TodoView: todo_view,
        Todo: Prometheus.Model.clone({
            init: function(title) {
                Prometheus.Model.init.call(this);
                this.title = title;
            }
        }),

        // "instances"
        todo_list: todo_list,
        todo_list_view: TodoListView.make(todo_list)

    };


    $("#entry-box").bind("keydown", function(e) {
        if (e.keyCode == 13) {
            var title = $("#entry-box").val();
            //m = Model.make(); // might like to push the whole model through
            dojox.cometd.publish("/User/1", title);
            $("#entry-box").val("");
        }
    });

    $.App = app;

    m = app.Todo.make("this is an item");
    todo_list.push(m);

    m.title = "New title";
    

});

