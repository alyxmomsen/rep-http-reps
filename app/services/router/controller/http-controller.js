require('http');
const { IncomingMessage, ServerResponse } = require('http');
// const { multipartFormHandler } = require("../../_multipart-parser/controller/controller");
const { renderMultipartForm } = require("../../_multipart-parser/models/render");
const { contentTypeHandlersRouter } = require("../../form-data-server/controller/content-type.controller");
const { FormHandler } = require("../../form-data-server/form-parser.router.entry-point");
const { handlePublic } = require("../../request-handlers/public/handle-public");
const { handleReactApp } = require("../../request-handlers/react/react-handler");
const { handleStatic } = require("../../request-handlers/static/static-handler");
const Router = require("../router");
const { dbControllersRouter } = require('../../database-adapter/controller/db-adapter.controller');
const { filemanager } = require('../../filemanager.service.js/fmanager.controller');

const router = new Router();

/* get static files */
router.get('/static/*', async (req, res) => await handleStatic(req, res));
/* public data route */
router.get('/public/:type/:id', async (req ,res) => await handlePublic(req , res) ) ;

/* react-app view */
router.get('/app', async (req, res) => handleReactApp(req , res));

/* get playlist */
router.get('/api/videos', async (req, res) => {res.end()});
/* get video-stream */
router.get('/video/:filename' , async (req  ,res) => {});

/* view */
router.get('/l/form', async (req, res, next, payload) => {
    console.log('handle form middleware');
    next('test');
    return;
}, renderMultipartForm);

/* 
    обработчик-роутер для всех зарегестрированных form content-type данных
    ожидает {req, res, responseSchema}
    req - http.IncomingMessage
    res - http.ServerResponse
    responseSchema - SchemaObject (описан в документации) обрабатывется SchemaObjectParser-ом  
    
    работает с кастомным протоколом: multitable (для name аттрибута данных HTML формы)
*/
router.post(
    '/api/handle-form',
    (req, res) => FormHandler.processForm(req, res, { contentTypeHandlersRouter })
);

createRoute('/api/img/:id', async (req, res) => {
    const { params } = req;

    const { id } = params;

    const dbAdapter = dbControllersRouter.get('files');

    const { success, error } = dbAdapter.readOne(id);

    if(error) {
        
        res.writeHead(400, {
            'content-type':'application/json',
        });
        res.end(JSON.stringify({
            message:'bad request',
            error:error,
        }));
        return;
    }
    
    if (!success) {
        
        res.writeHead(502, {
            'content-type':'application/json',
        });
        res.end(JSON.stringify({
            message:'internal error',
        }));
        return;
    }
    
    const { rowById } = success;
    
    const filename = rowById.get('fileSystemFilename');
    
    try {

        const { success:fmSucc, error:fmErr } = await filemanager.read(filename.data);
        
        console.log({fmSucc, fmErr});
        
        const { readStream } = fmSucc ;

        const chunks = [];
        readStream.on('data', (chunk) => {
            chunks.push(chunk);
        });
    
        readStream.on('end', () => {
            console.log('succcccc');
            const wholeData = Buffer.concat(chunks);
            res.writeHead(200, {
                'content-type':'image/jpg',
            });
            res.end(wholeData);
        })
    }
    catch (err) {
        console.log({err});
    }
});

/* 
    обработчик для multipart/form-data
    required: req, res, responseSchema 

    работает с кастомным протоколом: multitable (для name аттрибута данных HTML формы)
*/
// router.post('/api/handle-multipart-form-data', multipartFormHandler.handle.bind(multipartFormHandler));

/* test route for URL params */
router.get('/test/:id/foo/:bar' , async (req  , res) => {
    const { method , url , params , queryParams } = req ;
    res.end(JSON.stringify({method , url , params , queryParams }));
});
/* test route for any tails */
router.get('/foo/bar/*', (req, res) => {
    res.end('test');
});
/* test route for any pathes in the middle of the URL */
router.get('/foo/*/bar', (req, res) => {
    res.end('test');
});

module.exports = { router }


/**
 * 
 * @param {string} url
 * @param {(req:IncomingMessage, res:ServerResponse) => Promise<any>} handler 
 * @returns 
 */
function createRoute (url, handler) {
    router.get( url , handler);
}