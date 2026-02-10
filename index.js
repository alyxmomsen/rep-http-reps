const http = require('http');
const router = require('./app/controller/web-api/web-api');

const httpServer = http.createServer((req , res) => {
    router.handleRequest(req , res);
});

const port = 3333 ;
const host = '127.0.0.1';
httpServer.listen(port , host , () => {
    console.log({port , host});
});