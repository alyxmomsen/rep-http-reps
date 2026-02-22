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
                }
            }
        } 

        return {
            success:{
                ...success ,
            }
        }
    }
    
    /**
     * @param {string} id 
     * @returns {{error:{message:string;subjects:any};success:{row:any}}}
     */
    readRow (id) {
        const { error , success } = this.#validationStrategy.readRow(id);

        if(error) {
            return {
                error:{
                    ...error ,
                } ,
            }
        }

        return  {
            success:{
                ...success ,
            }
        }
    }

    readAllRowsByTableName () {
        this.#validationStrategy.readAllRowsByTableName();
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

    console.log({tablename ,validationStrategies });

    const tablenameStrategy = validationStrategies.get(tablename || {});

    if(!tablenameStrategy || (tablenameStrategy instanceof Strategy === false)) throw new Error(`no strategy`);

    return new DataBaseController(tablenameStrategy) ;

}

module.exports = { DBControllerFactory , validationStrategies } ;