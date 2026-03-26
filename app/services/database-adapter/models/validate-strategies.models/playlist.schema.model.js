const { dataBase } = require("../../../database/controller/db.controller");
const { DATABASE_TYPES, DATABASE_TABLES, DBAdapter } = require("../db-adapter.model");

const { STRING, BOOLEAN, NUMBER } = DATABASE_TYPES;
const { PLAYLIST } = DATABASE_TABLES;

const playlistValidationSchema = {
    tableName:PLAYLIST,
    schema:{
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

const playlistController = new DBAdapter(playlistValidationSchema,  { dataBase:dataBase });

module.exports = { playlistController }