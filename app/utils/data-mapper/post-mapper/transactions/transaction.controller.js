const { StateContainer: StateRollBackContainer } = require('./transaction.model');

class StateContainerController {
    create() {
        const container = new StateRollBackContainer({});
        return container;
    }

    constructor() {}
}

module.exports = { StateContainerController: StateContainerController };
