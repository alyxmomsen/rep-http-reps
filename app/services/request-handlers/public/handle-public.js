const { IncomingMessage, ServerResponse } = require("node:http");
const { sendFallBack } = require("../../../utils/error-factory");
const { join, resolve, extname } = require("node:path");
const { readFile } = require("node:fs/promises");

const MIMETypeValue = {
    TextCSS:'text/css' ,
    TextJavaScript: 'text/javascript',
    TextPlain:'text/plain',
}

const MIME_KEY_MAP = {
    '.css': MIMETypeValue.TextCSS,
    '.js':MIMETypeValue.TextJavaScript,
}

function bundleLeaf (filename) {
    return {
        filename,
        mime:MIME_KEY_MAP[extname(filename)] || MIMETypeValue.TextPlain, 
    }
}

const { TextCSS , TextJavaScript } = MIMETypeValue ;

const PUBLIC_SRC_MAP = {
    typeRouter:{
        'css':{
            rootPath:resolve(join('.','public','css')),
            idRouter:{
                'main':bundleLeaf('main.css'),
                'form':bundleLeaf('form.css'),
            } ,
        } ,
        'js':{
            rootPath:resolve(join('.','public','js')),
            idRouter:{
                'main':bundleLeaf('main.js'),
                'form':bundleLeaf('form.js'),
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

    addLeaf(branchId, leafId, filename) {
        /**
         * @type {{rootPath:string;idRouter:Object.<string.<{filename:string;mime:string}>}}
         */
        const idBranch = this.#routes.get(branchId);
        if (!idBranch) {
            throw new Error(`incorrect branch id. given: ${branchId}`);
        }
        idBranch.idRouter[leafId] = bundleLeaf(filename);
    }

    /**
     * 
     * @param {string} type 
     */
    addBranch(type) {
        this.#routes[type] = {
            rootPath:resolve(join('.','public', type)),
            idRouter: new Map(),
        }
    }

    constructor () {
        this.#routes = new Map();
        const routes = ['css', 'js'];
        routes.forEach(route => {
            this.#routes[route] = {
                rootPath: {

                },
                idRouter: {},
            }
        });
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

    const { params } = req ;
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