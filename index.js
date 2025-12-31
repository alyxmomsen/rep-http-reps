const http = require('http');
const { Router } = require('./router/router');
const { fork } = require('child_process');

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

router.get('/test/:id/foo/:bar' , (req , res  , next) => {console.log('local mw 1')} , (req , res) => {
    
    const {method , url , params , queryParams } = req ;

    const child = fork('./forks/filescanner.js')

    const scanPath = join('C:','Users','Public'/* ,'Libraries' */);

    child.on("error" , (e) => {
        console.log('child error' , e);
    });

    child.send(
        {
            type:'order' ,
            payload:{
                name:'scan-dir' ,
                path:scanPath ,
            }
        }
    );

    res.end(JSON.stringify({method , url , params , queryParams}));
});

const port = 3333;
const host = '0.0.0.0';
server.listen(port, host , () => {
    console.log({port , host});
});