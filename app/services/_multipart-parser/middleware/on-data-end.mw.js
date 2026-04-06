const { filemanager: defaultFilemanager } = require("../../filemanager.service.js/fmanager.controller");
const { FileManager } = require("../../filemanager.service.js/filemanager.service");
const { dbControllersRouter: defaultDbRouter, dbControllersRouter } = require("../../database-adapter/controller/db-adapter.controller");
const { DBAdapter } = require("../../database-adapter/models/db-adapter.model");
const { LinksBuffer } = require("../utils/data-links-buffer/data-links-buffer.util");
const { dataSetProcessorFactory } = require("../utils/mapper/controller/data-set-mapper.controller");
const { Transactor } = require("../../transactor/v2/model/transactor.model");

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

        console.log('on-data-end middleware: payload data' , {payload});

        // console.dir(payload, {depth:20});


        const datasetProcessor = dataSetProcessorFactory({
            linksBuffer: new LinksBuffer(),
            transactor: new Transactor({
                fileManager: filemanager,
                dbControllersRouter:dbControllersRouter,
            }),
        });

        const {tree, supply} = await datasetProcessor.process(payload, []);

        console.dir({dspr:supply}, {depth:10});

        // возвращаем "успех" и данные для репорта клиенту
        return await next({ success: { addedData:[] } });
    };

    return fn;
};


