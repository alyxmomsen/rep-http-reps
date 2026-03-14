const { extractProtocolName } = require("../../services/name-attribute-parser/utlils/extract-protocol-name");

/**
 * 
 * @param {Object.<string,any>} payload 
 * @param {(nextData:Object.<string,any>)=>Promise<Object.<string,any>>} next 
 * @returns {any}
 */
async function extractProtocolNameMiddleware(payload, next) {
    const {body, contentType, filename, name} = payload.data || {};

    const {protocolName, data:nameAttrValue} = extractProtocolName(name);

    console.log({protocolName, nameAttrValue, name});

    if(protocolName !== 'multitable') {
        return 'hello world';
    }

    return await next({body, contentType, filename, nameAttrValue});
}

