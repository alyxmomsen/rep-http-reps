const { IncomingMessage, ServerResponse } = require('http');
// const { multipartFormHandler } = require("../../_multipart-parser/controller/controller");
const {
    renderMultipartForm,
} = require('../../_multipart-parser/models/render');
const {
    contentTypeHandlersRouter,
} = require('../../form-data-server/controller/content-type.controller');
const {
    FormHandler,
} = require('../../form-data-server/form-parser.router.entry-point');
const { handlePublic } = require('../../request-handlers/public/handle-public');
const {
    handleReactApp,
} = require('../../request-handlers/react/react-handler');
const {
    handleStatic,
} = require('../../request-handlers/static/static-handler');
// const Router = require("../router");

const {
    dbControllersRouter,
} = require('../../database-adapter/controller/db-adapter.controller');
const {
    filemanager,
} = require('../../filemanager.service.js/fmanager.controller');
const { HTTPRouter } = require('../v3/router.model');
const { dataBase } = require('../../database/controller/db.controller');
// const { HTTPRouter } = require('../v2/model/router.model');
const router = new HTTPRouter();


const RouterHandlers = {
    StreamVideo:StreamVideoRouteHandler,
}

/* get static files */
router.get('/static/*', async (req, res) => await handleStatic(req, res));
/* public data route */
router.get(
    '/public/:type/:id',
    async (req, res) => await handlePublic(req, res)
);

/* react-app view */
router.get('/app', async (req, res) => handleReactApp(req, res));

/* get playlist */
router.get('/api/videos', async (req, res) => {
    res.end();
});
/* get video-stream */
router.get('/video/:rowId', RouterHandlers.StreamVideo);

/* view */
router.get(
    '/l/form',
    async (ctx, next) => {
        const { req, res, params, queryParams } = ctx;

        console.log('handle form middleware');
        await next('test');
        return;
    },
    renderMultipartForm
);

/* 
    обработчик-роутер для всех зарегестрированных form content-type данных
    ожидает {req, res, responseSchema}
    req - http.IncomingMessage
    res - http.ServerResponse
    responseSchema - SchemaObject (описан в документации) обрабатывется SchemaObjectParser-ом  
    
    работает с кастомным протоколом: multitable (для name аттрибута данных HTML формы)
*/
router.post('/api/handle-form', (ctx) => {
    const { req, res } = ctx;

    FormHandler.processForm(req, res, { contentTypeHandlersRouter });
});

createRoute('/api/get-playlist/:type', async (ctx) => {
    const { req, res, params } = ctx;

    const dbAdapter = dbControllersRouter.get('video-playlist');

    try {
        const { error, success } = dbAdapter.readAllRows();

        if (error) {
            // Не возвращаем ошибку, если таблица пуста — возвращаем пустой массив
            console.log('Playlist read error (possibly empty):', error);
            res.writeHead(200, {
                'content-type': 'application/json',
            });
            res.end(
                JSON.stringify({
                    success: {
                        rows: {},
                    },
                })
            );
            return;
        }

        const validatedData = success?.validatedData || {};

        res.end(
            JSON.stringify({
                success: {
                    rows: validatedData,
                },
            })
        );
    } catch (err) {
        console.log('get playlist end-point: error: ', { err });
        res.writeHead(200, {
            'content-type': 'application/json',
        });
        res.end(
            JSON.stringify({
                success: {
                    rows: {},
                },
            })
        );
    }
});

createRoute('/api/get-file/:id', async (ctx) => {
    const { params } = ctx;

    const { id } = params;

    const dbAdapter = dbControllersRouter.get('files');

    await new Promise(async (resolve, reject) => {
        const { success, error } = dbAdapter.readOne(id);

        if (error) {
            res.writeHead(400, {
                'content-type': 'application/json',
            });
            res.end(
                JSON.stringify({
                    message: 'bad request',
                    error: error,
                })
            );

            reject();
            return;
        }

        if (!success) {
            res.writeHead(502, {
                'content-type': 'application/json',
            });
            res.end(
                JSON.stringify({
                    message: 'internal error',
                })
            );
            reject();
            return;
        }

        const { rowById } = success;

        const filename = rowById.get('fileSystemFilename');
        const mime = rowById.get('mime');

        try {
            const { success: fmSucc, error: fmErr } = await filemanager.read(
                filename.data
            );

            console.log({ fmSucc, fmErr });

            const { readStream } = fmSucc;

            const chunks = [];
            readStream.on('data', (chunk) => {
                chunks.push(chunk);
            });

            readStream.on('end', () => {
                console.log('succcccc');
                const wholeData = Buffer.concat(chunks);
                res.writeHead(200, {
                    'content-type': mime.data,
                });
                res.end(wholeData);
                resolve();
                return;
            });
        } catch (err) {
            console.log('get-file-mw/catch', { err });
            reject();
        }
    });
});

/* 
    обработчик для multipart/form-data
    required: req, res, responseSchema 

    работает с кастомным протоколом: multitable (для name аттрибута данных HTML формы)
*/
// router.post('/api/handle-multipart-form-data', multipartFormHandler.handle.bind(multipartFormHandler));

/* test route for URL params */
router.get('/test/:id/foo/:bar', async (ctx) => {
    const { req, res } = ctx;

    const { method, url, params, queryParams } = req;
    res.end(JSON.stringify({ method, url, params, queryParams }));
});
/* test route for any tails */
router.get('/foo/bar/*', (req, res) => {
    res.end('test');
});
/* test route for any pathes in the middle of the URL */
router.get('/foo/*/bar', (req, res) => {
    res.end('test');
});

module.exports = { router };

/**
 *
 * @param {string} url
 * @param {(req:IncomingMessage, res:ServerResponse) => Promise<any>} handler
 * @returns
 */
function createRoute(url, handler) {
    router.get(url, handler);
}

/**
 * 
 * @param {{req:IncomingMessage;res:ServerResponse}} ctx 
 * @returns 
 */
async function StreamVideoRouteHandler (ctx) {

    console.log('StreamVideoRouteHandler: called', {ctx:ctx.params.rowId});

    const { req, res } = ctx;

    const headers = req.headers;

    if(headers.range) {
        console.log({range});
    }


    // if(ranges)

    const dbresponse = dataBase.readOne('files', ctx.params.rowId);

    if(dbresponse.error) {

        ctx.res.end(JSON.stringify({
            hello:'world',
        }));
        return;
    }
    
    if(!dbresponse.success) {
        
        ctx.res.end(JSON.stringify({
            foo:'bar',
        }));
        return;
    }

    const filename = dbresponse.success.rowById.get('fileSystemFilename');

    const filmanagerResponse = await filemanager.read(filename);

    console.log('fm response: ', filmanagerResponse);

    await filmanagerResponse.success.readStream.pipe(ctx.res);

}