const { readFile } = require("node:fs/promises");
const { resolve, join } = require("node:path");

const logPrefix = 'handle asset: ';

async function handleAsset (req, res , type , id) {
    
    console.log(logPrefix , 'start');

    const { params , queryParams } = req ;

    if(!params) {
        // throw new Error('no params given');
        console.log(logPrefix , 'no params object'.toUpperCase());
        res.writeHead(500);
        res.end();
        return ;
    }

    if(!type || !id) {
        // throw new Error('no "id"|"type" params ');
        console.log(logPrefix , 'no "id"|"type" params'.toUpperCase());
        res.writeHead(500);
        res.end();
        return ;
    }
    
    const assetsDir = resolve(join('.' , 'app' , 'src' , 'assets')) ;
    
    const filerouter = {
        'html':{
            'form':{
                subPath:'html', 
                filename:'form.html' ,
                contentType:'text/html'
            } ,
        } ,
    }
    
    const resolved = filerouter[type]?.[id] ;
    
    if(!resolved) {
        console.log(logPrefix , 'smth wrong with resolver'.toUpperCase());
        res.writeHead(500);
        res.end();
        return ;
    }

    const { subPath , filename , contentType } = resolved ;

    const path = join(assetsDir , subPath , filename);

    try {

        const assetFile = await readFile(path);

        res.writeHead(200 , 'ok' ,{
            'content-type':contentType ,
        });
        res.end(assetFile);

    }
    catch(e) {

        res.writeHead(500);
        res.end('smth wrong');
    };

    

}

module.exports = handleAsset ;