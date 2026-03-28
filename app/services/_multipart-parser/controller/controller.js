// _multipart-parser/controller/controller.js

const { MultipartFormdataHandler } = require("../models/multi-part-parser.model");
const { MultiTableGrouppingAgent } = require("../services/multi-table-gruping-agent/multi-table-gruping-agent");

// Импортируем middleware
const extractProtocolMiddleware = require("../middleware/extract-protocol.mw");
const onDataEndMiddleware = require("../middleware/on-data-end.mw");

// Внешние зависимости
const { filemanager } = require("../../filemanager.service.js/filemanager.service");
const { dbControllersRouter } = require("../../database-adapter/controller/db-adapter.controller");
const { extractProtocolName } = require("../services/name-attribute-parser/utlils/extract-protocol-name");
// const { Mapper } = require("../../../utils/mapper-2.0/mapper.2.0");
const { DataTransformer } = require("../services/data-transformer/data-transfromer");
const { multiTableProtocolParser } = require("../services/multi-table-gruping-agent/utils/extract-multitable-form-protocol-data");
const { LinksBuffer } = require("../utils/data-links-buffer/data-links-buffer.util");

const multiTableGrouppingAgentFactory  = () => {
    return new MultiTableGrouppingAgent({
        // mapper:new Mapper(),
        dataTransformer: new DataTransformer(),
        multiTableProtocolParser:multiTableProtocolParser,
    });
}

const formDataLinksBufferFactory = () => {
    return new LinksBuffer();
}

// Создаём экземпляр
const multipartFormHandler = new MultipartFormdataHandler({
    multiTableGrouppingAgentFactory,
});

multipartFormHandler.useMiddleware(
    extractProtocolMiddleware({ extractProtocolName }),
);

multipartFormHandler.onDataEndListeners(
    onDataEndMiddleware({ 
        filemanager, 
        dbRouter: dbControllersRouter,
        formDataLinksBufferFactory:formDataLinksBufferFactory,
    })
);

// События
multipartFormHandler.addEventListener('dataPartParsed', (payload) => {
    console.log(`\x1b[33mon form data part parsed\x1b[0m`, { payload });
});

module.exports = { multipartFormHandler };