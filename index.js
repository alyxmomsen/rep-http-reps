const http = require('http');
const router = require('./app/services/web-api/api');

const httpserver = http.createServer((req , res) => {
    router.handleRequest(req ,res);
});

const port = 3333;
const host = '127.0.0.1';
httpserver.listen(port , host , () => {
    console.log({port , host});
});