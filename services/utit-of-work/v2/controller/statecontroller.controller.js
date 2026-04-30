const {
    StateControllerToo,
    TryBehavior,
    RollBackBehavior,
} = require('../model/statecontroller.model');

class StateControllerFactoryToo {
    Instance(payload = {}) {
        const stateController = new StateControllerToo({
            tryBehavior: this.#tryBehavior,
            rollBackBehavior: this.#rollbackBehavior,
        });
        return stateController;
    }

    /**
     * @type {TryBehavior}
     */
    #tryBehavior;
    /**
     * @type {RollBackBehavior}
     */
    #rollbackBehavior;

    /**
     *
     * @param {Object} deps
     * @param {Object} deps.tryBehavior
     * @param {Object} deps.rollbackBehavior
     */
    constructor(deps = {}) {
        if (
            !deps.tryBehavior ||
            deps.tryBehavior instanceof TryBehavior === false
        ) {
            throw new Error(
                `StateControllerFactoryToo::constructor deps.tryBehavior required`
            );
        }

        if (
            !deps.rollbackBehavior ||
            deps.rollbackBehavior instanceof RollBackBehavior === false
        ) {
            throw new Error(
                `StateControllerFactoryToo::constructor deps.rollbackBehavior required`
            );
        }

        this.#tryBehavior = deps.tryBehavior;
        this.#rollbackBehavior = deps.rollbackBehavior;
    }
}

class TryBehaviorFactory {
    Instance() {
        return;
    }

    /**
     *
     * @param {Object} deps
     * @param {Object} deps.payload
     */
    constructor(deps = {}) {}
}

module.exports = { StateControllerFactoryToo };
