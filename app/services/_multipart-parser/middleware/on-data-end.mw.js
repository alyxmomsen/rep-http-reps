// _multipart-parser/middleware/on-data-end.mw.js

const { randomBytes } = require("node:crypto");
// const { filemanager } = require("../../filemanager.service.js/fmanager.controller");
const { filemanager: defaultFilemanager } = require("../../filemanager.service.js/fmanager.controller");
const { FileManager } = require("../../filemanager.service.js/filemanager.service");
const { dbControllersRouter: defaultDbRouter, dbControllersRouter } = require("../../database-adapter/controller/db-adapter.controller");
const { DBAdapter } = require("../../database-adapter/models/db-adapter.model");

/**
 * Middleware для финальной обработки: сохранение файлов и запись в БД
 * @param {{
 *  filemanager:FileManager;
 *  dbRouter:Map<string,DBAdapter>;
 * }} deps - зависимости
 * @returns {Function} middleware
 */
module.exports = function onDataEndMiddleware(deps = {}) {
    const filemanager = deps.filemanager || defaultFilemanager;
    const dbRouter = deps.dbRouter || defaultDbRouter;

    // ============== define variables to transactions ============== 

    /**
     * @type {Map<string,any>}
     */
    const transactions = new Map();
    /**
     * @type {Array<Object>}
     */
    const failedLinksFiles = [];

    // linkId:linkId.data,
    // tableName,
    // rowId:newRowIdHash,
    /**
     * @type {Array<{
     *  linkId:string;
     *  tableName:string;
     *  rowId:string;
     * }>}
     */
    const links = [];


    // ==============================================================

    return async (payload, next) => {
        
        const { mergedGroups } = payload;
        
        if(mergedGroups === undefined) {
            throw new Error('onDataEndMiddleware: required compiled groups but not given');
        }

        // for (const [k, v] of Object.entries(mergedGroups.files)) {
        //     console.log({k});
        //     for (const [kk, vv] of Object.entries(v)) {
        //         console.log({kk, vv});
        //     }
        // }

        const addedData = [];

        // сначала файлы, потому что для БД нужны автоматические имена файлов в файловой системе
        
        for (const [tableName, groups] of Object.entries(mergedGroups.files)) {
            console.log(`\x1b[38;2;255;128;255mtable name: ${tableName}\x1b[0m`);

            // получаем db-controller
            const dbController = dbRouter.get(tableName);
            if(dbController === undefined) {
                console.log(`on-data-end middleware: is not resieved db controller by tableName ${tableName}`.toUpperCase());
                throw new Error(`on-data-end middleware: is not resieved db controller by tableName ${tableName}`.toUpperCase());
            }

            for (const [groupId, columns] of Object.entries(groups)) {
                console.log(`\x1b[38;2;128;255;255mgroup id: : ${groupId}\x1b[0m`);

                const { originalFileName, mime, file, linkId } = columns;

                // =================================================
                // =================== валидатор ===================
                
                // validate with link
                if(!linkId) {
                    // скипаем группу, потому-что не имеет смысла сохранять файл без ссылки на него
                    failedLinksFiles.push({
                        message:'link is not received',
                        data:{...columns} // просто копирую для разрыва ссылки на объект
                    });
                    console.log(`\x1b[31b` + `link is not received`.toUpperCase() + `\x1b[0b`);
                    continue;
                }

                if(!linkId.data) {
                    throw new Error(`on-data-end middleware: incorrect link id`);
                }

                // validate with file must be received
                if(file === undefined) {
                    failedLinksFiles.push({
                        message:'file is not received',
                        data:{...columns} // просто копирую для разрыва ссылки на объект
                    });
                    console.log(`\x1b[31b` + `file is not received`.toUpperCase() + `\x1b[0b`);
                    continue
                }

                if(file instanceof Buffer === false) {
                    failedLinksFiles.push({
                        message:'file is not Buffer',
                        data:{...columns} // просто копирую для разрыва ссылки на объект
                    });
                    console.log(`\x1b[31b` + `file is not Buffer`.toUpperCase() + `\x1b[0b`);
                    continue
                }

                // =================== валидатор ===================
                // =================================================

                // =================================================
                // ================ transaction start ==============

                // пробуем сохранять файл и получаем его автоматическое имя-хеш
                const { success, error } = await filemanager.write(file);

                // console.log({originalFileName, mime, file, linkId , filemanager:{success, error}});

                if(error) {
                    // откат
                }

                if(!success) {
                    // откат
                }

                const { filename:fileSystemFilename } = success;
                
                // db controller

                const { error:dbError, success:dbSuccess } = dbController.createOne({
                    fileSystemFilename:{
                        data:fileSystemFilename,
                        dataType:'string',
                    },
                    originalFileName,
                    mime,
                });

                if(dbError) {
                    // откат транзакции
                }

                if (!dbSuccess) {
                    // откат транзакции
                }

                // получаем id только что добавленного поля
                const { newRowIdHash, row } = dbSuccess;

                if (!newRowIdHash || !row) {
                    // otkat tpaH3aktcb|N
                }

                links.push({
                    linkId:linkId.data,
                    tableName,
                    rowId:newRowIdHash,
                });
                
                // console.log({dbError, dbSuccess , newRowIdHash});

                const dbReadResponse = dbController.readOne(newRowIdHash);

                for (const [columnName, colData] of Object.entries(columns)) {
                    // console.log(`\x1b[38;2;0;255;128mcolumn name: ${columnName}\x1b[0m`);
                    // console.log('columnData: ', colData);
                    
                }
            }
        }

        console.log('all linked files: ', {links});

        for (const [tableName, groups] of Object.entries(mergedGroups.fields)) {
            console.log(`\x1b[38;2;255;128;255mtable name: ${tableName}\x1b[0m`);

            const controller = dbControllersRouter.get(tableName);
            if(!controller) {
                console.log(`\x1b[31mon-data-end middleware: controller by tablename ${tableName} is not received\x1b[0m`);
                continue;
            }

            for (const [groupId, columns] of Object.entries(groups)) {
                console.log(`\x1b[38;2;128;255;255mgroup id: : ${groupId}\x1b[0m` , columns);
                
                // объект для подготовленных данных в базу данных
                const tableRowDataSet = {};

                for (const [columnName, colData] of Object.entries(columns)) {

                    // пока что не учитываем тип данных (colData.dataType), всегда записываем строку
                    tableRowDataSet[columnName] = {}
                    const column = tableRowDataSet[columnName]; 
                    column['dataType'] = colData.dataType;
                    
                    if(colData.dataType === 'link') {
                        
                        /* устанавливаем ссылочные данные на таблицу с файлом */
                        for (const linkObj of links) {

                            if(linkObj.linkId === colData.data) {
                                column['data'] = {
                                    tableName:linkObj.tableName,
                                    rowId:linkObj.rowId,
                                } ;
                                break;
                            }
                        }

                        continue;
                        // console.log(`\x1b[38;2;0;255;128mcolumn name: ${/* columnName */ + ''}\x1b[0m`, colData);
                    }
                    // console.log('columnData: ', colData);    
                    column['data'] = colData.data ;
                }

                controller.createOne(tableRowDataSet);
            }
        }

        return await next({ success: { addedData } });
    };
};