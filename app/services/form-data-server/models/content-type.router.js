// интерфейс для обработчика формы

const { IncomingMessage, ServerResponse } = require("node:http");

class ContentTypeHandlerController {
    async handle (req, res, payload) {
        return this.#strategy(req, res, payload);
    }

    /**
     * @type {Function}
     */
    #strategy;

    /**
     * 
     * @param {Function} strategy 
     */
    constructor (strategy) {
        this.#strategy = strategy;
    }
}

class ContentTypeHandlersRouter {

    /**
     * 
     * @param {string} contentType 
     * @returns {ContentTypeHandlerController} 
     */
    getHandlerController(contentType) {

        const strategy = this.#contentTypeHandlers.get(contentType);

        if(strategy === undefined) {
            throw new Error(`Content-type handlers router: unregistrated content-type`);
        }

        return new ContentTypeHandlerController(strategy);
    }

    registrateContentTypeHandler (contentType , handler) {
        
        let isContentTypeValid = false;
        for (const [key, registratedContentType] of Object.entries(ContentTypeHandlersRouter.contentTypesMaps)) {
            if(contentType === registratedContentType) {
                isContentTypeValid = true;
                break;
            }
        }

        if(this.#contentTypeHandlers.has(contentType)) {
            throw new Error(`Content type handlers router: this content-type ${contentType} already in use`);
        }

        this.#contentTypeHandlers.set(contentType, handler);
        /* логирование успешной транзакции */
        console.log(`content-type <${contentType}> registrated successfull`);

    }

    static contentTypesMaps = {
        'MULTIPART_FORM_DATA':'multipart/form-data',
        'TEXT_PLAIN':'text/plain',
        'APPLICATION_X_WWW_FORM_URLENCODED':'application/x-www-form-urlencoded',
    }

    /**
     * @type {Map<string,Function>}
     */
    #contentTypeHandlers;

    constructor () {
        this.#contentTypeHandlers = new Map();
    }
    
}

/**
 * 
 */
module.exports = { ContentTypeHandlersRouter, ContentTypeHandlerController } 