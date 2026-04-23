/**
 *
 * @param {Object} deps
 * @param {(dataBuffer:Buffer<ArrayBuffer>,separatorBuffer:Buffer<ArrayBuffer>,start:number) => number} deps.findIndexInBuffer
 */
function SplitFormDataBuffer(deps = {}) {
    if (!deps.findIndexInBuffer) {
        throw new Error(`ParseFormData fn: deps.findIndexInBuffer required`);
    }

    /**
     *
     * @param {Buffer<ArrayBuffer>} data
     * @param {Buffer<ArrayBuffer>} separator
     * @returns {Buffer<ArrayBuffer>[]}
     */
    const fn = function (data, separator) {
        const parts = [];
        let index = 0;
        let start = 0;

        while (
            (index = deps.findIndexInBuffer(data, separator, start)) !== -1
        ) {
            parts.push(data.subarray(start, index));
            start = index + separator.length;
            if (data[start] === 0x0d && data[start + 1] === 0x0a) {
                start += 2;
            }
        }

        parts.push(data.subarray(start));

        return parts;
    };

    return fn;
}

module.exports = { SplitFormDataBuffer };
