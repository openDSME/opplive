/*
    Copyright (c) Maximilian Köstler
    3-clause BSD license
    https://license.koestler.hamburg
*/

var PROCEDURE_GET_SUBMODULES      = 'com.examples.functions.getAllSubmodules'
var PROCEDURE_GET_PARAMTERS       = 'com.examples.functions.getParameterNames'
var PROCEDURE_GET_PARAMETER_VALUE = 'com.examples.functions.getParameter'
var PROCEDURE_SET_PARAMETER_VALUE = 'com.examples.functions.setParameter'

function result_to_list(res) {
    if (res === null) {
        res = [];
    } else if (typeof(res.args) !== 'undefined') {
        res =  res.args;
    } else {
        res = [res];
    }
    res.sort(function(a, b){return a[0].localeCompare(b[0], undefined, {numeric: true})});
    return res;
}

function set_parameter_value(session, module_path, parameter_name, input) {
    input.removeClass('invalid').addClass('syncing');
    var value = input.val();
    session.call(PROCEDURE_SET_PARAMETER_VALUE, [module_path, parameter_name, value]).then(function (res) {
        input.removeClass('syncing')
    });
}

function show_parameter_value(session, module_path, parameter, cell) {
    session.call(PROCEDURE_GET_PARAMETER_VALUE, [module_path, parameter.name]).then(function (res) {
        cell.empty();

        let form = $('<form></form>');
        cell.append(form);

        let value = res.toString();
        let width = Math.max(20, value.length + 1);
        let input = $('<input type="text" name="value" style="width:' + width + 'ch;" value="' + value + '">');
        form.append(input);

        let submit = $('<input type="submit" hidden>');
        form.append(submit);

        input.on('input',function(e){
            input.addClass('invalid');
        });

        form.validate({
            rules: {
                value: {
                    parameter_type: parameter
                }
            },
            submitHandler: function(f) {
                set_parameter_value(session, module_path, parameter.name, input);
            }
        });
    });
}

function show_parameters(session, module_path) {
    session.call(PROCEDURE_GET_PARAMTERS, [module_path]).then(function (res) {
        res = result_to_list(res);

        var table = $('#parameter-table');
        table.empty();

        for(var i = 0; i < res.length; i++) {
            let parameter = parameter_parse(res[i]);

            let row   = $('<tr></tr>');
            table.append(row);

            let name_cell = $('<td class="variable">' + parameter.name + '</td>');
            row.append(name_cell);

            let type_cell = $('<td>' + format_parameter_type(parameter) + '</td>');
            row.append(type_cell);

            let unit_cell = $('<td>' + format_unit(parameter) + '</td>');
            row.append(unit_cell);

            let value_cell = $('<td></td>');
            row.append(value_cell);

            show_parameter_value(session, module_path, parameter, value_cell);
        }
    });
}

function append_modules(session, module_path, node) {
    session.call(PROCEDURE_GET_SUBMODULES, [module_path]).then(
        function (res) {
            node.children('ul').remove();

            res = result_to_list(res);

            var list = $('<ul></ul>');
            node.append(list);

            for(var i = 0; i < res.length; i++) {
                let name = res[i][0];
                let type = format_module_type(res[i][1]);

                let entry = $('<li></li>');
                list.append(entry);

                let label = $('<span class="module-handle"><span class="variable module-name">' + name + '</span> (' + type + ')</span>');
                entry.append(label);

                let child_module = module_path + '.' + name;
                if (module_path === '') {
                    child_module = name;
                }

                label.click(function(){
                    $('.module-name').removeClass('selected');
                    $(this).children('.module-name').first().addClass('selected');

                    append_modules(session, child_module, entry);
                    show_parameters(session, child_module);
                });
            }
        }
     );
}

function connect(url, realm) {
    var connection = new autobahn.Connection({url: url, realm: realm});

    connection.onopen = function (session) {
        $('#module-tree').empty();
        $('#parameter-table').empty();
        append_modules(session, '', $('#module-tree'));
    };

    connection.open();
}
