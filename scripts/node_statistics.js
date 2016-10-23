var node_statistics_module = new function () {
    /***** PRIVATE VARIABLES *****/
    this.event_name = null;
    this.node_count = null;
    this.chart = null;

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
        this.chart = new Chart(ctx).Bar(initial_data, {
            animationSteps: 5,
            responsive: true
        });

        for (i = 0; i < node_count; i++) {
            var value = Math.random();
            this.chart.addData([value], i);
        }
    }

    function connect(uri) {
        ab.connect(uri,
            function (session) {
                console.log("Connected to " + uri);
                session.subscribe(this.event_name, onEvent);
            },
            function (code, reason) {
                console.log("Connection lost (" + reason + ")");
                connected = false;
            },

            {
                "maxRetries": 600,
                "retryDelay": 10
            }
        );
    }

    function onEvent(topic, event) {
        var pair = event.split(",");
        var received = parseFloat(pair[0]);
        var dropped = parseFloat(pair[1]);

        this.chart.addData([received, dropped], ++this.latest_label);
    }

    /***** PUBLIC INTERFACE *****/
    return {
        init: function (container_id, uri) {
            console.log("Init node_statistics.js");
            eventName = "http://opendsme.org/events/2"
            node_count = nodeCount;

            prepare_chart(container_id);
            //connect(uri);
        }
    }
}