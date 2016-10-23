var positioning_module = new function () {
    /***** PRIVATE VARIABLES *****/
    this.node_count = null;
    this.container = null;

    this.nodes = null;

    /***** PRIVATE METHODS *****/
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

    function send_single_position(node) {
        // TODO
        //console.log(node);
    }

    function send_all_positions(nodes) {
        // TODO
        //console.log(nodes);
    }

    function setup_nodes(container_id, div) {
        this.shiftX = 20;
        this.shiftY = 56;

        this.nodes = [];

        for (i = 0; i < this.node_count; i++) {
            nodes[i] = {
                x: 0,
                y: 0,
                address: i,
                object: null
            };
        }

        this.nodes.forEach(function (element) {
            var node = document.createElement("div");
            element.object = node;
            node.id = container_id + "node_" + element.address;
            node.innerText = element.address;
            node.className = "node";
            $(div).append(node);

            $(node).draggable({
                stop: function (event, ui) {
                    //$(event.toElement).one('click', function (e) { e.stopImmediatePropagation(); });
                    element.x = node.offsetLeft - shiftX;
                    element.y = node.offsetTop - shiftY;
                    send_single_position(element);
                },
                containment: "parent",
                opacity: 0.5,
                stack: ".node"
            });

            node.onclick = function (element) {
                var item = element.target;
                item.classList.toggle("range");
                $(item).parent().append($(item)); /* pop to the front */
            }
        }, this);
    }

    function place_nodes(normalized) {
        this.nodes.forEach(function (element, index) {
            element.x = normalized.positions[index].x;
            element.y = normalized.positions[index].y;
        }, this);

        var offsetX = 80;
        this.nodes.forEach(function (element) {
            element.object.style.left = Math.floor(element.x) + shiftX + "px";
            element.object.style.top = Math.floor(element.y) + shiftY + "px";
        }, this);
        this.container.style.width = Math.floor(normalized.maxX + offsetX) + "px";
        this.container.style.height = Math.floor(normalized.maxY + shiftY) + "px";

        send_all_positions(this.nodes);
    }

    function position_nodes(mobility_provider) {
        var positions = mobility_provider(this.node_count);
        var normalized = mobility.normalize(positions);
        place_nodes(normalized);
    }

    function get_node_positions() {
        var positions = [];
        this.nodes.forEach(function (element, index) {
            positions[element.address] = {
                x: element.x,
                y: element.y
            };
        }, this);
        return positions;
    }

    function load_node_positions(positions) {
        if (positions.length != this.node_count) {
            throw "Incorrect number of nodes given (was " + positions.length + ", expected " + this.node_count + ")";
        }
        var normalized = mobility.normalize(positions);
        place_nodes(normalized);
    }

    function show_ranges(show) {
        this.nodes.forEach(function (element) {
            if (show) {
                element.object.classList.add("range");
            } else {
                element.object.classList.remove("range");
            }
        }, this);
    }

    function prepare_chart(container_id) {
        var div = document.createElement("div");
        div.id = container_id + "_div";
        div.style.width = "100%";
        div.style.height = "100%";
        $("#" + container_id).append(div);

        this.container = div;

        setup_nodes(container_id, div);
        position_nodes(mobility.concentric_circles);
    }

    /***** PUBLIC INTERFACE *****/
    return {
        init: function (container_id, uri, nodeCount) {
            console.log("Init positioning.js");

            node_count = nodeCount;
            prepare_chart(container_id);
            //connect(uri);
        },

        reposition: function (mobility_provider) {
            position_nodes(mobility_provider);
        },

        getPositions: function () {
            return get_node_positions();
        },

        loadPositions: function (positions) {
            load_node_positions(positions);
        },

        ranges: function (show) {
            show_ranges(show);
        }
    }
}