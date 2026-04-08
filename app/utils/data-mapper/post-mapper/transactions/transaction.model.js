
class Transaction {

    rollback () {

    }

    commit () {

    }

    setRollBack (name, executor) {
        if(this.#rollbacks.has(name)) {
            throw new Error(`Transaction::setRollBack`);
        }

        this.#rollbacks.set(name, executor);
    }

    /**
     * 
     * @param {string} actionName 
     * @param {Function} action 
     */
    setAction(actionName, action) {
        if(this.#actons.has(actionName)) {
            throw new Error(`Transaction::setAction`);
        }

        this.#actons.set(actionName, action);
    }

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

    /**
     * @type {Map<string,Function>}
     */
    #actons;

    /**
     * @type {Map<string,Function>}
     */
    #rollbacks;

    data;
    /**
     * @type {'pending'|'rejected'|'done'} 
     */
    state;

    constructor () {
        this.data = null;
        this.state = 'pending';

        this.#actons = new Map();

        this.#rollbacks = new Map();
    }
}

module.exports = { Transaction }