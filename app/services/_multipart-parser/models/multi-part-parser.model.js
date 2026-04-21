const { IncomingMessage, ServerResponse } = require('http');
const {
    MultiTableGrouppingAgent,
} = require('../services/multi-table-gruping-agent/multi-table-gruping-agent');

class MultipartFormdataHandler {
    /**
     *
     * @param {IncomingMessage} req - http.IncomingMessage
     * @param {ServerResponse} res - http.ServerResponse
     * @param {string} payload - boundary raw string
     * @returns {Promise<{error?:Object;success?:Object}>}
     */
    async handle(req, res, payload, deps) {
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
            const Options = {
                incomingDataMaxSize: 1024 * 1024 * 1024 * 2, // 2Gb
            };

            const RequestDataPool = {
                Chunks: [],
                ReceivedDataSize: 0,
            };

            req.on('data', async (chunk) => {
                RequestDataPool.ReceivedDataSize += chunk.length;
                RequestDataPool.Chunks.push(chunk);
            });

            req.on('end', async () => {
                const wholeBuffer = Buffer.concat(RequestDataPool.Chunks);
                const boundaryBuffer = Buffer.from(`--${boundaryMatch[1]}`);
                /* разбиваем сплошной буфер данных формы на отдельные порции
                где одна порция - один HTML инпут  */
                // const parts = splitFormData(wholeBuffer, boundaryBuffer);
                const parts = this.#DepsToolSet.splitFormData(
                    wholeBuffer,
                    boundaryBuffer
                );

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
                            this.#DepsToolSet.parseFormDataPart(part);
                        const headers = this.#DepsToolSet.splitHeaders(
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
                            this.#DepsToolSet.parseContentDisposition(
                                contentDisposition
                            );

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

    /**
     * @type {() => MultiTableGrouppingAgent}
     */
    #multiTableAgentFactory;

    /**
     * @type {{
     *  splitFormData:(data:Buffer<ArrayBuffer>, separator:Buffer<ArrayBuffer>)=> Buffer<ArrayBuffer>[]
     *  parseFormDataPart:(part:Buffer<ArrayBuffer>)=> ({headers:Buffer<ArrayBuffer>,body:Buffer<ArrayBuffer>})
     *  splitHeaders:(headersRaw:string)=> Object.<string,string>
     *  parseContentDisposition:(contentDispositionHeaderData:string)=> ({
     *   name: string | null;
     *   filename: string | null;
     *  })
     * }}
     */
    #DepsToolSet;

    /**
     *
     * @param {Object} deps
     * @param {() => MultiTableGrouppingAgent} deps.multiTableGrouppingAgentFactory
     * @param {(data:Buffer<ArrayBuffer>, separator:Buffer<ArrayBuffer>)=> Buffer<ArrayBuffer>[]} deps.splitFormData
     * @param {(part:Buffer<ArrayBuffer>)=> ({headers:Buffer<ArrayBuffer>,body:Buffer<ArrayBuffer>})} deps.parseFormDataPart
     * @param {(headersRaw:string)=> Object.<string,string>} deps.splitHeaders
     * @param {(contentDispositionHeaderData:string)=> ({
     *  name: string | null;
     *  filename: string | null;
     * })} deps.parseContentDisposition
     */
    constructor(deps = {}) {
        if (!deps.multiTableGrouppingAgentFactory) {
            throw new Error(
                `MultipartFormdataHandler: deps.multiTableGrouppingAgentFactory required`
            );
        }

        this.#multiTableAgentFactory = deps.multiTableGrouppingAgentFactory;

        if (!deps.splitFormData) {
            throw new Error(`deps.splitFormData required`);
        }

        console.log(
            `💘 MultipartFormdataHandler::constructor: deps.splitFormData`
        );

        if (!deps.parseFormDataPart) {
            throw new Error(`deps.parseFormDataPart required`);
        }

        console.log(
            `💘 MultipartFormdataHandler::constructor: deps.parseFormDataPart`
        );

        if (!deps.splitHeaders) {
            throw new Error(`deps.splitHeaders required`);
        }

        console.log(
            `💘 MultipartFormdataHandler::constructor: deps.splitHeaders`
        );

        if (!deps.parseContentDisposition) {
            throw new Error(`deps.parseContentDisposition required`);
        }

        console.log(
            `💘 MultipartFormdataHandler::constructor: deps.parseContentDisposition`
        );

        this.#DepsToolSet = {
            splitFormData: deps.splitFormData,
            parseFormDataPart: deps.parseFormDataPart,
            splitHeaders: deps.splitHeaders,
            parseContentDisposition: deps.parseContentDisposition,
        };

        this.#onDataPartMiddleware = [];
        this.#onDataEndMiddleware = [];
    }
}

module.exports = { MultipartFormdataHandler };
