const { readFile } = require("node:fs/promises");
const HTTPRouter = require("../router");
const { join, resolve } = require("node:path");
const { handleForm } = require("../services/request-handlers/services/form-handlers/form-handler-main");

const router = new HTTPRouter ();

const CONSTANTS = {
    PATHES: {
        HTML:{
            FORM:resolve(join('.' , 'app' , 'src' , 'assets' , 'html' , 'form.html')) ,   
        } ,
    }
}

router.post('/api/handle-form' , async (req , res) => {
    await handleForm(req , res);
});

router.get('/l/form' , async (req , res) => {

    const { HTML } = CONSTANTS.PATHES ;

    try {
        const html = await readFile(HTML.FORM , 'utf-8');
        res.writeHead(200 , 'ok' , {
            'content-type':'text/html' ,
        });
        res.end(html);
    }
    catch(e) {
        console.log({e});
        res.writeHead(500 , 'ok' , {
            'content-type':'text/html' ,
        });
        res.end(JSON.stringify({
            message:'error durring read file' ,
            subjects:{nativeError:e} ,
        }));
    }
});

router.get('/test/:id/foo/:bar' , (req , res) => {

    const { url  , method , headers , params , queryParams } = req ;

    res.writeHead(200 , 'ok' , {
        "content-type":'application/json' ,
    });

    res.end(JSON.stringify({
        url , method , params
    }));
});

router.useMiddleware(
    (req , res , next) => {
        console.log(`global middleware #${1}`);next();
    } ,
    (req , res , next) => {
        console.log(`global middleware #${2}`);next();
    } ,
    (req , res , next) => {
        console.log(`global middleware #${3}`);next();
    } ,
);

module.exports = { router }