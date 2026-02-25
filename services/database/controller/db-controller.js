const { loggerFactory } = require("../../../utils/logger");
const { validationStrategies, Strategy } = require("./behaviors/strategies");
const log = loggerFactory('DataBaseController' , '-u');
class DataBaseController {

    /**
     * 
     * @param {Object.<string,Object>} data 
     */    
    async createRow (data) {
        const { error , success } = await this.#strategy.createRow(data);
        if(error) {
            // return {...new Error_(error)} ;
            return {
                error ,
            }
        }

        if(!success) {
            return {
                error: {
                    location:'DataBaseController::createRow' ,
                    message:'no success object' ,
                    subjects:{success} ,
                }
            }
        }

        // return {...new Success_(success)}
        return {
            success ,
        }
    }

    /**
     * 
     * @param {string} rowId 
     */
    readRow (rowId) {
        const { error , success } = this.#strategy.readRow(rowId);

        if(error) return errorFactory(error);

        if(!success) {
            return errorFactory({
                location:'DataBaseController::readRow' ,
                message:'no success object' ,
                subjects:{success} ,
            })
        }


        return {
            success ,
        }
    }

    readAllRowsByTableName () {
        const { error , success } = this.#strategy.readAllRowsByTableName();

        if(error) {
            return errorFactory(error) ;
        }

        if(!success) {
            return errorFactory({
                location:'DataBaseController::readAllRowsByTableName' ,
                message:'no success object' ,
                subjects:{success} ,
            })
        }
        
        return {
            success ,
        }
    }

    #strategy;

    /**
     * @param {Strategy} strategyPattern 
     */
    constructor (strategyPattern) {
        if(!strategyPattern || strategyPattern instanceof Strategy === false) {
            throw new Error(`incorrect Strategy instance`);
        }
        this.#strategy = strategyPattern ;
    }
}

module.exports = { DBControllerFactory , validationStrategies , errorFactory /* , Error_ , Success_  */} ;

/**
 * 
 * @param {string} strategyName 
 * @returns {DataBaseController}
 */
function DBControllerFactory (strategyName) {
    const strategy = validationStrategies.get(strategyName);
    if(!strategy || strategy instanceof Strategy === false) {
        throw new Error ('incorrect strategy Object');
    }
    return new DataBaseController(strategy) ;
}

/**
 * 
 * @param {{location:string;message:string;subjects:Object.<string,any>}} data 
 * @returns {{error:{location:string;message:string;subjects:Object.<string,any>}}}
 */
function errorFactory (data) {

    const { location , subjects , message } = data ;

    if(location || subjects || message) {
        throw new Error(`inccorect Error init data`);
    }

    return {
        location ,
        subjects ,
        message ,
    }
    
}

// class Error_ {

//     error;

//     /**
//      * 
//      * @param {{locatiion:string;message:string;subjects:Object.<string,any>}} data 
//      */
//     constructor (data) {
//         const { locatiion , message , subjects } = data;

//         if(!locatiion || !message || !subjects) {
//             throw new Error_(`incorrect init Error data`);
//         }
        
//         this.error = {
//             locatiion:locatiion || null, 
//             message:message || null ,
//             subjects: subjects || {} ,
//         }
//     }
// }

// class Success_ {
//     success;

//     /**
//      * 
//      * @param {Object.<string,any>} data 
//      */
//     constructor (data) {
//         this.success = data ;
//     }
// }
