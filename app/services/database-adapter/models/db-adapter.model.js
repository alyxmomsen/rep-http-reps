const DATABASE_TYPES = {
    STRING:'string',
    NUMBER:'number',
    BOOLEAN:'boolean',
}

const DATABASE_TABLES = {
    FILES:'files',
    PLAYLIST:'video-playlist',
}

class DBAdapter {

    createOne(data) {

        const errors = {};
        const validatedData = {};
        const { properties, tableName } = this.#strategy;

        for (const [key, strategyPropertyModel] of Object.entries(properties)) {

            try {
                const providedPropValue = data[key];
                if(!providedPropValue) {
                    if(strategyPropertyModel.required) {
                        throw new Error(`required property; ${key} not provided`);
                    }
                    validatedData[key] = strategyPropertyModel.defaultValue;
                    continue;
                }
                validatedData[key] = providedPropValue ;
            }
            catch(err) {
                console.log({err});
                const [errorType, details] = err.message?.split(/;\s*/);
                errors[errorType] = details;
            }
        }

        database.createOne(tableName, validatedData);

    }

    readOne() {}
    readAllRows() {}

    /**
     * @type {{tableName:string;properties:Object.<string,{required:boolean;type:string;defaultValue:string|boolean|number}>}}
     */
    #strategy;
    #errors;

    /**
     * @param {{tableName:string;properties:Object.<string,{required:boolean;type:string;defaultValue:string|boolean|number}>}} strategy
     */
    constructor (strategy) {
        this.#strategy = strategy;
        this.#errors = new Map();
    }
}

module.exports = { DBAdapter, DATABASE_TYPES, DATABASE_TABLES }