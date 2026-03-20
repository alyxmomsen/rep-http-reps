// _multipart-parser/controller/controller.js

const { MultipartFormdataHandler } = require("../models/multi-part-parser.model");
const { MultiTableGrouppingAgent } = require("../services/multi-table-gruping-agent/multi-table-gruping-agent");

// Импортируем middleware
const extractProtocolMiddleware = require("../middleware/extract-protocol.mw");
const groupDataMiddleware = require("../middleware/group-data.mw");
const onDataEndMiddleware = require("../middleware/on-data-end.mw");

// Внешние зависимости
const { filemanager } = require("../../filemanager.service.js/filemanager.service");
const { dbControllersRouter } = require("../../database-adapter/controller/db-adapter.controller");
const { extractProtocolName } = require("../services/name-attribute-parser/utlils/extract-protocol-name");

// Создаём экземпляр
const multipartFormHandler = new MultipartFormdataHandler();

// Создаём ОДНОГО агента
const multiTableAgent = new MultiTableGrouppingAgent();

// Регистрируем middleware, передавая одного и того же агента
multipartFormHandler.useMiddleware(
    extractProtocolMiddleware({ extractProtocolName }),
    groupDataMiddleware({ multiTableAgent })  // 👈 один агент
);

multipartFormHandler.onDataEndListeners(
    onDataEndMiddleware({ 
        filemanager, 
        dbRouter: dbControllersRouter,
        multiTableAgent  // 👈 тот же агент
    })
);

// События
multipartFormHandler.addEventListener('dataPartParsed', (payload) => {
    console.log(`\x1b[33mon form data part parsed\x1b[0m`, { payload });
});

module.exports = { multipartFormHandler };