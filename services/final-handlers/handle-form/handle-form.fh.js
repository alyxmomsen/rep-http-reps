const http = require('http');

require('https');

/**
 *
 * @param {Object} deps
 * @param {Map<string,Function>} deps.ContentTypeRoutes
 * @returns {import("../../router/model/router.model").RouteFinalHandler}
 */
function HandleFormFinalHandler(deps = {}) {
    if (!deps.ContentTypeRoutes) {
        throw new Error(
            `HandleFormFinalHandler factory: deps.contentTypeRoutes required`
        );
    }

    /**
     *
     * @type {import("../../router/model/router.model").RouteFinalHandler}
     */
    const fn = async function (ctx) {
        if (!ctx.req || !ctx.res) {
            throw new Error(
                `HandleFormFinalHandler: ctx.req && ctx.res required`
            );
        }

        const contentTypeHeader = ctx.req.headers['content-type'];

        const [contentType, contentTypePayload] =
            contentTypeHeader.split(/;\s*/);

        const ContentType = {
            contentType,
            payload: contentTypePayload,
        };

        const contentTypeHandler =
            deps.ContentTypeRoutes.get(contentType) ||
            (() => {
                console.log('alternate handler');
            });

        await contentTypeHandler(ctx.req, ContentType.payload);

        ctx.res.writeHead(200, {
            'content-type': 'application/json',
        });
        ctx.res.end(JSON.stringify({ message: 'foo bar baz' }));
    };

    return fn;
}

/**
 * @type {Map<string,Function>}
 */
const ContentTypeRoutes = new Map();
// registrate content-type route
ContentTypeRoutes.set(
    'multipart/form-data',
    MultipartContentTypeRoute({
        SplitFormDataBuffer: SplitFormDataBuffer({
            findIndexInBuffer: findIndexInBuffer,
        }),
    })
);

/**
 *
 * @param {Object} deps
 * @param {(data:Buffer<ArrayBuffer>, separator:Buffer<ArrayBuffer>) => Buffer<ArrayBuffer>[]} deps.SplitFormDataBuffer
 * @returns {(req:http.IncomingMessage, res:http.ServerResponse, payload:any) => {}}
 */
function MultipartContentTypeRoute(deps = {}) {
    if (!deps.SplitFormDataBuffer) {
        throw new Error(
            `MultipartContentTypeRoute factory: deps.SplitFormDataBuffer required`
        );
    }

    /**
     *
     * @param {http.IncomingMessage} req
     * @param {any} payload
     * @returns
     */
    const fn = async function (req, payload) {
        const Pools = {
            RequestChunks: [],
        };

        const LocalBuffer = {};

        const Args = {
            /**
             * @type {string}
             */
            payload,
            HTTPRequest: req,
        };

        const boundary = Args.payload;

        LocalBuffer.boundaryMatchResult = boundary.match(
            /boundary=(----[^;\s]+)/
        );

        if (LocalBuffer.boundaryMatchResult === null) {
            throw new Error(`boundaryMatchResult === null`);
        }
        console.log('multipart handler', { boundary, LocalBuffer, Args });

        return new Promise((resolve, reject) => {
            Args.HTTPRequest.on(`data`, (chunk) => {
                Pools.RequestChunks.push(chunk);
            });

            Args.HTTPRequest.on(`end`, async () => {
                const RequestWholeData = Buffer.concat(Pools.RequestChunks);

                const SplitBufferResult = await deps.SplitFormDataBuffer(
                    RequestWholeData,
                    Buffer.from(LocalBuffer.boundaryMatchResult[1])
                );

                for (const part of SplitBufferResult) {
                    console.log({ part });

                    // if (part.length)
                }

                resolve({ success: { message: 'done', data: {} } });
            });
        });
    };

    return fn;
}

module.exports = { HandleFormFinalHandler, ContentTypeRoutes };

/**
 *
 * @param {Object} deps
 * @param {(dataBuffer:Buffer<ArrayBuffer>,separatorBuffer:Buffer<ArrayBuffer>,start:number) => number} deps.findIndexInBuffer
 */
function SplitFormDataBuffer(deps = {}) {
    if (!deps.findIndexInBuffer) {
        throw new Error(`ParseFormData fn: deps.findIndexInBuffer required`);
    }

    /**
     *
     * @param {Buffer<ArrayBuffer>} data
     * @param {Buffer<ArrayBuffer>} separator
     * @returns {Buffer<ArrayBuffer>[]}
     */
    const fn = async function (data, separator) {
        // console.log({
        //     data: data.toString('utf-8'),
        //     separator: separator.toString('utf-8'),
        // });

        const parts = [];
        let index = 0;
        let start = 0;

        while (
            (index = deps.findIndexInBuffer(data, separator, start)) !== -1
        ) {
            // console.log(index);
            parts.push(data.subarray(start, index));
            start = index + separator.length;
        }

        parts.push(data.subarray(start));

        // console.log({ parts });

        return parts;
    };

    return fn;
}

/**
 *
 * @param {Buffer<ArrayBuffer>} dataBuffer
 * @param {Buffer<ArrayBuffer>} separatorBuffer
 * @param {number} start
 */
function findIndexInBuffer(dataBuffer, separatorBuffer, start = 0) {
    for (
        let index = start;
        index < dataBuffer.length - separatorBuffer.length;
        index++
    ) {
        let found = true;
        for (let j = 0; j < separatorBuffer.length; j++) {
            if (dataBuffer[index + j] !== separatorBuffer[j]) {
                // console.log({ index, j });
                found = false;
                break;
            }
        }

        if (found === true) {
            return index;
        }
    }

    return -1;
}
