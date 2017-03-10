var ResetButtonModule = (function () {

    /***** CONSTRUCTOR *****/
    function ResetButtonModule(container_id, uris, objects) {
        if (!(this instanceof arguments.callee)) {
            throw new Error("Constructor called as a function");
        }
        if (window.DEBUG) {
            console.log("Creating instance of 'reset.js' at '" + container_id + "'");
        }

        /***** PRIVATE VARIABLES *****/
        this._procedure_name = "http://opendsme.org/rpc/restart"
        this._stored_sessions = {};
        this._objects = objects;

        _prepare_input.call(this, container_id);

        for (var i = 0; i < uris.length; i++) {
            _connect.call(this, uris[i]);
        }
    }

    /***** PRIVATE METHODS *****/

    function _prepare_input(container_id) {
        var that = this;

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
            for (var uri in that._stored_sessions) {
                if(that._stored_sessions[uri]) {
                    that._stored_sessions[uri].call(that._procedure_name).then(
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
            for (var i = 0; i < that._objects.length; i++) {
                that._objects[i].reset.call(that._objects[i]);
            }
        }

    }

    function _connect(uri) {
        var that = this;

        ab.connect(uri,
            function (session) {
                that._stored_sessions[uri] = session;
                if (window.DEBUG) {
                    console.log("Connected to " + uri);
                }
            },
            function (code, reason) {
                that._stored_sessions[uri] = null;
                if (window.DEBUG) {
                    console.error("Connection lost (" + reason + ")");
                }
            },
            {
                "maxRetries": 50,
                "retryDelay": 500
            }
        );
    }

    /***** PUBLIC INTERFACE *****/
    // NONE

    return ResetButtonModule;
})();
