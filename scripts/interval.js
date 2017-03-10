var IntervalSliderModule = (function() {

    /***** CONSTRUCTOR *****/
    function IntervalSliderModule(container_id, uris) {
        if (!(this instanceof arguments.callee)) {
            throw new Error("Constructor called as a function");
        }
        if (window.DEBUG) {
            console.log("Creating instance of 'interval.js' at '" + container_id + "'");
        }

        /***** PRIVATE VARIABLES *****/
        this._procedure_name = "http://opendsme.org/rpc/setInterval";
        this._stored_sessions = {};
        this._input = null;
        this._label = null;

        _prepare_input.call(this, container_id);
        _setDisplayedValue.call(this, 1.0);

        for (var i = 0; i < uris.length; i++) {
            _connect.call(this, uris[i]);
        }
    }

    /***** PRIVATE METHODS *****/
    function _convertValue(text) {
        var that = this;

        var converted = parseFloat(text) / 100
        converted = Math.pow(5, converted);

        var decimals = Math.round(Math.sqrt(1 / converted));
        decimals = Math.max(0, decimals);
        decimals = Math.min(3, decimals);

        converted = converted.toFixed(decimals)
        return converted;
    }

    function _prepare_input(container_id) {
        var that = this;

        that._input = document.createElement("input");
        that._input.id = container_id + "_range";
        that._input.name = that._input.id;
        that._input.type = "range";
        that._input.min = "-143";
        that._input.max = "243";
        that._input.onchange = onChange;
        that._input.oninput = onInput;

        that._label = document.createElement("label");
        that._label.id = container_id + "_label";
        that._label.innerText = "0.0 s";
        that._label.htmlFor = that._input.name;

        $("#" + container_id).append(that._input);
        $("#" + container_id).append(that._label);

        function onChange() {
            _setInterval.call(that, _convertValue.call(that, that._input.value));
        }

        function onInput(value) {
            that._label.innerText = _convertValue.call(that, that._input.value) + " s";
        }
    }

    function _connect(uri) {
        var that = this;

        function onInitialized(topic, event) {
            _setInterval.call(that, _convertValue.call(that, that._input.value));
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

    function _setDisplayedValue(value) {
        var that = this;

        that._label.innerText = value + " s";
        that._input.value = Math.floor(Math.log(value) / Math.log(5) * 100);
    }

    function _setInterval(interval) {
        var that = this;

        var sendInterval = parseFloat(interval);
        for (var uri in that._stored_sessions) {
            if(that._stored_sessions[uri]) {
                that._stored_sessions[uri].call(that._procedure_name, sendInterval).then(
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

    /***** PUBLIC INTERFACE *****/
    IntervalSliderModule.prototype.reset = function() {
        var that = this;

        _setDisplayedValue.call(that, 1.0);
    };

    return IntervalSliderModule;
})();
