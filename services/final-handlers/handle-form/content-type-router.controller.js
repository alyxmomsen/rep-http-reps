const { DBAdapterFactory } = require('../../db-adapter/db-adapter.controller');
const {
    ValidatiionSchemas: DBAdapterValidatiionSchemas,
    ValidatiionSchemas,
} = require('../../db-adapter/db-adapter.model');
const { FileManager } = require('../../file-manager/model/f-manager.model');
const {
    inMemoryDataBase,
    InMemoryDBFactory,
} = require('../../in-memory-db/controller/db.controller');
const {
    LeafTryBehavior,
    LeafRollbackBehavior,
} = require('../../utit-of-work/v2/behaviors/leaf.behavior');
const {
    SecondTryBehavior,
    SecondRollbackBehavior,
} = require('../../utit-of-work/v2/behaviors/second.behavior');
const {
    StateControllerFactoryToo,
} = require('../../utit-of-work/v2/controller/statecontroller.controller');

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
            StateControllerFactory: new StateControllerFactoryToo({
                tryBehavior: new SecondTryBehavior({
                    dBAdapter: new DBAdapterFactory({
                        dataBaseInstance: inMemoryDataBase,
                        ValidationSchemas:ValidatiionSchemas,
                    }).Instance(),
                    stateControllerFactory: new StateControllerFactoryToo({
                        tryBehavior: new LeafTryBehavior({
                            fileManager: new FileManager({
                                rootDir: './uploads',
                            }),
                        }),
                        rollbackBehavior: new LeafRollbackBehavior(),
                    }),
                }),
                rollbackBehavior: new SecondRollbackBehavior({}),
            }),
        }),
    })
);

ContentTypeRoutes.set('application/x-www-form-urlencoded', DefaultBehavior({}));
ContentTypeRoutes.set('text/plain', DefaultBehavior({}));

module.exports = { ContentTypeRoutes };


/**
 * 
 * @param {Object} deps 
 */
function DefaultBehavior(deps = {}) { 

    const fn = function (req, payload) {
        return [];
    }

    return fn;

}