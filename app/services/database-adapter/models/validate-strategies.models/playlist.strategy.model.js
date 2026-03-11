const { DATABASE_TYPES, DATABASE_TABLES, DBAdapter } = require("../db-adapter.model");

const { STRING, BOOLEAN, NUMBER } = DATABASE_TYPES;
const { PLAYLIST } = DATABASE_TABLES;

const playlistValidationSchema = {
    tableName:PLAYLIST,
    properties:{
        id:{
            required:true,
            type:STRING,
            defaultValue:undefined,
        },
        title:{
            required:true,
            type:STRING,
            defaultValue:undefined,
        },
        description:{
            required:false,
            type:STRING,
            defaultValue:`no description`,
        },
    }
}

const playlistController = new DBAdapter(playlistValidationSchema);

module.exports = { playlistController }