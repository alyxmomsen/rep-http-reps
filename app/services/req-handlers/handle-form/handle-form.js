const { loggerFactory } = require("../../../../utils/logger");
const handleMultipartData = require("./utils/handlers/multipart-handler/multipart-handler");

const log = loggerFactory('handle form' , '-u');

async function handleForm (req , res) {

    const { headers } = req ;

    const contentTypeHeader = headers['content-type'] ;

    if(!contentTypeHeader) {
        log('y' , 'no header');
        res.writeHead(400);
        res.end();
        return ;
    }

    const [contentType , contentTypeAttrLike] = contentTypeHeader.split('; ');

    log('r' ,{contentType , contentTypeAttrLike});

    switch (contentType) {
        case 'multipart/form-data' :
            await handleMultipartData(req , res ,{boundaryRawStr:contentTypeAttrLike});
            return ;
        case 'application/x-www-form-urlencoded' :
            (f=>f)({});
            return ;
        case 'text/plain' :
            (f=>f)({});
            return ;
        default:
            // some handler
    }

    res.writeHead(400);
    res.end('unknown content-type');
    // res.end('text plain');
}

module.exports = handleForm ;