const { loggerFactory } = require("../../../../utils/logger");

const log = loggerFactory('handle form' , '-u');

function handleForm (req , res) {

    const { headers } = req ;

    const contentTypeHeader = headers['content-type'] ;

    if(!contentTypeHeader) {
        log('y' , 'no header');
        res.writeHead(400);
        res.end();
    }

    res.end();
}

module.exports = handleForm ;