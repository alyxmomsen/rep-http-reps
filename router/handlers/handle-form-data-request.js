
const { join } = require('path');
const loadPublicSourceUtil = require("./public-handlers/load-public-source.util.");

const htmlpath = join('.' , 'public' , 'html' , 'form.html');

const bufferDataParts = [];

async function handleform (req , res) {

    const {headers} = req ;
    const contentTypeHeaderData = headers['content-type'];

    const matchers = [
        await matcherFactory(/multipart\/form-data/ , handleMultipart) ,
    ];

    req.on('data' , async (chunk) => {

        await handleRequestData (chunk , bufferDataParts ) ;
    });

    req.on('end' , async () => {

        await handleRequestEnd(matchers  , bufferChunks , contentTypeHeaderData);

    });

    
    loadPublicSourceUtil(req ,res , htmlpath , (e) => {
        console.log('handle form error' , e);
    });
}

module.exports = handleform ;

async function handleRequestData (chunk , bufferDataParts) {
    
    bufferDataParts.push(chunk);

}

async function handleRequestEnd (matchers , bufferChunks , contentTypeHeaderData) {

    for (const matcher of matchers) {

        const handlerLike = matcher(contentTypeHeaderData);
        
        if(handlerLike === null) continue ;
        
        const handler = handlerLike ;
        
        await handler(bufferChunks);
        
        return ;
    }

}

async function matcherFactory (regex , handler) {

    return (contentTypeHeaderData) => {

        const match = regex.exec(contentTypeHeaderData);

        if(match === null) return null;

        return async (formData) => {

            handler(contentTypeHeaderData , formData);
        }
    }
}

async function handleMultipart (contentTypeHeaderData , formData) {
    console.log(contentTypeHeaderData , formData);
}