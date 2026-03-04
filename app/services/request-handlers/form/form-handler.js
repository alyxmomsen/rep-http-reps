const { readFile } = require("node:fs/promises");
const { IncomingMessage, ServerResponse } = require("node:http");
const { resolve, join } = require("node:path");
const { sendFallBack } = require("../../../utils/error-factory");
const { contentTypeHandlersRouter } = require("./controller/content-type.controller");

const FORM_HANDLER_CONSTANTS = {
    ASSETS_PATH:'./assets/html/form.html' ,
}

const fallbacks = new Map();

class FormHandler {

    /**
     * 
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     * @param {Object} payload
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

        const [ contentType , contentTypeHeaderPayload ] = contentTypeHeader.split(/; */) ;

        console.log({contentType});

        if(!contentType) {
            sendFallBack(
                res ,400 ,
                'FormHandler::processForm' , 
                'no content-type provided' ,
                {conttentTypeHeader: contentTypeHeader}
            );
            return ;
        }

        try {
            /* фабрика возвращает bundle {handler:function;payloadDataKey:string} , 
            в котором содержится: 
            handler (handler:function) 
            и сопроводительные данные (payloadDataKey:string)
            а именно ключ для payload объекта. именно этот ключ будет использован
            в обработчике для получения payload значения
            соответственно, с каждым обработчиком приходит свой ключ */
            // const { handler , payloadDataKey:PAYLOAD_DATA_KEY } = useContentTypeHandlerRouter(contentType);
            // console.log(useContentTypeHandlerRouter(contentType));
            // await handler(req , res  , { [PAYLOAD_DATA_KEY]:contentTypeHeaderPayload });

            const contentTypeHandlerInterface = contentTypeHandlersRouter.getHandlerInterface(contentType);
            await contentTypeHandlerInterface.handle(req ,res , contentTypeHeaderPayload);

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

            const formHTMLpath = resolve(join(...FORM_HANDLER_CONSTANTS.ASSETS_PATH.split(/[\//]/))) ;
            const file = await readFile(formHTMLpath , 'utf-8');
            res.writeHead(200 , 'ok' , {
                "content-type": 'text/html' ,
            });
            res.end(file);
        }
        catch (e) {
            console.log({e});
        }
    }

    constructor () {}
}

// const formHandler = new FormHandler ();

module.exports = { FormHandler , /* formHandler */ } ;


