const { StateContainer } = require("./transaction.model");

class StateContainerFactory {
    create() {
        const container = new StateContainer({});
        return container;
    }

    constructor() {}
}

module.exports = { StateContainerFactory };
