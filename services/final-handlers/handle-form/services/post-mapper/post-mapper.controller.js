const {
    StateControllerFactory,
} = require('../../../../utit-of-work/state-controller.controller');
const { PostMapper } = require('./post-mapper.model');

class PostMapperFactory {
    Instance() {
        return new PostMapper({
            LeafActions: this.#postMapperActions,
            StateControllerFactory: this.#stateControllerFactory,
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
     *
     * @param {Object} payload
     * @param {StateControllerFactory} payload.StateControllerFactory
     * @param {Map<string,(payload:any,smth:any) => Promise<any>} payload.PostMapperActions
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

        this.#stateControllerFactory = deps.StateControllerFactory;
        this.#postMapperActions = deps.PostMapperActions;
    }
}

module.exports = { PostMapperFactory };
