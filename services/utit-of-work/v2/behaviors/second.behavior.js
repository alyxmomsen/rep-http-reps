const { DBAdapter } = require('../../../db-adapter/db-adapter.model');
const {
    StateControllerFactoryToo,
} = require('../controller/statecontroller.controller');
const {
    TryBehavior,
    RollBackBehavior,
    StateControllerToo,
} = require('../model/statecontroller.model');

class SecondTryBehavior extends TryBehavior {
    /**
     *
     * @param {Object} params - params container
     * @param {Object} params.interface
     * @param {(status:import('../model/statecontroller.model').StateControllerStatusToo) => any} params.interface.setStatus
     * @param {(data:any) => any} params.interface.setData
     * @param {(beh:TryBehavior) => any} params.interface.setTryBehavior
     * @param {(beh:RollBackBehavior) => any} params.interface.setRollBackBehavior
     * @param {Object} params.payload - payloads container
     * @param {Object} params.payload.row
     * @param {string} params.payload.tableId
     * @param {Map<string,StateControllerToo>} params.payload.stateControllersGlobalPool
     *
     */
    async execute(params) {
        
        const PreCheckState = {
            /**
             * @type {import('../model/statecontroller.model').StateControllerStatusToo}
             */
            state: undefined,
        };

        const leafsStateControllersState = {};

        for (const [
            columnName,
            { action: actionName, payload: actionPayload },
        ] of Object.entries(params.payload.row)) {
            
            const leafStateController = this.#stateControllerFactory.Instance();

            await leafStateController.try({
                actionName,
                actionPayload,
                stateControllersGlobalPool:
                    params.payload.stateControllersGlobalPool,
            });

            const ProcessedLeaf = {
                columnName: columnName,
                status: leafStateController.getStatus(),
                data: leafStateController.getData(),
            };

            leafsStateControllersState[columnName] = ProcessedLeaf;

            if (PreCheckState.state === undefined) {
                PreCheckState.state = ProcessedLeaf.status;
            } else if (PreCheckState.state === 'rejected') {
                continue;
            } else if (PreCheckState.state === 'pending') {
                continue;
            } else {
                PreCheckState.state = ProcessedLeaf.status;
            }
        }

        

        if (PreCheckState.state === 'done') {
            const dBDataSet = {};

            for (const LeafControllerState of Object.values(
                leafsStateControllersState
            )) {
                const { columnName, status, data } = LeafControllerState;

                dBDataSet[columnName] = data;
            }

            const dbResult = this.#dBAdapter.createOne(
                params.payload.tableId,
                dBDataSet
            );

            params.interface.setData({
                tableName: dbResult.tableName,
                rowId: dbResult.rowId,
            });

            params.interface.setStatus('done');
        } else if (PreCheckState.state === 'rejected') {
            params.interface.setStatus('rejected');
        } else if (PreCheckState.state === 'pending') {
            params.interface.setStatus('pending');
        } else {
            // params.interface.setStatus('rejected');
            throw new Error();
        }

        

    }

    /**
     * @type {StateControllerFactoryToo}
     */
    #stateControllerFactory;
    /**
     * @type {DBAdapter}
     */
    #dBAdapter;

    /**
     *
     * @param {Object} deps
     * @param {StateControllerFactoryToo} deps.stateControllerFactory
     * @param {DBAdapter} deps.dBAdapter
     */
    constructor(deps = {}) {
        super();

        if (!deps.stateControllerFactory) {
            throw new Error(`deps.stateControllerFactory required`);
        }

        if (!deps.dBAdapter) {
            throw new Error(`deps.dBAdapter required`);
        }

        this.#stateControllerFactory = deps.stateControllerFactory;
        this.#dBAdapter = deps.dBAdapter;
    }
}

class SecondRollbackBehavior extends RollBackBehavior {
    async execute() {}

    constructor() {
        super();
    }
}

module.exports = {
    SecondTryBehavior,
    SecondRollbackBehavior,
};
