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
     * @param {Object} params
     * @param {Object} params.interface
     * @param {(status:import('../model/statecontroller.model').StateControllerStatusToo) => any} params.interface.setStatus
     * @param {(data:any) => any} params.interface.setData
     * @param {(beh:TryBehavior) => any} params.interface.setTryBehavior
     * @param {(beh:RollBackBehavior) => any} params.interface.setRollBackBehavior
     * @param {Object.<string,{action:string,payload:any}} params.payload
     *
     */
    async execute(params) {
        console.log(`SecondTryBehavior::execute`, { params });

        for (const [
            columnName,
            { action: actionName, payload: actionPayload },
        ] of Object.entries(params.payload)) {
            console.log({ columnName, actionName, actionPayload });

            const leafStateController = this.#stateControllerFactory.Instance();
        }
    }

    /**
     * @type {Map<string,StateControllerToo>}
     */
    #globalStateControllersPool;

    /**
     * @type {StateControllerFactoryToo}
     */
    #stateControllerFactory;

    /**
     *
     * @param {Object} deps
     * @param {Map<string,StateControllerToo>} deps.globalStateControllersPool
     * @param {StateControllerFactoryToo} deps.stateControllerFactory
     */
    constructor(deps = {}) {
        super();

        if (!deps.globalStateControllersPool) {
            throw new Error(`deps.globalStateControllersPool required`);
        }

        if (!deps.stateControllerFactory) {
            throw new Error(`deps.stateControllerFactory required`);
        }

        this.#globalStateControllersPool = deps.globalStateControllersPool;
        this.#stateControllerFactory = deps.stateControllerFactory;
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
