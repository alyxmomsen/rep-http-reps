/* стандартный(-е) модуль(-и) */
const { IncomingMessage, ServerResponse } = require("node:http");
/* кастомная утилита для отправки фолл-беков */
const { sendFallBack } = require("../../../utils/error-factory");
/* #warning начинал реализацию централизованой системы обработки ошибок, но отложил разработку
оставил это здесь что-бы напоминало*/
// const { errorService } = require("../../../error/error.service");
const { splitFormData } = require("../utils/split-form-raw-data");
const { parseFormDataPart } = require("../utils/parse-form-data-part");
// const { GLOBAL_NAMES } = require("../../../registry/names.map");
// const { registry:namesRegistry } = require("../../../registry/names.registry");
// const scriptId = namesRegistry.registrate(GLOBAL_NAMES.MULTIPART_HANDLER);

const MULTIPART_FORM_HANDLER_CONSTANTS = {
    PAYLOAD_DATA_KEY:'boundaryRawData' ,
    /* это поле предназначалось для централизованной системы обработки ошибок,
    в той архитектуре нужно было учитывать идентификатор скрипта
    сейчас это пока что здесь, дожидается дальнейшей разработки */
    // CURRENT_SCRIPT_ID:scriptId ,
    HTML_FORM_CONTENT_TYPE:'multipart/form-data' , // for the form-handler routing
}

class MultipartFormdataHandler {

    /**
     * 
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     * @param {string} payload 
     * @returns {Promise<{error:Object.<string,any>}|{success:Object.<string,any>}>} 
     */
    async handle (req, res, payload) {

        if(!payload) {
            throw new Error(`no payload provided`);
        }

        /* получаем boundary по простому регулярному выражению */
        /**
         * @type {string}
         */
        const boundary = (payload?.match(/boundary=(----[^;\s$]+)/))?.[1] || null;

        if(!boundary) {
            throw new Error(`no boundary provided`);
        }

        return new Promise ((resolve, reject) => {

            /**
             * @type {Buffer<ArrayBuffer>[]}
             */
            const formDataChunks = [];
            
            /**
             * переменная для контролля размера полученных данных
             * @type {number}
             */
            let formDataSize = 0 ;
            req.on("data" , async (chunk) => {
                formDataSize += chunk.length ;
                formDataChunks.push(chunk);
            }); 

            req.on('end' , async () => {
                
                console.log(`form chunks received`);
                /* объеденяем все полученые Buffer chunks в один монолит */
                const wholeFormDataBuffer = Buffer.concat(formDataChunks);
                /* разбиваем перманентный буффер на логические куски, где 
                каждый кусок есть данные одного HTML тега "input" */
                const parts = splitFormData(wholeFormDataBuffer , Buffer.from(`--${boundary}`));
                
                /* здесь должны быть группы не прошедшие валидацию по той или иной причине
                предполагается эти группы обработать и отправить отчет на клиент,
                например для информирования пользователя для дальнейшей корректировки вводимых данных 
                пока что это здесь с целью напоминания, дожидается дальнейшей разработки*/
                const invalidGroups = new Map();

                const parsedFormDataParts = [];

                for (const part of parts) {
                    try {
                        /* полный парсинг данных одного инпута 
                        на выходе получаем 7 семантически различных типов данных
                        body: содержимое инпута введеное пользователем,в т.ч файл, в виде Buffer<ArrayBuffer>
                        parsedNameAttribute это данные аттрибута "name" HTML тега, при этом парсинг реализуется по
                        , пока-что, одной стратегии*/
                        const { 
                            body, contentType, filename, name
                        } = parseFormDataPart(part);
                        
                        /* middleware */

                        const nextData = await this.#executOnPartHandledeMiddleware(
                            {data:{body, contentType, filename, name}}, 
                            this.#middleware,
                        );

                        console.log({nextEndData:nextData});

                        parsedFormDataParts.push(nextData);

                        /* ---------- */

                        continue;
                    }
                    catch (e) {
                        /* исключения пока никак не обрабатываются */
                        const errorMessage = e.message ;
                        console.log({errorMessage, e, cs:MULTIPART_FORM_HANDLER_CONSTANTS.CURRENT_SCRIPT_ID});
                    }
                }

                const { success, error } = await this.#executeOnEndMiddleware({parsedFormDataParts}, this.#onDataEndListeners);
                
                if(error) {
                    reject({
                        error,
                    })
                }
                
                resolve({
                    success,
                });
            });

            req.on('error' , (error) => {
                reject({
                    error,
                });
            })
        });
    }

    /**
     * 
     * @param  {...((payload:Object.<string,any>, next:((payload)=>Promise<Object.<string,any>>))=>Promise<Object.<string,any>>)} handlers 
     */
    onDataEndListeners (...handlers) {
        handlers.forEach(handler => {
            this.#onDataEndListeners.push(handler);
        });
    }

    /**
     * 
     * @param {string} eventName 
     * @param {(payload:Object.<string,any>) => void} handler 
     */
    addEventListener (eventName, handler) {
        this.#eventListeners.set(eventName, handler);
    }

    /**
     * 
     * @param  {...((payload:Object.<string,any>,next:((nextData:Object.<string,any>)=>Promise<Object.<string,any>>))=>Promise<Object.<string,any>>)} middleware 
     */
    useMiddleware (...middleware) {
        for (const handler of middleware) {
            this.#middleware.push(handler);
        }
    }

    /**
     * 
     * @param {string} eventName 
     * @param {Object.<string,any>} payload 
     */
    #emit (eventName, payload) {
        this.#handleEvents(eventName, payload);
    }

    /**
     * 
     * @param {string} eventName 
     * @param {Object.<string,any>} payload
     */
    #handleEvents (eventName, payload) {
        for (const [listenerEventName, handler] of this.#eventListeners.entries()) {
            if(eventName !== listenerEventName) continue;
            handler(payload);
        }
    }

    /**
     * 
     * @param {((payload:Object.<string,any>, next:(nextData:Object.<string,any>)=>Promise<Object.<string,any>>)=>Promise<Object.<string,any>>)[]} middleware 
     * @returns {Promise<Object.<string,any>}
     */
    async #executeOnEndMiddleware (payload, middleware) {
        const MAX_REQURSIVE_CALLSTACK = middleware.length + 1;
        let iterationsCounter = 0;
        /**
         * 
         * @param {Object.<string,any>} nextData 
         */
        const next = async (nextData) => {
            if(iterationsCounter < MAX_REQURSIVE_CALLSTACK) {
                console.log({nextData});
                const handler = middleware[iterationsCounter++];
                if(!handler) return nextData;
                return await handler(nextData, next);
            }
            throw new Error(`too many reqursive callstack. current: ${iterationsCounter}`);
        }
        return await next(payload);
    }

    /**
     * 
     * @param {((payload:Object.<string,any>, next:(nextData:Object.<string,any>)=>Promise<Object.<string,any>>)=>Promise<Object.<string,any>>)[]} middleware 
     * @returns {Promise<Object.<string,any>}
     */
    async #executOnPartHandledeMiddleware (payload, middleware) {
        const MAX_RECURSIVE =  middleware.length + 1;
        let iterationsCounter = 0;
        const next = async (nextData) => {
            if(iterationsCounter < MAX_RECURSIVE) {
                console.log({nextData});
                const handler = middleware[iterationsCounter++];
                if(handler === undefined) return nextData;
                return await handler(nextData, next);
            }
            throw new Error(`too many reqursive stack. current: ${iterationsCounter}`);
        }
        return await next(payload);
    }

    /**
     * @type {Map.<string,(payload:Object.<string,any>)=>void>}
     */
    #eventListeners;

    /**
     * @type {((payload:Object.<string,any>, next:(nextData:Object.<string,any>)=>Promise<void>)=>Promise<void>)[]}
     */
    #middleware;
    #onDataEndListeners;

    constructor () {
        this.#eventListeners = new Map();
        this.#middleware = [];
        this.#onDataEndListeners = [];
    }
}

module.exports = { MultipartFormdataHandler, MULTIPART_FORM_HANDLER_CONSTANTS }