
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
            const contentTypeHandlerController = contentTypeHandlersRouter.getHandlerController(contentType);
            const { error, success } = await contentTypeHandlerController.handle(req ,res , contentTypeHeaderPayload);

            if(error) {
                console.log({error, success});
                res.end(JSON.stringify({foo:'bar'}));
                return;
            }

            if(!success) {
                res.writeHead(500, 'internal error', {
                    "content-type":"application/json",
                });
                res.end(JSON.stringify({error:'internal error'}));
                return;
            }

            console.log('content type handler success: ', {success , error});

            // for (const [key, value] of Object.entries(parsedData)) {
            //     console.log({key, value});
            // }


            /* 
                it`s need validate the "succes" object,
                becose response data may be any type

                it`s need a validate scheme,
                but at now i response object the "succes"
            
            */

            res.writeHead(200, 'ok' , {
                'content-type':'application/json',
            });

            res.end(JSON.stringify({success}));
            return
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
