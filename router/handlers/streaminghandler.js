const { createReadStream } = require('fs');
const { stat } = require('fs/promises');
const { extname } = require('path');
const { join } = require('path');

const hardcodevideopath = join('C:' ,'Users' ,'AnturNevut' ,'Videos' , '2025-08-16 21-28-43.mkv');
const contentTypeUtil = {
    '.mkv':'video/mkv' ,
    '.mp4':'vidoe/mp4' ,
}

async function handleStreamRequest(req , res) {
    
    const _path = hardcodevideopath ;

    const {headers , url , method } = req ;

    console.log('handle stream');

    try {
        const stats = await stat(_path);
        const filesize = stats.size ;
        
        const range = headers.range ;

        console.log({range})

        if(range === undefined) {
            console.log('range is undefined ...');
            res.writeHead(200, 'ok' , {
                'content-type':'video/mkv' ,
            });
            createReadStream(_path).pipe(res);
            return ;
        }

        const rangeParts = range.replace('bytes=' , '').split('-');
        
        const chunkSizeMax = 500_000 ;
        const startRange = Number.parseInt(rangeParts[0]) ;

        console.log(startRange + chunkSizeMax , filesize);
        const endRange = rangeParts[1] 
            ? (startRange + chunkSizeMax) >= filesize ? Number.parseInt(rangeParts[1]) : (startRange + chunkSizeMax - 1)
            : (startRange + chunkSizeMax) >= filesize ? filesize - 1 : (startRange + chunkSizeMax - 1) ;

        const chunksize = endRange - startRange + 1 ;

        console.log({startRange , endRange , chunksize});
        res.writeHead(206 , 'partial content' , {
            'content-type':/* contentTypeUtil[ext] || */ 'video/mkv' ,
            'content-length':`${chunksize}` ,
            'content-range':`bytes ${startRange}-${endRange}/${filesize}` ,
            'accept-ranges':'bytes ' ,
        });
        createReadStream(_path , {
            start:startRange , 
            end:endRange ,
        }).pipe(res);

        return ;

    }
    catch (e) {
        console.log('errrrrrooooorrrr' , e);
    }


    
}

module.exports = handleStreamRequest ;

async function _stream (res , path , start , end , filesize) {
    
    const ext = extname(path) ;

    const chunksize = end - start + 1 ;

    console.log({start , end});

    

}