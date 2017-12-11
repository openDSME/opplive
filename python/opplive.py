#!/usr/bin/env python3

import argparse
import autobahn_sync
import cmd

class Shell(cmd.Cmd):
    intro = 'Interactive OMNeT++ shell. Type help or ? to list commands.\n'
    prompt = '>> '

    def __init__(self, caller, *args):
        super().__init__(*args)
        self.caller = caller

    def do_modules(self, arg):
        '''List all submodules of a module'''

        res = self.caller(u'com.examples.functions.getAllSubmodules', arg)
        if hasattr(res, 'results'):
            res = list(res.results)
        elif res:
            res = [res]
        else:
            res = []

        for name, typename in res:
            print(name, ':', typename)

    def do_parameters(self, arg):
        '''List all parameters of a module'''

        res = self.caller(u'com.examples.functions.getParameterNames', arg)
        if hasattr(res, 'results'):
            res = list(res.results)
        elif res:
            res = [res]
        else:
            res = []

        for name, typename in res:
            print(name, ':', typename)

    def do_getParameter(self, arg):
        '''Retrieve the value of a module parameter'''

        module, parameter = arg.split(' ')
        res = self.caller(u'com.examples.functions.getParameter', module, parameter)
        print(res)

    def do_setParameter(self, arg):
        '''Change the value of a module parameter'''

        module, parameter, value = arg.split(' ')
        res = self.caller(u'com.examples.functions.setParameter', module, parameter, value)
        print(res)

def main(args):
    url = u'ws://{0}:{1}/ws'.format(args.host, args.port)
    print('Attempting connection to "{0}"'.format(url))

    autobahn_sync.run(url=url, realm=args.realm)
    Shell(autobahn_sync.call).cmdloop()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('realm', type=str)
    parser.add_argument('host', type=str)
    parser.add_argument('port', type=int)

    main(parser.parse_args())

