// _multipart-parser/middleware/on-data-end.mw.js

const { randomBytes } = require("node:crypto");
const { filemanager: defaultFilemanager } = require("../../filemanager.service.js/filemanager.service");
const { dbControllersRouter: defaultDbRouter } = require("../../database-adapter/controller/db-adapter.controller");

/**
 * Middleware для финальной обработки: сохранение файлов и запись в БД
 * @param {Object} deps - зависимости
 * @returns {Function} middleware
 */
module.exports = function onDataEndMiddleware(deps = {}) {
    const filemanager = deps.filemanager || defaultFilemanager;
    const dbRouter = deps.dbRouter || defaultDbRouter;
    
    return async (payload, next) => {
        const { multiTableAgent } = payload;
        const addedData = [];
        
        const compiledGroups = multiTableAgent.__getGroups();
        
        for (const [tableName, groups] of Object.entries(compiledGroups)) {
            console.log(`\x1b[38;2;255;128;255mtable name: ${tableName}\x1b[0m`);
            
            for (const [groupId, columns] of Object.entries(groups)) {
                console.log(`\x1b[38;2;128;255;255mgroup id: : ${groupId}\x1b[0m`);
                
                for (const [columnName, colData] of Object.entries(columns)) {
                    console.log(`\x1b[38;2;0;255;128mcolumn name: ${columnName}\x1b[0m`);
                    
                    const { fileName, fileMIME, fileBody } = colData;
                    const dbAdapter = dbRouter.get(tableName);
                    
                    if (fileName || fileMIME) {
                        console.log(fileName, fileBody);
                        
                        try {
                            const { error, success } = await filemanager.write(fileBody);
                            if (error) {
                                throw new Error(`fmanager error`);
                            }
                            
                            const { filename } = success;
                            const { error: dbAdapterError, success: dbAdapterSuccess } = dbAdapter.createOne({
                                fileSystemFilename: filename,
                                originalFileName: fileName,
                                mime: fileMIME,
                            });
                            
                            addedData.push({
                                id: dbAdapterSuccess?.newRowIdHash,
                            });
                            
                            console.log('data base adapter result', { dbAdapterSuccess, dbAdapterError });
                        } catch (e) {
                            console.log(`\x1b[38;2;255;64;0mwrong table name\x1b[0m`);
                        }
                    }
                }
            }
        }
        
        return await next({ success: { addedData } });
    };
};