const { dbControllersRouter } = require("../../../../database-adapter/controller/db-adapter.controller");
const { filemanager } = require("../../../../filemanager.service.js/fmanager.controller");
// const { filemanager } = require("../../../../filemanager.service.js/fmanager.controller");
const { dataSetMapper } = require("../data-set-mapper.model");
const { tableNameAction, groupIdAction, propRegularAction, propFileAction } = require("../model/actions/actions");

const Actions = {
    tableName: tableNameAction,
    groupId: groupIdAction,
    propertyRegular: propRegularAction,
    propertyFile: propFileAction,
};

/**
 * 
 * @param {Object} deps 
 * @returns {(data:Object, propsCallStack:string[]) => }
 */
function dataSetMapperFactory(deps = {}) {
    
    /**
     * 
     * @param {Object} data 
     * @param {string[]} propsCallStack 
     * @returns 
     */
    const fn = (data, propsCallStack) => dataSetMapper(data, propsCallStack, Actions);

    return fn;
}

module.exports = { dataSetMapperFactory , Actions }