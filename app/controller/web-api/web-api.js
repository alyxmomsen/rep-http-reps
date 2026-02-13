const { readFile } = require("fs/promises");
const { loggerFactory } = require("../../../utils/logger");
const Router = require("../../services/router/router");
const { resolve, join } = require("path");
const handlePublic = require("../../services/req-handlers/handle-public/handle-public");
const handleForm = require("../../services/req-handlers/handle-form/handle-form");

const router = new Router();

const log = loggerFactory('route /test/:id/foo/:bar' , '-u');

router.use(
    (req , res , next) => {log('def' , 'Gmw 11');next()} ,
    (req , res , next) => {log('def' , 'Gmw 12');next()} ,
    (req , res , next) => {log('def' , 'Gmw 13');next()} ,
);

router.post('/handle-form' , handleForm);

router.get('/public/:type/:id' , (req , res) => {
    

    handlePublic(req , res);
});

router.get('/form' , async (req , res) => {
    
    const log = loggerFactory('route: /form' , '-u');

    try {
        const file = await readFile(resolve(join('.' , 'app' , 'src' , 'assets' , 'html' , 'form.html')));
        res.writeHead(200 , 'ok' , {
            'content-type':'text/html' ,
        });
        res.end(file);
    }
    catch (e) {

        log('r' , {e});
        
        res.writeHead(500);
        res.end();
    }
    
});

router.get(
    '/test/:id/foo/:bar' , 
    (req , res , next) => {log('r' , 'lmw 1');next()} ,
    (req , res , next) => {log('r' , 'lmw 2');next()} ,
    (req , res , next) => {log('r' , 'lmw 3');next()} ,
    async (req , res) => {
        
        const { method , url , params , queryParams } = req; 
        
        res.writeHead(200 , 'ok' , {
            'content-type':'application/json'
    });

    res.end(JSON.stringify({method , url , params , queryParams}));
});;

module.exports = { router }