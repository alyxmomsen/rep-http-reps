const { randomBytes } = require("node:crypto");
const { filemanager } = require("../../../filemanager.service.js/filemanager.service");
const { dbControllersRouter } = require("../../../database-adapter/controller/db-adapter.controller");

async function onDataEndMiddleware(nextData, next) {

    const { multiTableAgent } = nextData ;

    console.log({nextData});

    return;
    
    const compiledGroups = multiTableAgent.__getGroups();
    for (const [tableName, groups] of Object.entries(compiledGroups)) {
        console.log(`\x1b[38;2;255;128;255mtable name: ${tableName}\x1b[0m`, );
        for (const [groupId , columns] of Object.entries(groups)) {
            console.log(`\x1b[38;2;128;255;255mgroup id: : ${groupId}\x1b[0m`, );
            for (const [columnName, colData] of Object.entries(columns)) {
                console.log(`\x1b[38;2;0;255;128mcolumn name: ${columnName}\x1b[0m`);

                const { fileName , fileMIME, fileBody } = colData;

                const dbConrollerModelName = tableName;
                const dbAdapter = dbControllersRouter.get(dbConrollerModelName);

                if(!dbAdapter) {
                    throw new Error(`no DB Adapter for <${dbConrollerModelName}> case`);
                }

                if(fileName || fileMIME) {
                    console.log(fileName, fileBody);
                    try {
                        const { error, success } = await filemanager.write(fileBody);
                        if(error) {
                            throw new Error(`fmanager error`);
                        }

                        const { filename } = success;

                        /* #warning
                            в database не реализовано динамичное создание id? 
                            исправить
                        */
                        const id = randomBytes(32).toString('hex');

                        const result = dbAdapter.createOne({
                            fileSystemFilename:filename,
                            originalFileName:fileName,
                            mime:fileMIME,
                        });

                        console.log({result});
                    }
                    catch (e) {
                        console.log(`\x1b[38;2;255;64;0m` + 'mwrong table name'.toUpperCase() + `\x1b[0m`);
                    }
                }

            }
    
        }
    }
    return compiledGroups;
}

module.exports = { onDataEndMiddleware }
