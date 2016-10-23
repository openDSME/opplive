var widget_module = new function () {
    /***** PRIVATE VARIABLES *****/
    this.locked = null;
    this.textarea = null;

    /***** PRIVATE METHODS *****/

    function add_properties() {
        $(".draggable").each(function (index, item) {
            $(item).resizable({
                disabled: false,
                minWidth: 150,
                minHeight: 60,
                containment: "parent",
                grid: [10, 10],
            });
            $(item).draggable({
                disabled: false,
                handle: "div",
                containment: "parent",
                grid: [10, 10],
                opacity: 0.5,
                snap: false,
                snapMode: "both",
                snapTolerance: 10,
                stack: ".draggable"
            });
        });
    }

    function remove_properties() {
        $(".draggable").each(function (index, item) {
            $(item).resizable({
                disabled: true
            });
            $(item).draggable({
                disabled: true
            });
        });
    }

    function showWidget(object) {
            var id = object.target.name;
            $("#" + id).show();
            $(object.target).remove();
        }

    function hideWidget(handle) {
            var container = handle.parent();
            var heading = handle.find( "h2" ).get(0);
            container.hide();

            var show_button = document.createElement("button");
            show_button.name = container.get(0).id;
            show_button.className = "menu-item";
            show_button.innerText = heading.innerText;
            show_button.onclick = showWidget;
            $("#menu").append(show_button);
    }

    function setup_positions() {

        function onHide(object) {
            var handle = $(object.target).parent();
            hideWidget(handle);
        }

        $(".handle").each(function (index, item) {
            var hide_button = document.createElement("a");
            hide_button.className = "minimize";
            hide_button.onclick = onHide;
            $(item).prepend(hide_button);
        });

        for (var id in widget_positions) {
            var element = $("#" + id).get(0);
            var position = widget_positions[id];
            element.style.left = position.x + "px";
            element.style.top = position.y + "px";
            element.style.width = position.w + "px";
            if (position.h) {
                element.style.height = position.h + "px";
            }
            if(position.hidden) {
                handle = $(element).find( "div" );
                hideWidget(handle)
            }
        }
    }

    function prepare_controls(container_id) {
        var fieldset = document.createElement("fieldset");
        $("#" + container_id).append(fieldset);

        var lock_checkbox = document.createElement("input");
        lock_checkbox.id = container_id + "_checkbox";
        lock_checkbox.name = lock_checkbox.id;
        lock_checkbox.type = "checkbox";
        lock_checkbox.checked = !this.locked;

        var label = document.createElement("label");
        label.id = container_id + "_label";
        label.innerText = "Unlock Widgets";
        label.htmlFor = lock_checkbox.id;

        var p1 = document.createElement("p");
        $(p1).append(lock_checkbox);
        $(p1).append(label);
        $(fieldset).append(p1);

        var store_button = document.createElement("button");
        store_button.id = container_id + "_button";
        store_button.innerText = "Export Layout";
        var p2 = document.createElement("p");
        $(p2).append(store_button);
        $(fieldset).append(p2);

        this.textarea = document.createElement("textarea");
        textarea.id = container_id + "_textarea";
        textarea.readOnly = true;
        var p3 = document.createElement("p");
        $(p3).append(textarea);
        $(fieldset).append(p3);

        lock_checkbox.onchange = onChange;
        store_button.onclick = onClick;
    }

    function onChange(obj) {
        interface.change(obj.target);
    }

    function onClick(obj) {
        var positions = {};
        $(".ui-widget-content").each(function (index, item) {
            var element = $(item).get(0);
            positions[element.id] = {
                x: element.offsetLeft,
                y: element.offsetTop,
                w: parseInt(element.style.width),
                h: parseInt(element.style.height),
                hidden: element.style.display == "none"
            }
        });
        var json = JSON.stringify(positions, null, 4);
        textarea.innerText = json;
    }

    /***** PUBLIC INTERFACE *****/
    return interface = {
        init: function (container_id, params) {
            console.log("Init widget.js");

            var locked = true;
            var controls = false;
            if (typeof params !== "undefined") {
                if (typeof params.locked !== "undefined") {
                    locked = params.locked;
                }
                if (typeof params.controls !== "undefined") {
                    controls = params.controls;
                }
            }
            if (!locked) {
                this.unlock();
            } else {
                this.lock();
            }
            if (controls) {
                prepare_controls(container_id);
            }
            setup_positions();
        },

        unlock: function () {
            //console.log("Unlocking UI");
            locked = false;
            add_properties();
        },

        lock: function () {
            //console.log("Locking UI");
            locked = true;
            remove_properties();
        },

        change: function (element) {
            if (!element.checked) {
                this.lock();
            } else {
                this.unlock();
            }
        }
    }
}