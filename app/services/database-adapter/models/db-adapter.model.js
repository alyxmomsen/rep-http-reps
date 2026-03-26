const { DataBase } = require("../../database/database");

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
    USERS:'users',
    FILES:'files',
}

class DBAdapter {

    createOne(data) {

        console.log(`выводим данные для транзакции`, {data}, this.#strategy.tableName)

        const errors = {};
        const validatedData = {};
        const { schema, tableName } = this.#strategy;

        for (const [key, strategyPropertyModel] of Object.entries(this.#strategy.schema)) {

            try {
                const providedPropValue = data[key];
                if(!providedPropValue) {
                    if(strategyPropertyModel.required) {
                        console.log({data, str:this.#strategy.tableName});
                        throw new Error(`required property; ${key} not provided`);
                    }
                    validatedData[key] = strategyPropertyModel.defaultValue;
                    continue;
                }
                validatedData[key] = providedPropValue ;
            }
            catch(err) {
                console.log('\x1b[31mDBAdapter error: \x1b[0m', {err});
                const [errorType, details] = err.message?.split(/;\s*/);
                errors[errorType] = details;
            }
        }

        const { success, error } = this.#dataBase.createOne(this.#strategy.tableName, validatedData);

        if(error) {
            return {
                error,
            }
        }

        return {
            success,
        }

    }

    readOne(rowId) {

        console.log(`take one`.toUpperCase());

        const {success, error} = this.#dataBase.readOne(this.#strategy.tableName, rowId);

        console.log('db row: ', {success, error});


        // ==================================================
        // =================== validation =================== 

        for (const [k, v] of Object.entries(this.#strategy.schema)) {
            // console.log({k, v});
        }

        // =================== validation =================== 
        // ================================================== 

        return {
            success , error,
        }

    }
    readAllRows() {}

    /**
     * @type {{tableName:string;schema:Object}}
     */
    #strategy;
    #errors;


    // dependencies

    /**
     * @type {DataBase}
     */
    #dataBase;

    // strategy

    /**
     * @type {string}
     */
    #tableName;
    /**
     * @type {Object}
     */
    #schema;

    /**
     * @param {{tableName:string;schema:Object}} strategy
     * @param {{
     *  dataBase:DataBase;
     * }} [deps={}] 
     */
    constructor (strategy,  deps = {}) {

        if(!strategy) {
            throw new Error(`Db Adapter: schema required but not provided`);
        }

        const tableName = strategy.tableName;
        const schema = strategy.schema; 

        if(!tableName || !schema) {
            throw new Error(`Db Adapter: schema must contained fields tableName & schema, but not provided`);
        }

        this.#strategy = strategy;
        this.#tableName = strategy.tableName;
        this.#schema = strategy.schema;

        const dataBase = deps.dataBase || undefined;

        if(!dataBase) {
            console.log(`\x1b[31m` + `- ❌ DBAdapter:${this.#strategy.tableName}: database is required but not porvided ❌` +`\x1b[0m`);
            throw new Error(`database is required but not porvided`.toUpperCase());
        }

        this.#dataBase = dataBase;

        console.log(`\x1b[32m` + `- ✅ DBAdapter:${this.#strategy.tableName}: database is connected ✅` +`\x1b[0m`);

        this.#errors = new Map();


    }
}

module.exports = { DBAdapter, DATABASE_TYPES, DATABASE_TABLES }