// _multipart-parser/middleware/extract-protocol.mw.js

const { extractProtocolName } = require("../services/name-attribute-parser/utlils/extract-protocol-name");

/**
 * Middleware для извлечения протокола из name атрибута
 * @param {Object} deps - зависимости
 * @returns {Function} middleware
 */
module.exports = function extractProtocolMiddleware(deps = {}) {
    const { extractProtocolName: extractFn = extractProtocolName } = deps;
    
    return async (payload, next) => {

        const { body, contentType, filename, name } = payload || {};
        
        const { protocolName, data: nameAttrValue } = extractFn(name);
        
        if (protocolName !== 'multitable') {
            return payload;
            return 'no name-protocol';
        }

        return await next({ body, contentType, filename, name:nameAttrValue });
    };
};
