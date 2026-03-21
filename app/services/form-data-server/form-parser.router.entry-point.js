
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
     * @param { ContentTypeHandlersRouter } contentTypeHandlersRouter 
     * @returns {Promise<void>} 
     */
    static async processForm (req ,res, deps = {}) {
        console.log('call the process-form...');

        const { headers } = req;
        
        /**
         * @type {ContentTypeHandlersRouter}
         */
        const contentTypeHandlersRouter = deps.contentTypeHandlersRouter;

        if(contentTypeHandlersRouter === undefined) {
            throw new Error(`processForm: contentTypeHandlersRouter is required`);
        }

        const contentTypeHeader = headers['content-type'];

        if(!contentTypeHeader) {
            console.log(`form handler: content-type header is required, but not provided`);
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
            /* 
                здесь, по-факту, работаем по паттерну Singletone, 
                по-скольку "contentTypeHandlersRouter" определен единожды в файле 
                "app\services\form-data-server\controller\content-type.controller.js",
                там же происходит регистрация content-type роутов, и там же он экспортирован,
                таким образом Singletone импортируется уже "заряженый" маршрутами
             */
            const contentTypeHandlerController = contentTypeHandlersRouter.getHandlerController(contentType);
            /* если исключение не произошло, то вызываем метод "handle" контроллера, 
            который, в свою очередь, вызывает content-type обработчик */
            const { error, success } = await contentTypeHandlerController.handle(req ,res , contentTypeHeaderPayload);

            if(error) {
                console.log('form handler: ', {error, success});
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

            console.log('form-handler end: ', {success , error});

            // for (const [key, value] of Object.entries(parsedData)) {
            //     console.log({key, value});
            // }

            /* 
                it`s need validate the "succes" object,
                becose response data may be any type

                it`s need a validate scheme,
                but at now i response object the "succes"
            
            */

            res.writeHead(200, {
                'content-type':'application/json',
            });
            res.end(JSON.stringify({success}));
            return
        }
        catch (e) {
            const response = {
                message: 'unknown error',
                error: e,
            };
            console.log('form-handler: ', { success, error });
            res.writeHead(520, {
                'content-type':'application/json',
            });
            res.end(JSON.stringify(response));
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
