const http = require('http');

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
        splitPart: SplitPart({
            findIndexInBuffer: findIndexInBuffer,
        }),
        parseHeaders: ParseHeaders({
            extractHeaders: ExtractHeaders(),
            parseContentDisposition: ParseContentDisposition(),
        }),
    })
);

/**
 *
 * @param {Object} deps
 * @param {(data:Buffer<ArrayBuffer>, separator:Buffer<ArrayBuffer>) => Buffer<ArrayBuffer>[]} deps.SplitFormDataBuffer
 * @param {(data:Buffer<ArrayBuffer>) => Object} deps.splitPart
 * @param {(data:string) => {name:string|null;filename:string|null;contentType:string|null}} deps.parseHeaders
 * @returns {(req:http.IncomingMessage, res:http.ServerResponse, payload:any) => {}}
 */
function MultipartContentTypeRoute(deps = {}) {
    if (!deps.SplitFormDataBuffer) {
        throw new Error(
            `MultipartContentTypeRoute factory: deps.SplitFormDataBuffer required`
        );
    }

    if (!deps.splitPart) {
        throw new Error(
            `MultipartContentTypeRoute factory: deps.SplitPart required`
        );
    }

    if (!deps.parseHeaders) {
        throw new Error(
            `MultipartContentTypeRoute factory: deps.parseHeaders required`
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

        return new Promise((resolve, reject) => {
            Args.HTTPRequest.on(`data`, (chunk) => {
                Pools.RequestChunks.push(chunk);
            });

            Args.HTTPRequest.on(`end`, async () => {
                const RequestWholeData = Buffer.concat(Pools.RequestChunks);

                const SplitBufferResult = deps.SplitFormDataBuffer(
                    RequestWholeData,
                    Buffer.from(`--${LocalBuffer.boundaryMatchResult[1]}`)
                );

                for (const part of SplitBufferResult) {
                    try {
                        const SplittedPart = deps.splitPart(part);

                        const ParsedHeaders = deps.parseHeaders(
                            SplittedPart.headers.toString('utf-8')
                        );

                        console.log({ ParsedHeaders });
                    } catch (err) {
                        console.log({ err });
                    }
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
 * @param {Function} deps.extractHeaders
 * @param {Function} deps.parseContentDisposition
 * @returns {}
 */
function ParseHeaders(deps = {}) {
    if (!deps.extractHeaders) {
        throw new Error(`ParseHeaders fn: deps.extractHeaders required`);
    }

    if (!deps.parseContentDisposition) {
        throw new Error(
            `ParseHeaders fn: deps.parseContentDisposition required`
        );
    }

    /**
     *
     * @param {string} headersString
     * @returns {{name:string|null;filename:string|null;contentType:string|null}}
     */
    const fn = function (headersString) {
        /**
         * @type {Object.<string,string>}
         */
        const ExtractedHeaders = deps.extractHeaders(headersString);

        // const Actions = {
        //     /**
        //      *
        //      * @param {string} data
        //      */
        //     'content-disposition': (data) => {
        //         console.log(`handle content-disposition action`);

        //         // data.match(/name="([^"]+)"/)?.[1] || null;
        //         // data.match(/name="([^"]+)"/)?.[1] || null;

        //         const ParsedData = {
        //             name: data.match(/name="([^"]+)"/)?.[1] || null,
        //             filename: data.match(/filename="([^"]+)"/)?.[1] || null,
        //         };

        //         return ParsedData;
        //     },
        //     /**
        //      *
        //      * @param {string} data
        //      */
        //     'content-type': (data) => {
        //         console.log(`handle content-type action`);
        //         return { contentType: data };
        //     },
        // };

        // console.log({ ExtractedHeaders });

        // for (const [headerKey, headerValue] of Object.entries(
        //     ExtractedHeaders
        // )) {
        //     const action =
        //         Actions[headerKey] ||
        //         (() => {
        //             console.log(`default action`);
        //         });

        //     action(headerValue);
        // }

        // console.log({ ExtractHeaders });

        const { name, filename } = deps.parseContentDisposition(
            ExtractedHeaders['content-disposition']
        );

        /**
         * @type {string|null}
         */
        const contentType = ExtractedHeaders['content-type'] || null;

        return {
            name,
            filename,
            contentType,
        };
    };

    return fn;
}

function ParseContentDisposition() {
    const fn = function (contentDispositionData) {
        const ParsedData = {
            name: contentDispositionData.match(/name="([^"]+)"/)?.[1] || null,
            filename:
                contentDispositionData.match(/filename="([^"]+)"/)?.[1] || null,
        };

        return ParsedData;
    };

    return fn;
}

/**
 *
 * @param {Object} deps
 * @returns {(headersString:string) => Object.<string,string>}
 */
function ExtractHeaders(deps = {}) {
    /**
     *
     * @param {string} headersString
     * @returns {Object.<string,string>}
     */
    const fn = function (headersString) {
        const ToolSet = {
            headerStringSeparator: '\r\n',
            headerCoupleSeparator: ': ',
        };

        const HeadersPool = {};

        headersString.split(ToolSet.headerStringSeparator).forEach((part) => {
            const [key, value] = part.split(ToolSet.headerCoupleSeparator);
            if (key && value) {
                const normalizedKey = key.toLowerCase();

                HeadersPool[normalizedKey] = value;
            }
        });

        return HeadersPool;
    };

    return fn;
}

/**
 *
 * @param {Object} deps
 * @param {Object} deps.findIndexInBuffer
 * @returns
 */
function SplitPart(deps = {}) {
    if (!deps.findIndexInBuffer) {
        throw new Error(`SplitPart fn: deps.findIndexInBuffer required`);
    }

    /**
     *
     * @param {Buffer<ArrayBuffer>} data
     */
    const fn = function (data) {
        const Args = {
            data,
        };

        const Tools = {
            dataSeparator: Buffer.from(`\r\n\r\n`),
        };

        const Result = {};

        const separatorIndex = deps.findIndexInBuffer(
            Args.data,
            Tools.dataSeparator
        );

        if (separatorIndex === -1) {
            throw new Error(
                `SplitPart fn: incorrect part, separator not found`
            );
        }

        Result.headers = data.subarray(0, separatorIndex);

        let bodyEndIndex = Args.data.length;

        if (
            Args.data[bodyEndIndex - 2] === 0x0d &&
            Args.data[bodyEndIndex - 1] === 0x0a
        ) {
            bodyEndIndex -= 2;
        }

        Result.body = Args.data.subarray(
            separatorIndex + Tools.dataSeparator.length,
            bodyEndIndex
        );

        return Result;
    };

    return fn;
}

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
    const fn = function (data, separator) {
        const parts = [];
        let index = 0;
        let start = 0;

        while (
            (index = deps.findIndexInBuffer(data, separator, start)) !== -1
        ) {
            parts.push(data.subarray(start, index));
            start = index + separator.length;
            if (data[start] === 0x0d && data[start + 1] === 0x0a) {
                start += 2;
            }
        }

        parts.push(data.subarray(start));

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
