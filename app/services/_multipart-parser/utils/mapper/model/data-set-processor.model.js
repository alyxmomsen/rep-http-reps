const {
    LinksBuffer,
} = require('../../data-links-buffer/data-links-buffer.util');

class DataSetProcessor {
    /**
     *
     * @param {Object} currentBranch
     * @param {string[]} [parentTrace=[]]
     * @returns
     */
    async process(currentBranch, parentTrace = []) {

        console.log('actions: ', this.#actions);
        if(!this.#actions) throw new Error(`no actions`);

        const currentContext = {};

        try {
            // console.log('Datasetprocessor: ', { data: currentBranch, parentTrace });

            

            for (const [prop, currentBranchConfig] of Object.entries(currentBranch)) {
                const [actionName, { meta, value:childBranch }] = currentBranchConfig;

                const Action = this.#actions.get(actionName);

                // const currentIterationTrace = [...parentTrace, prop];
                const currentIterationTrace = [...parentTrace, {knotProp:prop, knotPropSemantic:meta.title}];

                const actionResult = await Action({
                    actionCaller: this.process.bind(this),
                    payloadToCaller: childBranch,
                    trace: currentIterationTrace,
                });

                const { result } = actionResult;

                currentContext[prop] = result;

                // console.log('DataSetProcessor:', { prop, config: currentBranchConfig, actionResult });
            }

            console.log({currentContext});

            return { context:currentContext }

        } catch (error) {
            console.log('DataSetProcessor err: ', error, { data: currentBranch });
            throw error;
        }
    }

    /**
     *
     * @param {"handleBranch"|"handleLeaf"} actionName
     * @param {Function} handler
     */
    addAction(actionName, handler) {
        console.log('action added');
        this.#actions.set(actionName, handler);
    }

    /**
     * @param {"handleBranch"|"handleLeaf"} actionName
     * @param {Object} payload
     */
    async #executeAction(actionName, payload) {
        const action = this.#actions.get(actionName);

        if (!action) {
            throw new Error(`DataSetProcessor: action is not received`);
        }

        const actionResult = await action(payload);

        return actionResult;
    }

    /**
     * @type {Map<"handleBranch"|"handleLeaf",Function>}
     */
    #actions;

    /**
     * @type {LinksBuffer}
     */
    #linksBuffer;

    /**
     *
     * @param {Object} deps
     * @param {LinksBuffer} deps.linkBuffer
     */
    constructor(deps = {}) {
        const linkBuffer = deps.linkBuffer;

        if (linkBuffer === undefined) {
            throw new Error(`DataSetProcessor: LinksBuffer required`);
        }

        this.#linksBuffer = linkBuffer;

        this.#actions = new Map();
    }
}

module.exports = { DataSetProcessor };
