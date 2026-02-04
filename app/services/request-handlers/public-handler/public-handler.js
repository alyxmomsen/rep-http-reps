const { readFile } = require("fs/promises");
const { join, resolve } = require("path");

async function publicHandler (req , res) {
    
    const { params , queryParams } = req; 

    if(!params) {
        res.writeHead(400);
        res.end('no params');
        return;
    }

    const { type , id } = params ;

    const rootPath = resolve(join('.' , 'app' , 'src' , 'public'));

    const router = {
        'css':{
            'main':join(rootPath , 'css' , 'main.css') ,
            'form':join(rootPath , 'css' , 'form.css') ,
        } ,
        'javascript':{
            'main':join(rootPath , 'javascript' , 'main.js'),
            'form':join(rootPath , 'javascript' , 'form.js'),
        }
    }

    const path = router[type]?.[id] ;

    if(!params) {
        res.writeHead(400);
        res.end('bad params');
        return;
    }

    console.log({path});

    try {
        const file = await readFile(path);
        res.end(file);
    }
    catch (e) {
        console.log({e});
        res.writeHead(500);
        res.end();
    }

}

module.exports = publicHandler ;