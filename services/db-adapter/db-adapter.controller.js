const { InMemoryDataBase } = require('../in-memory-db/model/db.model');
const { DBAdapter, ValidatiionSchemas } = require('./db-adapter.model');

/**
 * @typedef {Object.<string,{required:boolean,config:{dataType:any}}} ValidationSchemas
 */
class DBAdapterFactory {
    Instance() {
        return new DBAdapter({
            DataBase: this.#dataBase,
            ValidationSchemas: this.#validationSchemas,
        });
    }

    /**
     * @type {InMemoryDataBase}
     */
    #dataBase;

    /**
     * @type {ValidationSchemas}
     */
    #validationSchemas;

    /**
     *
     * @param {Object} deps
     * @param {InMemoryDataBase} deps.dataBaseInstance
     * @param {ValidationSchemas} deps.ValidationSchemas
     */
    constructor(deps = {}) {
        if (!deps.dataBaseInstance) {
            throw new Error(
                `DBAdapterFactory::constructor: deps.dataBaseInstance required`
            );
        }

        if (!deps.ValidationSchemas) {
            throw new Error(
                `DBAdapterFactory::constructor: deps.ValidationSchemas required`
            );
        }

        this.#dataBase = deps.dataBaseInstance;
        this.#validationSchemas = deps.ValidationSchemas;
    }
}

module.exports = { DBAdapterFactory };
