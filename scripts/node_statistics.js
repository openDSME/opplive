var NoteStatisticsModule = (function () {

    /***** CONSTRUCTOR *****/
    function NoteStatisticsModule(container_id, uri, node_count) {
        if (!(this instanceof arguments.callee)) {
            throw new Error("Constructor called as a function");
        }
        console.log("Creating instance of 'node_statistics.js' at '" + container_id + "'");

    /***** PRIVATE VARIABLES *****/
        this._chart = null;

        _prepare_chart.call(this, container_id, node_count);
        _connect.call(this, uri, "http://opendsme.org/events/2");
    }

    /***** PRIVATE METHODS *****/
    function _prepare_chart(container_id, node_count ) {
        var canvas = document.createElement("canvas");
        canvas.id = container_id + "_canvas";
        canvas.style.width = "100%";
        canvas.style.height = "80px";
        $("#" + container_id).append(canvas);

        var ctx = canvas.getContext('2d');
        var initial_data = {
            labels: [],
            datasets: [
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
                        ticks: {
                            beginAtZero: true
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });

        for (i = 0; i < node_count; i++) {
            this._chart.data.labels.push(i);
            this._chart.data.datasets[0].data.push(0);
        }
        this._chart.update();
    }

    function _connect(uri, event_name) {
        var that = this;

        function onEvent(topic, event) {
            var values = JSON.parse(event);
            for (var i = 0; i < values.length; i++) {
                that._chart.data.datasets[0].data[i] = values[i];
            }
            that._chart.update();
        }

        ab.connect(uri,
            function (session) {
                console.log("Connected to " + uri);
                session.subscribe(event_name, onEvent);
            },
            function (code, reason) {
                console.error("Connection lost (" + reason + ")");
            },

            {
                "maxRetries": 1,
                "retryDelay": 10
            }
        );
    }


    /***** PUBLIC INTERFACE *****/
    // NONE

    return NoteStatisticsModule;
})();

