const { IncomingMessage, ServerResponse } = require('http');
const { Router_Dev } = require("./model/router.model");

describe ('router-dev', () => {

    /**
     * @type {Router_Dev}
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

        router = new Router_Dev();

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

    test('router must replace final slash if it before "?" or at end of the string' , async () => {

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

    test ('2' , () => {
        expect(1).toEqual(1)
    });

});