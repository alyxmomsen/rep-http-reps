const { StateController, TryBehavior } = require('../model/state-controller.model');

class StateControllerFactory {
    Instatnce() {
        return new StateController({
            tryBehavior:this.#tryBehavior,
            rollBackBehavior:null,
        });
    }

    /**
     * @type {TryBehavior}
     */
    #tryBehavior;

    /**
     *
     * @param {Object} deps
     * @param {TryBehavior} deps.tryBehavior
     */
    constructor(deps = {}) {

        if (!deps.tryBehavior) {
            throw new Error(`StateControllerFactory::constructor: deps.tryBehavior required`);
        } 

        this.#tryBehavior = deps.tryBehavior ;

    }
}

module.exports = { StateControllerFactory };
