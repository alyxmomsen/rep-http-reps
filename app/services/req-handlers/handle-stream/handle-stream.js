const { Readable } = require("node:stream");
const { dbController } = require("../../../../services/database/controller/db-controller");
const { filemanager } = require("../../../../services/file-manager/file-manager");

async function handleStream (req , res) {
    
    const { headers , params } = req ;

    const { range } = headers ;

    if(!params) {
        res.writeHead(400);
        res.end(JSON.stringify({message:'no params'}));
        return ;
    }

    const { id:rowId } = params ;

    const { error , success } = await dbController.execTransaction( 'READ' , 'FILES' , {rowId});

    console.log('video stream' , {error , success , rowId});

    if(error) {
        return {
            error ,
        }
    }

    const { filename } = success.row || {} ;

    if(!filename) {

        res.writeHead(500);
        res.end(JSON.stringify({message:'internal error'}));
        return ;
    }

    const { error:filemanagerError , success:filemanagerSuccess } = await filemanager.read(filename);
    
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