var TrafficModule = (function () {

    /***** CONSTRUCTOR *****/
    function TrafficModule(container_id, uri) {
        if (!(this instanceof arguments.callee)) {
            throw new Error("Constructor called as a function");
        }
        console.log("Creating instance of 'traffic.js' at '" + container_id + "'");

    /***** PRIVATE VARIABLES *****/
        this._chart = null;

        _prepare_chart.call(this, container_id);
        _connect.call(this, uri, "http://opendsme.org/events/1");
    }

    /***** PRIVATE METHODS *****/
    function _prepare_chart(container_id) {
        var canvas = document.createElement("canvas");
        canvas.id = container_id + "_canvas";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        $("#" + container_id).append(canvas);

        var ctx = canvas.getContext('2d');
        var initial_data = {
            labels: [],
            datasets: [
                {
                    label: "Delivered Packets",
                    backgroundColor: "rgba(0,220,0,0.4)",
                    borderColor: "rgba(0,220,0,1)",
                    data: []
                },
                {
                    label: "Dropped Packets",
                    backgroundColor: "rgba(220,0,0,0.4)",
                    borderColor: "rgba(220,0,0,1)",
                    data: []
                }
            ]
        };

        this._chart = new Chart(ctx, {
            type: "bar",
            data: initial_data,
            options: {
                scales: {
                    xAxes: [{
                        stacked: true,
                        ticks: {
                            beginAtZero: true
                        }
                    }],
                    yAxes: [{
                        stacked: true,
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }

    function _connect(uri, event_name) {
        var that = this;

        function onEvent(topic, event) {
            var tuple = event.split(",");
            that._chart.data.labels.push(parseFloat(tuple[0])); // time
            that._chart.data.datasets[0].data.push(parseFloat(tuple[1])); // received
            that._chart.data.datasets[1].data.push(parseFloat(tuple[2])); // dropped

            var duration = 1000;
            if (that._chart.data.labels.length > 30) {
                that._chart.data.labels.shift();
                that._chart.data.datasets[0].data.shift();
                that._chart.data.datasets[1].data.shift();
                duration = 1;
            }
            that._chart.update(duration);
        }

        ab.connect(uri,
            function (session) {
                console.log("Connected to " + uri);
                session.subscribe(event_name, onEvent);
            },
            function (code, reason) {
                console.error("Connection lost (" + reason + ")");
                connected = false;
            },

            {
                "maxRetries": 1,
                "retryDelay": 10
            }
        );
    }


    /***** PUBLIC INTERFACE *****/
    // NONE

    return TrafficModule;
})();
