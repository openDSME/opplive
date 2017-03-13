var NodePositioningModule = (function() {

    /***** CONSTRUCTOR *****/
    function NodePositioningModule(container_id, uris, nodeCount) {
        if (!(this instanceof arguments.callee)) {
            throw new Error("Constructor called as a function");
        }
        if (window.DEBUG) {
            console.log("Creating instance of 'positioning.js' at '" + container_id + "'");
        }

        /***** PRIVATE VARIABLES *****/
        this._procedure_name = "http://opendsme.org/rpc/setPosition";
        this._stored_sessions = {};
        this._node_count = nodeCount;
        this._container = null;
        this._nodes = null;
        this._scale = null;

        _prepare_chart.call(this, container_id);

        for (var i = 0; i < uris.length; i++) {
            _connect.call(this, uris[i]);
        }
    }

    /***** PRIVATE METHODS *****/
    function _connect(uri) {
        var that = this;

        function onInitialized(topic, event) {
            _send_all_positions.call(that, that._nodes);
        }

        ab.connect(uri,
            function(session) {
                that._stored_sessions[uri] = session;
                if (window.DEBUG) {
                    console.log("Connected to " + uri);
                }
                session.subscribe("http://opendsme.org/events/initialized", onInitialized);
            },
            function(code, reason) {
                that._stored_sessions[uri] = null;
                if (window.DEBUG) {
                    console.error("Connection lost (" + reason + ")");
                }
            },
            {
                "maxRetries": 20,
                "retryDelay": 500
            }
        );
    }

    function _send_single_position(node) {
        var that = this;

        for (var uri in that._stored_sessions) {
            if(that._stored_sessions[uri]) {
                that._stored_sessions[uri].call(that._procedure_name + "/" + node.address, node.x, node.y).then(
                    function(res) {
                        return;
                    },
                    function(error, desc) {
                        console.error("Connection error (" + desc + ")");
                        return;
                    }
                );
            }
        }
    }

    function _send_all_positions(nodes) {
        var that = this;
        nodes.forEach(function(element) {
            _send_single_position.call(that, element);
        }, this);
    }

    function _setup_nodes(container_id, div) {
        var that = this;

        that._nodes = [];
        for (i = 0; i < that._node_count; i++) {
            that._nodes[i] = {
                x: 0,
                y: 0,
                address: i,
                object: null
            };
        }

        that._nodes.forEach(function(element) {
            var node = document.createElement("div");
            element.object = node;
            node.id = container_id + "node_" + element.address;
            node.innerText = element.address;
            node.className = "node";
            $(div).append(node);

            $(node).draggable({
                stop: function(event, ui) {
                    //$(event.toElement).one('click', function (e) { e.stopImmediatePropagation(); });
                    element.x = node.offsetLeft * that._scale;
                    element.y = node.offsetTop * that._scale;
                    _send_single_position.call(that, element);
                },
                containment: "parent",
                opacity: 0.5,
                stack: ".node"
            });

            node.onclick = function(element) {
                var item = element.target;
                item.classList.toggle("range");
                var range = Math.floor(170 / that._scale);
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
        var that = this;

        that._nodes.forEach(function(element, index) {
            element.x = normalized.positions[index].x;
            element.y = normalized.positions[index].y;
        }, this);

        that._scale = normalized.maxX / 500;

        var minWidth = 500;
        var minHeight = 500;
        var offset = 10;

        var nodeSize = Math.min(32 / that._scale, 32)

        that._nodes.forEach(function(element) {
            element.object.style.width = nodeSize + "px";
            element.object.style.height = nodeSize + "px";

            var fontSize = Math.min(30 / that._scale, 15) + "px";
            var lineHeight = nodeSize;
            $(element.object).css("font-size", fontSize);
            $(element.object).css("line-height", lineHeight + "px");

            element.object.style.left = Math.floor(element.x / that._scale) + "px";
            element.object.style.top = Math.floor(element.y / that._scale) + "px";
        }, this);

        container.style.width = Math.max(minWidth, Math.floor(normalized.maxX / that._scale) + nodeSize + offset) + "px";
        container.style.height = Math.max(minHeight, Math.floor(normalized.maxY / that._scale) + nodeSize + offset) + "px";

        if (!quiet) {
            _send_all_positions.call(that, that._nodes);
        }
    }

    function _position_nodes(mobility_provider, quiet) {
        var that = this;

        var positions = mobility_provider(that._node_count);
        var normalized = mobility.normalize(positions);
        _place_nodes.call(that, normalized, quiet);
    }

    function _get_node_positions() {
        var that = this;

        var positions = [];
        that._nodes.forEach(function(element, index) {
            positions[element.address] = {
                x: element.x,
                y: element.y
            };
        }, this);
        return positions;
    }

    function _load_node_positions(positions) {
        var that = this;

        if (positions.length != _node_count) {
            throw "Incorrect number of nodes given (was " + positions.length + ", expected " + that._node_count + ")";
        }
        var normalized = mobility.normalize(positions);
        _place_nodes.call(that, normalized);
    }

    function _show_ranges(show) {
        var that = this;

        that._nodes.forEach(function(element) {
            if (show) {
                var range = Math.floor(170 / that._scale);
                $(element.object).css("box-shadow", "0px 0px 0px " + range + "px rgba(0, 0, 0, 0.1)");
                element.object.classList.add("range");
            } else {
                $(element.object).css("box-shadow", "0px 0px 0px 0px rgba(0, 0, 0, 0.0)");
                element.object.classList.remove("range");
            }
        }, this);
    }

    function _prepare_chart(container_id) {
        var that = this;

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

            var nodeWidth = Math.min(16, 16 * that._scale);
            spanX.innerText = Math.floor((left - offsetX) * that._scale - nodeWidth);
            spanY.innerText = Math.floor((top - offsetY) * that._scale - nodeWidth);
            return false;
        }

        container = div;

        _setup_nodes.call(that, container_id, div);
        _position_nodes.call(that, mobility.concentric_circles, true);
    }

    /***** PUBLIC INTERFACE *****/
    NodePositioningModule.prototype.reposition = function(mobility_provider) {
        _position_nodes.call(this, mobility_provider);
    };

    NodePositioningModule.prototype.getPositions = function() {
        return _get_node_positions.call(this);
    }

    NodePositioningModule.prototype.loadPositions = function(positions) {
        _load_node_positions.call(this, positions);
    }

    NodePositioningModule.prototype.ranges = function(show) {
        _show_ranges.call(this, show);
    }

    return NodePositioningModule;
})();
