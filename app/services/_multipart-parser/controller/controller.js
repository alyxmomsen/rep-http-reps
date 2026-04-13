const {
    MultipartFormdataHandler,
} = require('../models/multi-part-parser.model');
const {
    MultiTableGrouppingAgent,
} = require('../services/multi-table-gruping-agent/multi-table-gruping-agent');

// Импортируем middleware
const extractProtocolMiddleware = require('../middleware/extract-protocol.mw');
const onDataEndMiddleware = require('../middleware/on-data-end.mw');

// Внешние зависимости
const {
    filemanager,
} = require('../../filemanager.service.js/filemanager.service');
const {
    dbControllersRouter,
} = require('../../database-adapter/controller/db-adapter.controller');
const {
    extractProtocolName,
} = require('../services/name-attribute-parser/utlils/extract-protocol-name');
const {
    multiTableProtocolParser,
} = require('../services/multi-table-gruping-agent/utils/extract-multitable-form-protocol-data');
const {
    FILE_DATA_SET_SCHEMA,
    REGULAR_FIELD_DATA_SET,
    LINKED_FIELD_DATA_SET_SCHEMA,
} = require('../services/data-mapper/v2/model/schemas/dm.schema');
// const {
//     dataMapperFactory,
// } = require('../services/data-mapper/v2/controller/data-mapper.controller');
const {
    PreMapper,
} = require('../../../utils/data-mapper/pre-mapper/pre-mapper.model');

const multiTableGrouppingAgentFactory = () => {
    return new MultiTableGrouppingAgent({
        // mapper:new Mapper(),
        dataTransformer: new PreMapper(),
        // dataTransformer: new DataTransformer(),
        multiTableProtocolParser: multiTableProtocolParser,
        fileDataSetSchema: FILE_DATA_SET_SCHEMA,
        linkedFieldDataSetSchema: LINKED_FIELD_DATA_SET_SCHEMA,
        regularFieldDataSetSchema: REGULAR_FIELD_DATA_SET,
    });
};

const formDataLinksBufferFactory = () => {
    return new LinksBuffer();
};

// Создаём экземпляр
const multipartFormHandler = new MultipartFormdataHandler({
    multiTableGrouppingAgentFactory,
});

multipartFormHandler.useMiddleware(
    extractProtocolMiddleware({ extractProtocolName })
);

multipartFormHandler.onDataEndListeners(
    onDataEndMiddleware({
        filemanager,
        dbRouter: dbControllersRouter,
        formDataLinksBufferFactory: formDataLinksBufferFactory,
    })
);

// События
multipartFormHandler.addEventListener('dataPartParsed', (payload) => {
    console.log(`\x1b[33mon form data part parsed\x1b[0m`, { payload });
});

module.exports = { multipartFormHandler };
