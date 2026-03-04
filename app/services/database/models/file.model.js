const { DBController , CONSTANTS:DB_CONTROLLER_CONSTANTS } = require("../model/db-conroller.model");

const { DEFAULT_VALUE , REQUIRED  ,VALUE_TYPE } = DB_CONTROLLER_CONSTANTS.PROPERTY_VALUE_CONFIG_KEYS ;

/* #warning: not using */
const contentTypes = {
    TEXT_PLAIN:'text/plain' ,
}

const fileControllerModels = new Map();

// нужно добавить дополнительные CRUD модели
// в текущей реализации отсутствуют: 
// READ_ONE, READ_TABLE, UPDATE_ONE, 
// DELETE_ONE, DELETE_TABLE
/* использовать Map для хранения моделей. и фабрики*/

const filesModel = new DBController({
    title:{
        [VALUE_TYPE]:'string' ,
        [DEFAULT_VALUE]:'untitled' ,
        [REQUIRED]:false ,
    } ,
    description:{
        [VALUE_TYPE]:'string' ,
        [DEFAULT_VALUE]:'no description' ,
        [REQUIRED]:false ,
    } ,
    filesistemFilename:{
        [VALUE_TYPE]:'string' ,
        [DEFAULT_VALUE]:undefined ,
        [REQUIRED]:true ,
    } ,
    originalFilename:{
        [VALUE_TYPE]:'string' ,
        [DEFAULT_VALUE]:undefined ,
        [REQUIRED]:false ,
    } ,
    mime:{
        [VALUE_TYPE]:'string' ,
        [DEFAULT_VALUE]:undefined ,
        [REQUIRED]:false ,
    } ,
});

const usersModel = new DBController({
    name:{
        [VALUE_TYPE]:'string' ,
        [DEFAULT_VALUE]:'no name' ,
        [REQUIRED]:true ,
    } ,
    ['last-name']:{
        [VALUE_TYPE]:'string' ,
        [DEFAULT_VALUE]:'no last name' ,
        [REQUIRED]:true ,
    } ,
    ['avatar/filesistemFilename']:{
        [VALUE_TYPE]:'string' ,
        [DEFAULT_VALUE]:'no last name' ,
        [REQUIRED]:true ,
    },
    ['avatar/mime']:{
        [VALUE_TYPE]:'string' ,
        [DEFAULT_VALUE]:'no last name' ,
        [REQUIRED]:true ,
    },
    ['thumb-nail/originalFilename']:{
        [VALUE_TYPE]:'string' ,
        [DEFAULT_VALUE]:'no last name' ,
        [REQUIRED]:true ,
    },
    ['logo/filesistemFilename']:{
        [VALUE_TYPE]:'string' ,
        [DEFAULT_VALUE]:'no last name' ,
        [REQUIRED]:true ,
    },
    ['logo/mime']:{
        [VALUE_TYPE]:'string' ,
        [DEFAULT_VALUE]:'no last name' ,
        [REQUIRED]:true ,
    },
    ['logo/originalFilename']:{
        [VALUE_TYPE]:'string' ,
        [DEFAULT_VALUE]:'no last name' ,
        [REQUIRED]:true ,
    },
});

const playlist1 = new DBController({
    ['title']:{
        [VALUE_TYPE]:'string' ,
        [DEFAULT_VALUE]:'no name' ,
        [REQUIRED]:true ,
    } ,
    ['description']:{
        [VALUE_TYPE]:'string' ,
        [DEFAULT_VALUE]:'no last name' ,
        [REQUIRED]:true ,
    } ,
    ['video-min/filesistemFilename']:{
        [VALUE_TYPE]:'string' ,
        [DEFAULT_VALUE]:'no last name' ,
        [REQUIRED]:true ,
    },
    ['video-min/mime']:{
        [VALUE_TYPE]:'string' ,
        [DEFAULT_VALUE]:'no last name' ,
        [REQUIRED]:true ,
    },
    ['video-min/originalFilename']:{
        [VALUE_TYPE]:'string' ,
        [DEFAULT_VALUE]:'no last name' ,
        [REQUIRED]:true ,
    },
    ['video-mid/filesistemFilename']:{
        [VALUE_TYPE]:'string' ,
        [DEFAULT_VALUE]:'no last name' ,
        [REQUIRED]:true ,
    },
    ['video-mid/mime']:{
        [VALUE_TYPE]:'string' ,
        [DEFAULT_VALUE]:'no last name' ,
        [REQUIRED]:true ,
    },
    ['video-mid/originalFilename']:{
        [VALUE_TYPE]:'string' ,
        [DEFAULT_VALUE]:'no last name' ,
        [REQUIRED]:true ,
    },
    ['video-fulhd/filesistemFilename']:{
        [VALUE_TYPE]:'string' ,
        [DEFAULT_VALUE]:'no last name' ,
        [REQUIRED]:true ,
    },
    ['video-fulhd/mime']:{
        [VALUE_TYPE]:'string' ,
        [DEFAULT_VALUE]:'no last name' ,
        [REQUIRED]:true ,
    },
    ['video-fulhd/originalFilename']:{
        [VALUE_TYPE]:'string' ,
        [DEFAULT_VALUE]:'no last name' ,
        [REQUIRED]:true ,
    },


});

module.exports = { usersModel , filesModel , playlist1 }