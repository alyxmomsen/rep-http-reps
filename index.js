const http = require('http');
// const { Router } = require('./router/router');

const router = new Router();

const server = http.createServer((req , res) => {

    

    res.end('hello the fucking world');
});

const port = 3333;
const host = '0.0.0.0';
server.listen(port, host , () => {
    console.log({port , host});
});