var TrafficModule = (function () {

    /***** CONSTRUCTOR *****/
    function TrafficModule(container_id, uri, fit_chart) {
        if (!(this instanceof arguments.callee)) {
            throw new Error("Constructor called as a function");
        }
        console.log("Creating instance of 'traffic.js' at '" + container_id + "'");

        /***** PRIVATE VARIABLES *****/
        this._chart = null;
        this._fit_chart = fit_chart;
        this._fit_max = -Infinity;

        _prepare_chart.call(this, container_id);
        _connect.call(this, uri, "http://opendsme.org/events/1");
    }

    /***** PRIVATE METHODS *****/
    function _prepare_chart(container_id) {
        var that = this;

        var canvas = document.createElement("canvas");
        canvas.id = container_id + "_canvas";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        $("#" + container_id).append(canvas);

        var ctx = canvas.getContext('2d');

        var datasets = [
            {
                label: "Delivered Packets",
                rgb: "0,220,0"
            },
            {
                label: "Dropped Packets",
                rgb: "220,0,0"
            },
            {
                label: "Queue Loss",
                rgb: "220,0,100"
            }
        ]

        for (var i = 0; i < datasets.length; i++) {
            var color = datasets[i].rgb
            datasets[i].data = [];
            datasets[i].backgroundColor = "rgba(" + color + ",0.4)",
                datasets[i].borderColor = "rgba(" + color + ",1)"
        }

        var initial_data = {
            labels: [],
            datasets: datasets
        };

        that._chart = new Chart(ctx, {
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
                        },
                        afterFit: function (scale) {
                            if (that._fit_chart) {
                                that._fit_chart.checkY(scale.max);
                            }
                            if (scale.max < that._fit_max) {
                                scale.end = that._fit_max
                                //TODO: Fix Ticks
                            }
                        },
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
            for (var i = 1; i < tuple.length; i++) {
                if (that._chart.data.datasets.length >= i) {
                    that._chart.data.datasets[i - 1].data.push(parseFloat(tuple[i]));
                }
            }

            if (tuple.length - 1 > that._chart.data.datasets.length) {
                console.warn("Data was given for ", tuple.length - 1, " dataset but only ", that._chart.data.datasets.length, " exist");
            } else if (tuple.length - 1 < that._chart.data.datasets.length) {
                console.warn("Data was given for ", tuple.length - 1, " dataset but ", that._chart.data.datasets.length, " have to be filled");
            }

            var duration = 1000;
            if (that._chart.data.labels.length > 30) {
                that._chart.data.labels.shift();
                for (var i = 0; i < that._chart.data.datasets.length; i++) {
                    that._chart.data.datasets[i].data.shift();
                }
                duration = 1;
            }
            that._chart.update(duration);
            that._chart.update(1);
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
    TrafficModule.prototype.checkY = function (max) {
        this._fit_max = max;
    };

    TrafficModule.prototype.setFitChart = function (fit_chart) {
        this._fit_chart = fit_chart;
    };

    return TrafficModule;
})();
