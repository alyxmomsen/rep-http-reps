const { createReadStream } = require('fs');
const { stat } = require('fs/promises');
const { join } = require('path');

const filenames = [
    'dust.mp4' , 
    'chickens.mp4' ,
    'sunflower.mp4' ,
]

async function handlePartialContentRequest (req , res) {

    const filename = filenames[Math.floor(Math.random() * filenames.length)] ;
    const defaultVideoPath = join(`C:` , `Users` , `All Users` , `Ableton` , `Live 12 Suite` , `Resources` , `Max` , `resources` , `media` , `jitter`  , `${filename}`);

    console.log('partial content request handler');

    const rangeHeader =  req.headers.range ;

    try {

        if(rangeHeader === undefined || /bytes=[\d]+/.test(rangeHeader) === false) {
            res.end('internal error');
            return;
        }

        const stats = await stat(defaultVideoPath);

        const filesize = stats.size;

        const rangeparts = rangeHeader.replace('bytes='  ,'').split('-');

        const chunkSize = 100_000 ;

        const start = Number.parseInt(rangeparts[0] , 10);

        
        let end = rangeparts[1] 
            ? Number.parseInt(rangeparts[1]) 
            : Math.min(start + chunkSize - 1, filesize - 1);

        console.log({start , end , rangeparts});

        const currentChunckSize = end - start + 1 ;

        console.log('rangeparts' , rangeparts);

        res.writeHead(206 , 'partial content'  , {
            'accept-ranges': 'bytes' , 
            'Content-Length':`${currentChunckSize}` ,
            'content-range':`bytes ${start}-${end}/${filesize}` ,
            'content-type':'video/mp4',
        });

        createReadStream(defaultVideoPath , {
            start ,
            end ,
        }).pipe(res);
        return ;
    }
    catch (e) {
        return ;    
    }
    
} 

module.exports = handlePartialContentRequest ;