const { readFile } = require('fs/promises');

require('fs');
async function _serveResponseFile(res , path) {
    
    const fallbackmessage = ''

    try {

        const file = await readFile(path , 'utf-8');
        res.end(file);
    }
    catch (e) {
        console.log(fallbackmessage + ' error : ', e)
    }

}

module.exports = _serveResponseFile ;