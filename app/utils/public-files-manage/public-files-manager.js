const { readFile } = require('fs/promises');
const { join } = require('path');
async function processPublicFile (req , res) {
    const {params:{type , id}} = req; 

    const resolve = {
        'css': {
            'main':{
                filepath:join('css' , 'main.css') ,
            }
        } , 
        'javascript' : {
            'main':{
                filepath:join('javascript' , 'main.js') ,
            } , 
            'form':{
                filepath:join('javascript' , 'form.js') ,
            } , 
        }
    }

    const resolved = resolve[type]?.[id] ;
    
    if(!resolved) {
        res.writeHead(500);
        res.end();
        return ;
    }
    
    const { filepath } = resolved ;

    const filepathFull = join('.' , 'public' , filepath);

    try {
        const file =  await readFile(filepathFull);
        res.end(file);
    }
    catch (e) {
        console.log({e});
        res.writeHead(500);
        res.end();
    }
}

module.exports = processPublicFile ;