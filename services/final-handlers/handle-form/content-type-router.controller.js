const { DBAdapterFactory } = require('../../db-adapter/db-adapter.controller');
const {
    ValidatiionSchemas: DBAdapterValidatiionSchemas,
} = require('../../db-adapter/db-adapter.model');
const {
    inMemoryDataBase,
} = require('../../in-memory-db/controller/db.controller');
const {
    StateControllerFactory,
} = require('../../utit-of-work/state-controller.controller');
const {
    MultipartContentTypeRoute,
} = require('./routes/multipart-route/multipart-route.model');
const {
    ExtractMultiTableData,
} = require('./routes/multipart-route/services/extract-multitable-data.util');
const {
    MultiTableParser,
} = require('./routes/multipart-route/services/multitable-parser.model');
const {
    ExtractHeaders,
} = require('./routes/multipart-route/utils/extract-headers.util');
const {
    findIndexInBuffer,
} = require('./routes/multipart-route/utils/find-index-in-buffer.util');
const {
    ParseContentDisposition,
} = require('./routes/multipart-route/utils/parse-content-disposition.util');
const {
    ParseHeaders,
} = require('./routes/multipart-route/utils/parser-headers.util');
const {
    SplitFormDataBuffer,
} = require('./routes/multipart-route/utils/split-form-data-buffer.util');
const { SplitPart } = require('./routes/multipart-route/utils/split-part.util');
const {
    PostMapperFactory,
} = require('./services/post-mapper/post-mapper.controller');
const {
    PostMapperActions,
} = require('./services/post-mapper/post-mapper.model');
const {
    PremapperControllerFactory,
    PremapperFactory,
} = require('./services/pre-mapper/premapper.controller');
const { PreMapperSchemas } = require('./services/pre-mapper/premapper.model');

/**
 * @type {Map<string,Function>}
 */
const ContentTypeRoutes = new Map();

ContentTypeRoutes.set(
    'multipart/form-data',
    MultipartContentTypeRoute({
        SplitFormDataBuffer: SplitFormDataBuffer({
            findIndexInBuffer: findIndexInBuffer,
        }),
        splitPart: SplitPart({
            findIndexInBuffer: findIndexInBuffer,
        }),
        parseHeaders: ParseHeaders({
            extractHeaders: ExtractHeaders(),
            parseContentDisposition: ParseContentDisposition(),
        }),
        MultiTableParser: MultiTableParser({
            ExtractMultiTableData: ExtractMultiTableData,
        }),
        PremapperControllerFactory: PremapperControllerFactory({
            PremapperFactory: PremapperFactory(),
            PreMapperSchemas: PreMapperSchemas,
        }),
        PostMapperFactory: new PostMapperFactory({
            PostMapperActions: PostMapperActions,
            StateControllerFactory: new StateControllerFactory(),
            DBAdapterFactory: new DBAdapterFactory({
                dataBaseInstance: inMemoryDataBase,
                ValidationSchemas: DBAdapterValidatiionSchemas,
            }),
        }),
    })
);

module.exports = { ContentTypeRoutes };
