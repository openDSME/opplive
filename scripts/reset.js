var ResetButtonModule = (function () {
    /***** PRIVATE VARIABLES *****/
    var _procedure_name = null;
    var _stored_sessions = [];

    /***** CONSTRUCTOR *****/
    function ResetButtonModule(container_id, uris) {
        if (!(this instanceof arguments.callee)) {
            throw new Error("Constructor called as a function");
        }
        if (window.DEBUG) {
            console.log("Creating instance of 'reset.js' at '" + container_id + "'");
        }

        _procedure_name = "http://opendsme.org/rpc/restart"

        _prepare_input(container_id);

        for (var i = 0; i < uris.length; i++) {
            _connect(uris[i]);
        }
    }

    /***** PRIVATE METHODS *****/

    function _prepare_input(container_id) {
        var fieldset = document.createElement("fieldset");
        $("#" + container_id).append(fieldset);

        var store_button = document.createElement("button");
        store_button.id = container_id + "_button";
        store_button.innerText = "Reset";
        var p1 = document.createElement("p");
        $(p1).append(store_button);
        $(fieldset).append(p1);

        store_button.onclick = onClick;

        function onClick() {
            if (_stored_sessions.length == 0) {
                console.error("No Session is established!");
                return;
            }

            for (var i = 0; i < _stored_sessions.length; i++) {
                _stored_sessions[i].call(_procedure_name).then(
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

    }

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

    /***** PUBLIC INTERFACE *****/
    // NONE

    return ResetButtonModule;
})();
