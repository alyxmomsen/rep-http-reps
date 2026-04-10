const { filemanager: defaultFilemanager } = require("../../filemanager.service.js/fmanager.controller");
const { FileManager } = require("../../filemanager.service.js/filemanager.service");
const { dbControllersRouter: defaultDbRouter, dbControllersRouter } = require("../../database-adapter/controller/db-adapter.controller");
const { DBAdapter } = require("../../database-adapter/models/db-adapter.model");
const { LinksBuffer } = require("../utils/data-links-buffer/data-links-buffer.util");
const { dataSetProcessorFactory } = require("../utils/mapper/controller/data-set-mapper.controller");
const { Transactor } = require("../../transactor/v2/model/transactor.model");
const { PostMapper } = require("../../../utils/data-mapper/post-mapper/post-mapper.model");
const { DataAction, DataActionFactory, FileActionFactory, LinkActionFactory } = require("../../../utils/data-mapper/post-mapper/post-mapper.controller");
const { StateRollBackContainerFactory } = require("../../../utils/data-mapper/post-mapper/transactions/transaction.controller");
const { dataBase } = require("../../database/controller/db.controller");

/**
 * Middleware для финальной обработки: сохранение файлов и запись в БД
 * @param {{
 *  filemanager:FileManager;
 *  dbRouter:Map<string,DBAdapter>;
 *  formDataLinksBufferFactory:() => LinksBuffer
 * }} deps - зависимости
 * @returns {(payload:Object,next:(payload:Object) => Promise<any>) => Promise<any>} middleware
 */
module.exports = function onDataEndMiddleware(deps = {}) {
    const filemanager = deps.filemanager || defaultFilemanager;
    const dbRouter = deps.dbRouter || defaultDbRouter;
    const formDataLinksBufferFactory = deps.formDataLinksBufferFactory;

    // ============= check dependencies =======================

    if (!filemanager) {
        throw new Error(`onDataEndMiddleware factory: filemanager required`);
    }

    if (!dbRouter) {
        throw new Error(`onDataEndMiddleware factory: dbRouter required`);
    }

    if (!formDataLinksBufferFactory) {
        throw new Error(`onDataEndMiddleware factory: formDataLinksBufferFactory required`);
    }

    /**
     * 
     * @param {Object} payload 
     * @param {(payload:Object,next:(payload:Object) => Promise<any>) => Promise<any>} next 
     * @returns 
     */
    const fn = async (payload, next) => {

        console.log('on-data-end middleware: payload data:');
        console.dir(payload, {depth:10});


        const postMapper = new PostMapper({
            dataAction:DataActionFactory({
                rollBackContainerFactory:new StateRollBackContainerFactory(),
            }),
            fileAction:FileActionFactory({
                rollBackContainerFactory:new StateRollBackContainerFactory(),
            }),
            linkAction:LinkActionFactory({
                rollBackContainerFactory:new StateRollBackContainerFactory(),
            }),
            stateRollBackContainerFactory:new StateRollBackContainerFactory(),
        });

        // console.dir(payload, {depth:10});

        await postMapper.process(payload);

        // console.log('check that');
        // const filesResult = dataBase.readAll('files');
        // const usersResult = dataBase.readAll('users');
        // const videoPlaylistResult = dataBase.readAll('video-playlist');

        // const filesDbObject = convertMapToObjectsArray(filesResult?.success?.tableRows || new Map());
        // const usersDbObject = convertMapToObjectsArray(usersResult?.success?.tableRows || new Map());
        // const videoDbObject = convertMapToObjectsArray(videoPlaylistResult?.success?.tableRows || new Map());

        // console.dir({
        //     filesDbObject, usersDbObject, 
        //     videoDbObject,  filesResult, 
        //     usersResult, videoPlaylistResult
        // }, {depth:10});

        const result = postMapper.getResult();


        const clientResponsePull = {};

        for (const [addr, { rowId, tableName }] of Object.entries(result)) {
            const { success, error } = dataBase.readOne(tableName, rowId);

            if(tableName === 'files') continue;

            clientResponsePull[tableName] = {success , error} ;

        }
        
        console.log('result from data base', {clientResponsePull});
        
        // возвращаем "успех" и данные для репорта клиенту
        return await next({ success: { clientResponsePull } });
    };

    return fn;
};

/**
 * 
 * @param {Map} mapData 
 */
function convertMapToObjectsArray (mapData) {

    console.log({mapData});

    const tableData = [];

    for (const [rowId, rowData] of mapData.entries()) {
        
        const _rowData = {};

        for (const [colName,colData] of rowData.entries()) {

            _rowData[colName] = {rowId, colData};
        }

        tableData.push(_rowData);
    }

    return tableData;
}
