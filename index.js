const http = require('http');
const { Router } = require('./router/router');
const { fork } = require('child_process');
const { join } = require('path');
const loadresponsefile = require('./router/utils/loadfiles');
const { WebSocketServer } = require('ws');
const { createHash, randomBytes } = require('crypto');
const WSServer = require('./services/wsserver');

const router = new Router();

const server = http.createServer((req , res) => {

    router.handleRequest(req , res);
});

const wsserver = new WSServer();

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

router.get('/public/styles/main' , async (req , res) => {

    const {method , url , params , queryParams } = req ;
    
    const file = await loadresponsefile(join('public','css','main.css'));
    console.log({file});
    if(file) {
        res.writeHead(200 , 'ok' , {
            'content-type':'text/css' ,
        });
        res.end(file);
        return ;
    }
    
    res.end(JSON.stringify({method , url , params , queryParams}));
});

router.get('/public/scripts/main' , async (req , res) => {

    const {method , url , params , queryParams } = req ;
    
    const file = await loadresponsefile(join('public','scripts','main.js'));
    console.log({file});
    if(file) {
        res.writeHead(200 , 'ok' , {
            'content-type':'text/javascript' ,
        });
        res.end(file);
        return ;
    }
    
    res.end(JSON.stringify({method , url , params , queryParams}));
});

router.get('/test/:id/foo/:bar' , (req , res  , next) => {console.log('local mw 1')} , async (req , res) => {
    
    const {method , url , params , queryParams } = req ;

    const file = await loadresponsefile(join('public','html','index.html'));
    if(file) {
        res.end(file);
        return ;
    }

    res.end(JSON.stringify({method , url , params , queryParams}));
});

const port = 3333;
const host = '0.0.0.0';
server.listen(port, host , () => {
    console.log({port , host});
});
