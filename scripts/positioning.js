var positioning_module = new function () {
    /***** PRIVATE VARIABLES *****/
    var node_count = null;
    var container = null;
    var shiftX = null;
    var shiftY = null;

    var nodes = null;

    var procedure_name = null;
    var stored_session = null;

    /***** PRIVATE METHODS *****/
    function connect(uri) {
        ab.connect(uri,
            function (session) {
                stored_session = session;
                console.log("Connected to " + uri);
            },
            function (code, reason) {
                stored_session = 0;
                console.error("Connection lost (" + reason + ")");
                connected = false;
            },

            {
                "maxRetries": 1,
                "retryDelay": 10
            }
        );
    }

    function onEvent(topic, event) {
    }

    function send_single_position(node) {
        if (stored_session) {
            stored_session.call(procedure_name + "/" + node.address, node.x, node.y).then(
                function (res) {
                    return;
                },
                function (error, desc) {
                    console.error("Connection error (" + desc + ")");
                    return;
                }
            );
        } else {
            console.error("Session is not established!");
        }
    }

    function send_all_positions(nodes) {
        nodes.forEach(function (element) {
            send_single_position(element);
        }, this);
    }

    function setup_nodes(container_id, div) {
        shiftX = 20;
        shiftY = 20;

        nodes = [];

        for (i = 0; i < node_count; i++) {
            nodes[i] = {
                x: 0,
                y: 0,
                address: i,
                object: null
            };
        }

        nodes.forEach(function (element) {
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

    function place_nodes(normalized, quiet) {
        nodes.forEach(function (element, index) {
            element.x = normalized.positions[index].x;
            element.y = normalized.positions[index].y;
        }, this);

        var minWidth = 500;
        var minHeight = 500;
        var offsetX = 80;
        var offsetY = 60;
        nodes.forEach(function (element) {
            element.object.style.left = Math.floor(element.x) + shiftX + "px";
            element.object.style.top = Math.floor(element.y) + shiftY + "px";
        }, this);
        container.style.width = Math.max(minWidth, Math.floor(normalized.maxX + offsetX)) + "px";
        container.style.height = Math.max(minHeight, Math.floor(normalized.maxY + shiftY + offsetY)) + "px";

        if (!quiet) {
            send_all_positions(nodes);
        }
    }

    function position_nodes(mobility_provider, quiet) {
        var positions = mobility_provider(node_count);
        var normalized = mobility.normalize(positions);
        place_nodes(normalized, quiet);
    }

    function get_node_positions() {
        var positions = [];
        nodes.forEach(function (element, index) {
            positions[element.address] = {
                x: element.x,
                y: element.y
            };
        }, this);
        return positions;
    }

    function load_node_positions(positions) {
        if (positions.length != node_count) {
            throw "Incorrect number of nodes given (was " + positions.length + ", expected " + node_count + ")";
        }
        var normalized = mobility.normalize(positions);
        place_nodes(normalized);
    }

    function show_ranges(show) {
        nodes.forEach(function (element) {
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

        var position_info = document.createElement("div");
        position_info.classList.add("coordinate-box");
        $("#" + container_id).append(position_info);
        var spanX = document.createElement("p");
        spanX.classList.add("coordinate");
        spanX.classList.add("coordinate-x");
        var spanY = document.createElement("p");
        spanY.classList.add("coordinate");
        spanY.classList.add("coordinate-y");
        $(position_info).append(spanX);
        $(position_info).append(spanY);

        div.onmouseenter = onEnter;
        div.onmouseleave = onLeave;

        function onEnter(event) {
            window.onmousemove = onMove;
            $(position_info).show();
        }

        function onLeave(event) {
            window.onmousemove = null;
            $(position_info).hide();
        }

        function onMove(event) {
            var left = event.clientX;
            var top = event.clientY;

            var rect = div.getBoundingClientRect();
            var offsetX = rect.left;
            var offsetY = rect.top;

            position_info.style.left = left + 10 + "px";
            position_info.style.top = top + 10 + "px";

            /* -16  for node dimensions */
            spanX.innerText = left - offsetX - shiftX - 16;
            spanY.innerText = top - offsetY - shiftY - 16;
            return false;
        }

        container = div;

        setup_nodes(container_id, div);
        position_nodes(mobility.concentric_circles, true);
    }

    /***** PUBLIC INTERFACE *****/
    return {
        init: function (container_id, uri, nodeCount) {
            console.log("Init positioning.js");
            procedure_name = "http://opendsme.org/rpc/setPosition"

            node_count = nodeCount;
            prepare_chart(container_id);
            connect(uri);
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
