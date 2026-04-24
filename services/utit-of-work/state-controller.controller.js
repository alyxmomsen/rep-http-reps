const { StateController } = require('./state-controller.model');

/**
 *
 * @param {Object} deps
 * @returns
 */
class StateControllerFactory {
    Instance() {
        const stateController = new StateController();

        return stateController;
    }

    constructor() {}
}

module.exports = { StateControllerFactory };
