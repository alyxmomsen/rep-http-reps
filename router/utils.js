const fs = require('fs');
const { readFile } = require('fs/promises');
const { extname } = require('path');
async function _sendPublicFile (res , path) {

    const contentType =  {
        '.html': 'text/html' ,
        '.css': 'text/css' ,
        '.js': 'text/javascript' ,
    }

    try {

        const ext = extname(path) ;

        console.log({ext});

        const file = await readFile(path);
        res.writeHead(200 , 'ok' , {
            'content-type':contentType[ext] || 'text/plain'
        });
        res.end(file);
        return 0;
    }
    catch (e) {
        console.log('read file error: ' , e);
        return 1 ;
    }

}

module.exports = _sendPublicFile ;