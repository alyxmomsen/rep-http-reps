// const { errorFactory } = require("../../../utils/error-factory");
// const { DBController , CONSTANTS:DB_CONTROLLER_CONSTANTS } = require("../model/db-conroller.model");
// const { filesModel: filesModelController } = require("../models/file.model");
// const { playlist1controller: playlist1ModelController } = require("../models/playlist1.controller.model");
// const { usersModel: usersModelController } = require("../models/users.controller.model");

// const { VIDEO , USERS , PLAYLIST_1 } = DB_CONTROLLER_CONSTANTS.DB_TABLES_NAMES ;

// /**
//  * @type {Map<string,DBController}
//  */
// const models = new Map();

// /* регистрация контроллеров 
// инстанцированых в соответствии с моделями (стратегиями) валидации полей 
// для работы с базой данных */
// models.set(VIDEO , filesModelController);
// models.set(USERS , usersModelController);
// models.set(PLAYLIST_1 , playlist1ModelController);

// /**
//  * 
//  * @param {string} modelName 
//  * @returns {DBController}
//  */
// function dbControllerFactory (modelName) {

//     /* в аргумент прилетает название таблицы которое прописано в HTML форме
//     при этом ключи мэпа( который хранит модели) соответствуют названию таблицы
//     models.set(VIDEO , filesModel); 
//     канонические значения ключей хранятся в константах "DB_CONTROLLER_CONSTANTS.DB_TABLES_NAMES"
//     DB_TABLES_NAMES:{
//         VIDEO:'video',
//         USERS:'users',
//         PLAYLIST_1:'playlist-1', и тд
//     }
    
//     */

//     const model = models.get(modelName);
//     if(!model) {
//         throw new Error(JSON.stringify(
//                 errorFactory(
//                     'dbControllerFactory',
//                     'wrong model name' ,
//                     {modelName} ,
//                 ) ,
//             ) ,
//         );
//     }
//     return model;
// }

// // module.exports = { dbControllerFactory } ;