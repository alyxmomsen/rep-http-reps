const http = require('http');
const { Router } = require('./router/router');

const router = new Router();

const server = http.createServer((req , res) => {

    router.handleRequest(req , res);
});

router.use(
    (req , res , next) => {

        console.log('global middleware 1');

        next();
    } ,
    (req , res , next) => {

        console.log('global middleware 1');

        
    } ,
    (req , res , next) => {

        console.log('global middleware 1');

        next();
    } ,
);

router.get('/' , (req , res  , next) => {console.log('local mw 1')} , (req , res) => {
    console.log();
    res.end('we stars');
});

const port = 3333;
const host = '0.0.0.0';
server.listen(port, host , () => {
    console.log({port , host});
});