var widget_module = new function () {
    /***** PRIVATE VARIABLES *****/

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

    function showWidgetFromMenu(object) {
        var id = object.target.name;
        $("#" + id).show();
        $(object.target).remove();
    }

    function showWidget(handle) {
        var container = handle.parent();
        var heading = handle.find("h2").get(0);
        container.show();
        $("#" + container.get(0).id + "_menu").remove();
    }

    function hideWidget(handle) {
        var container = handle.parent();
        var heading = handle.find("h2").get(0);
        container.hide();

        var show_button = document.createElement("button");
        show_button.name = container.get(0).id;
        show_button.id = show_button.name + "_menu";
        show_button.className = "menu-item";
        show_button.innerHTML = heading.innerHTML;
        show_button.onclick = showWidgetFromMenu;
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
    }

    function prepare_controls(container_id, locked) {
        var fieldset = document.createElement("fieldset");
        $("#" + container_id).append(fieldset);

        var lock_checkbox = document.createElement("input");
        lock_checkbox.id = container_id + "_checkbox";
        lock_checkbox.name = lock_checkbox.id;
        lock_checkbox.type = "checkbox";
        lock_checkbox.checked = !locked;

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
        this.textarea.id = container_id + "_textarea";
        this.textarea.readOnly = true;
        var p3 = document.createElement("p");
        $(p3).append(this.textarea);
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
        $(obj.target).parent().parent().find("textarea").val(json);
    }

    /***** PUBLIC INTERFACE *****/
    return interface = {
        init: function (container_id, params) {
            if (window.DEBUG) {
                console.log("Initialising singleton 'widget.js' at '" + container_id + "'");
            }

            var locked = true;
            if (typeof params !== "undefined") {
                if (typeof params.locked !== "undefined") {
                    locked = params.locked;
                }
            }
            if (!locked) {
                this.unlock();
            } else {
                this.lock();
            }

            prepare_controls(container_id, locked);
            setup_positions();
        },

        loadView: function (positions) {
            for (var id in positions) {
                var element = $("#" + id).get(0);
                if (element == undefined) {
                    console.warn("Position was given for widget '" + id + "', but this widget does not exist");
                    continue;
                }

                var position = positions[id];
                element.style.left = position.x + "px";
                element.style.top = position.y + "px";
                if (position.w) {
                    element.style.width = position.w + "px";
                }
                if (position.h) {
                    element.style.height = position.h + "px";
                }
                if (position.hidden && element.style.display != "none") {
                    handle = $(element).find("div.handle");
                    hideWidget(handle)
                }
                if (!position.hidden && element.style.display == "none") {
                    handle = $(element).find("div.handle");
                    showWidget(handle)
                }
            }
        },

        unlock: function () {
            add_properties();
        },

        lock: function () {
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