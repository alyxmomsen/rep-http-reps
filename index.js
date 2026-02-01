const http = require('http');
const router = require('./app/services/web-api/web-api');

const httpserver = http.createServer(async (req  , res) => {

    await router.handleRequest(req , res);
});

const port = 3333 ;
const host = '127.0.0.1';

httpserver.listen(port , host, () => {
    console.log({port , host});
});