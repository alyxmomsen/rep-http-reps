const { readFile } = require("node:fs/promises");
const { resolve:pathResolve, join } = require("node:path");

async function processAssetRequest(req ,res , fileRelativePath) {
    
    const assetsDir = pathResolve(join('.' , 'app' , 'assets'));

    try {
        const file = await readFile(join(assetsDir , fileRelativePath));
        res.writeHead(200 , 'ok' ,{
            'content-type':'text/html' ,
        });
        
        res.end(file);
    }
    catch(e) {
        console.log({e});
    }
}

module.exports = processAssetRequest ;