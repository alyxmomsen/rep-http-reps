const http = require('http');
const { _Router } = require('./router/router');

const router = new _Router();

const server = http.createServer((req , res) => {
    router.handleRequest(req , res);
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