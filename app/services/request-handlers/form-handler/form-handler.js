const multipartTypeHandler = require("./sub-handlers/content-type/multipart-handler");

async function formhandler(req ,res) {
    
    const { headers } = req ;

    const contentTypeHeader = headers['content-type'];

    if(!contentTypeHeader) {
        res.writeHead(400);
        res.end('bad request');
        return;
    }

    const [contentType , contentTypeAttr ] = contentTypeHeader.split('; ') ;

    // console.log({contentType});

    switch (contentType) {

        case 'multipart/form-data':
            return multipartTypeHandler(req  ,res , {contentTypeAttr});
            break ;
        case 'multipart/form-data':
            return textplainTypeHandler();
            break ;
        case 'multipart/form-data':
            return applicationXWWWFormdataTypeHandler();
            break ;
        default:
            // handle default
    }

    res.writeHead(400);
    res.end('no content type data');

}

module.exports = formhandler ;


// content-type handlers

async function textplainTypeHandler(params) {
    
    return ;
}
async function applicationXWWWFormdataTypeHandler(params) {
    
    return ;
}
