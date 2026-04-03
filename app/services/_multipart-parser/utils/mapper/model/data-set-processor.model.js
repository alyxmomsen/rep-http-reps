const { LinksBuffer } = require("../../data-links-buffer/data-links-buffer.util");

class DataSetProcessor {

    /**
     * 
     * @param {Object} data 
     * @param {Array<string>} parentCallStack 
     * @returns 
     */
    async process(data, parentCallStack) {
        /**
         * 
         * incoming data example:
         * 
         * {
         *     files: [
         *         'branch',{
         *             meta: { title: 'tableName' },
         *             value:{
         *                 originalFileName: [
         *                     'leaf', {
         *                         meta: { title: 'originalFileName' },
         *                         value: { data: 'some.name.txt', dataType: 'string' }
         *                     },
         *                 ],
         *             },
         *         },
         *     ],
         * }
         * 
         * where: 
         * 
         * #branch
         * 
         * 
         * string: [
         *  actionName:'branch'|'leaf', actionPayload:{ meta:{ title:string, value: Knot }}
         * ]
         * 
         * 
         *
         */

        /**
         * 
         */
        const collection = {};

        console.log('DataSetProcessor.process');
        console.dir(data, {depth:5});
        
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
            // const metaTitle = propKey;

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
            
            if (actionName === "branch") {
                
                const actionResult = await this.#executeAction("handleBranch", {
                    reqFn: this.process.bind(this),
                    actionPayload: actionPayload.value,
                    callStack: [...parentCallStack, ...currentIterationCallStack],
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
                // collection[propKey] = actionResult;
            }
            else {

                const actionResult = await this.#executeAction("handleLeaf", {
                    reqFn: this.process.bind(this),
                    actionPayload: actionPayload.value,
                    callStack: [...parentCallStack, ...currentIterationCallStack],
                });

                /**
                 * 
                 * collect child parsed data
                 * 
                 * @type {Object}
                 * 
                 */
                collection[propKey] = actionResult;
                // collection[metaTitle] = actionResult;
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
    constructor(deps={}) {
        const linkBuffer = deps.linkBuffer;

        if(linkBuffer === undefined) {
            throw new Error(`DataSetProcessor: LinksBuffer required`);
        }

        this.#linksBuffer = linkBuffer;

        this.#actions = new Map();
    }
}

module.exports = { DataSetProcessor }