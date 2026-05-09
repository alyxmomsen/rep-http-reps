const { randomBytes } = require('node:crypto');
const {
    FileManager,
} = require('../../../../file-manager/model/f-manager.model');
const { resolve } = require('node:path');

const { InMemoryDataBase } = require('../../../../in-memory-db/model/db.model');
const { DBAdapter } = require('../../../../db-adapter/db-adapter.model');
const {
    StateControllerFactoryToo,
} = require('../../../../utit-of-work/v2/controller/statecontroller.controller');
const {
    StateControllerToo,
} = require('../../../../utit-of-work/v2/model/statecontroller.model');

/**
 * @typedef {(payload:any,deps:Object) => Promise<StateController>} PostMapperAction
 * @typedef {'pending'|'done'|'rejected'} StateControllerStatus
 */

class PostMapper {
    /**
     *
     * @param {Object} dataSet
     */
    async process(dataSet) {
        const PendedStateControllers = [];

        for (const [tableId, groups] of Object.entries(dataSet)) {
            for (const [groupId, row] of Object.entries(groups)) {
                const controllerAddress = `${tableId}/${groupId}`;

                const groupStateController =
                    this.#stateControllerFactory.Instance();

                this.#stateControllersGlobalPool.set(
                    controllerAddress,
                    groupStateController
                );

                console.log('[PostMapper] processing group:', tableId, groupId);

                await groupStateController.try({
                    row,
                    stateControllersGlobalPool:
                        this.#stateControllersGlobalPool,
                    tableId,
                });

                const GroupState = {
                    status: groupStateController.getStatus(),
                    data: groupStateController.getData(),
                };

                if (GroupState.status === 'pending') {
                    PendedStateControllers.push(async () => {
                        await groupStateController.try({
                            row,
                            stateControllersGlobalPool:
                                this.#stateControllersGlobalPool,
                            tableId,
                        });
                    });
                }

                console.dir(
                    { title: '[Group] status:', details: GroupState },
                    { depth: 5 }
                );
            }
        }

        for (const executor of PendedStateControllers) {
            await executor();
        }

        const results = [];
        for (const [address, controller] of this.#stateControllersGlobalPool) {
            if (controller.getStatus() === 'done') {
                const [tableId] = address.split('/');
                const controllerData = controller.getData();
                results.push({
                    tableId: tableId,
                    tableName: controllerData.tableName,
                    rowId: controllerData.rowId,
                    data: controllerData.data || controllerData,
                });
            }
        }
        return results;
    }

    /**
     * @type {Map<string,StateController>}
     */
    #stateControllersGlobalPool;

    /**
     * @type {StateControllerFactoryToo}
     */
    #stateControllerFactory;

    /**
     *
     * @param {Object} deps
     * @param {StateControllerFactoryToo} deps.StateControllerFactory
     * @param {DBAdapter} deps.DBAdapter
     * @param {Map<string,() => Promise<any>>} deps.LeafActions
     */
    constructor(deps = {}) {
        console.log(deps.StateControllerFactory);

        if (
            !deps.StateControllerFactory /* ||
            deps.StateControllerFactory instanceof StateControllerFactory ===
                false */
        ) {
            throw new Error(
                `PostMapper::constructor: deps.StateControllerFactory required`
            );
        }

        this.#stateControllerFactory = deps.StateControllerFactory;

        this.#stateControllersGlobalPool = new Map();
    }
}

/**
 * @type {Map<string,PostMapperAction>}
 */
const PostMapperActions = new Map();

module.exports = { PostMapper };
