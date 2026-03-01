const { IncomingMessage, ServerResponse } = require("node:http");
const { sendFallBack } = require("../../../utils/error-factory");
const { join, resolve } = require("node:path");
const { readFile } = require("node:fs/promises");

const PUBLIC_DIR = resolve(join('.' , 'public'));

const insertSrcMapItem =  (map , type , id ) => {}

const PUBLIC_SRC_MAP = {
    typeRouter:{
        'css':{
            rootPath:resolve(join('.','public','css')),
            idRouter:{
                'main':{
                    filename:'main.css' ,
                    mime:'text/css' , 
                }
            } ,
        } ,
        'js':{
            rootPath:resolve(join('.','public','js')),
            idRouter:{
                'main':{
                    filename:'main.js' ,
                    mime:'text/javascript' , 
                }
            } ,
        } ,
    }
}

/**
 * 
 * @param {IncomingMessage} req 
 * @param {ServerResponse} res 
 * @returns {Promise<any>}
 */
async function handlePublic(req , res) {

    const { params , queryParams } = req ;
    const { type , id } = params || {} ;

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