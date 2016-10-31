function vector_distance(a, b) {
    var x_diff = a.x - b.x;
    var y_diff = a.y - b.y;
    return Math.sqrt(x_diff * x_diff + y_diff * y_diff);
}

var mobility = {
    concentric_circles: function (node_count) {
        var currentCircle = 0;
        var onCurrentCircle = 0;
        var currentCircleSize = 0;
        var positions = [];
        for (i = 0; i < node_count; i++) {
            var currentAngle = 0;
            if (currentCircleSize != 0) {
                currentAngle = onCurrentCircle * 2 * Math.PI / currentCircleSize;
            }
            positions[i] = {
                x: 100 * currentCircle * Math.cos(currentAngle),
                y: 100 * currentCircle * Math.sin(currentAngle)
            };
            if (onCurrentCircle + 1 >= currentCircleSize) {
                onCurrentCircle = 0;
                currentCircle++;
                currentCircleSize = Math.floor(2 * Math.PI * currentCircle);
            } else {
                onCurrentCircle++;
            }
        }
        return positions;
    },

    star: function (node_count) {
        var currentCircle = 0;
        var onCurrentCircle = 0;
        var currentCircleSize = 0;
        var positions = [];
        for (i = 0; i < node_count; i++) {
            var currentAngle = 0;
            if (currentCircleSize != 0) {
                currentAngle = onCurrentCircle * 2 * Math.PI / currentCircleSize;
            }
            positions[i] = {
                x: 70 * currentCircle * Math.cos(currentAngle),
                y: 70 * currentCircle * Math.sin(currentAngle)
            };
            if (onCurrentCircle + 1 >= currentCircleSize) {
                currentCircleSize = 6;
                onCurrentCircle = 0;
                currentCircle++;
            } else {
                onCurrentCircle++;
            }
        }
        return positions;
    },

    grid: function (node_count) {
        var dimension = Math.sqrt(node_count);
        var x = 0;
        var y = 0;
        var positions = [];
        for (i = 0; i < node_count; i++) {
            positions[i] = {
                x: 100 * x,
                y: 100 * y
            };
            if (x + 1 >= dimension) {
                x = 0;
                y++;
            } else {
                x++;
            }
        }
        return positions;
    },

    random: function (node_count) {
        var dimension = Math.sqrt(node_count);
        var positions = [];
        for (i = 0; i < node_count; i++) {
            var spaced = false;
            do {
                spaced = true;
                positions[i] = {
                    x: Math.floor((Math.random() * 100 * dimension) + 1),
                    y: Math.floor((Math.random() * 100 * dimension) + 1)
                };
                for (j = 0; j < i; j++) {
                    if (vector_distance(positions[i], positions[j]) < 50) {
                        spaced = false;
                    }
                }
            } while (!spaced);
        }
        return positions;
    },

    normalize: function (positions) {
        positions.forEach(function (element) {
            element.x = Math.round(element.x);
            element.y = Math.round(element.y);
        }, this);

        var minX = Infinity;
        var minY = Infinity;
        positions.forEach(function (element) {
            if (element.x < minX) {
                minX = element.x;
            }
            if (element.y < minY) {
                minY = element.y;
            }
        }, this);

        positions.forEach(function (element) {
            element.x -= minX;
            element.y -= minY;
        }, this);

        var maxX = -Infinity;
        var maxY = -Infinity;
        positions.forEach(function (element) {
            if (element.x > maxX) {
                maxX = element.x;
            }
            if (element.y > maxY) {
                maxY = element.y;
            }
        }, this);

        return {
            positions: positions,
            minX: minX,
            minY: minY,
            maxX: maxX,
            maxY: maxY
        };
    }
}
