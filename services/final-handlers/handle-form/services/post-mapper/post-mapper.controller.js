const {
    DBAdapterFactory,
} = require('../../../../db-adapter/db-adapter.controller');
const {
    ValidatiionSchemas,
} = require('../../../../db-adapter/db-adapter.model');
const {
    inMemoryDataBase,
} = require('../../../../in-memory-db/controller/db.controller');
const {
    StateControllerFactory,
} = require('../../../../utit-of-work/state-controller.controller');
const { PostMapper } = require('./post-mapper.model');

class PostMapperFactory {
    Instance() {
        return new PostMapper({
            LeafActions: this.#postMapperActions,
            StateControllerFactory: this.#stateControllerFactory,
            InMemoryDataBase: inMemoryDataBase,
            DBAdapter: this.#DBAdapterFactory.Instance(),
        });
    }

    /**
     * @type {StateControllerFactory}
     */
    #stateControllerFactory;

    /**
     * @type {Map<string,import('./post-mapper.model').PostMapperAction>}
     */
    #postMapperActions;

    /**
     * @type {DBAdapterFactory}
     */
    #DBAdapterFactory;

    /**
     *
     * @param {Object} deps
     * @param {StateControllerFactory} deps.StateControllerFactory
     * @param {Map<string,(payload:any,smth:any) => Promise<any>} deps.PostMapperActions
     * @param {DBAdapterFactory} deps.DBAdapterFactory
     */
    constructor(deps = {}) {
        if (!deps.StateControllerFactory) {
            throw new Error(
                `PostMapperFactory::constructor: deps.StateControllerFactory required`
            );
        }

        if (!deps.PostMapperActions) {
            throw new Error(
                `PostMapperFactory::constructor: deps.PostMapperActions required`
            );
        }

        if (!deps.DBAdapterFactory) {
            throw new Error(`PostMapperFactory::constructor:  required`);
        }

        this.#stateControllerFactory = deps.StateControllerFactory;
        this.#postMapperActions = deps.PostMapperActions;
        this.#DBAdapterFactory = deps.DBAdapterFactory;
    }
}

module.exports = { PostMapperFactory };
