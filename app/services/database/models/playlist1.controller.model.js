const { DBController , CONSTANTS } = require("../model/db-conroller.model");

const { PROPERTY_VALUE_CONFIG_KEYS } = CONSTANTS ;
const { DEFAULT_VALUE , REQUIRED , VALUE_TYPE } = PROPERTY_VALUE_CONFIG_KEYS ;

const playlist1controller = new DBController({
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


module.exports = { playlist1controller }