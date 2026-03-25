
/* стандартные nodejs модули */
const { readFile } = require("node:fs/promises");
const { IncomingMessage, ServerResponse } = require("node:http");
const { resolve, join } = require("node:path");
/* кастомная утилита (пока-что просто утилита) для отправки фол-бэков */
const { sendFallBack } = require("../../utils/error-factory");
/* импор content-type из файла где происходит регистрация обработчиков для content-type случаев */
const { contentTypeHandlersRouter } = require("./controller/content-type.controller");
const { ContentTypeHandlersRouter } = require("./models/content-type.router");
// const { ContentTypeHandlersRouter } = require("./models/content-type.router");

/**
 * временное решение для хранения относительного пути 
 */
const FORM_HANDLER_CONSTANTS = {
    ASSETS_PATH:resolve('./assets/html/form.html') ,
}

console.log(FORM_HANDLER_CONSTANTS);

/*
 * собирался сделать роутинг для фол-бэков обработчиков
 * но приостановил, так как были более важные фокусы
 */
/**
 * @type {Map<string,(...args:string)=>void>}
 */
const fallbacks = new Map();
fallbacks.set('error type' , (...args) => {});

/**
 * 
 */
class FormHandler {

    /**
     * @description вызывает конкретный контроллер для обработки формы 
     * в зависимости от "content-type" хедера , 
     * принимает зависимость contentTypeHandlersRouter
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res
     * @param {{contentTypeHandlersRouter:ContentTypeHandlersRouter}} deps 
     * @returns {Promise<void>} 
     */
    static async processForm (req ,res, deps = {}) {

        const contentTypeHandlersRouter = deps.contentTypeHandlersRouter ;

        if(contentTypeHandlersRouter === undefined) {
            res.writeHead(500, {
                "content-type":'application/json',
            });
            res.end(JSON.stringify({
                message:'enternal error: 1',
            }));
            console.log(`x1b[31m` + 'contentTypeHandlersRouter is not received' + `x1b[0m`);
            throw new Error(`contentTypeHandlersRouter is not received`);
        }

        const { headers } = req;
        const contentTypeHeader = headers['content-type'];

        if(contentTypeHeader === undefined) {
            res.writeHead(400, {
                "content-type":'application/json',
            });
            res.end(JSON.stringify({
                message:'expected content-type header but not provided'
            }));
            return;
        }

        const [contentType, contentTypeAttr] = contentTypeHeader.split(/;\s*/);

        try {
            const contentTypeController = contentTypeHandlersRouter.getHandlerController(contentType);
            const {success, error} = await contentTypeController.handle(req, res, contentTypeAttr);

            if(error) {
                res.writeHead(500, {
                    "content-type":'application/json',
                });
                res.end(JSON.stringify({
                    message:'2'
                }));
                return;
            }


            if(!success) {
                res.writeHead(500, {
                    "content-type":'application/json',
                });
                res.end(JSON.stringify({
                    message:'3'
                }));
                return;
            }

            res.writeHead(200, {
                "content-type":'application/json',
            });
            res.end(JSON.stringify({
                success,
            }));
            return;
            
        }
        catch (err) {
            console.log({err});
        }
    }   

    /**
     * @description 'render is read and send the concrete html'
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     * @returns {Promise<void>} 
     */
    static async renderer (req , res) {

        console.log('renderer...');

        try {

            const formHTMLpath = FORM_HANDLER_CONSTANTS.ASSETS_PATH ;
            const file = await readFile(formHTMLpath , 'utf-8');
            res.writeHead(200 , 'ok' , {
                "content-type": 'text/html' ,
            });
            res.end(file);
        }
        catch (e) {
            // здесь нужно сделать редирект 
            console.log({e});
            // res.setHeader("");
            res.writeHead(500 , 'internal error' , {
                "content-type":'text/plain'
            });
            res.end('500. internal error');
        }
    }

    // dependecies

    /**
     * @type {ContentTypeHandlersRouter}
     */
    #contentTypeHandlersRouter;

    constructor({
        contentTypeHandlersRouter,
    }) {
        this.#contentTypeHandlersRouter = contentTypeHandlersRouter;
        if (contentTypeHandlersRouter === undefined) {
            const errorDetails = 'contentTypeHandlersRouter was not provided';
            throw new Error(`dependencies error: ${errorDetails}`);
        }
    }
}


/* на данный момент экспортируется именно класс, посколку методы статические */
module.exports = { FormHandler } ;
