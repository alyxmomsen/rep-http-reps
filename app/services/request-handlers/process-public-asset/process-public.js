const { readFile } = require('fs/promises');
const { join, resolve:pathResolve } = require('path');
async function processPublic(req , res) {

    const { params , queryParams } = req; 
    
    if(!params) {
        res.writeHead(400);
        res.end('no params');
        return ;
    }

    const { type , id} = params

    const publicDir = pathResolve(join('.' , 'app' , 'public'));

    const files = {
        'css':{
            'main':join('css' , 'main.css') ,
            'form':join('css' , 'form.css') ,
        },
        'javascript':{
            'main':join('javascript' , 'main.js') ,
            'form':join('javascript' , 'form.js') ,
        }
    }

    const relpath = files[type]?.[id] ;

    if(!relpath) {
        res.writeHead(400);
        res.end('incorrect params');
        return ;
    }

    const fullPath = join(publicDir , relpath);

    try {

        const file = await readFile(fullPath);
        res.end(file);
    }
    catch (e) {
        console.log({e});
    }

    res.end();
}

module.exports = processPublic ;