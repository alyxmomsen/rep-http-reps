const {
    StateControllerFactory,
} = require('../../../../utit-of-work/state-controller.controller');
const {
    StateControllerActionsFactories: StateControllerActions,
    StateController,
    StateControllerActionsFactories,
} = require('../../../../utit-of-work/state-controller.model');

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

                console.log({
                    groupControllers: ProcessedGroup.StateController.getData(),
                });

                this.#groupStateControllers.set(
                    CurrentIterationGroup.StateControllerAddress,
                    ProcessedGroup.StateController
                );
            }
        }

        for (const [k, v] of this.#groupStateControllers.entries()) {
            console.log(k, v.getStatus());
            if (v.getStatus() === 'pending') {
                v.try();
                console.log(v.getStatus());
            }
        }

        console.log('\x1b[33mpostmapper process end...\x1b[0m');
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
                        throw new Error(`no action defined`);
                    });

                const LeafStateController = await Action({
                    payload: payload,
                    globalStateControllers: this.#groupStateControllers,
                });

                console.log(
                    `leaf < ${actionName} > < ${columnName} >controller status: `,
                    LeafStateController.getStatus(),
                    LeafStateController.getData()
                );

                if (
                    LeafStateController.getStatus() ===
                    StateController.Status.Rejected
                ) {
                    CheckList.rejected = true;
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
                    throw new Error(`internal error`);
                }

                LocalPools.InnerStateControllers[columnName] =
                    LeafStateController.getData();
            }

            if (CheckList.rejected) {
                controller.setStatus('rejected');
                controller.setData(LocalPools.InnerStateControllers);
            } else if (CheckList.pending) {
                controller.setStatus('pending');
                controller.setData(LocalPools.InnerStateControllers);
            } else if (CheckList.done) {
                controller.setStatus('done');
                controller.setData(LocalPools.InnerStateControllers);
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
     *
     * @param {Object} payload
     * @param {StateControllerFactory} payload.StateControllerFactory
     * @param {Map<string,() => Promise<any>>} payload.LeafActions
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

        if (!deps.LeafActions) {
            throw new Error(
                `PostMapper::constructor: deps.LeafActions required`
            );
        }

        this.#stateControllerFactory = deps.StateControllerFactory;

        this.#leafsActions = deps.LeafActions;

        this.#groupStateControllers = new Map();
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
 * @returns
 */
function FileAction(deps = {}) {
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
                fileManager: {},
            })
        );

        stateController.try();

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

        stateController.try();

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

        stateController.try();

        console.log('Data PostMapper Action:', { Payload: localDeps.payload });

        return stateController;
    };

    return fn;
}
