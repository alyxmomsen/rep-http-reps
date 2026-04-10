// const { DBController , CONSTANTS:DB_CONTROLLER_CONSTANTS } = require("../model/db-conroller.model");

// const { DEFAULT_VALUE , REQUIRED  ,VALUE_TYPE } = DB_CONTROLLER_CONSTANTS.PROPERTY_VALUE_CONFIG_KEYS ;

// /* #warning
//  * not using
//  */
// const contentTypes = {
//     TEXT_PLAIN:'text/plain' ,
// }

// const fileControllerModels = new Map();

// // нужно добавить дополнительные CRUD модели
// // в текущей реализации отсутствуют:
// // READ_ONE, READ_TABLE, UPDATE_ONE,
// // DELETE_ONE, DELETE_TABLE
// /* использовать Map для хранения моделей. и фабрики*/

// const filesModel = new DBController({
//     // title:{
//     //     [VALUE_TYPE]:'string' ,
//     //     [DEFAULT_VALUE]:'untitled' ,
//     //     [REQUIRED]:false ,
//     // } ,
//     // description:{
//     //     [VALUE_TYPE]:'string' ,
//     //     [DEFAULT_VALUE]:'no description' ,
//     //     [REQUIRED]:false ,
//     // } ,
//     filesistemFilename:{
//         [VALUE_TYPE]:'string' ,
//         [DEFAULT_VALUE]:undefined ,
//         [REQUIRED]:true ,
//     } ,
//     originalFilename:{
//         [VALUE_TYPE]:'string' ,
//         [DEFAULT_VALUE]:undefined ,
//         [REQUIRED]:false ,
//     } ,
//     mime:{
//         [VALUE_TYPE]:'string' ,
//         [DEFAULT_VALUE]:undefined ,
//         [REQUIRED]:false ,
//     } ,
// });

// module.exports = { filesModel }
