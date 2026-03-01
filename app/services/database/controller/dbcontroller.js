const { errorFactory } = require("../../../utils/error-factory");
const { DBController: DBModel } = require("../model/db-conroller.model");
const { filesModel, usersModel } = require("../models/file.model");

const models = new Map();

models.set('files' , filesModel);
models.set('users' , usersModel);

/**
 * 
 * @param {string} modelName 
 * @returns {DBModel}
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