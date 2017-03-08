var PowerStatisticsModule = (function() {

    /***** CONSTRUCTOR *****/
    function PowerStatisticsModule(container_id, uris, labels) {
        if (!(this instanceof arguments.callee)) {
            throw new Error("Constructor called as a function");
        }
        if (window.DEBUG) {
            console.log("Creating instance of 'power.js' at '" + container_id + "'");
        }

        /***** PRIVATE VARIABLES *****/
        this._chart = null;
        this._labels = labels;
        this._arrived = 0;

        _prepare_chart.call(this, container_id);

        for (var i = 0; i < uris.length; i++) {
            _connect.call(this, i, uris[i], "http://opendsme.org/events/3");
        }
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

        datasets = []
        for (var i = 0; i < that._labels.length; i++) {
            datasets.push({
                label: that._labels[i],
                rgb: "0," + ((255-i*128)%256).toString() + "," + ((i*255)%256).toString()
            })
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
            type: "line",
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
                        },
                    }]
                }
            }
        });
    }

    function _connect(i, uri, event_name) {
        var that = this;

        function onEvent(topic, event) {
            var tuple = event.split(",");

            that._arrived = that._arrived + 1;
            that._chart.data.datasets[i].data.push(parseFloat(tuple[1]));

            var duration = 1000;
            if(i == 0) {
                that._arrived = 0;
                that._chart.data.labels.push(parseFloat(tuple[0])); // time

                if (that._chart.data.labels.length > 30) {
                    that._chart.data.labels.shift();
                    for(var j = 0; j < that._labels.length; j++) {
                        that._chart.data.datasets[j].data.shift();
                    }
                    duration = 0;
                }
                that._chart.update(duration);
            }

            if(that._arrived == that._labels.length) {
                that._chart.update(duration);
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

    return PowerStatisticsModule;
})();
