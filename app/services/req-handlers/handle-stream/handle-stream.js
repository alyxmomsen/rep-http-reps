const { Readable } = require("node:stream");
const { dbController } = require("../../../../services/database/controller/db-controller");

async function handleStream (req , res) {
    
    const { headers , params } = req ;

    const { range } = headers ;

    if(!params) {
        res.writeHead(400);
        res.end(JSON.stringify({message:'no params'}));
        return ;
    }

    const { id } = params ;
    dbController.getRow('files' , null , res);
    const filelike = false && 'await readFileById(id)';
    
    if(!filelike) {
        
        res.writeHead(400);
        res.end(JSON.stringify({message:'no file by id'}));
        return ;
    }

    if(!range) {
        
        res.writeHead(400);
        res.end(JSON.stringify({message:'no range'}));
        return ;
    }

    console.log();
    res.writeHead(200  ,'ok' , {
        'content-type' : filelike.mime
    });
    const rs = Readable.from(filelike.file);
    rs.on('data' , (chunk) => {
        console.log({chunk});
    })
    rs.pipe(res);
}

module.exports = handleStream ;