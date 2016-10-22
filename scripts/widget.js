var widget_module = new function () {
    /***** PRIVATE VARIABLES *****/
    this.locked = null;
    this.textarea = null;

    /***** PRIVATE METHODS *****/

    function add_properties() {
        $(".draggable").each(function (index, item) {
            // $(item).resizable();
            $(item).draggable({
                disabled: false,
                handle: "h2",
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
            // $(item).resizable({
            //     disabled: true
            // });
            $(item).draggable({
                disabled: true
            });
        });
    }

    function setup_positions() {
        for (var id in widget_positions) {
            $("#" + id).get(0).style.left = widget_positions[id].x + "px";
            $("#" + id).get(0).style.top = widget_positions[id].y + "px";
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
        $(fieldset).append(lock_checkbox);

        var label = document.createElement("label");
        label.id = container_id + "_label";
        label.innerText = "Unlock Widgets";
        label.htmlFor = lock_checkbox.id;
        $(fieldset).append(label);

        var store_button = document.createElement("button");
        store_button.id = container_id + "_button";
        store_button.name = lock_checkbox.id;
        store_button.innerText = "Export Positions";
        $(fieldset).append(store_button);

        this.textarea = document.createElement("textarea");
        textarea.id = container_id + "_textarea";
        textarea.name = lock_checkbox.id;
        textarea.readOnly = true;
        $(fieldset).append(textarea);

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
                y: element.offsetTop
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
            console.log("Unlocking UI");
            locked = false;
            add_properties();
        },

        lock: function () {
            console.log("Locking UI");
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