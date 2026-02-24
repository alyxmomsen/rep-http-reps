
const { join, resolve, extname } = require("path");
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
                'video-stream':'video-stream.css' ,
            }
        } ,
        'javascript': {
            path:join(publicDir , 'js') ,
            filemap: {
                'main':'main.js' ,
                'form':'form.js' ,
                'video-stream':'video-stream.js' ,
                'rq-router':'request-router.js',
            }
        } ,
        'picture': {
            path:join(publicDir , 'pictures') ,
            filemap: {
                'default':'preloader-1.gif' ,
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

    const extn = extname(filepath);

    console.log(((extn && (extn === '.gif') && {'content-type':'image/gif'}) || {}));

    try {
        const file = await readFile(filepath);
        log('g' , `${type}/${id}`, ': ' , 'successfully');
        res.writeHead(200 , 'ok', {
            ...((extn && (extn === '.gif') && {'content-type':'image/gif'}) || {})
        });
        res.end(file);
    }
    catch (e) {
        log('r' , {e});
        res.writeHead(500);
        res.end();
    }
}

module.exports =  handlePublic ;