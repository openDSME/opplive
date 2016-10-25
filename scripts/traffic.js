var traffic_module = new function () {
    /***** PRIVATE VARIABLES *****/
    var chart = null;

    /***** PRIVATE METHODS *****/
    function prepare_chart(container_id) {
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

        chart = new Chart(ctx, {
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
        var tuple = event.split(",");
        var time = parseFloat(tuple[0]);
        var received = parseFloat(tuple[1]);
        var dropped = parseFloat(tuple[2]);
        chart.data.labels.push(time);
        chart.data.datasets[0].data.push(received);
        chart.data.datasets[1].data.push(dropped);

        var duration = 1000;
        if(chart.data.labels.length > 30) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
            chart.data.datasets[1].data.shift();
            duration = 1;
        }
        chart.update(duration);
    }

    /***** PUBLIC INTERFACE *****/
    return {
        init: function (container_id, uri) {
            console.log("Init traffic.js");
            var event_name = "http://opendsme.org/events/1"

            prepare_chart(container_id);
            connect(uri, event_name);
        }
    }
}
