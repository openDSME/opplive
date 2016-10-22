var layout_module = new function () {
    /***** PRIVATE VARIABLES *****/

    /***** PRIVATE METHODS *****/
    function prepare_html(container_id, positioning) {
        var fieldset = document.createElement("fieldset");
        $("#" + container_id).append(fieldset);

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

        concentric_layout.onclick = onClickConcentric;
        grid_layout.onclick = onClickGrid;
        star_layout.onclick = onClickStar;
        random_layout.onclick = onClickRandom;

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
    }

    /***** PUBLIC INTERFACE *****/
    return {
        init: function (container_id, uri, positioning) {
            console.log("Init layout.js");
            prepare_html(container_id, positioning);
            //connect(uri);
        }
    }
}