const { IncomingMessage, ServerResponse } = require("node:http");
const { multipartHandler } = require("../model/multipart.handler");
const { errorFactory } = require("../../../../utils/error-factory");

const conentTypeHandlersRouter = new Map() ;

conentTypeHandlersRouter.set('multipart/form-data' , multipartHandler);

/**
 * 
 * @param {string} contentType
 * @returns {((req:IncomingMessage , res:ServerResponse , payload:Object) => Promise<any>)} 
 */
function contentTypeHandlerFactory (contentType) {
    const handler = conentTypeHandlersRouter.get(contentType);
    if(!handler) throw new Error(JSON.stringify(errorFactory(
        'contentTypeHandlerFactory', 
        'unknown contenttype' ,
        {contentType} ,
    )))
    return handler ;
}

module.exports = { conentTypeHandlersRouter , contentTypeHandlerFactory } 

// /**
//  * @param {string} contentType 
//  */
// function addContentType (contentType) {
//     return conentTypeHandlersRouter.set()
// }