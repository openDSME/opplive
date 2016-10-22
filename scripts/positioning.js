var positioning_module = new function () {
    /***** PRIVATE VARIABLES *****/
    this.node_count = null;
    this.container = null;

    this.nodes = null;

    /***** PRIVATE METHODS *****/
    function setup_nodes(container_id, div) {
        this.nodes = [];
        
        for (i = 0; i < this.node_count; i++) {
            nodes[i] = {
                x: 0,
                y: 0,
                address: i,
                object: null
            };
        }

        this.nodes.forEach(function(element) {
            var node = document.createElement( "div" );
            element.object = node;
            node.id = container_id + "node_" + element.address;
            node.innerText = element.address;
            node.className = "node";
            $(div).append(node);

            $(node).draggable({
                    containment: "parent",
                    opacity: 0.5,
                    stack: ".node"
                });
        }, this);
    }

    function position_nodes(mobility_provider) {
        var positions = mobility_provider(this.node_count);
        var normalized = mobility.normalize(positions);

        this.nodes.forEach(function(element, index) {
            element.x = positions[index].x;
            element.y = positions[index].y;
        }, this);

        var offsetX = 80;
        var offsetY = 56;
        this.nodes.forEach(function(element) {
            element.object.style.left = Math.floor(element.x) + 20 + "px";
            element.object.style.top = Math.floor(element.y) + offsetY + "px";
        }, this);
        this.container.style.width = Math.floor(normalized.maxX + offsetX) + "px";
        this.container.style.height = Math.floor(normalized.maxY + offsetY) + "px";
    }

    function prepare_chart(container_id) {
        var div = document.createElement( "div" );
        div.id = container_id + "_div";
        div.style.width = "100%";
        div.style.height = "100%";
        $("#" + container_id).append(div);

        this.container = div;

        setup_nodes(container_id, div);
        position_nodes(mobility.concentric_circles);
    }

    function connect(uri) {
        ab.connect(uri,
            function (session) {
                console.log("Connected to " + uri);
                session.subscribe(this.event_name, onEvent);
            },
            function (code, reason) {
                console.log("Connection lost (" + reason + ")");
                connected = false;
            },

            {
                "maxRetries": 600,
                "retryDelay": 10
            }
        );
    }

    function onEvent(topic, event) {
    }

    /***** PUBLIC INTERFACE *****/
    return {
        init: function(container_id, uri) {
            console.log("Init positioning.js");

            node_count = 19;
            prepare_chart(container_id);
            //connect(uri);
        },

        reposition: function(mobility_provider) {
            position_nodes(mobility_provider);
        }
    }
}