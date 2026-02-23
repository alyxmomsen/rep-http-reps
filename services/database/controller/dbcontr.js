const { validationStrategies, Strategy } = require("./behaviors/strategies");

class DataBaseController {

    /**
     * 
     * @param {Object.<string,{value:Buffer<ArrayBuffer>;contentType:string}>} data
     * @returns {Promise<{error?:{message:string;location:string;subject:Object};success?:Object}>} 
     */
    async createRow (data) {
        const { success , error } = await this.#validationStrategy.createRow(data);
        return error ? {error} : {success}
    }

    /**
     * 
     * @returns {{error?:{message:string;location:string;subject:Object};success?:Object}} 
     */
    readRow (id) {
        const { success , error } = this.#validationStrategy.readRow(id);
        return error ? {error} : {success};
    }

    /**
     * @returns {{error?:{message:string;location:string;subject:Object};success?:Object}} 
     */
    readAllRowsByTableName () {
        const { error , success } = this.#validationStrategy.readAllRows();
        if(error) {
            return {
                error ,
            }
        }

        return {
            success ,
        }
    }

    #validationStrategy;

    /**
     * 
     * @param {Strategy} strategy 
     */
    constructor (strategy) {
        if(!strategy || (strategy instanceof Strategy === false)) {
            throw new Error(`incorrect strategy object`);
        }
        this.#validationStrategy = strategy ; 
    }

}


function DBControllerFactory (tableName) {
    const strategy = validationStrategies.get(tableName);
    if(!strategy || (strategy instanceof Strategy === false)) {
        throw new Error(`incorrect tablename`);
    }
    return new DataBaseController(strategy);
}

module.exports = { DBControllerFactory , validationStrategies } ;