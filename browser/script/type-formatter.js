/*
    Copyright (c) Maximilian Köstler
    3-clause BSD license
    https://license.koestler.hamburg
*/

function format_namespace(type) {
    parts = type.split(/(?:::)|(?:\.)/);
    type_name = parts[parts.length - 1];
    return '<span title="' + type + '">' + type_name + '</span>';
}

function format_keyword(keyword) {
    return '<span class="keyword">' + keyword + '</span>';
}

function format_type(type) {
    return '<span class="type">' + type + '</span>';
}

function format_module_type(rawtype) {
    var type = rawtype;

    if (type.startsWith('C++ class: ')) {
        type = type.replace('C++ class: ', '');
        type = format_namespace(type);

    } else if (type.startsWith('extends ')) {
        type = type.replace('C++ class: ', '');
        var parts = type.split('  ');
        console.assert(parts.length === 3);
        console.assert(parts[0].startsWith('extends '));
        console.assert(parts[1].startsWith('like '));

        var part_extends = parts[0].substr('extends '.length);
        var part_like    = parts[1].substr('like '.length);
        var part_class   = parts[2];

        type = format_namespace(part_class)
                + ' ' + format_keyword('extends') + ' ' + format_namespace(part_extends)
                + ' ' + format_keyword('like') + ' ' + format_namespace(part_like);
    } else if (type.startsWith('like ')) {
        type = type.replace('C++ class: ', '');
        var parts = type.split('  ');
        console.assert(parts.length === 2);
        console.assert(parts[0].startsWith('like '));

        var part_like    = parts[0].substr('like '.length);
        var part_class   = parts[1];

        type = format_namespace(part_class)
        + ' ' + format_keyword('like') + ' ' + format_namespace(part_like);
    }

    return format_type(type);
}

function format_parameter_type(parameter) {
    var type = "";

    if (parameter.volatile) {
        type += format_keyword('volatile') + ' ';
    }

    type += parameter.base_type;

    return format_type(type);
}

function format_unit(parameter) {
    if (parameter.unit !== '') {
        return '[' + format_type(parameter.unit) + ']';
    } else {
        return '';
    }
}