var draggable_module = new function () {
    /***** PRIVATE VARIABLES *****/

    /***** PRIVATE METHODS *****/

    /***** PUBLIC INTERFACE *****/
    return {
        init: function(container_id, uri) {
            $(".draggable").each(function(index, item) {
                //$(item).resizable();
                $(item).draggable({
                    handle: "h2",
                    containment: "parent",
                    grid: [ 10, 10 ],
                    opacity: 0.5,
                    snap: false,
                    snapMode: "both",
                    snapTolerance: 10,
                    stack: ".draggable"
                });
            });
        }
    }
}