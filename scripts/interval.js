var IntervalSliderModule = (function () {
    /***** PRIVATE VARIABLES *****/
    var _procedure_name = null;
    var _stored_sessions = [];
    var _input = null;
    var _label = null;

    /***** CONSTRUCTOR *****/
    function IntervalSliderModule(container_id, uris) {
        console.log("Creating instance of interval.js");

        _procedure_name = "http://opendsme.org/rpc/setInterval"

        _prepare_input(container_id);
        _setDisplayedValue(1.0);

        for (var i = 0; i < uris.length; i++) {
            _connect(uris[i]);
        }
    }

    /***** PRIVATE METHODS *****/
    function _prepare_input(container_id) {
        _input = document.createElement("input");
        _input.id = container_id + "_range";
        _input.name = _input.id;
        _input.type = "range";
        _input.min = "1";
        _input.max = "40";
        _input.onchange = onChange;
        _input.oninput = onInput;

        _label = document.createElement("label");
        _label.id = container_id + "_label";
        _label.innerText = "0.0 s";
        _label.htmlFor = _input.name;

        $("#" + container_id).append(_input);
        $("#" + container_id).append(_label);

        function onChange() {
            var value = parseFloat(_input.value) / 10;
            _setInterval(value);
        }

        function onInput(value) {
            _label.innerText = parseFloat(_input.value) / 10 + " s";
        }
    }

    function _connect(uri) {
        ab.connect(uri,
            function (session) {
                _stored_sessions.push[session];
                console.log("Connected to " + uri);
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

    function _setDisplayedValue(value) {
        _label.innerText = value + " s";
        _input.value = Math.floor(value * 10);
    }

    function _setInterval(interval) {
        if (_stored_sessions.length == 0) {
            console.error("No Session is established!");
            return;
        }

        for (var i = 0; i < _stored_sessions.length; i++) {
            _stored_sessions[i].call(_procedure_name, interval).then(
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

    /***** PUBLIC INTERFACE *****/
    // NONE

    return IntervalSliderModule;
})();

