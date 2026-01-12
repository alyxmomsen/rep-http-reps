const http = require('http');
const { Router } = require('./router/router');
const _sendPublicFile = require('./router/utils');
const { join } = require('path');
const { stat } = require('fs');
const handleStreamRequest = require('./router/handlers/streaminghandler');
const handleForm = require('./router/handlers/handleform');

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

router.post('/api/handle-form' , async (req , res) => {
    handleForm(req , res);
});

router.get('/form' , async (req , res) => {
    const status = await _sendPublicFile(res , join('.' , 'view' , 'form.html'));
    if(status > 0) {
        res.end();
        return;
    }
});

router.get('/api/video-stream' , async (req , res) => {

    await handleStreamRequest(req , res);
});

router.get('/video' , (req , res  , next) => {next()} , async (req , res) => {


    const status = await _sendPublicFile(res , join('.' , 'view' , 'index.html'));
    if(status > 0) {
        res.end();
        return;
    }

});

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