/**
 *
 * @param {Object} deps
 * @returns {(headersString:string) => Object.<string,string>}
 */
function ExtractHeaders(deps = {}) {
    /**
     *
     * @param {string} headersString
     * @returns {Object.<string,string>}
     */
    const fn = function (headersString) {
        const ToolSet = {
            headerStringSeparator: '\r\n',
            headerCoupleSeparator: ': ',
        };

        const HeadersPool = {};

        headersString.split(ToolSet.headerStringSeparator).forEach((part) => {
            const [key, value] = part.split(ToolSet.headerCoupleSeparator);
            if (key && value) {
                const normalizedKey = key.toLowerCase();

                HeadersPool[normalizedKey] = value;
            }
        });

        return HeadersPool;
    };

    return fn;
}

module.exports = { ExtractHeaders };
