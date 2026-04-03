const { IncomingMessage, ServerResponse } = require("http");
const { HTTPRouter } = require("../../../app/services/router/v2/model/router.model");
require('http');


describe ('router-dev', () => {

    /**
     * @type {HTTPRouter}
     */
    let router;

    /**
     * @type {IncomingMessage}
     */
    let req;
    /**
     * @type {ServerResponse}
     */
    let res;

    /**
     * @type {ServerResponse<IncomingMessage>.writeHead(statusCode: number, statusMessage?: string, headers?: OutgoingHttpHeader | OutgoingHttpHeader[]): ServerResponse}
     */
    let mockWriteHead;

    beforeEach(() => {
        req = new IncomingMessage(null);
        res = new ServerResponse(req);

        req.method = 'GET';
        req.headers.params = 'id'

        router = new HTTPRouter();

        mockWriteHead = jest.fn();
    });

    // test('route must registrate new method with correct arguments' , () => {
    //     expect(() => router.get('/', (req, res) => { req.end() })).not.toThrow();
    // });
    
    // test('router throws error if registrating a route with no handlers', () => {

    //     // expect(async () => await router.handleRequest(req, res)).rejects.toThrow('route isn\`t ready');
    //     expect(() => router.get('/template')).toThrow('middleware.length must be > 0');
    // });

    // test('router must handle request', () => {

    //     router.get('/foo', (req, res) => {
    //         res.writeHead(200, {
    //             'content-type':"application/json",
    //         });
    //         res.end(JSON.stringify({message:'hello world'}));
    //     });

    //     req.method = 'GET';
    //     req.url = '/foo'

    //     res.end = jest.fn();
        
    //     res.writeHead  = mockWriteHead ;
    //     router.handleRequest(req, res);
    //     expect(mockWriteHead).toHaveBeenCalled();
    //     expect(mockWriteHead).toHaveBeenCalledWith(200, {"content-type":"application/json"});
    //     expect(res.end).toHaveBeenCalledWith(JSON.stringify({message:'hello world'}));
    // });

    test('router must replace final slashes if it before "?" or at end of the string' , async () => {

        router.get('/bar',  (req, res) => {
            res.writeHead(200);
            res.end('ok');
        });

        res.writeHead = jest.fn();
        res.end = jest.fn();

        req.method = 'GET';
        req.url = '/bar/'
        
        await router.handleRequest(req, res);
        
        expect(res.writeHead).toHaveBeenCalled();
        expect(res.writeHead).toHaveBeenCalledWith(200);
        expect(res.end).toHaveBeenCalledWith('ok');

        /* ======================================== */

        res.writeHead = jest.fn();
        res.end = jest.fn();
        
        req.url = '/bar//////////'; 
        await router.handleRequest(req, res);
        
        expect(res.writeHead).toHaveBeenCalled();
        expect(res.writeHead).toHaveBeenCalledWith(200);
        expect(res.end).toHaveBeenCalledWith('ok');
    });

    test ('router must be provide params to handler' , async () => {
        
        const mockHandler = jest.fn();

        router.get('/foo/:id', mockHandler);

        req.method = 'GET';
        req.url = '/foo/bar?hello=world';

        await router.handleRequest(req, res);

        expect(mockHandler).toHaveBeenCalled();
        expect(req.params).toEqual({id:'bar'});
        expect(req.queryParams).toEqual({hello:'world'});


    });

    test (`middleware chain must be broken if function the "next" was not called`, async () => {

        const mw1 = jest.fn(async (req, res, next) => {
            await next();
        });
        const mw2 = jest.fn();
        const mw3 = jest.fn();
        const mw4 = jest.fn();
        const finalHandler = jest.fn(async (req, res) => {});

        router.get('/foo', mw1, mw2, mw3, mw4, finalHandler);

        req.method = "GET";
        req.url = '/foo/'

        await router.handleRequest(req, res);

        expect(mw1)/* .not */.toHaveBeenCalled();
        expect(mw2)/* .not */.toHaveBeenCalled();
        expect(mw3).not.toHaveBeenCalled();
        expect(finalHandler).toHaveBeenCalled();

    }) ;

    test (`the middleware chain must be called with the defined sequence`, async () => {

        const sequence = [];
        const mw1 = jest.fn(async (req, res, next) => {
            sequence.push('mw1a');
            await next();
            sequence.push('mw1b');
        });
        const mw2 = jest.fn(async (req, res, next) => {
            sequence.push('mw2a');
            await next();
            sequence.push('mw2b');
        });
        const mw3 = jest.fn(async (req, res, next) => {
            sequence.push('mw3a');
            await next();
            sequence.push('mw3b');
        });
        const mw4 = jest.fn(async (req, res, next) => {
            // sequence.push();
            await next();
            // sequence.push();
        });
        const finalHandler = jest.fn(async (req, res) => {});

        router.get('/foo', mw1, mw2, mw3, mw4, finalHandler);

        req.method = "GET";
        req.url = '/foo/'

        await router.handleRequest(req, res);

        const sequenceStr = sequence.join(',');
        console.log({sequenceStr: sequenceStr});

        expect(mw1)/* .not */.toHaveBeenCalled();
        expect(mw2)/* .not */.toHaveBeenCalled();
        expect(mw3)/* .not */.toHaveBeenCalled();
        expect(mw4)/* .not */.toHaveBeenCalled();
        expect(sequenceStr).toEqual('mw1a,mw2a,mw3a,mw3b,mw2b,mw1b');

    }) ;

    test (`route must be wait if it is long polling request`,  async () => {

        jest.useFakeTimers();

        req.method = 'GET';
        req.url = '/test';

        const mockResponseEnd = jest.fn();

        res.end = mockResponseEnd;

        const  handler = jest.fn(async (req, res) => {
            // res.end('foo bar baz done!');
            setTimeout(() => res.end('timeouted'),1000);
        });

        router.get('/test',  handler);

        await router.handleRequest(req, res);

        // вызывает ли сразу
        
        expect(handler).toHaveBeenCalled();
        expect(mockResponseEnd).not.toHaveBeenCalled();
        
        // вызывает ли через 5 секунд

        jest.advanceTimersByTime(5000)
        
        expect(handler).toHaveBeenCalled();
        expect(mockResponseEnd).toHaveBeenCalled();
        
    }) ;


    test ('shuld get parsed params and query-params', async () => {

        req.method = 'GET';
        req.url = '/test/13/?foo=bar&bar=baz&broken=key=value'

        const handler = jest.fn(async (req, res) => {

            const params = req.params;
            const queryParams = req.queryParams;

            if(!params) {
                
                res.writeHead(400);
                res.end('no params');
                return;
            }
            
            if(!queryParams) {
                
                res.writeHead(400);
                res.end('no query params');
                return;
            }

            // throw new Error('some error');
            res.writeHead(200);
            res.end('ok');
        });

        res.end = jest.fn();
        // res.writeHead = jest.fn();

        res.writeHead = jest.fn()/* .mockReturnThis() */;

        router.get('/test/:id', handler);

        const result = await router.handleRequest(req, res)

        expect(res.writeHead).toHaveBeenCalledWith(200)
        expect(req.params).toBeDefined();
        expect(req.params).toHaveProperty('id', '13');
        
        expect(req.queryParams).toBeDefined();
        expect(req.queryParams).toHaveProperty('foo', 'bar');
        expect(req.queryParams).toHaveProperty('bar', 'baz');
        expect(req.queryParams).toHaveProperty('broken', 'key');

    });
    
});