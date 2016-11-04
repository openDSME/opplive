var NodePositioningModule = (function () {
    /***** PRIVATE VARIABLES *****/
    var _procedure_name = null;
    var _stored_sessions = [];

    var _node_count = null;
    var _container = null;
    var _nodes = null;

    var _scale = null;

    /***** CONSTRUCTOR *****/
    function NodePositioningModule(container_id, uris, nodeCount) {
        if (!(this instanceof arguments.callee)) {
            throw new Error("Constructor called as a function");
        }
        if (window.DEBUG) {
            console.log("Creating instance of 'positioning.js' at '" + container_id + "'");
        }

        _procedure_name = "http://opendsme.org/rpc/setPosition"

        _node_count = nodeCount;
        _prepare_chart(container_id);

        for (var i = 0; i < uris.length; i++) {
            _connect(uris[i]);
        }
    }

    /***** PRIVATE METHODS *****/
    function _connect(uri) {
        ab.connect(uri,
            function (session) {
                _stored_sessions.push(session);
                if (window.DEBUG) {
                    console.log("Connected to " + uri);
                }
            },
            function (code, reason) {
                _stored_sessions = [];
                console.error("Connection lost (" + reason + ")");
                connected = false;
            },
            {
                "maxRetries": 1,
                "retryDelay": 10
            }
        );
    }

    function _send_single_position(node) {
        if (_stored_sessions.length == 0) {
            console.error("No Session is established!");
            return;
        }

        for (var i = 0; i < _stored_sessions.length; i++) {
            _stored_sessions[i].call(_procedure_name + "/" + node.address, node.x, node.y).then(
                function (res) {
                    return;
                },
                function (error, desc) {
                    console.error("Connection error (" + desc + ")");
                    return;
                }
            );
        }
    }

    function _send_all_positions(nodes) {
        nodes.forEach(function (element) {
            _send_single_position(element);
        }, this);
    }

    function _setup_nodes(container_id, div) {
        _nodes = [];

        for (i = 0; i < _node_count; i++) {
            _nodes[i] = {
                x: 0,
                y: 0,
                address: i,
                object: null
            };
        }

        _nodes.forEach(function (element) {
            var node = document.createElement("div");
            element.object = node;
            node.id = container_id + "node_" + element.address;
            node.innerText = element.address;
            node.className = "node";
            $(div).append(node);

            $(node).draggable({
                stop: function (event, ui) {
                    //$(event.toElement).one('click', function (e) { e.stopImmediatePropagation(); });
                    element.x = node.offsetLeft * _scale;
                    element.y = node.offsetTop * _scale;
                    _send_single_position(element);
                },
                containment: "parent",
                opacity: 0.5,
                stack: ".node"
            });

            node.onclick = function (element) {
                var item = element.target;
                item.classList.toggle("range");
                var range = Math.floor(170 / _scale);
                if (item.classList.contains("range")) {
                    $(item).css("box-shadow", "0px 0px 0px " + range + "px rgba(0, 0, 0, 0.1)");
                } else {
                    $(item).css("box-shadow", "0px 0px 0px 0px rgba(0, 0, 0, 0.0)");
                }
                $(item).parent().append($(item)); /* pop to the front */
            }
        }, this);
    }

    function _place_nodes(normalized, quiet) {
        _nodes.forEach(function (element, index) {
            element.x = normalized.positions[index].x;
            element.y = normalized.positions[index].y;
        }, this);

        _scale = normalized.maxX / 500;

        var minWidth = 500;
        var minHeight = 500;
        var offset = 10;

        var nodeSize = Math.min(32 / _scale, 32)

        _nodes.forEach(function (element) {
            element.object.style.width = nodeSize + "px";
            element.object.style.height = nodeSize + "px";

            var fontSize = Math.min(30 / _scale, 15) + "px";
            var lineHeight = nodeSize;
            $(element.object).css("font-size", fontSize);
            $(element.object).css("line-height", lineHeight + "px");

            element.object.style.left = Math.floor(element.x / _scale) + "px";
            element.object.style.top = Math.floor(element.y / _scale) + "px";
        }, this);

        container.style.width = Math.max(minWidth, Math.floor(normalized.maxX / _scale) + nodeSize + offset) + "px";
        container.style.height = Math.max(minHeight, Math.floor(normalized.maxY / _scale) + nodeSize + offset) + "px";

        if (!quiet) {
            _send_all_positions(_nodes);
        }
    }

    function _position_nodes(mobility_provider, quiet) {
        var positions = mobility_provider(_node_count);
        var normalized = mobility.normalize(positions);
        _place_nodes(normalized, quiet);
    }

    function _get_node_positions() {
        var positions = [];
        _nodes.forEach(function (element, index) {
            positions[element.address] = {
                x: element.x,
                y: element.y
            };
        }, this);
        return positions;
    }

    function _load_node_positions(positions) {
        if (positions.length != _node_count) {
            throw "Incorrect number of nodes given (was " + positions.length + ", expected " + _node_count + ")";
        }
        var normalized = mobility.normalize(positions);
        _place_nodes(normalized);
    }

    function _show_ranges(show) {
        _nodes.forEach(function (element) {
            if (show) {
                var range = Math.floor(170 / _scale);
                $(element.object).css("box-shadow", "0px 0px 0px " + range + "px rgba(0, 0, 0, 0.1)");
                element.object.classList.add("range");
            } else {
                $(element.object).css("box-shadow", "0px 0px 0px 0px rgba(0, 0, 0, 0.0)");
                element.object.classList.remove("range");
            }
        }, this);
    }

    function _prepare_chart(container_id) {
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

            var nodeWidth = Math.min(16, 16 * _scale);
            spanX.innerText = Math.floor((left - offsetX) * _scale - nodeWidth);
            spanY.innerText = Math.floor((top - offsetY) * _scale - nodeWidth);
            return false;
        }

        container = div;

        _setup_nodes(container_id, div);
        _position_nodes(mobility.concentric_circles, true);
    }

    /***** PUBLIC INTERFACE *****/
    NodePositioningModule.prototype.reposition = function (mobility_provider) {
        _position_nodes(mobility_provider);
    };

    NodePositioningModule.prototype.getPositions = function () {
        return _get_node_positions();
    }

    NodePositioningModule.prototype.loadPositions = function (positions) {
        _load_node_positions(positions);
    }

    NodePositioningModule.prototype.ranges = function (show) {
        _show_ranges(show);
    }

    return NodePositioningModule;
})();
