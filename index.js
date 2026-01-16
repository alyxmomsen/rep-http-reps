const http = require('http');
const { _Router } = require('./router/router');
const handleForm = require('./router/handers/handle-form');
const { readFile } = require('fs/promises');
const { join } = require('path');

const router = new _Router();

const server = http.createServer((req , res) => {
    router.handleRequest(req , res);
});

router.get('/form' , async (req ,res) => {

    let file = 'no file' ;
    try {
        file = await readFile(join('.' , 'view' , 'form.html'));
    }
    catch (error) {
        console.log('readfile error ' , {error});
    }

    res.end(file);
});

router.post('/api/handle-form'  , 
    (req , res , next) => {
        console.log('middleware is run');
        next();

    } ,
    async (req , res) =>  {
    await handleForm(req , res);
});

router.get('/test/:id_1/:id_2' , async (req ,res) => {

    const {method , url , params , queryParams} = req; 
    res.writeHead(200 , 'ok' , {
        'content-type':'application/json'
    });
    res.end(JSON.stringify({
        method , url , params , queryParams
    }));
});

const port = 3333 ;
const host = '127.0.0.1' ;
server.listen(port , host , () => {
    console.log({port , host});
});