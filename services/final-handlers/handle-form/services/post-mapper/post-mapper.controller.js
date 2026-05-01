const {
    DBAdapterFactory,
} = require('../../../../db-adapter/db-adapter.controller');
const {
    ValidatiionSchemas,
} = require('../../../../db-adapter/db-adapter.model');
const {
    inMemoryDataBase,
} = require('../../../../in-memory-db/controller/db.controller');
const { StateControllerFactoryToo } = require('../../../../utit-of-work/v2/controller/statecontroller.controller');
const { PostMapper } = require('./post-mapper.model');

class PostMapperFactory {
    Instance() {
        return new PostMapper({
            StateControllerFactory: this.#stateControllerFactory,
        });
    }

    /**
     * @type {StateControllerFactory}
     */
    #stateControllerFactory;

    /**
     *
     * @param {Object} deps
     * @param {StateControllerFactoryToo} deps.StateControllerFactory
     */
    constructor(deps = {}) {
        if (!deps.StateControllerFactory) {
            throw new Error(
                `PostMapperFactory::constructor: deps.StateControllerFactory required`
            );
        }

        this.#stateControllerFactory = deps.StateControllerFactory;
    }
}

module.exports = { PostMapperFactory };
