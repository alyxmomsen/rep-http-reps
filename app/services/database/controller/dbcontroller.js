const { errorFactory } = require("../../../utils/error-factory");
const { DBController , CONSTANTS:DB_CONTROLLER_CONSTANTS } = require("../model/db-conroller.model");
const { filesModel, usersModel } = require("../models/file.model");

const { FILES , USERS } = DB_CONTROLLER_CONSTANTS.DB_TABLES_NAMES ;

const models = new Map();

models.set(FILES , filesModel);
models.set(USERS , usersModel);

/**
 * 
 * @param {string} modelName 
 * @returns {DBController}
 */
function dbControllerFactory (modelName) {

    const model = models.get(modelName);
    if(!model) {
        throw new Error(JSON.stringify(
                errorFactory(
                    'dbControllerFactory',
                    'wrong model name' ,
                    {modelName} ,
                ) ,
            ) ,
        );
    }
    return model;
}

module.exports = { dbControllerFactory } ;