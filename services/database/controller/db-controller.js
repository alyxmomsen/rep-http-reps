const { loggerFactory } = require("../../../utils/logger");
const { validationStrategies, Strategy } = require("./behaviors/strategies");
const log = loggerFactory('DataBaseController' , '-u');
class DataBaseController {

    /**
     * 
     * @param {{Object.<string,any>}} data 
     * @returns {Promise<{
     *      error?:{location:string;message:string;subject:any};
     *      success?:Object;
     * }>}
     */
    async createRow (data) {

        const { success , error } = await this.#strategyBehavior.createRow(data);

        if(error) {
            return {
                error ,
            }
        }

        return {
            success ,
        }
    }

    /**
     * 
     * @returns {{
     *     error?:{location:string;message:string;subject:Object};
     *     success?:Object;
     * }}
     */
    readRow (rowId) {
        const { success , error } = this.#strategyBehavior.readRow(rowId);
        if(error) {
            return {
                error ,
            }
        }

        return {
            success ,
        }
    }

    /**
     * 
     * @returns {{
     *     error?:{location:string;message:string;subject:Object};
     *     success?:Object;
     * }}
     */
    readAllRowsByTableName () {
        const { success , error } = this.#strategyBehavior.readAllRowsByTableName();
        if(error) {
            return {
                error ,
            }
        }

        return {
            success ,
        }
    }

    #strategyBehavior;

    /**
     * 
     * @param {Strategy} strategy 
     */
    constructor (strategy) {
        if(!strategy || (strategy instanceof Strategy === false)) {
            throw new Error(`no strategy`);
        }
        this.#strategyBehavior = strategy ;
    }
}

/**
 * 
 * @param {string} tableName 
 * @returns {Strategy}
 */
function DBControllerFactory (tableName) {
    const strategy = validationStrategies.get(tableName);
    if(!strategy || (strategy instanceof Strategy === false)) {
        throw new Error({
            message:`no Strategy`
        });
    }
    return new DataBaseController(strategy) ;
}

module.exports = { DBControllerFactory , validationStrategies } ;