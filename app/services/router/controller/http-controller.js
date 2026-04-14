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
const { createReadStream } = require('fs');
const { join } = require('path');
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
 * @param {{
 *  req:IncomingMessage;
 *  res:ServerResponse;
 *  params:Object.<string,string>;
 *  queryParams:Object.<string,string>;
 * }} ctx 
 * @returns 
 */
async function StreamVideoRouteHandler (ctx) {

    let step = 0;

    const Flags = {
        IsRangeHeader: true,
        IsRowIdParam: true,
    }

    console.log('step: ', ++step);

    console.log('StreamVideoRouteHandler: called');

    const { req, res, params, queryParams } = ctx;

    if(!ctx.req || !ctx.res) {
        
        throw new Error(`StreamVideoRouteHandler/ctx cust: no ctx.req || ctx.res`);
    }
    console.log('step: ', ++step)
    if(!ctx.params || !ctx.queryParams) {
        
        console.log(`StreamVideoRouteHandler/ctx cust: no ctx.params || ctx.queryParams`);
        ctx.res.writeHead(400, {
            "content-type":'application/json',
        });
        ctx.res.end(JSON.stringify({
            message:'params required',
        }));
        return;
    }
    console.log('step: ', ++step)
    if(!ctx.params.rowId) {
        
        console.log(`StreamVideoRouteHandler/params cust: params.rowId no received`);
        ctx.res.end(JSON.stringify({
            message:'rowid required but not received',
        }));
        ctx.res.writeHead(400, {
            "content-type":"application/json",
        });
        return;
    }
    console.log('step: ', ++step)
    if(!req.headers.range) {

        Flags.IsRangeHeader = false;
    }

    console.log('StreamVideoRouteHandler: params-set',{params:ctx.params, queryParams:ctx.queryParams});
    console.log('step: ', ++step)
    const ParamsSet = {
        params:ctx.params,
        queryParams:ctx.queryParams,
    }

    const dbresponse = dataBase.readOne('files', ParamsSet.params.rowId);
    console.log('step: ', ++step)
    if(dbresponse.error) {
        ctx.res.writeHead(500, {
            'content-type':'application/json',
        });
        ctx.res.end(JSON.stringify({
            message:'db negative response',
            error:dbresponse.error,
        }));
        return;
    }   
    console.log('step: ', ++step)    
    if(!dbresponse.success) {
        ctx.res.writeHead(500, {
            'content-type':'application/json',
        });
        ctx.res.end(JSON.stringify({
            message:'iternal error',
        }));
        return;
    }
    console.log('step: ', ++step)
    const FileDataSet = {
        start:0,
        end:0,
        mime:'application/octet-stream',
        fileName:'',
    }

    const fileSystemFilename = dbresponse.success.rowById.get('fileSystemFilename');
    console.log('step: ', ++step)
    const mime = dbresponse.success.rowById.get('mime');
    console.log('step: ', ++step , 'message: smth')
    const filmanagerResponse = await filemanager.read(fileSystemFilename);
    console.log('step: ', ++step,  {filmanagerResponse})
    if(filmanagerResponse.error) {
        ctx.res.writeHead(500, {
            'content-type':'application/json',
        });
        ctx.res.end(JSON.stringify({
            message:'iternal error',
            error:filmanagerResponse.error,
        }));
        return;
    }
    console.log('step: ', ++step)
    console.log('StreamVideoRouteHandler/filmanagerResponse: ', {filmanagerResponse});

    if(!ctx.req.headers.range) {

        ctx.res.writeHead(200, {
            'content-type':mime,
            'content-length':filmanagerResponse.success.fileStats.fileSize,
            'Accept-Ranges': 'bytes',
        });

        
        await filmanagerResponse.success.readStream.pipe(ctx.res);
        throw new Error();
        return;
    }
    console.log('step: ', ++step)
    // ctx.res.writeHead(200, {
    //     'content-type':mime,
    //     'content-length':filmanagerResponse.success.fileStats.fileSize,
    // });

    // await filmanagerResponse.success.readStream.pipe(ctx.res);

    const FileStats = {
        start:0,
        end:0,
        rangeLength:0,
    }

    const ranges = ctx.req.headers.range.replace('bytes=', '').split('-');

    console.log('StreamVideoRouteHandler: ', {ranges} , filmanagerResponse.success.fileStats.fileSize);
    console.log('step: ', ++step)
    FileStats.start = Number.parseInt(ranges[0], 10);
    FileStats.end = ranges[1] ? Number.parseInt(ranges[1], 10) : filmanagerResponse.success.fileStats.fileSize - 1;

    const fileRootPath = await filemanager.getRootPath();
    
    const rs = createReadStream(join(fileRootPath, fileSystemFilename), {
        start:FileStats.start,
        end:FileStats.end,
    });

    console.log(`check that: ` , {start:FileStats.start, end:FileStats.end});
    console.log('step: ', ++step)
    ctx.res.writeHead(206, {
        'Content-Type':mime,
        'Content-Length':`${(FileStats.end - FileStats.start) + 1}`,
        'Content-Range':`bytes ${FileStats.start}-${FileStats.end}/${filmanagerResponse.success.fileStats.fileSize}`,
        'Accept-Ranges':'bytes',
    });

    console.log({
        'Content-Type':mime,
        'Content-Length':`${(FileStats.end - FileStats.start) + 1}`,
        'Content-Range':`bytes ${FileStats.start}-${FileStats.end}/${filmanagerResponse.success.fileStats.fileSize}`,
        'Accept-Ranges':'bytes',
    });
    console.log('step: ', ++step)
    rs.pipe(ctx.res);

}