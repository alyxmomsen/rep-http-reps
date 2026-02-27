const { IncomingMessage, ServerResponse } = require("node:http");
const { fomrHandlers, CONSTANTS } = require("./controller/form-handlers-controller");

/**
 * 
 * @param {IncomingMessage} req 
 * @param {ServerResponse} res 
 */
async function handleForm(req , res) {

    const { headers } = req; 

    const contentTypeHeader = headers['content-type'] || null ;

    if(!contentTypeHeader) {
        
        res.writeHead(400 , 'bad request' , {
            "content-type":'application/json' ,
        });
        res.end(JSON.stringify({
            message:'no content type header' ,
        }));
        return ;
    }
    
    const [contentType , contentTypeAttribute] = contentTypeHeader.split(/;\s*/);
    
    console.log({contentType , contentTypeAttribute});
    
    if(!contentType) {
        res.writeHead(400 , 'bad request' , {
            "content-type":'application/json' ,
        });
        res.end(JSON.stringify({
            message:'content-type is not provided' ,
        }));
        return ;
    }
        
    const handler = fomrHandlers.get(contentType);
    
    if(!handler) {
        
        res.writeHead(500 , 'internal error' , {
            "content-type":'application/json' ,
        });
        res.end(JSON.stringify({
            message:'no handler to this form content-type' ,
            subjects:{contentType} ,
        }));
        return ;
    }

    const { success , error } = await handler(req , res , { boundaryRawString:contentTypeAttribute });

    console.log('FORM HANDLER; ' , { success , error });
}

module.exports = { handleForm }