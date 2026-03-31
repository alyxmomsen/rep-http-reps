class DataSetProcessor {

    async process(data, parentCallStack, actions) {
        // console.dir(data, {depth:10});

        console.log(`dataSetMapper: start`);
        // console.dir(data, {
        //     depth:10,
        // });

        const collection = {};
        
        for (const [propKey, config] of Object.entries(data)) {

            const currentIterationCallStack = [];

            const [actionName, actionPayload] = config;
            
            /**
             * @description
             * meta.title для трассировки 
             * 
             * @type {string}
             * 
             */
            const metaTitle = actionPayload?.meta?.title;

            /**
             * проверяем содержатся ли ожидаемые поля
             */
            if (!actionPayload || !actionPayload.meta || !actionPayload.value) {
                throw new Error(`dataSetMapper: actionPayload|actionPayload.meta|actionPayload.value required`);
            }

            // console.log(`dataSetMapper: `, { propKey, config, metaTitle });
            
            currentIterationCallStack.push({
                propKey: propKey,
                propDescription:metaTitle
            });
            
            if (/* actionName === 'tableName' || actionName === 'groupId' */actionName === "branch") {
                
                const actionResult = await this.#executeAction("handleBranch", {
                    reqFn: this.process.bind(this),
                    actionPayload: actionPayload.value,
                    callStack: [...parentCallStack, ...currentIterationCallStack],
                    // callStack: [...parentCallStack, ...currentIterationCallStack],
                    actions,
                });

                for (const [k, v] of Object.entries(actionResult)) {
                    collection[k, v]
                }
                
                /**
                 * 
                 * collect child parsed data
                 * 
                 * @type {Object}
                 * 
                 */
                collection[metaTitle] = actionResult;
            }
            else {

                const actionResult = await this.#executeAction("handleLeaf", {
                    reqFn: this.process.bind(this),
                    actionPayload: actionPayload.value,
                    callStack: [...parentCallStack, ...currentIterationCallStack],
                    // callStack: [...parentCallStack, ...currentIterationCallStack],
                    actions,
                });

                /**
                 * 
                 * collect child parsed data
                 * 
                 * @type {Object}
                 * 
                 */
                collection[metaTitle] = actionResult;
            }

        }

        return collection;
    }

    /**
     * 
     * @param {"handleBranch"|"handleLeaf"} actionName 
     * @param {Function} handler 
     */
    addAction(actionName, handler) {
        this.#actions.set(actionName, handler);
    }

    /**
     * @param {"handleBranch"|"handleLeaf"} actionName 
     * @param {Object} payload 
     */
    async #executeAction(actionName, payload) {
        console.log({ actionName, payload });
        
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
     * 
     * @param {{
     * }} deps 
     */
    constructor(deps={}) {
        const { smth } = deps;

        this.#actions = new Map();
    }
}

module.exports = { DataSetProcessor }