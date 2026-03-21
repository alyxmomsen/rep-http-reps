// _multipart-parser/middleware/group-data.mw.js

const { MultiTableGrouppingAgent } = require("../services/multi-table-gruping-agent/multi-table-gruping-agent");

module.exports = function groupDataMiddleware(deps = {}) {
    /**
     * @type {MultiTableGrouppingAgent}
     */
    const multiTableAgent = deps.multiTableAgent; // 👈 принимаем агента
    
    if (!multiTableAgent) {
        throw new Error('groupDataMiddleware: multiTableAgent is required');
    }
    
    return async (payload, next) => {
        const { body, contentType, filename, nameAttrValue: name } = payload;
        
        // Используем переданного агента
        multiTableAgent.handleFormDataPartParsedData({ body, contentType, filename, name });
        
        return await next({});
    };
};