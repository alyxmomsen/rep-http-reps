const { IncomingMessage, ServerResponse } = require('http');
const {
    MultiTableGrouppingAgent,
} = require('../services/multi-table-gruping-agent/multi-table-gruping-agent');

class MultipartFormdataHandler {
    /**
     *
     * @param {IncomingMessage} req
     * @param {ServerResponse} res
     * @param {string} payload
     * @returns {Promise<{error?:Object;success?:Object}>}
     */
    async handle(req, res, payload) {
        if (!payload) {
            return {
                error: {
                    subject: 'multipart handler',
                    message: 'payload required but not provided',
                    code: 1,
                    details: null,
                },
            };
        }

        const boundaryMatch = payload.match(/boundary=(----[^;\s]+)/);

        if (!boundaryMatch) {
            return {
                error: {
                    subject: 'multipart handler',
                    message:
                        'boundary required but is not correct or not provided',
                    code: 2,
                    details: { payload },
                },
            };
        }

        return new Promise((resolve, reject) => {
            const chunks = [];
            const incomingDataMaxSize = 1024 * 1024 * 1024 * 2; // 2Gb
            let receivedSize = 0;
            req.on('data', async (chunk) => {
                receivedSize += chunk.length;
                chunks.push(chunk);
            });

            req.on('end', async () => {
                const wholeBuffer = Buffer.concat(chunks);
                const boundaryBuffer = Buffer.from(`--${boundaryMatch[1]}`);
                /* разбиваем сплошной буфер данных формы на отдельные порции
                где одна порция - один HTML инпут  */
                const parts = splitFormData(wholeBuffer, boundaryBuffer);

                /* инстанцируем объект multiTableAgentFactory, 
                этот класс накапливает состояние, инстанцирование гарантирует 
                то что состояние объекта "чистый лист"*/
                const multiTableGroupingAgent = this.#multiTableAgentFactory();

                for (const part of parts) {
                    try {
                        // ==========================================================
                        // ============== ? вынести в middleware ? ==================

                        /* парсинг данных */
                        /* дробим монолит на атомы */
                        const { body, headers: headersPart } =
                            parseFormDataPart(part);
                        const headers = splitHeaders(
                            headersPart.toString('utf-8')
                        );
                        const contentDisposition =
                            headers['content-disposition'] || null;
                        const contentType = headers['content-type'] || null;
                        if (!contentDisposition) {
                            /* contentDisposition содержит важные данные, так-что без него- никак */
                            throw new Error(
                                `multipart form data parser: incorrect content-disposition of content-type`
                            );
                        }

                        const { name, filename } =
                            parseContentDisposition(contentDisposition);

                        //
                        // ==========================================================

                        /*  
                            ✔ extractProtocolMiddleware: выявление наличия протокола multitable-form-protocol 
                                - uses extractProtocolName                        
                        */
                        const mwResult = await this.#executeMiddleware(
                            { name, filename, contentType, body },
                            this.#onDataPartMiddleware
                        );

                        /* 
                            ✔ MultiTableGrouppingAgent: трансформация плоской структуры в иерархическую
                            с последущим мерджингом таких структур для каждой порции данных
                        */
                        await multiTableGroupingAgent.handleFormDataPartParsedData(
                            mwResult
                        );
                    } catch (e) {
                        console.log('check that error: ', { e });
                    }
                }

                /* получаем смердженную иерархическую структуру  */
                const mergedGroups = multiTableGroupingAgent.getGroups();

                console.log('check multipart handler', { mergedGroups });

                const middlewareresponse = await this.#executeMiddleware(
                    mergedGroups,
                    this.#onDataEndMiddleware
                );

                // console.log();

                if (middlewareresponse.success) {
                    /* резолвим промис успешным результатом processing-чейна  */
                    resolve({ success: middlewareresponse.success });
                }

                // console.log({mergedGroups});
            });
        });
    }

    /**
     *
     * @param  {...() => Promise<any>} handlers
     */
    useMiddleware(...handlers) {
        handlers.forEach((handler) => {
            this.#onDataPartMiddleware.push(handler);
        });
    }

    /**
     *
     * @param  {...()=> Promise<any>} handlers
     */
    onDataEndListeners(...handlers) {
        handlers.forEach((handler) => {
            this.#onDataEndMiddleware.push(handler);
        });
    }

    addEventListener() {}

    /**
     *
     * @param {(() => Promise<any>)[]} middleware
     */
    async #executeMiddleware(payload, middleware) {
        let index = 0;

        const next = async (nextPayload) => {
            if (index < middleware.length) {
                const currentIndex = index++;
                const handler = middleware[currentIndex];
                if (handler) {
                    try {
                        return await handler(nextPayload, next);
                    } catch (err) {
                        throw err;
                    }
                }
            }

            return nextPayload;
        };

        if (middleware.length > 0) {
            // обработанные данные
            return await next(payload);
        } else {
            // необработанные данные
            return payload;
        }
    }

    #onDataPartMiddleware;
    #onDataEndMiddleware;

    #multiTableAgentFactory;

    /**
     *
     * @param {{multiTableGrouppingAgentFactory:() => MultiTableGrouppingAgent}} deps
     */
    constructor(deps = {}) {
        const multtitableAgenttFactrory = deps.multiTableGrouppingAgentFactory;

        if (!multtitableAgenttFactrory) {
            throw new Error(
                `MultipartFormdataHandler: required multiTableGrouppingAgentFactory but not provided`
            );
        }

        this.#multiTableAgentFactory = multtitableAgenttFactrory;

        this.#onDataPartMiddleware = [];
        this.#onDataEndMiddleware = [];
    }
}

module.exports = { MultipartFormdataHandler };

function parseContentDisposition(contentDispositionHeaderData) {
    const nameMatch = contentDispositionHeaderData.match(/name="([^"]+)"/);
    const filenameMatch =
        contentDispositionHeaderData.match(/filename="([^"]+)"/);

    return {
        name: (nameMatch && nameMatch[1]) || null,
        filename: (filenameMatch && filenameMatch[1]) || null,
    };
}

/**
 *
 * @param {string} headersRaw
 */
function splitHeaders(headersRaw) {
    const headers = {};

    const separator = '\r\n';

    const rows = headersRaw.split(separator);
    rows.forEach((row) => {
        const [key, value] = row.split(': ');
        if (key && value) {
            const normalizedKey = key.toLowerCase();
            headers[normalizedKey] = value;
        }
    });

    return headers;
}

/**
 *
 * @param {Buffer<ArrayBuffer>} part
 */
function parseFormDataPart(part) {
    const separatorBuffer = Buffer.from(`\r\n\r\n`);
    const separatorIndex = findSeparatorIndex(part, separatorBuffer);

    if (separatorIndex === -1) {
        throw new Error(
            `MultipartFormdataHandler/fn.parseFormDataPart: incorrect part`
        );
    }

    const headers = part.subarray(0, separatorIndex);

    let bodyEndIndex = part.length;

    if (part[bodyEndIndex - 2] === 0x0d && part[bodyEndIndex - 1]) {
        bodyEndIndex -= 2;
    }

    const body = part.subarray(
        separatorIndex + separatorBuffer.length,
        bodyEndIndex
    );

    return {
        headers,
        body,
    };
}

/**
 *
 * @param {Buffer<ArrayBuffer>} data
 * @param {Buffer<ArrayBuffer>} separator
 */
function splitFormData(data, separator) {
    let start = 0;
    let index = 0;

    const parts = [];

    while ((index = findSeparatorIndex(data, separator, start)) !== -1) {
        parts.push(data.subarray(start, index));
        start = index + separator.length;

        if (data[start] === 0x0d && data[start + 1] === 0x0a) {
            start += 2;
        }
    }

    parts.push(data.subarray(start));

    return parts;
}

/**
 *
 * @param {Buffer<ArrayBuffer>} data
 * @param {Buffer<ArrayBuffer>} separator
 * @param {number} start
 */
function findSeparatorIndex(data, separator, start = 0) {
    for (let index = start; index <= data.length - separator.length; index++) {
        let found = true;
        for (let j = 0; j < separator.length; j++) {
            if (data[index + j] !== separator[j]) {
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
