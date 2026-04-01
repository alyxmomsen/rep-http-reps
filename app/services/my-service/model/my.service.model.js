
class MyModule {


    doSomthing () {

    }

    #validator;

    /**
     * 
     * @param {Object} deps
     * @param {Validator} deps.validator 
     * @param {number} deps.bar 
     */
    constructor (deps={}) {

        const validator = deps.validator;
        const bar = deps.bar;

        console.log(`varning: my module`);

        this.#validator = validator || null;

    }
}

class Validator {

    /**
     * 
     * @param {Object} data 
     */
    process (data) {

        for (const [k, v] of Object.entries(data)) {

        }


    }

    constructor () {

    }
}

class Logger {

}

