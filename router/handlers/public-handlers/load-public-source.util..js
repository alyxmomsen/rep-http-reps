const { readFile } = require('fs/promises');

async function loadPublicSourceUtil (req , res , path , fallback = f => f) {

    try {
        const file = await readFile(path , 'utf-8');

        res.end(file)
        return file ;
    }
    catch (e) {

        fallback(e);
        res.end('internal error. no file');
        return null ;
    }
}

module.exports = loadPublicSourceUtil;

