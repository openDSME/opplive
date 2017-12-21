#!/usr/bin/env python3

# Copyright (c) Maximilian Köstler
# 3-clause BSD license
# https://license.koestler.hamburg

import argparse
import autobahn_sync
import cmd
import re

PROCEDURE_GET_SUBMODULES      = 'com.examples.functions.getAllSubmodules'
PROCEDURE_GET_PARAMTERS       = 'com.examples.functions.getParameterNames'
PROCEDURE_GET_PARAMETER_VALUE = 'com.examples.functions.getParameter'
PROCEDURE_SET_PARAMETER_VALUE = 'com.examples.functions.setParameter'

class Shell(cmd.Cmd):
    intro = 'Interactive OMNeT++ shell. Type help or ? to list commands.\n'
    prompt = '>> '

    ###### CONSTRUCTOR ######
    def __init__(self, call, *args):
        super().__init__(*args)
        self.call = call

    ###### HELPER FUNCTIONS ######
    def result_to_list(self, res):
        if hasattr(res, 'results'):
            res = list(res.results)
        elif res:
            res = [res]
        else:
            res = []
        return res

    def get_modules(self, module):
        res = self.call(PROCEDURE_GET_SUBMODULES, module)
        return self.result_to_list(res)

    def get_parameters(self, module):
        res = self.call(PROCEDURE_GET_PARAMTERS, module)
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

    def sort_objects(self, objects):
        convert = lambda text: int(text) if text.isdigit() else text
        alphanum_key = lambda o: [convert(c) for c in re.split('([0-9]+)', o[0])]
        objects = sorted(objects, key=alphanum_key)
        return objects

    def print_objects(self, objects):
        objects = self.sort_objects(objects)
        max_name_length = max(len(name) for name, *t in objects)
        for name, *t in objects:
            print(name.ljust(max_name_length), '->', *t)

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
    def emptyline(self):
        pass

    def do_modules(self, arg):
        '''List all submodules of a module'''
        self.print_objects(self.get_modules(arg))

    def do_parameters(self, arg):
        '''List all parameters of a module'''
        self.print_objects(self.get_parameters(arg))

    def do_getParameter(self, arg):
        '''Retrieve the value of a module parameter'''
        module, parameter = arg.split(' ')
        print(self.call(PROCEDURE_GET_PARAMETER_VALUE, module, parameter))

    def do_setParameter(self, arg):
        '''Change the value of a module parameter'''
        module, parameter, value = arg.split(' ')
        self.call(PROCEDURE_SET_PARAMETER_VALUE, module, parameter, value)

    def do_quit(self, arg):
        '''Exit the application'''
        exit()

def main(args):
    url = u'ws://{}:{}/ws'.format(args.host, args.port)
    print('Connecting to "{}".'.format(url))

    autobahn_sync.run(url=url, realm=args.realm)
    try:
        Shell(autobahn_sync.call).cmdloop()
    except KeyboardInterrupt:
        print('Shutting down.')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Call remote procedures on a remote OMNeT++ simulation.')
    parser.add_argument('realm', type=str)
    parser.add_argument('host', type=str)
    parser.add_argument('port', type=int)

    main(parser.parse_args())

