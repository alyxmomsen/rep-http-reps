// __tests__/unit/router/router.test.js

const Router = require('../../../app/services/router/router');
const { IncomingMessage, ServerResponse } = require('node:http');

describe('🧪 ROUTER', () => {
    let router;
    let req;
    let res;

    beforeEach(() => {
        router = new Router();
        
        req = new IncomingMessage(null);
        res = new ServerResponse(req);
        
        res.writeHead = jest.fn().mockReturnThis();
        res.end = jest.fn().mockReturnThis();
        
        // Правильный мок для headersSent
        let headersSent = false;
        Object.defineProperty(res, 'headersSent', {
            get: jest.fn(() => headersSent),
            set: jest.fn((val) => { headersSent = val; })
        });
    });

    describe('📝 Регистрация маршрутов', () => {
        test('должен зарегистрировать GET маршрут', async () => {
            const handler = jest.fn();
            router.get('/test', handler);
            
            req.method = 'GET';
            req.url = '/test';
            
            await router.handleRequest(req, res); // 👈 добавили await!
            
            expect(handler).toHaveBeenCalled();
        });

        test('должен зарегистрировать POST маршрут', async () => {
            const handler = jest.fn();
            router.post('/test', handler);
            
            req.method = 'POST';
            req.url = '/test';
            
            await router.handleRequest(req, res); // 👈 добавили await!
            
            expect(handler).toHaveBeenCalled();
        });
    });

    describe('⚙️ Middleware', () => {
        test('должен выполнить middleware в правильном порядке', async () => {
            const order = [];
            
            const mw1 = async (req, res, next) => {
                order.push('mw1 start');
                await next();
                order.push('mw1 end');
            };
            
            const mw2 = async (req, res, next) => {
                order.push('mw2 start');
                await next();
                order.push('mw2 end');
            };
            
            const handler = async (req, res) => {
                order.push('handler');
                res.end();
            };

            router.get('/test', mw1, mw2, handler);
            
            req.method = 'GET';
            req.url = '/test';
            
            await router.handleRequest(req, res);
            
            // Правильный порядок для Express-style:
            // mw1 start → mw2 start → handler → mw2 end → mw1 end
            expect(order).toEqual([
                'mw1 start',
                'mw2 start',
                'handler',
                'mw2 end',
                'mw1 end'
            ]);
        });

        test('должен прервать цепочку, если middleware не вызвал next', async () => {
            const mw1 = jest.fn(async (req, res, next) => {
                res.end('error from mw1');
                // next НЕ вызываем!
            });
            
            const mw2 = jest.fn();
            const handler = jest.fn();

            router.get('/test', mw1, mw2, handler);
            
            req.method = 'GET';
            req.url = '/test';
            
            await router.handleRequest(req, res);
            
            expect(mw1).toHaveBeenCalled();
            expect(mw2).not.toHaveBeenCalled(); // 👈 не должен вызываться!
            expect(handler).not.toHaveBeenCalled();
            expect(res.end).toHaveBeenCalledWith('error from mw1');
        });
    });

    describe('🎯 Wildcard маршруты', () => {
        test('должен обработать * в конце URL', async () => {
            const handler = jest.fn();
            router.get('/files/*', handler);
            
            req.method = 'GET';
            req.url = '/files/images/photo.jpg';
            
            await router.handleRequest(req, res);
            
            expect(handler).toHaveBeenCalled();
        });
    });


    // ===== ДИАГНОСТИЧЕСКИЙ ТЕСТ =====
test('🔍 ДИАГНОСТИКА: должен выполнить middleware', async () => {
  const order = [];

  const mw1 = async (req, res, next) => {
    console.log('✅ mw1 start');
    order.push('mw1 start');
    await next();
    order.push('mw1 end');
    console.log('✅ mw1 end');
  };

  const mw2 = async (req, res, next) => {
    console.log('✅ mw2 start');
    order.push('mw2 start');
    await next();
    order.push('mw2 end');
    console.log('✅ mw2 end');
  };

  const handler = async (req, res) => {
    console.log('✅ handler');
    order.push('handler');
    res.end();
  };

  router.get('/test', mw1, mw2, handler);

  req.method = 'GET';
  req.url = '/test';

  await router.handleRequest(req, res);

  console.log('📦 order:', order);
  expect(order).toEqual([
    'mw1 start',
    'mw2 start',
    'handler',
    'mw2 end',
    'mw1 end'
  ]);
});


});