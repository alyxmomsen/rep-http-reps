require('http');

const { IncomingMessage, ServerResponse } = require('http');
const {
    MiddlewareExecutor,
} = require('../../../utils/middleware-executor/model/mw-executor.model');
const { Router } = require('../model/router.model');
const {
    CompileRouteBundle,
} = require('../model/behaviors/compile-route-bundle.behavior');
const {
    MiddlewareExecutorDIContainer,
} = require('../../../utils/middleware-executor/controller/mw-executor.controller');

const { readFile, stat } = require('fs/promises');
const { resolve, extname } = require('path');
const {
    HandleFormFinalHandler,
} = require('../../final-handlers/handle-form/handle-form.fh.model');
const {
    ContentTypeRoutes,
} = require('../../final-handlers/handle-form/content-type-router.controller');
const { InMemoryDataBase } = require('../../in-memory-db/model/db.model');
const {
    inMemoryDataBase,
} = require('../../in-memory-db/controller/db.controller');
const { createReadStream } = require('fs');
const {
    DBAdapter,
    ValidatiionSchemas,
} = require('../../db-adapter/db-adapter.model');
const { DBAdapterFactory } = require('../../db-adapter/db-adapter.controller');
const { FileManager } = require('../../file-manager/model/f-manager.model');
const { Readable } = require('stream');

const router = new Router(
    {
        middlewareExecutor: MiddlewareExecutorDIContainer({
            option: {},
        })(),
    },
    { compileRouteBundleBehavior: CompileRouteBundle() }
);

// router.addGlobalMiddleware(
//     SayHelloMW(),
//     SayHelloMW(),
//     SayHelloMW(),
//     SayHelloMW(),
//     SayHelloMW(),
//     SayHelloMW()
// );

// Раздача статики (CSS, JS)
router.get('/public/:type/:file', HandleStaticFinalHandler());

router.get(
    '/video-stream/:dBRowId',
    VideoStreamHandler({
        dBAdapter: new DBAdapterFactory({
            dataBaseInstance: inMemoryDataBase,
            ValidationSchemas: ValidatiionSchemas,
        }).Instance(),
        fileManager: new FileManager({
            rootDir: resolve(process.env?.UPLOADS_DIR || './uploads'),
        }),
    })
);

router.get(
    '/foo',
    SayHelloMW(),
    TestHandler({
        logger: {},
    })
);

router.get('/test/:id/foo/:bar', (ctx) => {
    const { req, res, params, queryParams } = ctx;
    console.log({ params, queryParams });
    res.end();
});

router.post(
    '/api/handle-multitable-form',
    HandleFormFinalHandler({
        ContentTypeRoutes: ContentTypeRoutes,
    })
);

router.get(`/api/get-playlist`, (ctx) => {
    const { req, res } = ctx;

    res.end('hello');
});

router.get('/l/form', GetFormFinalHandler());

module.exports = { router };

/**
 *
 * @param {Object} deps
 * @param {DBAdapter} deps.dBAdapter
 * @param {FileManager} deps.fileManager
 * @returns
 */
function VideoStreamHandler(deps = {}) {
    if (!deps.dBAdapter) {
        throw new Error(
            `VideoStreamHandler factory: deps.dataBaseInstance required`
        );
    }

    if (!deps.fileManager) {
        throw new Error(
            `VideoStreamHandler factory: deps.fileManager required`
        );
    }

    /**
     *
     * @param {{req:IncomingMessage, res:ServerResponse, params:{dBRowId:string} queryParams:Object.<string,string>}} Ctx
     */
    const fn = async (Ctx) => {
        const IncomingArgs = {
            Ctx: Ctx,
        };

        const { req, res, params: Params } = IncomingArgs.Ctx;

        const rangeHeader = req.headers.range;

        const DBAdapterResult = deps.dBAdapter.readOne(
            DBAdapter.TablesMap.Code.Files,
            Params.dBRowId
        );

        if (DBAdapterResult.failure) {
            res.end(
                JSON.stringify({
                    failure: DBAdapterResult.failure,
                })
            );
            return;
        }

        if (!rangeHeader) {
            const FileManagerResult = await deps.fileManager.getStream(
                DBAdapterResult.success.rowData.fileSystemFileName
            );
            console.log({ FileManagerResult });
            FileManagerResult.stream.pipe(res);
            return;
        }

        console.dir({ DBAdapterResult }, { depth: 3 });

        const DataSet = {
            /**
             * @type {{
             *  originalFileName:string;
             *  mime:string;
             *  fileSystemFileName:string;
             * }}
             */
            DbRow: DBAdapterResult.success.rowData,
        };

        const FileStats = await deps.fileManager.getFileStats(
            DBAdapterResult.success.rowData.fileSystemFileName
        );

        if (FileStats.failure) {
            res.writeHead(500);
            res.end(JSON.stringify({}));
        }

        if (FileStats.success)
            res.writeHead(206, {
                'content-type': DataSet.DbRow.mime,
                'content-length': '',
                'accept-ranges': 'bytes',
                'content-range': `bytes=${0}-${0}/${0}`,
            });
        res.end();
    };

    return fn;
}

/**
 *
 * @param {Object} deps
 * @returns
 */
function HandleStaticFinalHandler(deps = {}) {
    const fn = async function (ctx) {
        const { req, res, params } = ctx;
        const { type, file } = params;

        const mimeTypes = {
            css: 'text/css',
            js: 'text/javascript',
            html: 'text/html',
        };

        const mime = mimeTypes[type] || 'text/plain';

        try {
            const fileContent = await readFile(
                resolve(`./assets/${type}/${file}.${type}`)
            );
            res.writeHead(200, { 'content-type': mime });
            res.end(fileContent);
        } catch (err) {
            console.log({ err });
            res.writeHead(404, { 'content-type': 'text/plain' });
            res.end('File not found');
        }
    };

    return fn;
}

/**
 *
 * @param {Object} deps
 * @returns {import('../model/router.model').RouteMiddleware}
 */
function SayHelloMW(deps = {}) {
    const fn = async function (ctx, next) {
        const { req, res } = ctx;
        ctx.hi = 'hello bro';
        console.log('echo: hello bro');
        await next();
    };

    return fn;
}

/**
 *
 * @param {Object} deps
 * @param {{foo:string}} deps.logger
 */
function TestHandler(deps = {}) {
    if (!deps.logger) {
        throw new Error(`\x1b[31mdeps.logger required\x1b[0m`);
    }

    /**
     *
     * @type {import('../model/router.model').RouteFinalHandler}
     */
    const fn = async function (ctx) {
        const { req, res } = ctx;

        console.log('hello from mw: ', ctx.hi);

        res.writeHead(200, {});
        res.end('bar');
    };

    return fn;
}

/**
 *
 * @param {Object} deps
 * @returns {import('../model/router.model').RouteFinalHandler}
 */
function GetFormFinalHandler(deps = {}) {
    /**
     *
     * @type {import('../model/router.model').RouteFinalHandler}
     */
    const fn = async (ctx) => {
        const { req, res } = ctx;

        const EXT = {
            HTML: '.html',
        };

        const ContentType = {
            '.html': 'text/html',
        };

        try {
            const File = await readFile(resolve('.\\assets\\html\\form.html'));

            const Stats = await stat(resolve('.\\assets\\html\\form.html'));

            const extName = extname(resolve('.\\assets\\html\\form.html'));

            res.writeHead(200, {
                'content-type': ContentType[extName] || 'foo/bar',
            });
            res.end(File);

            return;
        } catch (err) {
            console.log(err);
            res.end(`smt wrong`);
        }
    };

    return fn;
}
