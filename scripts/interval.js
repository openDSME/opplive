var IntervalSliderModule = (function() {
    /***** PRIVATE VARIABLES *****/
    var _procedure_name = null;
    var _stored_sessions = [];
    var _input = null;
    var _label = null;

    /***** CONSTRUCTOR *****/
    function IntervalSliderModule(container_id, uris) {
        if (!(this instanceof arguments.callee)) {
            throw new Error("Constructor called as a function");
        }
        if (window.DEBUG) {
            console.log("Creating instance of 'interval.js' at '" + container_id + "'");
        }

        _procedure_name = "http://opendsme.org/rpc/setInterval"

        _prepare_input(container_id);
        _setDisplayedValue(1.0);

        for (var i = 0; i < uris.length; i++) {
            _connect(uris[i]);
        }
    }

    /***** PRIVATE METHODS *****/
    function _convertValue(text) {
        var converted = parseFloat(_input.value) / 100
        converted = Math.pow(5, converted);

        var decimals = Math.round(Math.sqrt(1 / converted));
        decimals = Math.max(0, decimals);
        decimals = Math.min(3, decimals);

        converted = converted.toFixed(decimals)
        return converted;
    }

    function _prepare_input(container_id) {
        _input = document.createElement("input");
        _input.id = container_id + "_range";
        _input.name = _input.id;
        _input.type = "range";
        _input.min = "-143";
        _input.max = "243";
        _input.onchange = onChange;
        _input.oninput = onInput;

        _label = document.createElement("label");
        _label.id = container_id + "_label";
        _label.innerText = "0.0 s";
        _label.htmlFor = _input.name;

        $("#" + container_id).append(_input);
        $("#" + container_id).append(_label);

        function onChange() {
            _setInterval(_convertValue(_input.value));
        }

        function onInput(value) {
            _label.innerText = _convertValue(_input.value) + " s";
        }
    }

    function _connect(uri) {
        ab.connect(uri,
            function(session) {
                _stored_sessions.push(session);
                if (window.DEBUG) {
                    console.log("Connected to " + uri);
                }
            },
            function(code, reason) {
                _stored_sessions = [];
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
        _label.innerText = value + " s";
        _input.value = Math.floor(Math.log(value) / Math.log(5) * 100);
    }

    function _setInterval(interval) {
        var sendInterval = parseFloat(interval);
        if (_stored_sessions.length == 0) {
            console.error("No Session is established!");
            return;
        }

        for (var i = 0; i < _stored_sessions.length; i++) {
            _stored_sessions[i].call(_procedure_name, sendInterval).then(
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

    /***** PUBLIC INTERFACE *****/
    // NONE

    return IntervalSliderModule;
})();
