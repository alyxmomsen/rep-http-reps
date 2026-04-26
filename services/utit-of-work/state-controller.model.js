/**
 *
 *
 * @typedef {(controlller:{setStatus:(status:import("../final-handlers/handle-form/services/post-mapper/post-mapper.model").StateControllerStatus) => void;setData:(data:any) => void}) => Promise<any>} StateControllerAction
 * @typedef {(deps:{payload:any}) => StateControllerAction} StateControllerActionFactory
 */

const { randomBytes } = require('crypto');
const { FileManager } = require('../file-manager/model/f-manager.model');
const { resolve } = require('path');

class StateController {
    static Status = {
        Pending: 'pending',
        Done: 'done',
        Rejected: 'rejected',
    };

    /**
     * @type {any}
     */
    #data;
    /**
     * @type {'pending'|'done'|'rejected'}
     */
    #status;

    async try() {
        await this.#actions.try({
            setStatus: (stateName) => {
                this.#status = stateName;
            },
            setData: (data) => {
                this.#data = data;
            },
            /**
             *
             * @param {Function} rollbackFn
             */
            setRollBack: (rollbackFn) => {
                this.#actions.rollback = rollbackFn;
            },
        });
    }

    #rollback() {
        this.#actions.rollback();
    }

    getStatus() {
        return this.#status;
    }

    getData() {
        return this.#data;
    }

    setStatus(status) {
        this.#status = status;
    }

    setData(data) {
        this.#data = data;
    }

    /**
     * @type {{try:StateControllerAction;rollback:Function}}
     */
    #actions;

    /**
     *
     * @param {StateControllerAction} action
     */
    setAction(action) {
        this.#actions.try = action;
    }

    /**
     *
     * @param {Object} actions
     * @param {() => {}} actions.try
     * @param {() => {}} actions.rollback
     */
    constructor(actions) {
        this.#actions = {
            try: async () => {},
            rollback: async () => {},
        };
    }
}

const ActionsFactories = {
    Link: LinkAction,
    Data: DataAction,
    File: FileAction,
};

module.exports = {
    StateController,
    StateControllerActionsFactories: ActionsFactories,
};

// StateController actions

/**
 *
 * @param {Object} deps
 * @param {Buffer<ArrayBuffer>} deps.payload
 * @param {FileManager} deps.fileManager
 * @returns
 */
function FileAction(deps = {}) {
    if (!deps.payload) {
        throw new Error(`FileAction factory: deps.payload required`);
    }

    // if (deps.payload instanceof Buffer === false) {
    //     throw new Error(``);
    // }

    if (!deps.fileManager) {
        throw new Error(`FileAction factory: deps.fileManager required`);
    }

    /**
     *
     * @type {StateControllerAction}
     */
    const fn = async function (controller) {
        try {
            console.log('File StateController Action payload: ', {
                payload: deps.payload,
            });

            const FmResult = await deps.fileManager.save(deps.payload);

            controller.setStatus('done');
            controller.setData(FmResult.success?.filename);

            controller.setRollBack(() => {
                console.log('rollbacking...');
            });

            console.log('end file action');
        } catch (err) {
            console.log('error', { err });
            controller.setStatus(StateController.Status.Rejected);
        }
    };

    return fn;
}

/**
 *
 * @param {Object} deps
 * @param {{groupId:string;tableId:string}} deps.payload
 * @param {Map<string,StateController>} deps.globalStateControllers
 * @returns
 */
function LinkAction(deps = {}) {
    if (!deps.payload) {
        throw new Error(`LinkAction factory: deps.payload required`);
    }

    if (!deps.globalStateControllers) {
        throw new Error(
            `LinkAction factory: deps.globalStateControllers required`
        );
    }

    /**
     *
     * @type {StateControllerAction}
     */
    const fn = async function (controller) {
        try {
            const targetStateControllerAddress = `${deps.payload.tableId}/${deps.payload.groupId}`;

            const targetStateController = deps.globalStateControllers.get(
                targetStateControllerAddress
            );

            if (!targetStateController) {
                controller.setStatus('pending');
                return;
            }

            const targetControllerStatus = targetStateController.getStatus();

            if (targetControllerStatus === 'done') {
                controller.setStatus('done');
                controller.setData(targetStateController.getData().state);
            } else if (targetControllerStatus === 'pending') {
                controller.setStatus('pending');
            } else if (targetControllerStatus === 'rejected') {
                controller.setStatus('rejected');
            } else {
                controller.setStatus('rejected');
            }

            console.log('Link StateController action payload: ', {
                deps,
                targetStateControllerAddress,
                targetStateController,
            });
        } catch (err) {
            console.log({ err });
        }
    };

    return fn;
}

/**
 *
 * @param {Object} deps
 * @param {Buffer<ArrayBuffer>} deps.payload
 * @returns
 */
function DataAction(deps = {}) {
    if (!deps.payload) {
        throw new Error(`DataAction factory: deps.payload required`);
    }

    /**
     *
     * @type {StateControllerAction}
     */
    const fn = async function (controller) {
        // throw new Error();
        try {
            console.log('Data StateController action payload: ', {
                payload: deps.payload,
            });
            const processedData = deps.payload.toString('utf-8');
            controller.setStatus(StateController.Status.Done);
            controller.setData(processedData);
        } catch (err) {
            controller.setStatus(StateController.Status.Rejected);
        }
    };

    return fn;
}
