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

function show_parameter_value(session, module_path, parameter, cell) {
    session.call(PROCEDURE_GET_PARAMETER_VALUE, [module_path, parameter]).then(function (res) {
        cell.empty();
        var input = $('<input type="text" value="' + res + '">');
        cell.append(input);
    });
}

function show_parameters(session, module_path) {
    session.call(PROCEDURE_GET_PARAMTERS, [module_path]).then(function (res) {
        res = result_to_list(res);

        var table = $('#parameter-table');
        table.empty();

        for(var i = 0; i < res.length; i++) {
            let name = res[i][0];
            let type = res[i][1];

            let row   = $('<tr></tr>');
            table.append(row);

            let name_cell = $('<td>' + name + '</td>');
            row.append(name_cell);

            let type_cell = $('<td>' + type + '</td>');
            row.append(type_cell);

            let value_cell = $('<td></td>');
            row.append(value_cell);

            show_parameter_value(session, module_path, name, value_cell);
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
                let type = res[i][1];

                let entry = $('<li></li>');
                list.append(entry);

                let label = $('<span>' + name + ' (' + type + ')</span>');
                entry.append(label);

                let child_module = module_path + '.' + name;
                if (module_path === '') {
                    child_module = name;
                }
                label.click(function(){
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