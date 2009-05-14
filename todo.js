$(function () {
    $("#entry-form").submit(function () {
    
    });
    
    var div = function() { return $("<div></div>") };

    var make_class_decoration = function(view, css_class) {
        return function(ev) {
            if (ev.value) { view.addClass(css_class) } else { view.removeClass(css_class); }
        }
    }


    // there is an event binding problem, because the events can't be bound
    // until this element is added to the DOM
    $.View.Todo = function(todo) {
        var item = $.View.Mirror(todo, "title").addClass("item");
        var tags = div().addClass("tags");
        todo.subscribe("done", make_class_decoration(item, "done"));
        return div().append(tags).append(item);
    }
    $.View.Todo.events = function(todo, view) {
        view.find(".item").click(function() { todo.done = !todo.done })
    }

    todo_list = $.Collection.make();
    var list_view = $.View.List(todo_list, $.View.Todo);
//    $("ul li").live("click", function() { $(this).css("text-decoration", "line-through") });


    // add the todo list to the main window
    $("#entry-form").before(list_view);

    $("#entry-box").bind("keydown", function(e) {
        if (e.keyCode == 13) {
            var title = $("#entry-box").val();
            //m = Model.make(); // might like to push the whole model through
            dojox.cometd.publish("/User/1", title);
            $("#entry-box").val("");
        }
    });


    dojo.require("dojox.cometd.longPollTransport");
    dojo.addOnLoad(function(){
        dojox.cometd.init("/cometd");
        dojox.cometd.subscribe("/User/*",function(message){ 
            // create a new record
            m = $.Record.make({ title: message.data, done: false });
            todo_list.push(m);
        });
    });

});

