const { database } = require("../../database/database");

const DATABASE_TYPES = {
    STRING:'string',
    NUMBER:'number',
    BOOLEAN:'boolean',
}

/* #warning
    db tables map defined locally!
    but it needs define the TablesMap globally

    another one a map like this defined in 
    app\services\_multipart-parser\services\multi-table-gruping-agent\multi-table-gruping-agent.js
 */
const DATABASE_TABLES = {
    VIDEO_FILES:'video-files',
    PLAYLIST:'video-playlist',
    USERS:'users'
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

        const { success, error } = database.createOne(tableName,data);

        if(error) {
            return {
                error,
            }
        }

        console.log({success, error});

        return {
            success,
        }

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