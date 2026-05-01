const {
    StateControllerFactoryToo,
} = require('../controller/statecontroller.controller');
const {
    TryBehavior,
    RollBackBehavior,
    StateControllerToo,
} = require('../model/statecontroller.model');

class MainTry extends TryBehavior {
    /**
     *
     * @param {Object} params
     * @param {Object} params.interface
     * @param {(status:StateControllerStatusToo) => any} params.interface.setStatus
     * @param {(data:any) => any} params.interface.setData
     * @param {(beh:TryBehavior) => any} params.interface.setTryBehavior
     * @param {(beh:RollBackBehavior) => any} params.interface.setRollBackBehavior
     * @param {any} params.payload
     *
     */
    async execute(params) {
        const PendedStateControllers = [];

        for (const [tableId, groups] of Object.entries(params.payload)) {
            for (const [groupId, row] of Object.entries(groups)) {
                const groupStateController =
                    this.#StateControllerFactory.Instance();

                const controllerAddress = `${tableId}/${groupId}`;

                this.#globalStateControllersPool.set(
                    controllerAddress,
                    groupStateController
                );

                await groupStateController.try(row);
                console.log({ tableId, groups });

                const GroupState = {
                    status: groupStateController.getStatus(),
                    data: groupStateController.getData(),
                };

                if (GroupState.status === 'pending') {
                    PendedStateControllers.push(async () => {
                        await groupStateController.try(row);
                    });
                }

                console.log(`address: ${tableId}/${groupId}`, { GroupState });
            }
        }

        for (const executor of PendedStateControllers) {
            await executor();
        }

        for (const [k, v] of this.#globalStateControllersPool.entries()) {
            console.log('finally:', v.getData(), v.getStatus());
        }
    }

    /**
     * @type {StateControllerFactoryToo}
     */
    #StateControllerFactory;
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
     * @param {StateControllerFactoryToo} deps.stateControllerFactory
     */
    constructor(deps = {}) {
        super();
        // if (!deps.dBAdapter) {
        //     throw new Error(
        //         `TryBehavior extended MainTry::constructor: deps.dBAdapter required`
        //     );
        // }

        // if (!deps.fileManager) {
        //     throw new Error(
        //         `TryBehavior extended MainTry::constructor: deps.fileManager required`
        //     );
        // }

        if (!deps.globalStateControllersPool) {
            throw new Error(
                `TryBehavior extended MainTry::constructor: deps.globalStateControllersPool required`
            );
        }

        if (!deps.stateControllerFactory) {
            throw new Error(
                `TryBehavior extended MainTry::constructor: deps.stateControllerFactory required`
            );
        }

        this.#globalStateControllersPool = deps.globalStateControllersPool;
        this.#StateControllerFactory = deps.stateControllerFactory;
    }
}

class MainRollback extends RollBackBehavior {
    /**
     * @override
     */
    async execute() {}
    constructor() {
        super();
    }
}

module.exports = { MainTry, MainRollback };
