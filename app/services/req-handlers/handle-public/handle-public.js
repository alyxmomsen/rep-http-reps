
const { join, resolve } = require("path");
const { loggerFactory } = require("../../../../utils/logger");
const { readFile } = require("fs/promises");

const log = loggerFactory('handle public' , '-u');

async function handlePublic (req , res) {
    
    const { params } = req ;
    
    if(!params) {
        res.writeHead(500);
        res.end();
        return ;
    }
    
    const { type , id } = params ;
    
    if(!type || !id) {
        res.writeHead(400);
        res.end();
        return ;
    }
    
    log('def' , {type , id});
    
    const publicDir = resolve(join('.' , 'public')) ;
    
    const typerouter =  {
        'css': {
            path:join(publicDir , 'css') ,
            filemap: {
                'main':'main.css' ,
                'form':'form.css' ,
            }
        } ,
        'javascript': {
            path:join(publicDir , 'js') ,
            filemap: {
                'main':'main.js' ,
                'form':'form.js' ,
                'video-stream':'video-stream.js' ,
            }
        } ,
    }
    
    const {path , filemap} = (typerouter[type] || {}) ;

    if(!path || !filemap) {
        res.writeHead(400);
        log('y' , 'incorrect type' , type);
        res.end();
        return ;
    }
    
    const filename = filemap[id] ;
    
    if(!filename) {
        res.writeHead(400);
        log('y' , 'incorrect id' , id);
        res.end();
        return ;
    }

    const filepath = join(path , filename) ;

    try {
        const file = await readFile(filepath, 'utf-8');
        log('g' , `${type}/${id}`, ': ' , 'successfully');
        res.writeHead(200);
        res.end(file);
    }
    catch (e) {
        log('r' , {e});
        res.writeHead(500);
        res.end();
    }
}

module.exports =  handlePublic ;