var TrafficModule = (function() {

    /***** CONSTRUCTOR *****/
    function TrafficModule(container_id, uri, fit, excluded) {
        if (!(this instanceof arguments.callee)) {
            throw new Error("Constructor called as a function");
        }
        if (window.DEBUG) {
            console.log("Creating instance of 'traffic.js' at '" + container_id + "'");
        }

        /***** PRIVATE VARIABLES *****/
        this._chart = null;
        this._fit_chart = fit;
        this._fit_max = -Infinity;

        if (excluded !== undefined) {
            this._excluded = excluded.sort();
        } else {
            this._excluded = []
        }

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
                        afterFit: function(scale) {
                            if (that._fit_chart !== undefined) {
                                var fitScale = that._fit_chart._chart.scales["y-axis-0"];
                                var fitMax = fitScale.max;
                                if (scale.max < fitMax) {
                                    scale.end = fitMax;
                                    scale.ticks = fitScale.ticks;
                                    scale.ticksAsNumbers = fitScale.ticksAsNumbers;
                                    that._fit_chart._chart.update(1);
                                }
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

            var currentDataset = 0;
            for (var i = 1; i < tuple.length; i++) {
                while (that._excluded.indexOf(i - 1) > -1) {
                    i++;
                }
                if (that._chart.data.datasets.length > currentDataset) {
                    that._chart.data.datasets[currentDataset].data.push(parseFloat(tuple[i]));
                }
                currentDataset++;
            }

            var totalDatasets = that._chart.data.datasets.length + that._excluded.length;
            if (tuple.length - 1 > totalDatasets) {
                console.warn("Data was given for ", tuple.length - 1, " dataset but only ", totalDatasets, " exist");
            } else if (tuple.length - 1 < that._chart.data.datasets.length) {
                console.warn("Data was given for ", tuple.length - 1, " dataset but ", totalDatasets, " have to be filled");
            }

            if (that._chart.data.labels.length > 30) {
                that._chart.data.labels.shift();
                for (var i = 0; i < that._chart.data.datasets.length; i++) {
                    that._chart.data.datasets[i].data.shift();
                }
                that._chart.update(1);
            } else {
                that._chart.update(1000);
            }
            
        }

        ab.connect(uri,
            function(session) {
                if (window.DEBUG) {
                    console.log("Connected to " + uri);
                }
                session.subscribe(event_name, onEvent);
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


    /***** PUBLIC INTERFACE *****/
    TrafficModule.prototype.setFitChart = function(fit_chart) {
        this._fit_chart = fit_chart;
    };

    return TrafficModule;
})();
