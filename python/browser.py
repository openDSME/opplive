#!/usr/bin/env python3

import argparse
import curses
import npyscreen
import sys

class ModuleTree(npyscreen.MLTreeAction):
    def __init__(self, *args, **keywords):
        super(ModuleTree, self).__init__(*args, **keywords)
        self.add_handlers({
            'q': self.parent.quit
        })

class MainForm(npyscreen.FormMutt):
    MAIN_WIDGET_CLASS = ModuleTree

    def __init__(self, *args, **keywords):
        super(MainForm, self).__init__(*args, **keywords)
        self.add_handlers({
            'q': self.quit
        })

    def beforeEditing(self):
        self.update_list()

    def update_list(self):
        treedata = npyscreen.NPSTreeData(content='Root', selectable=True,ignoreRoot=False)
        c1 = treedata.newChild(content=self.parentApp.args.address, selectable=True, selected=True)
        c2 = treedata.newChild(content='Child 2', selectable=True)
        g1 = c1.newChild(content='Grand-child 1', selectable=True)
        g2 = c1.newChild(content='Grand-child 2', selectable=True)
        g3 = c1.newChild(content='Grand-child 3')
        gg1 = g1.newChild(content='Great Grand-child 1', selectable=True)
        gg2 = g1.newChild(content='Great Grand-child 2', selectable=True)
        gg3 = g1.newChild(content='Great Grand-child 3')

        self.wMain.values = treedata
        self.wMain.display()

    def quit(self, _):
        self.parentApp.quit()

class BrowserApp(npyscreen.NPSAppManaged):
    def __init__(self, args):
        super(BrowserApp, self).__init__()
        self.args = args

    def onStart(self):
        self.registerForm('MAIN', MainForm(name='OMNeT++ Parameter Browser'))

    def quit(self):
        self.setNextForm(None)
        sys.exit()

def main(args):
    BrowserApp(args).run()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('address')

    args = parser.parse_args()
    main(args)

