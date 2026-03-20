// _multipart-parser/middleware/group-data.mw.js

const { MultiTableGrouppingAgent } = require("../services/multi-table-gruping-agent/multi-table-gruping-agent");

/**
 * Middleware для группировки данных через MultiTableGrouppingAgent
 * @param {Object} deps - зависимости
 * @returns {Function} middleware
 */
module.exports = function groupDataMiddleware(deps = {}) {
    const AgentClass = deps.MultiTableGrouppingAgent || MultiTableGrouppingAgent;
    const agent = new AgentClass();
    
    return async (payload, next) => {
        const { body, contentType, filename, nameAttrValue: name } = payload;
        
        agent.handleFormDataPartParsedData({ body, contentType, filename, name });
        
        return await next({});
    };
};