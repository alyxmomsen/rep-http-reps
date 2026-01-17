const { createReadStream } = require("fs");
const { stat } = require("fs/promises");
const { join } = require("path");

const testVideoFilePath = join('C:', 'Users', 'user', 'Videos', '1g33JJ33roO5qbaw.mp4');

async function handleVideoStream(req, res) {
    
    console.log('handle video stream start');
    
    const { headers } = req;

    const rangeLike = headers.range;

    try {

        const stats = await stat(testVideoFilePath);
        const filesize = (stats).size;
        const { start, end } = await fetchRanges(rangeLike , filesize);
        const statusCode = 206;
        const statusMessage = 'partial content';
        const resHeaders = {
            'content-type': 'video/mp4',
            'content-length': `${end - start + 1}`,
            'content-range': `${start}-${end}/${filesize}`,
            'accepte-ranges':`bytes`,
        };

        res.writeHead(statusCode , statusMessage , resHeaders);
        createReadStream(testVideoFilePath , {start ,end}).pipe(res);

    }
    catch (e) {
        console.log('handle video stream error; ', e);
        res.end('internal error');
        return;
    }


}

module.exports = handleVideoStream;

async function fetchRanges(rangeLike , filesize) {
    
    if (rangeLike === undefined) throw new Error('no range  header');

    const [start , end] = rangeLike.replace(/bytes=/ , '').split('-');

    if (start === '') {
        throw new Error('no start range');
    }

    return {
        start: Number.parseInt(start), 
        end:end ? Number.parseInt(end): filesize - 1 ,
    }
}
