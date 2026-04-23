/**
 *
 * @param {Object} deps
 * @param {Function} deps.extractHeaders
 * @param {Function} deps.parseContentDisposition
 * @returns {}
 */
function ParseHeaders(deps = {}) {
    if (!deps.extractHeaders) {
        throw new Error(`ParseHeaders fn: deps.extractHeaders required`);
    }

    if (!deps.parseContentDisposition) {
        throw new Error(
            `ParseHeaders fn: deps.parseContentDisposition required`
        );
    }

    /**
     *
     * @param {string} headersString
     * @returns {{name:string|null;filename:string|null;contentType:string|null}}
     */
    const fn = function (headersString) {
        /**
         * @type {Object.<string,string>}
         */
        const ExtractedHeaders = deps.extractHeaders(headersString);

        // const Actions = {
        //     /**
        //      *
        //      * @param {string} data
        //      */
        //     'content-disposition': (data) => {
        //         console.log(`handle content-disposition action`);

        //         // data.match(/name="([^"]+)"/)?.[1] || null;
        //         // data.match(/name="([^"]+)"/)?.[1] || null;

        //         const ParsedData = {
        //             name: data.match(/name="([^"]+)"/)?.[1] || null,
        //             filename: data.match(/filename="([^"]+)"/)?.[1] || null,
        //         };

        //         return ParsedData;
        //     },
        //     /**
        //      *
        //      * @param {string} data
        //      */
        //     'content-type': (data) => {
        //         console.log(`handle content-type action`);
        //         return { contentType: data };
        //     },
        // };

        // console.log({ ExtractedHeaders });

        // for (const [headerKey, headerValue] of Object.entries(
        //     ExtractedHeaders
        // )) {
        //     const action =
        //         Actions[headerKey] ||
        //         (() => {
        //             console.log(`default action`);
        //         });

        //     action(headerValue);
        // }

        // console.log({ ExtractHeaders });

        const { name, filename } = deps.parseContentDisposition(
            ExtractedHeaders['content-disposition']
        );

        /**
         * @type {string|null}
         */
        const contentType = ExtractedHeaders['content-type'] || null;

        return {
            name,
            filename,
            contentType,
        };
    };

    return fn;
}

module.exports = { ParseHeaders };
