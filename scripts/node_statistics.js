var node_statistics_module = new function () {
    /***** PRIVATE VARIABLES *****/
    var node_count = null;
    var chart = null;

    /***** PRIVATE METHODS *****/
    function prepare_chart(container_id) {
        var canvas = document.createElement("canvas");
        canvas.id = container_id + "_canvas";
        canvas.style.width = "100%";
        canvas.style.height = "100px";
        $("#" + container_id).append(canvas);

        var ctx = canvas.getContext('2d');
        var initial_data = {
            labels: [],
            datasets: [
                {
                    label: "Dropped Packets",
                    backgroundColor: "rgba(220,0,0,0.2)",
                    borderColor: "rgba(220,0,0,1)",
                    data: []
                }
            ]
        };
        chart = new Chart(ctx, {
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
            chart.data.labels.push(i);
            chart.data.datasets[0].data.push(0);
        }
        chart.update();
    }

    function connect(uri, event_name) {
        ab.connect(uri,
            function (session) {
                console.log("Connected to " + uri);
                session.subscribe(event_name, onEvent);
            },
            function (code, reason) {
                console.log("Connection lost (" + reason + ")");
                connected = false;
            },

            {
                "maxRetries": 1,
                "retryDelay": 10
            }
        );
    }

    function onEvent(topic, event) {
        var values = JSON.parse(event);
        for (var i = 0; i < values.length; i++) {
            chart.data.datasets[0].data[i] = values[i];
        }
        chart.update();
    }

    /***** PUBLIC INTERFACE *****/
    return {
        init: function (container_id, uri) {
            console.log("Init node_statistics.js");
            var event_name = "http://opendsme.org/events/2"
            node_count = nodeCount;

            prepare_chart(container_id);
            connect(uri, event_name);
        }
    }
}
