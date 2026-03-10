
/* стандартные nodejs модули */
const { readFile } = require("node:fs/promises");
const { IncomingMessage, ServerResponse } = require("node:http");
const { resolve, join } = require("node:path");
/* кастомная утилита (пока-что просто утилита) для отправки фол-бэков */
const { sendFallBack } = require("../../utils/error-factory");
/* импор content-type из файла где происходит регистрация обработчиков для content-type случаев */
const { contentTypeHandlersRouter } = require("./controller/content-type.controller");

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
     * @description вызывает конкретный контроллер для обработки формы в зависимости от "content-type" хедера 
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     * @returns {Promise<void>} 
     */
    static async processForm (req ,res) {

        console.log('form in process...');

        const { headers } = req;
        
        const contentTypeHeader = headers['content-type'];

        if(!contentTypeHeader) {
            sendFallBack(
                res , 400 ,
                'FormHandler::processForm' , 
                'no content-type header' ,
                {conttentTypeHeader: contentTypeHeader}
            );
            return ;
        }

        /* разбиваем содержимое content-type хедера на две части по regex строке где
        вероятно содержится значение именно "content-type" и через разделитель ";\s*" 
        дополнительная информация для content-type строки.
        в случае с multipart/form-data это "boundary" разделитель данных */
        const [ contentType , contentTypeHeaderPayload ] = contentTypeHeader.split(/;\s*/) ;

        try {
            const contentTypeHandlerInterface = contentTypeHandlersRouter.getHandlerController(contentType);
            const result = await contentTypeHandlerInterface.handle(req ,res , contentTypeHeaderPayload);
        }
        catch (e) {
            console.log({e});
            sendFallBack(
                res , 520 ,
                'FormHandler::processForm' ,
                'unknown error' ,
                {e}
            );
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

    constructor () {}
}


/* на данный момент экспортируется именно класс, посколку методы статические */
module.exports = { FormHandler } ;
