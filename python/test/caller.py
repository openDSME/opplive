#!/usr/bin/env python3

from autobahn.asyncio.wamp import ApplicationSession, ApplicationRunner

class TestCaller(ApplicationSession):
    async def onJoin(self, details):
        print('session ready')

        try:
            while(True):
                a = int(input('a:'))
                b = int(input('b:'))
                res = await self.call(u'org.opendsme.add2', a, b)
                print('call result: {}'.format(res))
        except Exception as e:
            print('call error: {0}'.format(e))

if __name__ == '__main__':
    runner = ApplicationRunner(url=u'ws://localhost:9000/ws', realm=u'opplive')
    runner.run(TestCaller)
