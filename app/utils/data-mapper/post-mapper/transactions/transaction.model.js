/**
 * @typedef {{value:"pending"|"done"|"rejected";message:string}} ContainerState
 *
 * @typedef {(controller:PreCommitActionController) => any} PreCommitAction
 *
 * @typedef {{
 *  setState:(state:ContainerState,stateMessage:string,deps:any) => Promise<any>;
 *  setRollBack:(name:string,rollback:() => any) => Promise<any>;
 *  setData:(value) => Promise<any>;
 * }} PreCommitActionController
 *
 */
class StateRollBackContainer {
    /**
     *
     * @returns {ContainerState}
     */
    getState() {
        return this.#state;
    }

    /**
     *
     * @returns {any}
     */
    getData() {
        return this.#data;
    }

    /**
     *
     * @param {any} value
     */
    #setData(value) {
        this.#data = value;
    }

    async rollback() {
        for (const [name, rollback] of this.#rollbacks.entries()) {
            console.log({ rollback });
            rollback();
        }
    }

    /**
     *
     * @param {ContainerState} state
     */
    #setState(state, message) {
        this.#state = {
            value: state,
            message: message,
        };
    }

    /**
     * @returns {}
     */
    #getState() {
        return this.#state;
    }

    /**
     * @param {Map<string,StateRollBackContainer>} globalContainers
     * @returns {Promise<any>}
     */
    async preCommit(globalContainers) {
        for (const [name, action] of this.#actions.entries()) {
            await action(
                {
                    setState: this.#setState.bind(this),
                    setRollBack: this.setRollBack.bind(this),
                    setData: (value) => this.#setData(value),
                },
                globalContainers
            );
        }
    }

    setRollBack(name, executor) {
        if (this.#rollbacks.has(name)) {
            // throw new Error(`Transaction::setRollBack`);
        }

        this.#rollbacks.set(name, executor);
    }

    // ({setState:((state:TransactionState) => any);getState:() => TransactionState}) => any

    /**
     *
     *
     * @param {string} actionName
     * @param {PreCommitAction} action
     */
    setAction(actionName, action) {
        if (this.#actions.has(actionName)) {
            throw new Error(`Transaction::setAction`);
        }

        this.#actions.set(actionName, action);
    }

    /**
     * @description
     * - локальный контекст экшна, при выполнении имеет доступ к приватному свойству `this.#data`,
     * посредством "контроллера" (интерфейс для текущего контейнера) переданного в аргумент,
     * т.е. он может устанавливать состояния контейнера (`this.#data`, `this.#state` ...)
     * ---
     * - экшн вызывается в `this.#preCommit`
     * ---
     * @example
     *
     * setAction ('action-name', (controller, deps) => {
     *  controller.setData('any data');
     *  controller.getData();
     *  controller.setState("done"); // "pending"|"rejected"|"done"
     *  controller.getState()
     *
     *
     * @type {Map<string,PreCommitAction>}
     */
    #actions;

    /**
     * @type {Map<string,Function>}
     */
    #rollbacks;

    #data;
    /**
     * @type {'pending'|'rejected'|'done'}
     */
    #state;

    constructor() {
        this.#data = null;
        this.#state = {
            value: 'pending',
            message: 'default state',
        };

        this.#actions = new Map();

        this.#rollbacks = new Map();
    }
}

module.exports = { StateRollBackContainer };

// /**
//  *
//  * @param {((payload:any, next:(nextPayload:any) => Promise<any>) => Promise<any>)[]} handlers
//  */
// async #executeActionsChain (handlers, payload) {

//     let index = 0;

//     const next = async (nextPayload) => {

//         if(index < handlers.length) {
//             const currentKey = index++;

//             const handler = handlers[currentKey];

//             return await handler(nextPayload, next);

//         }

//         return nextPayload;

//     }

//     if(handlers.length > 0) {
//         return await next(payload);
//     }

//     return payload;

// }
