const { IncomingMessage, ServerResponse } = require('node:http');
const { HTTPRouter } = require('../../../app/services/router/v3/router.model');

describe('router - v3', () => {
    /** @type {HTTPRouter} */
    let router;

    /** @type {IncomingMessage} */
    let req;

    /** @type {ServerResponse} */
    let res;

    beforeEach(() => {
        router = new HTTPRouter();

        req = new IncomingMessage(null);

        res = new ServerResponse(req);
    });

    const { IncomingMessage, ServerResponse } = require('node:http');
    const {
        HTTPRouter,
    } = require('../../../app/services/router/v3/router.model');

    describe('router - v3', () => {
        let router;
        let req;
        let res;

        beforeEach(() => {
            router = new HTTPRouter();
            req = new IncomingMessage(null);
            res = new ServerResponse(req);
        });

        test('should execute middleware and handler correctly', async () => {
            req.method = 'GET';
            req.url = '/foo/1/2/?queryParam1=foo&queryParam2=baz';

            res.writeHead = jest.fn();
            res.end = jest.fn();

            const handler = jest.fn(async (ctx) => {
                const { req, params, queryParams } = ctx;

                expect(req.foo).toBe('baz');
                expect(params).toEqual({ param1: '1', param2: '2' });
                expect(queryParams).toEqual({
                    queryParam1: 'foo',
                    queryParam2: 'baz',
                });

                ctx.res.end(JSON.stringify({ message: 'hello there' }));
            });

            const middleware = jest.fn(async (ctx, next) => {
                ctx.req.foo = 'baz';
                await next();
            });

            router.get('/foo/:param1/:param2', middleware, handler);
            await router.handleRequest(req, res);

            expect(middleware).toHaveBeenCalled();
            expect(handler).toHaveBeenCalled();
            expect(res.end).toHaveBeenCalledWith(
                JSON.stringify({ message: 'hello there' })
            );
        });
    });
});
