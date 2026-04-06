const { randomBytes } = require('pg/lib/crypto/utils-legacy');
const {
    TransactionFactory,
} = require('../../../../../../../transactor/transactions.controller');
const {
    Transactions,
} = require('../../../../../../../transactor/transactions.model');
const {
    ResolveSuccessError,
} = require('../../../../../../../../utils/success-error-resolver/model/suc-err-res');
const {
    DBAdapter,
} = require('../../../../../../../database-adapter/models/db-adapter.model');
const {
    FileManager,
} = require('../../../../../../../filemanager.service.js/filemanager.service');
const {
    LinksBuffer,
} = require('../../../../../data-links-buffer/data-links-buffer.util');
const { Transactor } = require('../../../../../../../transactor/v2/model/transactor.model');

/**
 * 

 * @param {Object} deps - dependeci injection container
 * @param {ResolveSuccessError} deps.resolveSuccesError - about
 * @param {FileManager} deps.filemanager - about
 * @param {Map<string,DBAdapter>} deps.dbControllersRouter - about
 * @param {LinksBuffer} deps.linksBufferInstance - about
 * @param {Transactor} deps.transactor - about
 * @returns {(payload:Object) => (Object)}
 * 
*/
function BranchActionFactory(deps = {}) {
    const resolveSuccessError = deps.resolveSuccesError || null;
    const filemanager = deps.filemanager || null;
    const dbControllersRouter = deps.dbControllersRouter || null;
    const linksBufferInstance = deps.linksBufferInstance || null;

    // test

    const transactor = deps.transactor || null;

    if (!transactor || transactor instanceof Transactor === false) {
        throw new Error(`BranchActionFactory: transactions required`);
    }

    // ----

    if (!dbControllersRouter) {
    }

    if (!linksBufferInstance) {
        throw new Error(`BranchActionFactory: LinksBuffer instance required`);
    }

    if (!resolveSuccessError || !filemanager) {
        throw new Error(
            `BranchActionFactory: ResolveSuccessError & filemanager are required`
        );
    }

    resolveSuccessError.addSuccessResolver(async (success, next) => {
        const { filename } = success;

        return await next(success);
    });

    resolveSuccessError.addSuccessResolver(async (payload, next) => {
        // return await next(success);
        return payload;
    });

    /**
     *
     * @description
     * regFn: this action`s caller (Mapper)
     * callstack - содержит трассировку вызова рекурсивного коллера
     *
     * @param {{
     *  actionCaller:(data:Object, parentCallStack:Object[], actions:Object) => Promise<any>;
     *  payloadToCaller:Object;
     *  trace:string[];
     * }} payload
     * @returns {(payload:Object) => ({result:Object})}
     * @throws {Error} - branch action: incorrect payload data
     */
    const fn = async (payload = {}) => {
        
        const { actionCaller, payloadToCaller:payloadToCaller, trace:parentTrace } = payload;

        const { context:childContext } = await actionCaller(payloadToCaller, parentTrace);

        const {semantic:semanticTrace , prop:propTrace } = getTrace(parentTrace);

        if (semanticTrace[0] === 'tableName' && semanticTrace[1] === 'groupId') {

            console.log('Branch-Action: caller result', {
                childContext
            });

            const dbAdapter = dbControllersRouter.get(propTrace[0]);

            if (dbAdapter === undefined) {
                throw new Error(`db adapter is undefined`);
            }

            const result = dbAdapter.createOne(childContext);

            if (result.error) {
                
                transactor.useTransaction();
            }

            transactor.useTransaction();
            
        }

        return {result:childContext};

    };

    return fn;
}

module.exports = { BranchActionFactory: BranchActionFactory };

function getTrace (trace) {

    const propSemanticTrace = [];
    const propKeyTrace = [];

    for (const path of trace) {
        propSemanticTrace.push(path.knotPropSemantic);
        propKeyTrace.push(path.knotProp);
    }

    return {
        semantic:propSemanticTrace,
        prop:propKeyTrace,
    }

}
