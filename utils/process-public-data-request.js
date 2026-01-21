const { readFile } = require("node:fs/promises");

async function processPublicDataRequest(res , path) {
    
    try {
        const file = await readFile(path);
        res.end(file);
    }
    catch (error) {
        console.log('process public data error' , {error});
    }
}

module.exports = processPublicDataRequest;