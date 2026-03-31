// const { dbControllersRouter } = require("../../../../database-adapter/controller/db-adapter.controller");
// const { filemanager } = require("../../../../filemanager.service.js/fmanager.controller");
// const { filemanager } = require("../../../../filemanager.service.js/fmanager.controller");
// const { dataSetMapper, DataSetProcessor } = require("../data-set-mapper.model");
// const { tableNameAction, groupIdAction, propRegularAction, propFileAction } = require("../model/actions/actions");
// const { BTypeActionFactory: BTypeActionFactory, ATypeActionFactory: ATypeActionFactory } = require("../model/actions/actions.demo");
const { branchAction } = require("../model/actions/branch-action/controller/branch.action.controller");
const { BTypeActionFactory } = require("../model/actions/leaf-action/model/leaf-action.mode");
const { DataSetProcessor } = require("../model/data-set-processor.model");

// /**
//  * @type {Object.<string,Function>}
//  */
// const Actions = {
//     tableName: tableNameAction,
//     groupId: groupIdAction,
//     propertyRegular: propRegularAction,
//     propertyFile: propFileAction,
// };

// const testActions = {
//     a: ATypeActionFactory(),
//     b: BTypeActionFactory(),
// };

// /**
//  *
//  * @param {Object} deps
//  * @returns {(data:Object, propsCallStack:string[]) => }
//  */
// function dataSetMapperFactory(deps = {}) {
    
//     /**
//      *
//      * @param {Object} data
//      * @param {string[]} propsCallStack
//      * @returns
//      */
//     const fn = async (data, propsCallStack) => await dataSetMapper(data, propsCallStack, testActions);

//     return fn;
// }

/**
 * 
 * @returns {DataSetProcessor}
 */
function dataSetProcessorFactory() {

    const dataSetProcessor = new DataSetProcessor();
    dataSetProcessor.addAction('handleBranch', branchAction);
    dataSetProcessor.addAction('handleLeaf', BTypeActionFactory());

    return dataSetProcessor;
}

module.exports = { dataSetProcessorFactory: dataSetProcessorFactory /* , Actions */ }