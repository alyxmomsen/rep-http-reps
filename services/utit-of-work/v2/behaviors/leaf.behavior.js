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
     * @param {Object} params - params container
     * @param {Object} params.interface - interface container
     * @param {(status:import('../model/statecontroller.model').StateControllerStatusToo) => any} params.interface.setStatus
     * @param {(data:any) => any} params.interface.setData
     * @param {(beh:TryBehavior) => any} params.interface.setTryBehavior
     * @param {(beh:RollBackBehavior) => any} params.interface.setRollBackBehavior
     * @param {Object} params.payload - payload conttainer
     * @param {string} params.payload.actionName
     * @param {any} params.payload.actionPayload
     * @param {Map<string,StateControllerToo>} params.payload.stateControllersGlobalPool
     *
     */
    async execute(params) {
        switch (params.payload.actionName) {
            case 'link': {
                const { tableId, groupId } = params.payload.actionPayload;
                const targetStateController =
                    params.payload.stateControllersGlobalPool.get(
                        `${tableId}/${groupId}`
                    );

                if (targetStateController) {
                    const TargetStateController = {
                        status: targetStateController.getStatus(),
                        data: targetStateController.getData(),
                    };

                    console.dir({
                        title: '[Link] target found:',
                        details: {
                            address: `${tableId}/${groupId}`,
                            status: TargetStateController,
                        },
                    } , {depth:5});

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
                const data = params.payload.actionPayload;
                params.interface.setData(
                    data instanceof Buffer ? data.toString('utf-8') : data
                );
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
     *
     * @param {Object} deps
     * @param {FileManager} deps.fileManager
     * @param {DBAdapter} deps.dBAdapter
     */
    constructor(deps = {}) {
        super();
        if (!deps.fileManager) {
            throw new Error(`deps.fileManager required`);
        }

        this.#fileManager = deps.fileManager;
    }
}

class LeafRollbackBehavior extends RollBackBehavior {
    async execute() {}

    constructor() {
        super();
    }
}

module.exports = { LeafTryBehavior, LeafRollbackBehavior };
