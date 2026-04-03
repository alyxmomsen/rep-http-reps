class ResolveSuccessError {
    
    /**
     * 
     * @param {{success?:Object;error?:Object}} res 
     */
    async handle(res={}) {
        const successCase = res.success;
        const errorCase = res.error;

        if (errorCase) {

            const result = await this.#executeMiddleware(errorCase, this.#errorHandlers)
            
            return;
        }
        
        if (!successCase) {
            
            const result = await this.#executeMiddleware(errorCase, this.#errorHandlers)

            return;
        }
        
        const result = await this.#executeMiddleware(successCase, this.#successHandlers);

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
    onBadResponse(...resolvers) {
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