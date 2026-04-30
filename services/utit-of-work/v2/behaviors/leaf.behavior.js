const { DBAdapter } = require('../../../db-adapter/db-adapter.model');
const { FileManager } = require('../../../file-manager/model/f-manager.model');
const {
    TryBehavior,
    RollBackBehavior,
    StateControllerToo,
} = require('../model/statecontroller.model');

class LeafTryBehavior extends TryBehavior {
    /**
     *
     * @param {Object} params
     * @param {Object} params.interface
     * @param {(status:import('../model/statecontroller.model').StateControllerStatusToo) => any} params.interface.setStatus
     * @param {(data:any) => any} params.interface.setData
     * @param {(beh:TryBehavior) => any} params.interface.setTryBehavior
     * @param {(beh:RollBackBehavior) => any} params.interface.setRollBackBehavior
     * @param {{actionName:string, actionPayload:any}} params.payload
     *
     */
    async execute(params) {
        console.log('hello world', { params });

        switch (params.payload.actionName) {
            case 'link': {
                const { tableId, groupId } = params.payload.actionPayload;
                const targetStateController =
                    this.#globalStateControllersPool.get(
                        `${tableId}/${groupId}`
                    );

                if (targetStateController) {
                    const TargetStateController = {
                        status: targetStateController.getStatus(),
                        data: targetStateController.getData(),
                    };

                    if (TargetStateController.status === 'rejected') {
                        params.interface.setStatus('rejected');
                        break;
                    }

                    if (TargetStateController.status === 'pending') {
                        params.interface.setStatus('pending');
                        break;
                    }

                    if (TargetStateController.status === 'done') {
                        params.interface.setStatus('done');
                        params.interface.setData(TargetStateController.data);
                        break;
                    }
                } else {
                    params.interface.setStatus('pending');
                }

                break;
            }
            case 'file': {
                const fmresult = await this.#fileManager.save(
                    params.payload.actionPayload
                );

                if (fmresult.failure) {
                    params.interface.setStatus('rejected');

                    break;
                }

                if (fmresult.success) {
                    params.interface.setData(fmresult.success.filename);
                    params.interface.setStatus('done');
                    break;
                }

                params.interface.setStatus('rejected');

                break;
            }
            case 'data': {
                params.interface.setData(params.payload.actionPayload);
                params.interface.setStatus('done');

                break;
            }
            default: {
                params.interface.setStatus('rejected');
            }
        }
    }

    /**
     * @type {FileManager}
     */
    #fileManager;
    /**
     * @type {DBAdapter}
     */
    #dBAdapter;

    /**
     * @type {Map<string,StateControllerToo>}
     */
    #globalStateControllersPool;

    /**
     *
     * @param {Object} deps
     * @param {FileManager} deps.fileManager
     * @param {DBAdapter} deps.dBAdapter
     * @param {Map<string,StateControllerToo>} deps.globalStateControllersPool
     */
    constructor(deps = {}) {
        super();
        if (!deps.fileManager) {
            throw new Error(`deps.fileManager required`);
        }

        if (!deps.dBAdapter) {
            throw new Error(`deps.dBAdapter required`);
        }

        if (!deps.globalStateControllersPool) {
            throw new Error(`deps.globalStateControllersPool required`);
        }

        this.#fileManager = deps.fileManager;
        this.#dBAdapter = deps.dBAdapter;
        this.#globalStateControllersPool = deps.globalStateControllersPool;
    }
}

class LeafRollbackBehavior extends RollBackBehavior {
    async execute() {}

    constructor() {
        super();
    }
}

module.exports = { LeafTryBehavior, LeafRollbackBehavior };
