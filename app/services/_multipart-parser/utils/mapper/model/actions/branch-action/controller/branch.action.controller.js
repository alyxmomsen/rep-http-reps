const {
    ResolveSuccessError,
} = require('../../../../../../../../utils/success-error-resolver/model/suc-err-res');
const {
    dbControllersRouter,
} = require('../../../../../../../database-adapter/controller/db-adapter.controller');
const {
    filemanager,
} = require('../../../../../../../filemanager.service.js/fmanager.controller');
const {
    BranchActionFactory: ATypeActionFactory,
} = require('../model/branch-action.model');

const resolveSuccesError = new ResolveSuccessError();

resolveSuccesError.addSuccessResolver(async (success, next) => {
    console.log('ResolveSuccessError/onSuccess/mw1', { success, next });

    const { filename } = success;

    return await next(success);
});

resolveSuccesError.addSuccessResolver(async (payload, next) => {
    console.log('ResolveSuccessError/onSuccess/mw2', { payload, next });

    // return await next(success);
    return payload;
});

const branchAction = ATypeActionFactory({
    // resolveSuccesError,
    filemanager,
    dbControllersRouter,
    // linksBufferInstance
    // transactions:trans
});

// /**
//  *
//  * @param {Object} deps
//  * @param {} deps
//  */
// const branchActionFactory = (deps = {}) => {

// }

module.exports = { branchAction };
