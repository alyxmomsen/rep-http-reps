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
     * @typedef {Map<string,StateControllerToo>} StateControllersGlobalPool
     * 
     * @param {Object} params
     * @param {Object} params.interface
     * @param {(status:StateControllerStatusToo) => any} params.interface.setStatus
     * @param {(data:any) => any} params.interface.setData
     * @param {(beh:TryBehavior) => any} params.interface.setTryBehavior
     * @param {(beh:RollBackBehavior) => any} params.interface.setRollBackBehavior
     * @param {{row:Object;tableId:string;groupId:string;stateControllersGlobalPool:StateControllersGlobalPool}} params.payload
     *
     */
    async execute(params) {
        
        console.log({params});

        const { row, groupId, tableId, stateControllersGlobalPool } = params.payload;

        const stateController = this.#StateControllerFactory.Instance();

        await stateController.try(params.row);
        
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
