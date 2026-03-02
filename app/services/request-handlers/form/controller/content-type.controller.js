const { IncomingMessage, ServerResponse } = require("node:http");
const { multipartHandler, CONSTANTS } = require("../model/multipart.handler");
const { errorFactory } = require("../../../../utils/error-factory");
const { textPlainHandler , CONSTANTS:TEXTPLAIN_HANDLER_CONSTANTS } = require("../model/text-plain.handler");

const conentTypeHandlersRouter = new Map() ;

const insertHandlerBundle = (handler  , payloadDataKey ) => {

    return {
        handler:handler ,
        payloadDataKey:payloadDataKey ,
    }
}

conentTypeHandlersRouter.set('multipart/form-data' , insertHandlerBundle(
    multipartHandler , CONSTANTS?.PAYLOAD_DATA_KEY || null
));
// conentTypeHandlersRouter.set('multipart/form-data' , {
//     handler:textPlainHandler , payloadDataKey:TEXTPLAIN_HANDLER_CONSTANTS?.PAYLOAD_DATA_KEY || null ,
// });
// conentTypeHandlersRouter.set('multipart/form-data' , multipartHandler);

/**
 * 
 * @param {string} contentType
 * @returns {((req:IncomingMessage , res:ServerResponse , payload:Object) => Promise<any>)} 
 */
function contentTypeHandlerFactory (contentType) {
    const handlerBundle = conentTypeHandlersRouter.get(contentType);
    if(!handlerBundle) throw new Error(JSON.stringify(errorFactory(
        'contentTypeHandlerFactory', 
        'unknown contenttype' ,
        {contentType} ,
    )))
    return handlerBundle ;
}

module.exports = { contentTypeHandlerFactory } 

// /**
//  * @param {string} contentType 
//  */
// function addContentType (contentType) {
//     return conentTypeHandlersRouter.set()
// }