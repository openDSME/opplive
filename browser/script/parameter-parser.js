/*
    Copyright (c) Maximilian Köstler
    3-clause BSD license
    https://license.koestler.hamburg
*/

function parameters_check_defined(parameter) {
    for (var key in parameter) {
        if (parameter.hasOwnProperty(key)) {
            if (parameter[key] === null) {
                throw Error('parameter "' + key + '" is ' + parameter[key] + '!');
            }
        }
    }
}

function parameter_parse(entry) {
    var parameter = {
        name:      null,
        base_type: null,
        volatile:  null,
        unit:      null
    };

    parameter.name = entry[0];

    var type = entry[1];
    var match = type.match(/^volatile (.*)$/);
    if (match !== null) {
        parameter.volatile = true;
        parameter.base_type = match[1];
    } else {
        parameter.volatile = false;
        parameter.base_type = type;
    }

    parameter.unit = entry[2];

    parameters_check_defined(parameter);

    return parameter;
}
