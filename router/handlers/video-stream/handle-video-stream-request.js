const { createReadStream } = require("node:fs");
const { stat } = require("node:fs/promises");
require('dotenv').config()
const tempPath = process.env.TEMP_FILES_PATH;

console.log(process.env.TEMP_FILES_PATH);

async function handleVideoStreamRequest(req, res) {
    console.log(`call video stream handler...`);

    if (tempPath === undefined) {
        console.log(`500 internal error`);
        return;
    }

    const { headers } = req;

    const range = headers.range;

    if (range === undefined) {
        console.log(`no range`);
        return
    }

    try {


        // const files = await readdir(tempPath);

        // const newPath = files

        // const file = await readFile(tempPath);
        const filesize = (await stat(tempPath)).size;
        const [_start , _end] = range.replace(/bytes=/, '').split('-');
        const start = (
            _start !== undefined
            && _start !== ''
        ) ? Number.parseInt(_start, 10) : 0;
        const end = _end ? Number.parseInt(_end , 10) : filesize - 1;
    
        createReadStream(tempPath , {start , end}).pipe(res);
        return;
    }
    catch (error) {
        console.log({ error });
        console.log(`500 internal error`);
        return
    }

}

module.exports = handleVideoStreamRequest

async function pathUtil (path) {
    
    path.replace(/\\/g, (_ , piece) => {
        
    })

    return;
} 