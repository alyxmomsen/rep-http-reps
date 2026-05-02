const {
    StateControllerFactory,
} = require('../../../../utit-of-work/state-controller.controller');
const {
    PostMapperFactory,
} = require('../../services/post-mapper/post-mapper.controller');
const {
    PostMapper,
    PostMapperActions,
} = require('../../services/post-mapper/post-mapper.model');
const {
    PremapperController,
} = require('../../services/pre-mapper/premapper.controller');
const {
    PreMapper,
    PreMapperSchemas: Schemas,
} = require('../../services/pre-mapper/premapper.model');

/**
 *
 * @param {Object} deps
 * @param {(data:Buffer<ArrayBuffer>, separator:Buffer<ArrayBuffer>) => Buffer<ArrayBuffer>[]} deps.SplitFormDataBuffer
 * @param {(data:Buffer<ArrayBuffer>) => Object} deps.splitPart
 * @param {(data:string) => {name:string|null;filename:string|null;contentType:string|null}} deps.parseHeaders
 * @param {(data:string) => {groupId:string;tableId:string;columnName:string;dataType:string}} deps.MultiTableParser
 * @param {() => PremapperController} deps.PremapperControllerFactory
 * @param {PostMapperFactory} deps.PostMapperFactory
 * @returns {(req:http.IncomingMessage, res:http.ServerResponse, payload:any) => {}}
 */
function MultipartContentTypeRoute(deps = {}) {
    if (!deps.SplitFormDataBuffer) {
        throw new Error(
            `MultipartContentTypeRoute factory: deps.SplitFormDataBuffer required`
        );
    }

    if (!deps.splitPart) {
        throw new Error(
            `MultipartContentTypeRoute factory: deps.SplitPart required`
        );
    }

    if (!deps.parseHeaders) {
        throw new Error(
            `MultipartContentTypeRoute factory: deps.parseHeaders required`
        );
    }

    if (!deps.MultiTableParser) {
        throw new Error(
            `MultipartContentTypeRoute factory: deps.MultiTableParser required`
        );
    }

    if (!deps.PremapperControllerFactory) {
        throw new Error(
            `MultipartContentTypeRoute factory: deps.PremapperControllerFactory required`
        );
    }

    if (!deps.PostMapperFactory) {
        throw new Error(
            `MultipartContentTypeRoute factory: deps.PostMapperFactory required`
        );
    }

    /**
     *
     * @param {http.IncomingMessage} req
     * @param {any} payload
     * @returns
     */
    const fn = async function (req, payload) {
        const Pools = {
            RequestChunks: [],
        };

        const LocalBuffer = {};

        const Args = {
            /**
             * @type {string}
             */
            payload,
            HTTPRequest: req,
        };

        const boundary = Args.payload;

        LocalBuffer.boundaryMatchResult = boundary.match(
            /boundary=(----[^;\s]+)/
        );

        if (LocalBuffer.boundaryMatchResult === null) {
            throw new Error(`boundaryMatchResult === null`);
        }

        return new Promise((resolve, reject) => {
            Args.HTTPRequest.on(`data`, (chunk) => {
                Pools.RequestChunks.push(chunk);
            });

            Args.HTTPRequest.on(`end`, async () => {
                const RequestWholeData = Buffer.concat(Pools.RequestChunks);

                const SplitBufferResult = deps.SplitFormDataBuffer(
                    RequestWholeData,
                    Buffer.from(`--${LocalBuffer.boundaryMatchResult[1]}`)
                );

                const premapperController = deps.PremapperControllerFactory();
                const MapperBuffer = {
                    premapperResult: {},
                };

                for (const part of SplitBufferResult) {
                    try {
                        const SplittedPart = deps.splitPart(part);

                        const ParsedHeaders = deps.parseHeaders(
                            SplittedPart.headers.toString('utf-8')
                        );

                        const ParsedMultitableData = deps.MultiTableParser(
                            ParsedHeaders.name
                        );

                        MapperBuffer.premapperResult =
                            premapperController.process(
                                {
                                    filename: ParsedHeaders.filename,
                                    contentType: ParsedHeaders.contentType,
                                    body: SplittedPart.body,
                                    groupId: ParsedMultitableData.groupId,
                                    tableId: ParsedMultitableData.tableId,
                                    columnName: ParsedMultitableData.columnName,
                                },
                                MapperBuffer.premapperResult
                            );
                    } catch (err) {
                        console.log({ err });
                    }
                }

                const postMapper = deps.PostMapperFactory.Instance();

                const PostMapperResult = await postMapper.process(
                    MapperBuffer.premapperResult
                ) || [];

                resolve({
                    success: { message: 'done', data: PostMapperResult },
                });
            });
        });
    };

    return fn;
}

module.exports = { MultipartContentTypeRoute };
