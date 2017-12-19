function parameter_parse(entry) {
    var parameter = {
        name:      null,
        base_type: null,
        volatile:  null,
    };

    parameter.name = entry[0];

    var type = entry[1];

    var match = type.match(/^expression\((.*)\)$/);

    if (match !== null) {
        parameter.volatile = true;
        parameter.base_type = match[1];
    } else {
        parameter.volatile = false;
        parameter.base_type = type;
    }

    return parameter;
}
