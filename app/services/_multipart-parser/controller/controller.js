const {
    MultipartFormdataHandler,
} = require('../models/multi-part-parser.model');

const {
    MultiTableGrouppingAgent,
} = require('../services/multi-table-gruping-agent/multi-table-gruping-agent');

const extractProtocolMiddleware = require('../middleware/extract-protocol.mw');
const onDataEndMiddleware = require('../middleware/on-data-end.mw');

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

const {
    PreMapper,
} = require('../../../utils/data-mapper/pre-mapper/pre-mapper.model');

const {
    splitHeaders,
    parseContentDisposition,
    parseFormDataPart,
    splitFormData,
} = require('../models/deps/multipart-parser.deps');
const {
    PostMapper,
} = require('../../../utils/data-mapper/post-mapper/post-mapper.model');
const {
    StateContainerFactory,
} = require('../../../utils/data-mapper/post-mapper/transactions/transaction.controller');
const {
    DataActionFactory,
    FileActionFactory,
    LinkActionFactory,
} = require('../../../utils/data-mapper/post-mapper/post-mapper.controller');

const multiTableGrouppingAgentFactory = () => {
    return new MultiTableGrouppingAgent({
        dataTransformer: new PreMapper(),
        multiTableProtocolParser: multiTableProtocolParser,
        fileDataSetSchema: FILE_DATA_SET_SCHEMA,
        linkedFieldDataSetSchema: LINKED_FIELD_DATA_SET_SCHEMA,
        regularFieldDataSetSchema: REGULAR_FIELD_DATA_SET,
    });
};

const formDataLinksBufferFactory = () => {
    return new LinksBuffer();
};

const multipartFormHandler = new MultipartFormdataHandler({
    multiTableGrouppingAgentFactory,
    splitHeaders: splitHeaders,
    parseContentDisposition: parseContentDisposition,
    parseFormDataPart: parseFormDataPart,
    splitFormData: splitFormData,
});

multipartFormHandler.useMiddleware(
    extractProtocolMiddleware({ extractProtocolName })
);

multipartFormHandler.onDataEndListeners(
    onDataEndMiddleware({
        postMapper: new PostMapper({
            stateRollBackContainerFactory: new StateContainerFactory(),
            dataAction: DataActionFactory({
                StateContainerFactory: new StateContainerFactory(),
            }),
            fileAction: FileActionFactory({
                StateContainerFactory: new StateContainerFactory(),
            }),
            linkAction: LinkActionFactory({
                StateContainerFactory: new StateContainerFactory(),
            }),
        }),
    })
);

multipartFormHandler.addEventListener('dataPartParsed', (payload) => {
    console.log(`\x1b[33mon form data part parsed\x1b[0m`, { payload });
});

module.exports = { multipartFormHandler };
