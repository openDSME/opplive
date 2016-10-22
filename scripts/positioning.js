var positioning_module = new function () {
    /***** PRIVATE VARIABLES *****/
    this.node_count = null;
    this.nodes = null;
    this.latest_label = null;

    /***** PRIVATE METHODS *****/
    function prepare_chart(container_id) {
        var div = document.createElement( "div" );
        div.id = container_id + "_div";
        div.style.width = "100%";
        div.style.height = "100%";
        $("#" + container_id).append(div);

        var currentCircle = 0;
        var onCurrentCircle = 0;
        var currentCircleSize = 0;
        this.nodes = [];
        for (i = 0; i < this.node_count; i++) {
            var currentAngle = 0;
            if(currentCircleSize != 0) {
                currentAngle = onCurrentCircle * 2 * Math.PI / currentCircleSize;
            }
            this.nodes[i] = {
                x: 100 * currentCircle * Math.cos(currentAngle),
                y: 100 * currentCircle * Math.sin(currentAngle),
                address: i + 1,
                object: null
            };
            if(onCurrentCircle + 1 >= currentCircleSize) {
                onCurrentCircle = 0;
                currentCircle++;
                currentCircleSize = Math.floor(2 * Math.PI * currentCircle);
            } else {
                onCurrentCircle++;
            }
        }

        var minX = Infinity;
        var minY = Infinity;
        this.nodes.forEach(function(element) {
            if(element.x < minX) {
                minX = element.x;
            }
            if(element.y < minY) {
                minY = element.y;
            }
        }, this);

        this.nodes.forEach(function(element) {
            element.x -= minX;
            element.y -= minY;
        }, this);

        var maxX = -Infinity;
        var maxY = -Infinity;
        this.nodes.forEach(function(element) {
            if(element.x > maxX) {
                maxX = element.x;
            }
            if(element.y > maxY) {
                maxY = element.y;
            }
        }, this);

        var offsetX = 40;
        var offsetY = 50;
        this.nodes.forEach(function(element) {
            element.x += offsetX;
            element.y += offsetY;
        }, this);

        $("#" + container_id).get(0).style.width = Math.floor(maxX + offsetX * 2 + 20) + "px";
        $("#" + container_id).get(0).style.height = Math.floor(maxY + offsetY + 30) + "px";

        this.nodes.forEach(function(element) {
            var node = document.createElement( "div" );
            element.object = node;
            node.id = container_id + "node_" + element.address;
            node.innerText = element.address;
            node.className = "node";
            node.style.left = Math.floor(element.x) + "px";
            node.style.top = Math.floor(element.y) + "px";
            $(div).append(node);

            $(node).draggable({
                    containment: "parent",
                    opacity: 0.5,
                    stack: ".node"
                });
        }, this);
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
        }
    }
}