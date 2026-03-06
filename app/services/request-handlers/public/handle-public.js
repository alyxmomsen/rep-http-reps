const { IncomingMessage, ServerResponse } = require("node:http");
const { sendFallBack } = require("../../../utils/error-factory");
const { join, resolve } = require("node:path");
const { readFile } = require("node:fs/promises");

const PUBLIC_DIR = resolve(join('.' , 'public'));

const insertSrcMapItem =  (map , type , id ) => {}

const MIME_VALUES = {
    TEXT_CSS:'text/css' ,
    TEXT_JAVASCRIPT:'text/javascript' ,
}

const { TEXT_CSS , TEXT_JAVASCRIPT } = MIME_VALUES ;

const PUBLIC_SRC_MAP = {
    typeRouter:{
        'css':{
            rootPath:resolve(join('.','public','css')),
            idRouter:{
                'main':{
                    filename:'main.css' ,
                    mime:TEXT_CSS , 
                } ,
                'form':{
                    filename:'form.css' ,
                    mime:TEXT_CSS , 
                }
            } ,
        } ,
        'js':{
            rootPath:resolve(join('.','public','js')),
            idRouter:{
                'main':{
                    filename:'main.js' ,
                    mime:TEXT_JAVASCRIPT, 
                } ,
                'form':{
                    filename:'form.js',
                    mime:TEXT_JAVASCRIPT ,
                }
            } ,
        } ,
    }
}

class PublicRouter {

    css (id , filename , mime) {

    }

    js(id , filename , mime) {
        this.#addRoute('js' , id , filename , mime);
    }
    
    #routes;

    #addRoute (type , id , filename , mime) {
        this.#routes.set(type , {
            rootPath:resolve(join('.' , 'public', 'js')) , idRouter:new Map([[id , {filename , mime}]])
        })

        console.log(`added public`);
    }

    constructor () {
        this.#routes = new Map();
    }
}

const typeRouter = new PublicRouter();
typeRouter.js('form' , 'form.js' , 'text/javascript');

/**
 * 
 * @param {IncomingMessage} req 
 * @param {ServerResponse} res 
 * @returns {Promise<any>}
 */
async function handlePublic(req , res) {

    const { params , queryParams } = req ;
    const { type , id } = params || {} ;

    console.log({type , id});

    if(!type || !id) {
        sendFallBack(
            res, 400, 'handlePublic', 
            'no "type" or "id" params provided', {type , id}
        );
        return ;
    }

    const { typeRouter } = PUBLIC_SRC_MAP ;

    const { rootPath , idRouter } = typeRouter[type] || {} ;

    if(!rootPath || !idRouter) {
        sendFallBack(
            res, 400, 'handlePublic', 
            'incorrect "TYPE" argument', {type , id , rootPath , idRouter , src:PUBLIC_SRC_MAP[type]}
        );
        return ;
    }
    
    const { filename  , mime } = idRouter[id] || {} ;
    
    if(!filename || !mime) {

        // console.log({filename , mime , idRouter , id});

        sendFallBack(
            res, 400, 'handlePublic', 
            'incorrect "filename"|"mime" arguments', {type , id , rootPath , idRouter , filename , mime , src:PUBLIC_SRC_MAP[type]}
        );
        return ;
    }

    const fullPath = join(rootPath , filename) ;

    try {
        const file = await readFile(fullPath , 'utf-8') ;
        res.writeHead(200 , 'ok' , {
            'content-type':mime || 'text/plain' ,
        });
        res.end(file);
    }
    catch (e) {
        console.log({e});
    }
}

module.exports = { handlePublic }