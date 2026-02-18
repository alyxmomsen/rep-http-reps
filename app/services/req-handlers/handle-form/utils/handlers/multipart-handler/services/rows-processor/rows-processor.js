const { createFile } = require("../../../../../../../../../services/database/controller/database-controller");
const { loggerFactory } = require("../../../../../../../../../utils/logger");
const log = loggerFactory('group processor' , '-u');
class GroupProccessor {

    sendResponse(res) {

        res.writeHead(200);
        res.end(JSON.stringify({foo:'bar'}));
    }

    async execute(tablename , payload , callback) {
        const tableNameHandlers = this.#routes.get(tablename);

        for (const handler of tableNameHandlers) {
            await handler(payload);
        }
    }

    addRouteHandler (tableName , handler) {

        const tableNameRoutes =  this.#routes.get(tableName);
        if(!tableNameRoutes) {
            this.#routes.set(tableName , [handler])
            return ;
        }

        tableNameHandler.push(handler);
    }

    #routes;

    constructor () {
        this.#routes = new Map() ;
    }
}

const groupsprocessor = new GroupProccessor();

groupsprocessor.addRouteHandler('files' , async (row) => {

    const addedFiles=  [] ;

    const { title , description , file , filename } = row ;
    
    console.log('files handler'.toUpperCase() , {row: row});

    if(!file?.value?.length) {
        log('r' , 'file have not data')
        return ;
    }

    const addedFile = await createFile({
        description:description?.value?.toString() || null , 
        originalFilename:filename?.value?.toString() || null , 
        title:title?.value?.toString() || null ,
        file:file?.value , mime:file?.contentType ,
        // filename:
    });

    console.log({addedFile});

    if(!addedFile) {
        console.log('\x1b[38;2;255;0;255mfile is not added\x1b[0m');
        return;
    }
    
    addedFiles.push(addedFile)

    console.log('files handler'.toUpperCase());
});

groupsprocessor.addRouteHandler('users' , (row) => {

    const {} = row ;

    console.log('users handler'.toUpperCase() , {row});
});


module.exports = groupsprocessor ;