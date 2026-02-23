const { Readable } = require("node:stream");
const { filemanager } = require("../../../../services/file-manager/file-manager");
const { DBControllerFactory } = require("../../../../services/database/controller/dbcontr");

async function handleStream (req , res) {
    
    const { headers , params } = req ;

    const { range } = headers ;

    if(!params) {
        res.writeHead(400);
        res.end(JSON.stringify({message:'no params'}));
        return ;
    }

    const { id:rowId } = params ;

    const dbController__files  = DBControllerFactory("FILES");

    const { error , success } = dbController__files.readRow(rowId);

    if(error) {
        console.log({error});
        res.writeHead(500);
        res.end(JSON.stringify({message:'internal error'}));
        return ;
    }

    const { row } = success || {} ;

    const { FSFilename } = row || {} ;

    if(!FSFilename) {

        res.writeHead(500);
        res.end(JSON.stringify({message:'internal error'}));
        return ;
    }

    const { error:filemanagerError , success:filemanagerSuccess } = await filemanager.read(FSFilename);
    
    if(filemanagerError) {
        
        res.writeHead(400);
        res.end(JSON.stringify({message:'no file by id'}));
        return ;
    }

    if(!range) {
        
        res.writeHead(400);
        res.end(JSON.stringify({message:'no range'}));
        return ;
    }

    res.writeHead(200  ,'ok' , {
        'content-type' : /* filelike.mime */'video/x-matroska' ,
    });
    const rs = Readable.from(/* filelike.file */filemanagerSuccess.file);
    rs.on('data' , (chunk) => {
        console.log({chunk});
    })
    rs.on('error' , (err) => {
        console.log({err});
    })
    rs.pipe(res);
}

module.exports = handleStream ;