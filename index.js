const http = require('http');

const _handleUpload = require('./router/handlers/handle-upload');
const _serveResponseFile = require('./router/services/serve-response-files');
const { join } = require('path');
const _Registry = require('./services/registry');
const _serveVideoListRequest = require('./router/handlers/_seve-video-list-request');
const _handlePartialContent = require('./router/handlers/_handle-partial-content');
const Router = require('./router/router');

const registry = new _Registry({rootDir:join('.' , 'upload-data')});

registry.update();

const router = new Router();

const server = http.createServer((req , res) => {

    router.handleRequest(req , res);
});

router.get('/src/sctipt/main' ,  async (req , res) => {

    _serveResponseFile(res , join('.' , 'dist' , 'bundle.js'));
});

router.get('/game' , async (req , res) => {
    _serveResponseFile(res , join('.' , 'view' , 'canvas.html'));
});

router.post('/api/upload' , (req , res) => {

    _handleUpload(req ,res , registry);
    _serveResponseFile(res , join('.' , 'view' , 'form.html'));
});

router.get('/form' , (req , res) => {

    _serveResponseFile(res , join('.' , 'view' , 'form.html'));
});

router.get('/video' , async (req , res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');


    _serveResponseFile(res , join('.' , 'view' , 'video.html'));
});

router.get('/api/video/get-by-id/:id' , async (req , res) => {

    const origin = req.headers.origin ;

    console.log({origin});

    // res.setHeader('Access-Control-Allow-Origin', '*');
    _handlePartialContent(req , res , registry);
});

router.get('/api/video/get-all' , async (req , res) => {

    const origin = req.headers.origin ;

    console.log({origin});

    // res.setHeader('Access-Control-Allow-Origin', '*');
    _serveVideoListRequest(req , res , registry);
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
// const host = '0.0.0.0';
const host = '127.0.0.1' ;
server.listen(port, host , () => {
    console.log({port , host});
});