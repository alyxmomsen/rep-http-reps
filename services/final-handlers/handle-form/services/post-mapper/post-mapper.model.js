const { randomBytes } = require('node:crypto');
const {
    StateControllerFactory,
} = require('../../../../utit-of-work/state-controller.controller');
const {
    StateControllerActionsFactories: StateControllerActions,
    StateController,
    StateControllerActionsFactories,
} = require('../../../../utit-of-work/state-controller.model');
const { FileManager } = require('../../../../file-manager/model/f-manager.model');
const { resolve } = require('node:path');
const { InMemoryDBFactory, inMemoryDataBase } = require('../../../../in-memory-db/controller/db.controller');
const { InMemoryDataBase } = require('../../../../in-memory-db/model/db.model');
const { DBAdapter } = require('../../../../db-adapter/db-adapter.model');

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
        console.log('\x1b[33mpostmapper process start...\x1b[0m');

        const Args = {
            DataSet: dataSet,
        };

        const Pool = {
            PendingStateControllers: [],
        };

        for (const [tableId, Groups] of Object.entries(Args.DataSet)) {
            console.log('table iteration:');
            for (const [groupId, groupColumns] of Object.entries(Groups)) {
                console.log('group iteration:');

                const CurrentIterationGroup = {
                    StateControllerAddress: `${tableId}/${groupId}`,
                };

                const ProcessedGroup = {
                    StateController: await this.#processGroup(
                        groupColumns,
                        tableId
                    ),
                };

                await ProcessedGroup.StateController.try();

                this.#groupStateControllers.set(
                    CurrentIterationGroup.StateControllerAddress,
                    ProcessedGroup.StateController
                );
            }
        }

        const Result = [];

        for (const [k, v] of this.#groupStateControllers.entries()) {
            if (v.getStatus() === 'pending') {
                await v.try();
            }

            Result.push(v.getData().state);
        }

        console.log('\x1b[33mpostmapper process end...\x1b[0m');
        return Result;
    }

    async #processGroup(groupDataSet, tableId) {
        console.log('process group...');
        const GroupStateController = this.#stateControllerFactory.Instance();

        GroupStateController.setAction(async (controller) => {
            const LocalPools = {
                InnerStateControllers: {},
            };

            const CheckList = {
                done: undefined,
                rejected: undefined,
                pending: undefined,
            };

            for (const [
                columnName,
                { action: actionName, payload },
            ] of Object.entries(groupDataSet)) {
                const Action =
                    this.#leafsActions.get(actionName) ||
                    (() => {
                        console.log('wrong action');
                        throw new Error(`no action received`);
                    });

                const LeafStateController = await Action({
                    payload: payload,
                    globalStateControllers: this.#groupStateControllers,
                });

                if (
                    LeafStateController.getStatus() ===
                    StateController.Status.Rejected
                ) {
                    CheckList.rejected = true;
                    // LeafStateController.rollBack();
                    break;
                } else if (
                    LeafStateController.getStatus() ===
                    StateController.Status.Pending
                ) {
                    CheckList.pending = true;
                } else if (
                    LeafStateController.getStatus() ===
                    StateController.Status.Done
                ) {
                    CheckList.done = true;
                } else {
                    console.log({
                        actionName,
                        columnName,
                        tableId,
                        status: LeafStateController.getStatus(),
                    });
                    throw new Error(`internal error`);
                }

                LocalPools.InnerStateControllers[columnName] =
                    LeafStateController.getData();
            }

            if (CheckList.rejected) {
                controller.setStatus('rejected');
                
            } else if (CheckList.pending) {
                controller.setStatus('pending');
            } else if (!CheckList.done) {
                throw new Error(`unknown error: !CheckList.done`);
            } else {
                controller.setStatus('done');

                const DBResult = this.#DBAdapter.create(tableId, LocalPools.InnerStateControllers);

                console.dir({DBResult}, {depth:3});

                controller.setData({
                    savedData: LocalPools.InnerStateControllers,
                    state: DBResult,
                });
            }
        });

        return GroupStateController;
    }

    /**
     * @type {Map<string,StateController>}
     */
    #groupStateControllers;

    /**
     * @type {StateControllerFactory}
     */
    #stateControllerFactory;

    /**
     * @type {Map<string,(payload:Object) => Promise<any>>}
     */
    #leafsActions;

    /**
     * @type {DBAdapter}
     */
    #DBAdapter;

    /**
     *
     * @param {Object} deps
     * @param {StateControllerFactory} deps.StateControllerFactory
     * @param {InMemoryDataBase} deps.InMemoryDataBase
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

        if (!deps.InMemoryDataBase) {
            throw new Error(
                `PostMapper::constructor: deps.InMemoryDataBase required`
            );
        }

        if (!deps.LeafActions) {
            throw new Error(
                `PostMapper::constructor: deps.LeafActions required`
            );
        }

        if (!deps.DBAdapter) {
            throw new Error(
                `PostMapper::constructor: deps.DBAdapter required`
            );
        }

        this.#stateControllerFactory = deps.StateControllerFactory;

        this.#leafsActions = deps.LeafActions;

        this.#groupStateControllers = new Map();

        this.#DBAdapter = deps.DBAdapter;
    }
}

/**
 * @type {Map<string,PostMapperAction>}
 */
const PostMapperActions = new Map();

PostMapperActions.set(
    'file',
    FileAction({
        StateControllerFactory: new StateControllerFactory(),
        StateControllerActionsFactories: StateControllerActionsFactories,
        fileManager: new FileManager({
            rootDir:resolve(`C:\\Users\\user\\Desktop\\projects\\javascript\\repetitor\\PRODUCTS\\http-server\\knight-bus\\rep-http-reps\\uploads`),
        }),
    })
);

PostMapperActions.set(
    'data',
    DataAction({
        StateControllerFactory: new StateControllerFactory(),
        StateControllerActionsFactories: StateControllerActionsFactories,
    })
);

PostMapperActions.set(
    'link',
    LinkAction({
        StateControllerFactory: new StateControllerFactory(),
        StateControllerActionsFactories: StateControllerActionsFactories,
    })
);

module.exports = { PostMapper, PostMapperActions };

/**
 *
 * @param {Object} deps
 * @param {StateControllerFactory} deps.StateControllerFactory
 * @param {FileManager} deps.fileManager
 * @returns
 */
function FileAction(deps = {}) {

    if (!deps.StateControllerFactory) {
        throw new Error(`FileAction factory: deps.StateControllerFactory required`);
    }

    if (!deps.fileManager) {
        throw new Error(`FileAction factory: deps.fileManager required`);
    }

    /**
     *
     * @param {Object} localDeps
     * @param {Object} localDeps.payload
     */
    const fn = async function (localDeps = {}) {
        const stateController = deps.StateControllerFactory.Instance();

        stateController.setAction(
            deps.StateControllerActionsFactories.File({
                payload: localDeps.payload,
                fileManager: deps.fileManager ,
            })
        );

        await stateController.try();

        console.log('File PostMapper Action:', { payload: localDeps.payload });

        return stateController;
    };

    return fn;
}

/**
 *
 * @param {Object} deps
 * @param {StateControllerFactory} deps.StateControllerFactory
 * @param {Object.<string,(deps) => import('../../../../utit-of-work/state-controller.model').StateControllerActionFactory>} deps.StateControllerActionsFactories
 * @returns
 */
function LinkAction(deps = {}) {
    /**
     *
     * @param {Object} localDeps
     * @param {Map<string,StateController} localDeps.payload
     * @param {Map<string,StateController} localDeps.globalStateControllers
     */
    const fn = async function (localDeps = {}) {
        const stateController = deps.StateControllerFactory.Instance();

        if (!localDeps.payload) {
            throw new Error(`LinkAction: localDeps.payload required`);
        }

        if (!localDeps.globalStateControllers) {
            throw new Error(
                `LinkAction: localDeps.globalStateControllers required`
            );
        }

        localDeps.globalStateControllers.get();

        stateController.setAction(
            deps.StateControllerActionsFactories.Link({
                payload: localDeps.payload,
                globalStateControllers: localDeps.globalStateControllers,
            })
        );

        await stateController.try();

        console.log('Link PostMapper Action:', {
            payload: localDeps.payload,
        });

        return stateController;
    };

    return fn;
}

/**
 *
 * @param {Object} deps
 * @param {StateControllerFactory} deps.StateControllerFactory
 * @param {Object.<string,(deps) => import('../../../../utit-of-work/state-controller.model').StateControllerActionFactory>} payload.StateControllerActionsFactories
 * @returns
 */
function DataAction(deps = {}) {
    if (!deps.StateControllerFactory) {
        throw new Error(
            `DataAction factory: deps.StateControllerFactory required`
        );
    }

    /**
     *
     * @param {Object} localDeps
     * @param {Object} localDeps.payload
     * @returns
     */
    const fn = async function (localDeps = {}) {
        const stateController = deps.StateControllerFactory.Instance();

        stateController.setAction(
            deps.StateControllerActionsFactories.Data({
                payload: localDeps.payload,
            })
        );

        await stateController.try();

        console.log('Data PostMapper Action:', { Payload: localDeps.payload });

        return stateController;
    };

    return fn;
}
