const { validationStrategies, Strategy } = require("./behaviors/strategies");

class DataBaseController {

    /**
     * 
     * @param {Object.<string,Object.<string,any>>} data 
     */
    async createRow (data) {
        const { error , success } = await this.#validationStrategy.createRow(data);

        if(error) {
            return {
                error:{
                    ...error ,
                } ,
            }
        }

        return {
            success: {
                ...success ,
            } ,
        }
    }
    
    /**
     * @param {string} id 
     * @returns {{error:{message:string;subjects:any};success:{row:any}}}
     */
    readRow (id) {
        console.log('dbcontroller readrow');
        const { error , success } = this.#validationStrategy.readRow(id);

        if (error) {
            return {
                error:{
                    ...error ,
                } ,
            }
        }

        return {
            success: {
                ...success ,
            } ,
        }

    }

    readAllRowsByTableName () {
        const { success , error } = this.#validationStrategy.readAllRows();
        if(error) {
            return {
                error:{
                    ...error ,
                } ,
            }
        }
        return {
            success: {
                ...success ,
            } ,
        }
    }

    #validationStrategy ;

    /**
     * 
     * @param {Strategy} strategy 
     */
    constructor (strategy) {
        this.#validationStrategy = strategy ;
    }
}

/**
 * 
 * @param {string} tablename 
 * @returns {DataBaseController}
 */
function DBControllerFactory (tablename) {

    const strategy = validationStrategies.get(tablename);
    if(!strategy || strategy instanceof Strategy === false) {
        throw new Error(`no table ${tablename} strategy`);
    }
    return new DataBaseController (strategy) ;
}

module.exports = { DBControllerFactory , validationStrategies } ;