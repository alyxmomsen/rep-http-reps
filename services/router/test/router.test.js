const { IncomingMessage, ServerResponse } = require('http');
const {
    MiddlewareExecutor,
} = require('../../../utils/middleware-executor/model/mw-executor.model');
const { Router } = require('../model/router.model');

const router = new Router({
    middlewareExecutor: new MiddlewareExecutor(),
});

router.get('/foo', async () => {
    console.log(`hello world`);
});
router.get('/foo', async () => {
    console.log(`hello world`);
});

const req = new IncomingMessage(null);
req.method = 'GET';
req.url = '/foo';
const res = new ServerResponse(req);

router.handleRequest(req, res);
