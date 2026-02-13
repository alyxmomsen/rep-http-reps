const { readFile } = require("fs/promises");
const { loggerFactory } = require("../../../utils/logger");
const Router = require("../../services/router/router");

const router = new Router();

const log = loggerFactory('route /test/:id/foo/:bar' , '-u');

router.use(
    (req , res , next) => {log('y' , 'Gmw 11');next()} ,
    (req , res , next) => {log('y' , 'Gmw 12');next()} ,
    (req , res , next) => {log('y' , 'Gmw 13');next()} ,
);

router.get('/form' , async (req , res) => {

    try {
        const file = await readFile('.' , 'src' , 'assets' , 'html' , 'form.html');
        
    }
    catch (e) {
        console.log({e});
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