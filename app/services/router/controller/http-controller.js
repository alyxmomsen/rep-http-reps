const { IncomingMessage, ServerResponse } = require('http');
// const { multipartFormHandler } = require("../../_multipart-parser/controller/controller");
const {
    renderMultipartForm,
} = require('../../_multipart-parser/models/render');
const {
    contentTypeHandlersRouter,
    formDataParserFactory,
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

const {
    dbControllersRouter,
} = require('../../database-adapter/controller/db-adapter.controller');
const {
    filemanager,
} = require('../../filemanager.service.js/fmanager.controller');
const { HTTPRouter } = require('../v3/router.model');
const { dataBase } = require('../../database/controller/db.controller');
const { createReadStream } = require('fs');
const { join, resolve } = require('path');
const { readFile } = require('fs/promises');
// const { HTTPRouter } = require('../v2/model/router.model');
const router = new HTTPRouter();

const RouterHandlers = {
    StreamVideo: StreamVideoRouteHandler,
};

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
router.post(
    '/api/handle-form',
    formDataParserFactory({
        contentTypeHandlersRouter: contentTypeHandlersRouter,
    })
);

router.get('/api/get-html-form/registrate-user', async (ctx) => {
    const { req, res, params, queryParams } = ctx;

    const file = await readFile(
        resolve('./assets/html/registrate-user.form.html')
    );

    res.writeHead(200, {
        'content-type': 'text/html',
    });
    res.end(
        JSON.stringify({
            file: file.toString('utf-8'),
        })
    );
});

createRoute('/api/get-playlist', async (ctx) => {
    const { req, res, params } = ctx;

    const dbAdapter = dbControllersRouter.get('video-playlist');

    try {
        const { error, success } = dbAdapter.readAllRows();

        if (error) {
            // Не возвращаем ошибку, если таблица пуста — возвращаем пустой массив
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
async function StreamVideoRouteHandler(ctx) {
    let step = 0;

    const Flags = {
        IsRangeHeader: true,
        IsRowIdParam: true,
    };

    const { req, res, params, queryParams } = ctx;

    if (!ctx.req || !ctx.res) {
        throw new Error(
            `StreamVideoRouteHandler/ctx cust: no ctx.req || ctx.res`
        );
    }

    if (!ctx.params || !ctx.queryParams) {
        ctx.res.writeHead(400, {
            'content-type': 'application/json',
        });
        ctx.res.end(
            JSON.stringify({
                message: 'params required',
            })
        );
        return;
    }

    if (!ctx.params.rowId) {
        ctx.res.end(
            JSON.stringify({
                message: 'rowid required but not received',
            })
        );
        ctx.res.writeHead(400, {
            'content-type': 'application/json',
        });
        return;
    }

    if (!req.headers.range) {
        Flags.IsRangeHeader = false;
    }

    const ParamsSet = {
        params: ctx.params,
        queryParams: ctx.queryParams,
    };

    const dbresponse = dataBase.readOne('files', ParamsSet.params.rowId);

    if (dbresponse.error) {
        ctx.res.writeHead(500, {
            'content-type': 'application/json',
        });
        ctx.res.end(
            JSON.stringify({
                message: 'db negative response',
                error: dbresponse.error,
            })
        );
        return;
    }

    if (!dbresponse.success) {
        ctx.res.writeHead(500, {
            'content-type': 'application/json',
        });
        ctx.res.end(
            JSON.stringify({
                message: 'iternal error',
            })
        );
        return;
    }

    const FileDataSet = {
        start: 0,
        end: 0,
        mime: 'application/octet-stream',
        fileName: '',
    };

    const fileSystemFilename =
        dbresponse.success.rowById.get('fileSystemFilename');

    const mime = dbresponse.success.rowById.get('mime');

    const filmanagerResponse = await filemanager.read(fileSystemFilename);

    if (filmanagerResponse.error) {
        ctx.res.writeHead(500, {
            'content-type': 'application/json',
        });
        ctx.res.end(
            JSON.stringify({
                message: 'iternal error',
                error: filmanagerResponse.error,
            })
        );
        return;
    }

    if (!ctx.req.headers.range) {
        ctx.res.writeHead(200, {
            'content-type': mime,
            'content-length': filmanagerResponse.success.fileStats.fileSize,
            'Accept-Ranges': 'bytes',
        });

        await filmanagerResponse.success.readStream.pipe(ctx.res);
        throw new Error();
        return;
    }

    const FileStats = {
        start: 0,
        end: 0,
        rangeLength: 0,
    };

    const ranges = ctx.req.headers.range.replace('bytes=', '').split('-');

    FileStats.start = Number.parseInt(ranges[0], 10);

    FileStats.end = ranges[1]
        ? Number.parseInt(ranges[1], 10)
        : filmanagerResponse.success.fileStats.fileSize - 1;

    const fileRootPath = await filemanager.getRootPath();

    const rs = createReadStream(join(fileRootPath, fileSystemFilename), {
        start: FileStats.start,
        end: FileStats.end,
    });

    ctx.res.writeHead(206, {
        'Content-Type': mime,
        'Content-Length': `${FileStats.end - FileStats.start + 1}`,
        'Content-Range': `bytes ${FileStats.start}-${FileStats.end}/${filmanagerResponse.success.fileStats.fileSize}`,
        'Accept-Ranges': 'bytes',
    });

    rs.pipe(ctx.res);
}
