
const { Transactions } = require("../../../../../../__dev-artefacts__/transactor/transactions.model");
const { ResolveSuccessError } = require("../../../../../utils/success-error-resolver/model/suc-err-res");
const { dbControllersRouter } = require("../../../../database-adapter/controller/db-adapter.controller");
const { filemanager } = require("../../../../filemanager.service.js/fmanager.controller");
const { LinksBuffer } = require("../../data-links-buffer/data-links-buffer.util");
const { BranchActionFactory } = require("../model/actions/branch-action/model/branch-action.model");
const { BTypeActionFactory } = require("../model/actions/leaf-action/model/leaf-action.mode");
const { DataSetProcessor } = require("../model/data-set-processor.model");

/**
 * @param {Object} deps
 * @param {LinksBuffer} deps.linksBuffer 
 * @param {Transactions} deps.transactions
 * @returns {DataSetProcessor}
 */
function dataSetProcessorFactory(deps) {

    console.log({deps});
    const transactions = deps.transactions;

    if(!transactions || transactions instanceof Transactions === false) {
        throw new Error(`transactions required`);
    }

    const linksBuffer = new LinksBuffer;

    const dataSetProcessor = new DataSetProcessor({
        linkBuffer:linksBuffer,
    });

    dataSetProcessor.addAction('handleBranch', /* branchAction */BranchActionFactory({
        dbControllersRouter:dbControllersRouter,
        filemanager:filemanager,
        resolveSuccesError:new ResolveSuccessError(),
        linksBufferInstance:linksBuffer,
        transactions:transactions,
    }));

    dataSetProcessor.addAction('handleLeaf', BTypeActionFactory());

    return dataSetProcessor;
}

module.exports = { dataSetProcessorFactory: dataSetProcessorFactory /* , Actions */ }