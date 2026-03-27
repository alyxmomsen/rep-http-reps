// _multipart-parser/middleware/on-data-end.mw.js

const { randomBytes } = require("node:crypto");
// const { filemanager } = require("../../filemanager.service.js/fmanager.controller");
const { filemanager: defaultFilemanager } = require("../../filemanager.service.js/fmanager.controller");
const { FileManager } = require("../../filemanager.service.js/filemanager.service");
const { dbControllersRouter: defaultDbRouter, dbControllersRouter } = require("../../database-adapter/controller/db-adapter.controller");
const { DBAdapter } = require("../../database-adapter/models/db-adapter.model");
require("dotenv").config();

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

    const linksBuffer = new LinksBuffer();

    // ==============================================================

    return async (payload, next) => {
        
        /**
         * @type {Object}
         */
        const mergedDataSet = payload.mergedGroups;
        
        if(mergedDataSet === undefined) {
            throw new Error('onDataEndMiddleware: required compiled groups but not given');
        }

        /**
         * @type {Object[]}
         */
        
        // сначала файлы, потому что для БД нужны автоматические имена файлов в файловой системе
        
        const { failedLinksFiles } = await validateFilesDataSet(mergedDataSet.files, {
            dbRouter,
            linksBuffer,
            filemanager,
        });
         
        const { successfullyStoredData:successfullyData } = await validateRegularFieldsDataSet(mergedDataSet.fields , {
            dbRouter,
            linksBuffer,
        });
        
        const successfullyStoredData = [...successfullyData];


        log('38;2;84;153;179', `all linked files: ` , {links});

        // ранее проитерировались по "файлам"
        // теперь итерируемся по обычным полям:
        

        // возвращаем "успех" и данные для репорта клиенту
        return await next({ success: { addedData: successfullyStoredData } });
    };
};

/**
 * 
 * @param {Object} dataSet 
 * @param {{
 *  dbRouter:Map<string,DBAdapter>;
 *  linksBuffer:LinksBuffer;
 * }} deps 
 */
async function validateRegularFieldsDataSet(dataSet, deps={}) {

    /**
     * @type {Map<string,DBAdapter>}
     */
    const dbRouter = deps.dbRouter;
    const linksBuffer = deps.linksBuffer;

    /**
     * @description данные для отправки на клиент
     * @type {Array<Object>}
     */
    const successfullyStoredData = [];

    for (const [tableName, groups] of Object.entries(dataSet)) {
        log(`38;2;255;128;32`, 'getting tablename: ', tableName);

        /* получаем контроллер по "tableName", для работы с базой данных */
        const controller = dbRouter.get(tableName);
        /* валидация контроллера на существование */
        if(!controller) {
            log(31, `on-data-end middleware: controller by tablename ${tableName} is not received`);
            continue;
        }

        /* итерируемся по подготовленным БД "строкам" */
        for (const [groupId, columns] of Object.entries(groups)) {
            log(`38;2;128;255;255`,`group id: : ${groupId}`, columns)

            // объект для подготовленных данных в базу данных
            const tableRowDataSet = {};

            /* перебираем DB "строку". просматриваем кажую "колонку" строки */
            for (const [columnName, colData] of Object.entries(columns)) {

                switch (colData.dataType) {

                    case 'link':
                        /* поиск сохраненных ссылочных данных */
                        // так как тип данных - 'link', значит 
                        // даные содержат идентификатор ссылки
                        const linkLike = linksBuffer.getLinkDataById(colData.data);
                        if(!linkLike){
                            log(`38;2;255;0;0`, `on-data-end middleware: required link but not found`);
                            throw new Error(`on-data-end middleware: required link but not found`);
                        }

                        /* если данные найдены, 
                        присваиваем значение будущему db-row столбцу*/
                        tableRowDataSet[columnName] = {
                            tableName:linkLike.tableName,
                            rowId:linkLike.rowId,
                        }

                        continue;
                        // break;
                    default:
                        /* валидируем поле, в зависимости от типа данных */
                        tableRowDataSet[columnName]/* ['data'] */ = 
                            // #warning: сейчас просто сохраняем string
                            colData.data instanceof Buffer 
                                ? colData.data.toString('utf-8') 
                                : colData.data ;

                }
            }

            // сохраняем данные в базе данных
            const dbresponse = controller.createOne(tableRowDataSet);

            /* если DB вернула успешный статус транзакции */
            if(dbresponse.success) {
                /* добавляем поле в массив данных для репорта на клиент */
                successfullyStoredData.push({
                    ...dbresponse.success,
                    tableName,
                })
            }
        }
    }

    return {
        successfullyStoredData,
    }

}



/**
 * 
 * @param {Object} filesMergedDataSet 
 * @param {{
 *  dbRouter:Map<string,DBAdapter>;
 *  filemanager:FileManager;
 *  linksBuffer:LinksBuffer;
 * }} deps 
 * @returns {Promise<{failedLinksFiles:Object[]}>}
 */
async function validateFilesDataSet (filesMergedDataSet, deps={}) {
    
    console.log({filesMergedDataSet});

    /**
     * @type {Map<string,DBAdapter>}
     */
    const dbRouter = deps.dbRouter;
    const filemanager = deps.filemanager;
    const linksBuffer = deps.linksBuffer;
    /**
     * @type {{
     *  message:string;
     *  data:Object;
     * }[]}
     */
    const failedLinksFiles = [];

    for (const [tableName, groups] of Object.entries(filesMergedDataSet)) {
        log(`38;2;255;128;255`, `table name: ${tableName}`);

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

            console.log('filemanager check: ', error, success);
            if(error) {
                // откат
            }

            if(!success) {
                // откат
            }

            const { filename:fileSystemFilename } = success;
            
            // db controller

            const { error:dbError, success:dbSuccess } = dbController.createOne({
                // это что, костыль?
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

            linksBuffer.push({
                linkId:linkId.data,
                tableName:tableName,
                rowId:newRowIdHash,
            });

            // links.push({
            //     linkId:linkId.data,
            //     tableName,
            //     rowId:newRowIdHash,
            // });
            
            // console.log({dbError, dbSuccess , newRowIdHash});

            // const dbReadResponse = dbController.readOne(newRowIdHash);

            // #test
            // but files stay do not departured
            /* по-умолчанию, файлы не попадают в выборку на клиент */
            if(dbSuccess) {
                // addedData.push(dbSuccess);
            }

            // for (const [columnName, colData] of Object.entries(columns)) {
            //     console.log(`\x1b[38;2;0;255;128mcolumn name: ${columnName}\x1b[0m`);
            //     console.log('columnData: ', colData);
                
            // }

            
        }
    }

    return { failedLinksFiles } ;
}

function colorizedLogString(code, str) {
    return `\x1b[${code}m` + str + `\x1b[0m`;
}

function log (col, colorString, ...others ) {

    const logging = (process.env && process.env.LOGGING) || 'false';

    if(logging === 'false') return;

    console.log(colorizedLogString(col, colorString), ...others);
}


class LinksBuffer {

    getAllLinks() {
        const links = this.#links;
        return links;
    }

    /**
     * 
     * @param {string} linkId 
     * @returns {{
     *  linkId:string,
     *  tableName:string,
     *  rowId:string,
     * }|null}
     */
    getLinkDataById (linkId) {

        for (const link of this.#links) {
            if(link.linkId === linkId) {
                return link;
            }
        }

        return null;
    }

    /**
     * 
     * @param {{
     *  linkId:string,
     *  tableName:string,
     *  rowId:string,
     * }} data 
     */
    push(data = {}) {

        if(!data || typeof data !== "object") {
            log(`38;2;255;0;101`, `LinkBuffer: incorrect data`);
            throw new Error(`LinkBuffer: incorrect data`);
        }

        const schema = {
            linkId:'string',
            rowId:'string',
            tableName:'string',
        }

        const result = {};

        for (const [key, type] of Object.entries(schema)) {
            if(!data[key]) {
                log(`38;2;255;0;101`, `LinkBuffer: property ${key} required`);
                throw new Error(`LinkBuffer: property ${key} required, but not provided`);
            }
            
            if(typeof data[key] !== type) {
                log(`38;2;255;0;101`, `LinkBuffer: property [${key}] must be <${type}>  type`);
                throw new Error(`LinkBuffer: property ${key} must be ${type} type`);
            }

            result[key] = data[key];
        }

        this.#links.push(result);

    }

    /**
     * @type {{
     *  linkId:string,
     *  tableName:string,
     *  rowId:string,
     * }[]}
     */
    #links;

    constructor () {
        this.#links = [];
    }
}