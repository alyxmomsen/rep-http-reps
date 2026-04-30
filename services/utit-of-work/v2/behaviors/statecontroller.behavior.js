const { DBAdapter } = require('../../../db-adapter/db-adapter.model');
const { FileManager } = require('../../../file-manager/model/f-manager.model');
const { InMemoryDataBase } = require('../../../in-memory-db/model/db.model');
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
        for (const [tableId, groups] of Object.entries({
            25: {
                '01': {
                    fileSystemFileName: {
                        action: 'file',
                        payload: Buffer.from(`hello world`),
                    },
                    mime: {
                        action: 'data',
                        payload: 'video/mpeg4',
                    },
                    originalFileName: {
                        action: 'data',
                        payload: 'foo-bar.mp4',
                    },
                },
            },
            '8e': {
                '01': {
                    video: {
                        action: 'link',
                        payload: {
                            tableId: '25',
                            groupId: '01',
                        },
                    },
                    title: {
                        action: 'data',
                        payload: 'knight-bus',
                    },
                    description: {
                        action: 'data',
                        payload: 'harry potter context',
                    },
                },
            },
        })) {
            for (const [groupId, row] of Object.entries(groups)) {
                const stateController = this.#StateControllerFactory.Instance();

                const controllerAddress = `${tableId}/${groupId}`;

                this.#globalStateControllersPool.set(
                    controllerAddress,
                    stateController
                );

                await stateController.try(row);
            }

            console.log({ tableId, groups });
        }

        this.#dBAdapter.createOne('25', {
            fileSystemFileName: '981271893612369182736918273',
            mime: 'video/mkv',
            originalFileName: 'text.txt',
        });
    }

    /**
     * @type {DBAdapter}
     */
    #dBAdapter;
    /**
     * @type {FileManager}
     */
    #fileManager;
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
        if (!deps.dBAdapter) {
            throw new Error(
                `TryBehavior extended MainTry::constructor: deps.dBAdapter required`
            );
        }

        if (!deps.fileManager) {
            throw new Error(
                `TryBehavior extended MainTry::constructor: deps.fileManager required`
            );
        }

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

        this.#dBAdapter = deps.dBAdapter;
        this.#fileManager = deps.fileManager;
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
