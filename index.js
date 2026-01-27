const http = require('http');
const router = require('./services/api/web-api/web-api');

const server = http.createServer((req , res) => {
    
    router.handleRequest(req , res);
});

const port = 3333;
const host = '0.0.0.0';

server.listen(port, host , () => {
    console.log({port , host});
});

