const { readFile } = require("node:fs/promises");
const { IncomingMessage, ServerResponse } = require("node:http");
const { resolve, join } = require("node:path");
const { sendFallBack } = require("../../../utils/error-factory");
const { contentTypeHandlerFactory } = require("./controller/content-type.controller");
const { MULTIPART_HANDLER_CONSTANTS } = require("./model/multipart.handler");

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
    async processForm (req ,res , payload) {

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

        const [ contentType , contentTypePayload ] = contentTypeHeader.split(/; */) ;

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
            const { PAYLOAD_DATA_KEY } = MULTIPART_HANDLER_CONSTANTS.PAYLOAD_ARGUMENT_DATA_KEYS
            const formHandler = contentTypeHandlerFactory(contentType);
            await formHandler(req , res  , { [PAYLOAD_DATA_KEY]: contentTypePayload }); // #hardcode
        }
        catch (e) {
            console.log({e});
        }  
    }   

    /**
     * 
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     * @returns {Promise<void>} 
     */
    async renderer (req , res) {

        console.log('renderer');

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

    constructor () {

    }
}

const formHandler = new FormHandler ();

module.exports = { formHandler } ;


