
require('fs');
const matcherFactoryDecorator = require("../utils/matcher-factory");
const handleMultipartData = require("./multipart-form-data/handle-multipart-data");
const extractBoundaryDecorator = require('./multipart-form-data/utils/decorators/get-boundary-decorator');
const handleTextPlainData = require('./text-plain-handler/handle-text-plain-data');
const handleAppUrlEncoded = require('./url-x-www-form-handler/handle-app-urlencoded-data');

async function handleFormData (req , res) {

    const { method , url , headers } = req ;
    
    const contentTypeHeaderString = headers['content-type'] ;

    if(contentTypeHeaderString === undefined) {
        send_fallback(res ,400 , 'bad' , 'no content type header');
        return ;
    }
    
    const [contentType] = contentTypeHeaderString.split('; ');
    
    if(contentType === undefined) {
        send_fallback(res ,400 , 'bad' , 'content-type header has no content-type data');
        return ;
    }

    const matcherFactory = await matcherFactoryDecorator(contentType);

    const contentTypeMatchers = [
        await matcherFactory(
            'multipart/form-data' , 
            await extractBoundaryDecorator(handleMultipartData , contentTypeHeaderString)
        ) ,
        await matcherFactory('application/x-www-form-urlencoded' , handleAppUrlEncoded) ,
        await matcherFactory('text/plain' , handleTextPlainData) ,
    ] ;

    const bufferDataParts = [] ;
    req.on('data' , (bufferChunk) => {
        bufferDataParts.push(bufferChunk);
    });

    req.on('end' , async () => {

        const wholeBufferData = Buffer.concat(bufferDataParts);

        for (const matcher of contentTypeMatchers) {
    
            const handlerLike = await matcher() ;
            if(handlerLike === null) continue ;
            handlerLike(req , res ,  wholeBufferData);
            return ;
        }
        
        res.end('have not matchers');
    });

}

module.exports = handleFormData ;

async function extractBoundary(params) {
    
}

async function send_fallback(res , statusCode , statusMessage = '' , message = '') {
    
    res.writeHead(
        statusCode ,
        statusMessage ,
        {
            'content-type':'text/plain' ,
        }
    );
    res.end(message);
}