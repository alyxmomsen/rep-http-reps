const { Readable } = require("node:stream");
const { filemanager } = require("../../../../services/file-manager/file-manager");
const { loggerFactory } = require("../../../../utils/logger");
const { DBControllerFactory } = require("../../../../services/database/controller/db-controller");
const { DB_CONSTANTS } = require("../../../../services/database/database");
// const { DB_TABLES_FIELDNAMES } = require("../../../../services/database/controller/behaviors/strategies");
const log = loggerFactory('handle stream' , '-u');

async function handleStream (req , res) {
    
    const { headers , params } = req ;

    const { range } = headers ;

    if(!params) {
        res.writeHead(400);
        res.end(JSON.stringify({message:'no params'}));
        return ;
    }

    const { id:rowId } = params ;

    const dbController__files  = DBControllerFactory(DB_CONSTANTS.tables.FILES.tablename);
    
    const { error , success } = dbController__files.readRow(rowId);
    log('r' , {rowId});
    
    if(error) {
        console.log({error});
        res.writeHead(500);
        res.end(JSON.stringify({message:'internal error'}));
        return ;
    }


    const row = success[DB_CONSTANTS.SUCCESS.keys.ROW] ; // !! need to refactor 

    // const { FILE } = DB_TABLES_FIELDNAMES ;

    const filename = row[DB_CONSTANTS.tables.FILES.keys.FILESYSTEM_FILENAME] || {} ;

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