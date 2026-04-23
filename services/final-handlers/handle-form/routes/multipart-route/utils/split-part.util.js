/**
 *
 * @param {Object} deps
 * @param {Object} deps.findIndexInBuffer
 * @returns
 */
function SplitPart(deps = {}) {
    if (!deps.findIndexInBuffer) {
        throw new Error(`SplitPart fn: deps.findIndexInBuffer required`);
    }

    /**
     *
     * @param {Buffer<ArrayBuffer>} data
     */
    const fn = function (data) {
        const Args = {
            data,
        };

        const Tools = {
            dataSeparator: Buffer.from(`\r\n\r\n`),
        };

        const Result = {};

        const separatorIndex = deps.findIndexInBuffer(
            Args.data,
            Tools.dataSeparator
        );

        if (separatorIndex === -1) {
            throw new Error(
                `SplitPart fn: incorrect part, separator not found`
            );
        }

        Result.headers = data.subarray(0, separatorIndex);

        let bodyEndIndex = Args.data.length;

        if (
            Args.data[bodyEndIndex - 2] === 0x0d &&
            Args.data[bodyEndIndex - 1] === 0x0a
        ) {
            bodyEndIndex -= 2;
        }

        Result.body = Args.data.subarray(
            separatorIndex + Tools.dataSeparator.length,
            bodyEndIndex
        );

        return Result;
    };

    return fn;
}

module.exports = { SplitPart };
