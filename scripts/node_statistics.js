var NoteStatisticsModule = (function() {

    /***** CONSTRUCTOR *****/
    function NoteStatisticsModule(container_id, uri, node_count, excluded) {
        if (!(this instanceof arguments.callee)) {
            throw new Error("Constructor called as a function");
        }
        if (window.DEBUG) {
            console.log("Creating instance of 'node_statistics.js' at '" + container_id + "'");
        }

        /***** PRIVATE VARIABLES *****/
        this._chart = null;

        if (excluded !== undefined) {
            this._excluded = excluded.sort();
        } else {
            this._excluded = []
        }

        _prepare_chart.call(this, container_id, node_count);
        _connect.call(this, uri);
    }

    /***** PRIVATE METHODS *****/
    function _prepare_chart(container_id, node_count) {
        var that = this;

        var canvas = document.createElement("canvas");
        canvas.id = container_id + "_canvas";
        canvas.style.width = "100%";
        canvas.style.height = "80px";
        $("#" + container_id).append(canvas);

        var ctx = canvas.getContext('2d');

        var datasets = [
            {
                label: "Delivered Packets",
                rgb: "0,240,0"
            },
            {
                label: "No ACK",
                rgb: "240,0,0"
            },
            {
                label: "Channel Busy",
                rgb: "240,0,150"
            },
            {
                label: "No Route",
                rgb: "220,100,30"
            },
            {
                label: "Queue Full",
                rgb: "180,50,100"
            },
            {
                label: "No GTS",
                rgb: "200,0,200"
            }
        ]

        for (var i = that._excluded.length - 1; i >= 0; i--) {
            datasets.splice(that._excluded[i], 1);
        }

        for (var i = 0; i < datasets.length; i++) {
            var color = datasets[i].rgb
            datasets[i].data = [];
            datasets[i].backgroundColor = "rgba(" + color + ",0.5)";
            datasets[i].borderColor = "rgba(" + color + ",0.5)";
            datasets[i].borderWidth = 0;
        }

        var initial_data = {
            labels: [],
            datasets: datasets
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
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });

        for (i = 0; i < node_count; i++) {
            this._chart.data.labels.push(i);
            for (j = 0; j < this._chart.data.datasets; j++) {
                this._chart.data.datasets[j].data[i] = 0;
            }
        }
        this._chart.update();
    }

    function _connect(uri) {
        var that = this;

        function onEvent(topic, event) {
            var values = JSON.parse(event);
            for (var i = 0; i < values.length; i++) {
                var currentDataset = 0;
                for (var j = 0; j < values[i].length; j++) {
                    while (that._excluded.indexOf(j) > -1) {
                        j++;
                    }
                    if (that._chart.data.datasets.length > currentDataset) {
                        that._chart.data.datasets[currentDataset].data[i] = values[i][j];
                    }
                    currentDataset++;
                }
            }
            that._chart.update();
        }

        function onInitialized(topic, event) {
            for (i = 0; i < that._chart.data.datasets.length; i++) {
                for (j = 0; j < that._chart.data.datasets[i].data.length; j++) {
                    that._chart.data.datasets[i].data[j] = 0;
                }
            }
            that._chart.update();
        }

        ab.connect(uri,
            function(session) {
                if (window.DEBUG) {
                    console.log("Connected to " + uri);
                }
                session.subscribe("http://opendsme.org/events/2", onEvent);
                session.subscribe("http://opendsme.org/events/initialized", onInitialized);
            },
            function(code, reason) {
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

    return NoteStatisticsModule;
})();

