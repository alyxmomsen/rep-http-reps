const http = require('http');
const { Router } = require('./router/router') ;
const _handleUpload = require('./router/handlers/handle-upload');
const _serveResponseFile = require('./router/services/serve-response-files');
const { join } = require('path');

const router = new Router();

const server = http.createServer((req , res) => {

    router.handleRequest(req , res);
});

router.post('/api/upload' , (req , res) => {

    _handleUpload(req ,res);
    _serveResponseFile(res , join('.' , 'view' , 'form.html'));
});

router.get('/form' , (req , res) => {

    _serveResponseFile(res , join('.' , 'view' , 'form.html'));
});



router.get('/' , async (req ,res) => {

    const { method , url} = req; 
    const params = req.params ;
    res.end(JSON.stringify({
        method , url , params
    }));
});

router.get('/parametrized/:id' , async (req ,res) => {

    const { method , url} = req; 
    const params = req.params ;
    res.end(JSON.stringify({
        method , url , params
    }));
});




const port = 3333;
const host = '0.0.0.0';
server.listen(port, host , () => {
    console.log({port , host});
});