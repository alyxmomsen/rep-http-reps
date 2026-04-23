const {
    MultipartContentTypeRoute,
} = require('./routes/multipart-route/multipart-route.model');
const { ExtractMultiTableData } = require('./routes/multipart-route/services/extract-multitable-data.util');
const { MultiTableParser } = require('./routes/multipart-route/services/multitable-parser.model');
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
const { PremapperControllerFactory, PremapperFactory } = require('./serices/pre-mapper/premapper.controller');
const { PreMapperSchemas } = require('./serices/pre-mapper/premapper.model');

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
        MultiTableParser:MultiTableParser({
            ExtractMultiTableData:ExtractMultiTableData,
        }),
        PremapperControllerFactory:PremapperControllerFactory({
            PremapperFactory:PremapperFactory(),
            PreMapperSchemas:PreMapperSchemas,
        }),
    })
);

module.exports = { ContentTypeRoutes };
