var traffic_module = new function () {
    /***** PRIVATE VARIABLES *****/
    var chart = null;
    var latest_label = null;

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
                    fillColor: "rgba(0,220,0,0.2)",
                    strokeColor: "rgba(0,220,0,1)",
                    pointColor: "rgba(0,220,0,1)",
                    pointStrokeColor: "#fff",
                    data: []
                },
                {
                    fillColor: "rgba(220,0,0,0.2)",
                    strokeColor: "rgba(220,0,0,1)",
                    pointColor: "rgba(220,0,0,1)",
                    pointStrokeColor: "#fff",
                    data: []
                }
            ]
        };
        latest_label = 1;
        chart = new Chart(ctx).Bar(initial_data, {
            animationSteps: 20,
            responsive: true
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
        chart.addData([received, dropped], time);
        if(latest_label++ > 30) {
            chart.removeData();
        }
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
