const { MultiTableGrouppingAgent } = require("../../services/multi-table-gruping-agent/multi-table-gruping-agent");

/**
 * 
 * @param {{
 *  body:Buffer<ArrayBuffer>;
 *  contentType:string;filename;
 *  nameAttrValue:string;
 *  multiTableAgent:MultiTableGrouppingAgent}} payload 
 * @param {(nextData:Object.<string,any>)=>Promise<Object.<string,any>>} next 
 * @returns {any}
 */
async function groupDataMiddleware (payload, next) {
    const {body, contentType, filename, nameAttrValue:name , multiTableAgent} = payload;

    multiTableAgent.handleFormDataPartParsedData({body, contentType, filename, name});

    return await next({});

}
