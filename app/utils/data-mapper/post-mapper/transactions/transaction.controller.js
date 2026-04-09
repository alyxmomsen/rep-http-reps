const { StateRollBackContainer } = require('./transaction.model');

class StateRollBackContainerFactory {
    create() {
        const container = new StateRollBackContainer({});
        return container;
    }

    constructor() {}
}

module.exports = { StateRollBackContainerFactory };
