var NetworkLayoutModule = (function () {
    /***** PRIVATE VARIABLES *****/
    // NONE

    /***** CONSTRUCTOR *****/
    function NetworkLayoutModule(container_id, positioning) {
        if (!(this instanceof arguments.callee)) {
            throw new Error("Constructor called as a function");
        }
        if (window.DEBUG) {
            console.log("Creating instance of 'layout.js' at '" + container_id + "'");
        }

        _prepare_html(container_id, positioning);
    }

    /***** PRIVATE METHODS *****/
    function _prepare_html(container_id, positioning) {
        var fieldset = document.createElement("fieldset");
        $("#" + container_id).append(fieldset);

        var range_checkbox = document.createElement("input");
        range_checkbox.id = container_id + "_checkbox";
        range_checkbox.name = range_checkbox.id;
        range_checkbox.type = "checkbox";
        range_checkbox.checked = false;

        var label = document.createElement("label");
        label.id = container_id + "_label";
        label.innerText = "Show Ranges";
        label.htmlFor = range_checkbox.id;

        var p0 = document.createElement("p");
        $(p0).append(range_checkbox);
        $(p0).append(label);
        $(fieldset).append(p0);

        var concentric_layout = document.createElement("button");
        concentric_layout.id = container_id + "_concentricButton";
        concentric_layout.innerText = "Concentric Cirlces";
        var p1 = document.createElement("p");
        $(p1).append(concentric_layout);
        $(fieldset).append(p1);

        var grid_layout = document.createElement("button");
        grid_layout.id = container_id + "_gridButton";
        grid_layout.innerText = "Grid Layout";
        var p2 = document.createElement("p");
        $(p2).append(grid_layout);
        $(fieldset).append(p2);

        var star_layout = document.createElement("button");
        star_layout.id = container_id + "_starButton";
        star_layout.innerText = "Star Layout";
        var p3 = document.createElement("p");
        $(p3).append(star_layout);
        $(fieldset).append(p3);

        var random_layout = document.createElement("button");
        random_layout.id = container_id + "_randomButton";
        random_layout.innerText = "Random Layout";
        var p4 = document.createElement("p");
        $(p4).append(random_layout);
        $(fieldset).append(p4);

        var store_button = document.createElement("button");
        store_button.id = container_id + "_storeButton";
        store_button.innerText = "Export Network";
        var p5 = document.createElement("p");
        $(p5).append(store_button);
        $(fieldset).append(p5);

        var load_button = document.createElement("button");
        load_button.id = container_id + "_loadButton";
        load_button.innerText = "Load Network";
        load_button.disabled = true;
        var p6 = document.createElement("p");
        $(p6).append(load_button);
        $(fieldset).append(p6);

        var textarea = document.createElement("textarea");
        textarea.id = container_id + "_textarea";
        var p7 = document.createElement("p");
        $(p7).append(textarea);
        $(fieldset).append(p7);


        range_checkbox.onchange = onChange;
        concentric_layout.onclick = onClickConcentric;
        grid_layout.onclick = onClickGrid;
        star_layout.onclick = onClickStar;
        random_layout.onclick = onClickRandom;
        store_button.onclick = onClickStore;
        load_button.onclick = onClickLoad;
        textarea.oninput = onInput;

        function onChange(obj) {
            positioning.ranges(obj.target.checked);
        }

        function onClickConcentric() {
            positioning.reposition(mobility.concentric_circles)
        }

        function onClickGrid() {
            positioning.reposition(mobility.grid)
        }

        function onClickStar() {
            positioning.reposition(mobility.star)
        }

        function onClickRandom() {
            positioning.reposition(mobility.random)
        }

        function onClickStore(obj) {
            var json = JSON.stringify(positioning.getPositions(), null, 4);
            $(obj.target).parent().parent().find("textarea").val(json);
            load_button.disabled = false;
        }

        function onClickLoad(obj) {
            var json = $(obj.target).parent().parent().find("textarea").val();
            try {
                positions = JSON.parse(json);
                positioning.loadPositions(positions);
            } catch (exception) {
                window.alert(exception);
            }
        }

        function onInput() {
            load_button.disabled = false;
        }
    }

    /***** PUBLIC INTERFACE *****/
    // NONE

    return NetworkLayoutModule;
})();
