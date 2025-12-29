const http = require('http');
const { Router } = require('./router/router');

const router = new Router();

const server = http.createServer((req , res) => {


    router.handleRequest(req , res);

});

router.get('/' , (req , res) => {
    res.end('default "/" resolve');
});

router.post('/post' , (req , res) => {
    res.end('default post resolve');
});

const port = 3333;
const host = '0.0.0.0';
server.listen(port, host , () => {
    console.log({port , host});
});