// const { dbControllersRouter } = require("../../../../database-adapter/controller/db-adapter.controller");
// const { filemanager } = require("../../../../filemanager.service.js/fmanager.controller");
// const { filemanager } = require("../../../../filemanager.service.js/fmanager.controller");
// const { dataSetMapper, DataSetProcessor } = require("../data-set-mapper.model");
// const { tableNameAction, groupIdAction, propRegularAction, propFileAction } = require("../model/actions/actions");
// const { BTypeActionFactory: BTypeActionFactory, ATypeActionFactory: ATypeActionFactory } = require("../model/actions/actions.demo");
const { ResolveSuccessError } = require("../../../../../utils/success-error-resolver/model/suc-err-res");
const { dbControllersRouter } = require("../../../../database-adapter/controller/db-adapter.controller");
const { filemanager } = require("../../../../filemanager.service.js/fmanager.controller");
const { LinksBuffer } = require("../../data-links-buffer/data-links-buffer.util");
// const { branchAction } = require("../model/actions/branch-action/controller/branch.action.controller");
const { BranchActionFactory } = require("../model/actions/branch-action/model/branch-action.model");
const { BTypeActionFactory } = require("../model/actions/leaf-action/model/leaf-action.mode");
const { DataSetProcessor } = require("../model/data-set-processor.model");

/**
 * @param {Object} [deps={}]
 * @param {LinksBuffer} deps.linksBuffer 
 * @returns {DataSetProcessor}
 */
function dataSetProcessorFactory(deps={}) {

    const linksBuffer = new LinksBuffer;

    const dataSetProcessor = new DataSetProcessor({
        linkBuffer:linksBuffer,
    });

    dataSetProcessor.addAction('handleBranch', /* branchAction */BranchActionFactory({
        dbControllersRouter:dbControllersRouter,
        filemanager:filemanager,
        resolveSuccesError:new ResolveSuccessError(),
        linksBufferInstance:linksBuffer,
    }));

    dataSetProcessor.addAction('handleLeaf', BTypeActionFactory());

    return dataSetProcessor;
}

module.exports = { dataSetProcessorFactory: dataSetProcessorFactory /* , Actions */ }