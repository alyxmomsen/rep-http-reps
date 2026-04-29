

/**
 * @typedef {"done"|"pending"|"rejected"} StateControllerStatus
 */

/**
 * 
 */
class StateController {
    /**
     * 
     * @param {Object} payload 
     * @param {Object} payload.data 
     */
    async try(payload) {
        this.#tryBehavior.execute({stateController:this, payload:payload.data});
    }

    async rollback() {
        this.#rollbackBehavior.execute({
            stateController:this,
        });
    }

    /**
     *
     * @param {TryBehavior} behavior
     */
    setTryBehavior(behavior) {
        this.#tryBehavior = behavior;
    }

    /**
     *
     * @param {RollbackBehavior} behavior
     */
    setRollbackBehavior(behavior) {
        this.#rollbackBehavior = behavior;
    }

    /**
     * 
     * @param {StateControllerStatus} status 
     */
    setStatus (status) {
        this.#status = status;
    }

    /**
     * 
     * @param {any} data 
     */
    setData (data) {
        this.#data = data;
    }

    /**
     * @type {RollbackBehavior}
     */
    #rollbackBehavior;
    /**
     * @type {TryBehavior}
     */
    #tryBehavior;

    /**
     * @type {StateControllerStatus}
     */
    #status;
    /**
     * @type {any}
     */
    #data;

    /**
     *
     * @param {Object} deps
     * @param {Object} deps.tryBehavior
     */
    constructor(deps = {}) {

        if (!deps.tryBehavior) {
            throw new Error(`StateController::constructor: deps.tryBehavior required`);
        } 

        this.#tryBehavior = deps.tryBehavior;
    }
}

class TryBehavior {
    /**
     *
     * @param {Object} params
     * @param {StateController} params.stateController
     * @param {any} params.payload
     */
    async execute(params) {}

    constructor() {}
}

class RollbackBehavior {
    /**
     *
     * @param {Object} params
     * @param {StateController} params.stateController
     */
    async execute(params) {}

    constructor() {}
}

module.exports = { StateController, TryBehavior, RollbackBehavior };
