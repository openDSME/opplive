#!/usr/bin/env python3

import argparse
import autobahn_sync
import cmd

class Shell(cmd.Cmd):
    intro = 'Interactive OMNeT++ shell. Type help or ? to list commands.\n'
    prompt = '>> '

    ###### CONSTRUCTOR ######
    def __init__(self, caller, *args):
        super().__init__(*args)
        self.caller = caller

    ###### HELPER FUNCTIONS ######
    def emptyline(self):
        pass

    def result_to_list(self, res):
        if hasattr(res, 'results'):
            res = list(res.results)
        elif res:
            res = [res]
        else:
            res = []
        return res

    def get_modules(self, module):
        res = self.caller(u'com.examples.functions.getAllSubmodules', module)
        return self.result_to_list(res)

    def get_parameters(self, module):
        res = self.caller(u'com.examples.functions.getParameterNames', module)
        return self.result_to_list(res)

    def get_modules_for_completion(self, text):
        parts            = text.split('.')

        complete_part    = '.'.join(parts[:-1])
        incomplete_part  = parts[-1]

        matching_modules = self.get_modules(complete_part)
        matching_modules  = [m[0] for m in matching_modules]
        matching_modules  = [m for m in matching_modules if m.startswith(incomplete_part)]
        matching_modules  = ['.'.join(parts[:-1] + [m]) for m in matching_modules]
        return matching_modules

    def get_parameters_for_completion(self, module, text):
        matching_parameters = self.get_parameters(module)
        matching_parameters = [p[0] for p in matching_parameters]
        matching_parameters = [p for p in matching_parameters if p.startswith(text)]
        return matching_parameters

    ###### AUTOCOMPLETE FUNCTIONS ######
    def complete_modules(self, text, line, begidx, endidx):
        return self.get_modules_for_completion(text)

    def complete_parameters(self, text, line, begidx, endidx):
        return self.complete_modules(text, line, begidx, endidx)

    def complete_getParameter(self, text, line, begidx, endidx):
        num_spaces = line.count(' ')
        if num_spaces < 2:
            return self.complete_modules(text, line, begidx, endidx)
        elif num_spaces == 2:
            module = line.split(' ')[1]
            return self.get_parameters_for_completion(module, text)
        else:
            return []

    def complete_setParameter(self, text, line, begidx, endidx):
        return self.complete_getParameter(text, line, begidx, endidx)

    ###### COMMANDS ######
    def do_modules(self, arg):
        '''List all submodules of a module'''

        modules = self.get_modules(arg)
        for name, typename in modules:
            print(name, '->', typename)

    def do_parameters(self, arg):
        '''List all parameters of a module'''

        parameters = self.get_parameters(arg)
        for name, typename in parameters:
            print(name, '->', typename)

    def do_getParameter(self, arg):
        '''Retrieve the value of a module parameter'''

        module, parameter = arg.split(' ')
        res = self.caller(u'com.examples.functions.getParameter', module, parameter)
        print(res)

    def do_setParameter(self, arg):
        '''Change the value of a module parameter'''

        module, parameter, value = arg.split(' ')
        res = self.caller(u'com.examples.functions.setParameter', module, parameter, value)

def main(args):
    url = u'ws://{}:{}/ws'.format(args.host, args.port)
    print('Connecting to "{}".'.format(url))

    autobahn_sync.run(url=url, realm=args.realm)
    Shell(autobahn_sync.call).cmdloop()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Call remote procedures on a remote OMNeT++ simulation.')
    parser.add_argument('realm', type=str)
    parser.add_argument('host', type=str)
    parser.add_argument('port', type=int)

    main(parser.parse_args())

