#!/usr/bin/env python3

from autobahn.asyncio.wamp import ApplicationSession, ApplicationRunner

class TestCallee(ApplicationSession):
    async def onJoin(self, details):
        print('session ready')

        def add2(x, y):
            print(x, '+', y)
            return x + y

        try:
            await self.register(add2, u'org.opendsme.add2')
            print('procedure registered')
        except Exception as e:
            print('could not register procedure: {0}'.format(e))

if __name__ == '__main__':
    runner = ApplicationRunner(url=u'ws://localhost:9000/ws', realm=u'opplive')
    runner.run(TestCallee)
