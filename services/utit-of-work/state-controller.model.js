/**
 *
 *
 * @typedef {(controlller:{setStatus:(status:import("../final-handlers/handle-form/services/post-mapper/post-mapper.model").StateControllerStatus) => void;setData:(data:any) => void}) => Promise<any>} StateControllerAction
 * @typedef {(deps:{payload:any}) => StateControllerAction} StateControllerActionFactory
 */

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
        });
    }

    #rollback() {}

    getStatus() {
        return this.#status;
    }

    getData() {
        return this.#data;
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
 * @param {{}} deps.fileManager
 * @returns
 */
function FileAction(deps = {}) {
    if (!deps.payload) {
        throw new Error(`FileAction factory: deps.payload required`);
    }

    if (!deps.fileManager) {
        throw new Error(`FileAction factory: deps.fileManager required`);
    }

    /**
     *
     * @type {StateControllerAction}
     */
    const fn = function (controller) {
        try {
            console.log('File StateController Action payload: ', {
                payload: deps.payload,
            });

            controller.setStatus('done');
            controller.setData({
                tableName: 'test table name',
                rowId: 'test row id',
            });
        } catch (err) {
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
    const fn = function (controller) {
        try {
            const targetStateControllerAddress = `${deps.payload.tableId}/${deps.payload.groupId}`;

            const targetStateController = deps.globalStateControllers.get(
                targetStateControllerAddress
            );

            if (!targetStateController) {
                controller.setStatus('pending');
                return;
            }

            throw new Error(`do it do it`);

            const targetControllerStatus = targetStateController.getStatus();

            controller.setData(targetStateController.getData());
            controller.setStatus('done');

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
    const fn = function (controller) {
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
