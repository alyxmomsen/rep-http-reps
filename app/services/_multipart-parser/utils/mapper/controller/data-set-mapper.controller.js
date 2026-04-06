
const { Transactions } = require("../../../../transactor/transactions.model");
const { ResolveSuccessError } = require("../../../../../utils/success-error-resolver/model/suc-err-res");
const { dbControllersRouter } = require("../../../../database-adapter/controller/db-adapter.controller");
const { filemanager } = require("../../../../filemanager.service.js/fmanager.controller");
const { LinksBuffer } = require("../../data-links-buffer/data-links-buffer.util");
const { BranchActionFactory } = require("../model/actions/branch-action/model/branch-action.model");
const { BTypeActionFactory } = require("../model/actions/leaf-action/model/leaf-action.mode");
const { DataSetProcessor } = require("../model/data-set-processor.model");
const { Transactor } = require("../../../../transactor/v2/model/transactor.model");

/**
 * @param {Object} deps
 * @param {LinksBuffer} deps.linksBuffer 
 * @param {Transactor} deps.transactor
 * @returns {DataSetProcessor}
 */
function dataSetProcessorFactory(deps) {

    console.log({deps});
    const transactor = deps.transactor;

    if(!transactor || transactor instanceof Transactor === false) {
        throw new Error(`transactions required`);
    }

    const linksBuffer = new LinksBuffer;

    const dataSetProcessor = new DataSetProcessor({
        linkBuffer:linksBuffer,
    });

    dataSetProcessor.addAction('branch', /* branchAction */BranchActionFactory({
        dbControllersRouter:dbControllersRouter,
        filemanager:filemanager,
        resolveSuccesError:new ResolveSuccessError(),
        linksBufferInstance:linksBuffer,
        transactor:transactor,
    }));

    dataSetProcessor.addAction('leaf', BTypeActionFactory());

    return dataSetProcessor;
}

module.exports = { dataSetProcessorFactory: dataSetProcessorFactory /* , Actions */ }