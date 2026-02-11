// const {} = require('');

const handleTheMultipartContentTypeData = require("./utils/handle-multi-part/handle-multipart");

const logPrefix = 'form handler: '.toUpperCase();
async function handleForm(req, res) {

    console.log(logPrefix , 'start');
    
    const { headers } = req ;

    const contentTypeHeader = headers['content-type'] ;

    if(!contentTypeHeader) {
        res.writeHead(400);
        res.end();
        return ;
    }

    const [ contentType , contentTypeAttr ] = contentTypeHeader.split('; ') ;

    const chunks = [] ;

    switch (contentType) {
        case 'multipart/form-data':
            await handleTheMultipartContentTypeData(req , res , {contentTypeAttr});
            return ;
        case 'text/plain':
            f=>f
            return ;
        case 'application/x-www-form-urlencoded':
            f=>f
            return ;
    }

}


module.exports = handleForm ;