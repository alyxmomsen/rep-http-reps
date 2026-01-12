const http = require('http');
const { Router } = require('./router/router');

const router = new Router();

const server = http.createServer(async  (req , res) => {
    await router.handleRequest(req , res);
});

router.use(
    (req , res , next) => {
        console.log(`global mw 1`);
        next();
    } ,
    (req , res , next) => {
        console.log(`global mw 2`);
        next();
    } ,
    (req , res , next) => {
        console.log(`global mw 3`);
        next();
    } ,
);

router.get('/' , 
    (req , res , next) => {
        console.log(`local mw 1`);
        next()
    }  , 
    (req , res , next) => {
        console.log(`local mw 2`);
        next()
    }  , 
    (req , res , next) => {
        console.log(`local mw 3`);
        next()
    }  , 
    (req ,res) => {
        res.end('fooooooo');
    }
);

const port = 3333 ; 
const host = 'localhost';
server.listen(port , host , () => {
    console.log({port , host});
});