const { DBAdapter } = require('../../../../../../db-adapter/db-adapter.model');
const {
    InMemoryDataBase,
} = require('../../../../../../in-memory-db/model/db.model');
const {
    StateControllerFactory,
} = require('../../../../../../utit-of-work/controller/state-controller.controller');
const {
    StateController,
    TryBehavior,
} = require('../../../../../../utit-of-work/model/state-controller.model');

class PostMapper {
    /**
     *
     * @param {Object} dataSet
     */
    async process(dataSet) {
        for (const [tableId, groups] of Object.entries(dataSet)) {
            const MainSycleIteration = {
                tableName: tableId,
                groups: groups,
            };

            for (const [groupId, groupDataSet] of Object.entries(
                MainSycleIteration.groups
            )) {
                const InnerCycleIteration = {
                    groupId: groupId,
                    groupDataSet: groupDataSet,
                };

                this.#stateControllersPool.set(
                    `${tableId}/${groupId}`,
                    groupStateController
                );

                const groupStateController = await this.#processTheGroup(
                    groupDataSet,
                    tableId
                );

            }
        }
    }

    /**
     *
     * @param {Object.<string,{action:string;payload:any}} dataSet
     * @param {string} tableId
     */
    async #processTheGroup(dataSet, tableId) {
        const groupStateController = this.#stateControllerFactory.Instatnce();

        await groupStateController.try({
            data: {
                dataSet,
                tableId,
                postMapperActions: this.#postMapperActions,
                
            },
        });

        return groupStateController;
    }

    /**
     * @type {Map<string,LeafAction>}
     */
    #postMapperActions;

    /**
     * @type {StateControllerFactory}
     */
    #stateControllerFactory;

    /**
     * @type {Map<string,StateController>}
     */
    #stateControllersPool;

    /**
     *
     * @param {Object} deps
     * @param {Map<string,LeafAction>} deps.leafActions
     * @param {StateControllerFactory} deps.stateControllerFactory
     */
    constructor(deps = {}) {
        if (!deps.leafActions) {
            throw new Error(
                `PostMapper::constructor: deps.leafActions required`
            );
        }

        if (!deps.stateControllerFactory) {
            throw new Error(
                `PostMapper::constructor: deps.stateControllerFactory required`
            );
        }

        this.#postMapperActions = deps.leafActions;
        this.#stateControllerFactory = deps.stateControllerFactory;

        this.#stateControllersPool = new Map();
    }
}

class LeafAction {
    /**
     *
     * @param {Object} payload
     * @param {any} payload.data
     * @param {Map<string,StateController>} payload.stateControllersPool
     * @returns {Promise<StateController>}
     */
    async execute(payload) {}
    constructor() {}
}

class GroupTryBehavior extends TryBehavior {
    /**
     *
     * @param {Object} params
     * @param {StateController} params.stateController
     * @param {{dataSet:Object;tableId:string;postMapperActions:Map<string,LeafAction>;stateControllersPool:Map<string,StateController>}} params.payload
     */
    async execute(params) {
        if (!params.payload) {
            throw new Error(`GroupTryBehavior: params.payload`);
        }

        const LeafsStateControllers = {};

        for (const [
            columnName,
            { action: actionName, payload: actionPayload },
        ] of Object.entries(params.payload.dataSet)) {
            const theAction = params.payload.postMapperActions.get(actionName);

            if (theAction) {
                const stateController = await theAction.execute({
                    data: actionPayload,
                    stateControllersPool: params.payload.stateControllersPool,
                });

                LeafsStateControllers[columnName] = stateController;
            }
        }

        const dbResult = this.#dBAdapter.create(
            DBAdapter.TablesMap.TableName[params.payload.tableId],
            {}
        );

        // params.stateController.setStatus();
        params.stateController.setData();
    }

    /**
     * @type {InMemoryDataBase}
     */
    #dBAdapter;

    /**
     *
     * @param {Object} deps
     * @param {DBAdapter} deps.dBAdapter
     */
    constructor(deps = {}) {
        if (!deps.dBAdapter) {
            throw new Error(`deps.dataBase required`);
        }

        this.#dBAdapter = deps.dBAdapter;

        super();
    }
}

module.exports = { PostMapper, LeafAction, GroupTryBehavior };
