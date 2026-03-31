class ResolveSuccessError {
    
    /**
     * 
     * @param {{success?:Object;error?:Object}} res 
     */
    async handle(res={}) {
        const { success, error } = res;

        if (error) {
            console.log(`\x1b[31mResolveSuccessError/onError\x1b[0m`);
            return;
        }
        
        if (!success) {
            console.log(`\x1b[31mResolveSuccessError/onNoSuccess\x1b[0m`);
            return;
        }
        
        const result = await this.#executeMiddleware(success, this.#successHandlers);

        return result;
    }

    /**
     * 
     * @param {Object} payload 
     * @param {Function[]} middleware 
     */
    async #executeMiddleware(payload, middleware) {
        
        let index = 0;

        const next = async (nextPayload) => {

            if (index < middleware.length) {
                const currentIndex = index++;

                const handler = middleware[currentIndex];

                if (handler) {
                    try {
                        return await handler(nextPayload, next);
                    }
                    catch (error) {
                        throw error;
                    }
                }

                return nextPayload;

            }

            return nextPayload;

        }

        if (middleware.length > 0) {
            return await next(payload);
        }

        return payload;
    }
    
    /**
     * 
     * @param {...(Function)} resolvers
     */
    addSuccessResolver(...resolvers) {
        resolvers.forEach(handler => {
            this.#successHandlers.push(handler);
        });
    }
    
    /**
     * 
     * @param {...(Function)} resolvers
    */
   addNoSuccessResolver(...resolvers) {
       resolvers.forEach(handler => {
           this.#noSuccessHandlers.push(handler);
       });
    }
    
    /**
     * 
     * @param {...(Function)} resolvers
    */
   addErrorResolver(...resolvers) {
        resolvers.forEach(handler => {
            this.#errorHandlers.push(handler);
        });
    }

    /**
     * @type {Function[]}
     */
    #successHandlers;

    /**
     * @type {Function[]}
     */
    #errorHandlers;

    /**
     * @type {Function[]}
     */
    #noSuccessHandlers;

    constructor() {
        this.#successHandlers = [];
        this.#errorHandlers = [];
        this.#noSuccessHandlers = [];
    }
}

module.exports = { ResolveSuccessError };