#!/usr/bin/env python3

import argparse

from twisted.internet.defer import inlineCallbacks
from autobahn.twisted.wamp import ApplicationSession, ApplicationRunner


def main(args):
    url = u'ws://{0}:{1}/ws'.format(args.host, args.port)

    class EventPrinter(ApplicationSession):
        @inlineCallbacks
        def onJoin(self, details):

            for topic in args.topic:
                def onevent(msg):
                    print('>> {0} >> {1}'.format(topic, msg))

                print('Subscribing to topic {}'.format(topic))
                yield self.subscribe(onevent, topic)

    runner = ApplicationRunner(url=url, realm=args.realm)
    runner.run(EventPrinter)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Subscribe to events of a remote OMNeT++ simulation')
    parser.add_argument('realm', type=str)
    parser.add_argument('host', type=str)
    parser.add_argument('port', type=int)
    parser.add_argument('topic', type=str, nargs='+')

    main(parser.parse_args())

