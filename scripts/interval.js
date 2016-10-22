var interval_module = new function () {
    /***** PRIVATE VARIABLES *****/
    this.procedure_name = null;
    this.session = null;
    this.input = null;
    this.label = null;

    /***** PRIVATE METHODS *****/
    function prepare_input(container_id) {
        input = document.createElement("input");
        input.id = container_id + "_range";
        input.name = input.id;
        input.type = "range";
        input.min = "1";
        input.max = "40";
        input.onchange = onChange;
        input.oninput = onInput;

        label = document.createElement("label");
        label.id = container_id + "_label";
        label.innerText = "0.0";
        label.htmlFor = input.name;

        $("#" + container_id).append(input);
        $("#" + container_id).append(label);

        function onChange() {
            var value = parseFloat(input.value) / 10;
            setInterval(value);
        }

        function onInput(value) {
            label.innerText = parseFloat(input.value) / 10;
        }
    }

    function connect(uri) {
        ab.connect(uri,
            function (session) {
                this.session = session;
                console.log("Connected to " + uri);
            },
            function (code, reason) {
                this.session = null;
                console.log("Connection lost (" + reason + ")");
                connected = false;
            },
            {
                "maxRetries": 10,
                "retryDelay": 10
            }
        );
    }

    function setDisplayedValue(value) {
        label.innerText = value;
        input.value = Math.floor(value * 10);
    } 

    function setInterval(interval) {
        if(this.session) {
            this.session.call(this.procedure_name, interval).then(
                function (res) {
                    console.log("Call succeded (" + res + ")");
                },
                function (error, desc) {
                    console.log("Connection error (" + desc + ")");
                }
            );
        } else {
            console.log("Session is not established!");
        }
    }

    /***** PUBLIC INTERFACE *****/
    return {
        init: function(container_id, uri) {
            console.log("Init interval.js");
            procedure_name = "http://opendsme.org/rpc/setInterval"

            prepare_input(container_id);
            setDisplayedValue(1.5);
            //connect(uri);
        }
    }
}