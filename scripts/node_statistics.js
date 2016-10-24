var node_statistics_module = new function () {
    /***** PRIVATE VARIABLES *****/
    var node_count = null;
    var chart = null;

    var dropped = [];

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
                    fillColor: "rgba(220,0,0,0.2)",
                    strokeColor: "rgba(220,0,0,1)",
                    pointColor: "rgba(220,0,0,1)",
                    pointStrokeColor: "#fff",
                    data: []
                }
            ]
        };
        chart = new Chart(ctx).Bar(initial_data, {
            animationSteps: 5,
            responsive: true
        });

        for (i = 0; i < node_count; i++) {
            dropped[i] = 0;
            chart.addData([dropped[i]], i);
        }
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
        var address = parseFloat(event) - 1;
        dropped[address]++;
        chart.datasets[0].bars[address].value = dropped[address];
        chart.update();
        setTimeout(function(){
            dropped[address]--;
            chart.datasets[0].bars[address].value = dropped[address];
            chart.update();
        }, 10000);
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
