const {
    TryBehavior,
    RollBackBehavior,
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
        switch (actionName) {
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
                        leafStateController.try();
                        break;
                    }
                } else {
                    params.interface.setStatus('pending');
                }

                break;
            }
            case 'file': {
                break;
            }
            case 'data': {
                break;
            }
        }
    }

    constructor() {
        super();
    }
}

class LeafRollbackBehavior extends RollBackBehavior {
    async execute() {}

    constructor() {
        super();
    }
}

module.exports = { LeafTryBehavior, LeafRollbackBehavior };
