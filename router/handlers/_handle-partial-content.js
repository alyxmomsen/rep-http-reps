require('fs');

const { readFile, stat } = require('fs/promises');
const _Registry = require("../../services/registry");
const { join } = require('path');
const { createReadStream } = require('fs');

async function _handlePartialContent(req , res , registry) {


    const params = req.params ;

    const range = req.headers.range ;

    if(range === undefined) {

        res.writeHead(400 , 'bad request' , {
            'content-type':'text/plain' ,
        });
        res.end('bad request; no range');
        return ;
    }
    
    if(registry instanceof _Registry === false) {
        res.writeHead(500 , 'internal server error' , {
            'content-type':'text/plain' ,
        });
        res.end('internal server error: no _Registry');
        return ;
    }
    
    if(params === undefined) {
        
        res.writeHead(400 , 'bad request' , {
            'content-type':'text/plain' ,
        });
        res.end('no video id');
        return ;
    }

    const itemLike = await registry.getItemById(params.id);
    console.log('hello world' , params.id , itemLike);

    if(itemLike === null) {
        res.end('no item');
        return;
    }


    try {

        const stats = await stat(join('.' , itemLike.path , itemLike.filename));

        // console.log({stats});


        const readStream = createReadStream(join('.' , itemLike.path , itemLike.filename));

        const rangeParts = range.replace('bytes=' , '').split('-');

        const filesize = stats.size ;

        const start = Number.parseInt(rangeParts[0]) ;
        const end = rangeParts[1] ? Number.parseInt(rangeParts[1]) : filesize - 1;
        
        const chunkSize = end - start + 1 ;

        console.log({start , end});

        res.writeHead(206 , 'partial content' , {
            'content-type': 'video/mkv' ,
            'content-length':`${chunkSize}` ,
            'content-range':`bytes ${start}-${end}/${filesize}` ,
            'accept-ranges':`bytes` ,
        });
        readStream.pipe(res);

        return ;
    }
    catch(e) {

        console.log('read file error: ' , e);
    }

    res.end('');
    
}

module.exports = _handlePartialContent ;