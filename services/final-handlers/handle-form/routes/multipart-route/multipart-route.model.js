/**
 *
 * @param {Object} deps
 * @param {(data:Buffer<ArrayBuffer>, separator:Buffer<ArrayBuffer>) => Buffer<ArrayBuffer>[]} deps.SplitFormDataBuffer
 * @param {(data:Buffer<ArrayBuffer>) => Object} deps.splitPart
 * @param {(data:string) => {name:string|null;filename:string|null;contentType:string|null}} deps.parseHeaders
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

                for (const part of SplitBufferResult) {
                    try {
                        const SplittedPart = deps.splitPart(part);

                        const ParsedHeaders = deps.parseHeaders(
                            SplittedPart.headers.toString('utf-8')
                        );

                        console.log({ ParsedHeaders });
                    } catch (err) {
                        console.log({ err });
                    }
                }

                resolve({ success: { message: 'done', data: {} } });
            });
        });
    };

    return fn;
}

module.exports = { MultipartContentTypeRoute };
