const { Readable } = require("stream");
const database = require("../../../../services/database");

async function getVideoStreamById (req , res) {
    
    const { params , queryParams } = req ;

    if(params === undefined) {
        res.writeHead(400);
        res.end('no params');
        return ;
    }

    const { id } = params ;
        
    const table = database.getTable('file');
    
    // console.log({table})

    if(!table) {
        res.writeHead(404);
        res.end('no table');
        return ;
    }
    
    const fileById = table.get(id);
    
    if(!fileById) {
        
        res.writeHead(404);
        res.end('no file by id');
        return ;
    }

    const fileBuffer = fileById.get('*').body;
    
    const rs = Readable.from(fileBuffer);
    res.writeHead(200 , 'ok' , {
        'content-type':fileById.get('*').contentType ,
    });
    rs.pipe(res);

    // console.log({fileById});

    return 
    res.end('nothing');
}

module.exports = getVideoStreamById ;