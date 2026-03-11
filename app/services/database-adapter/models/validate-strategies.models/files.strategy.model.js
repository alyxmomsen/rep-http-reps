const { DATABASE_TYPES, DATABASE_TABLES, DBAdapter } = require("../db-adapter.model");

const { STRING, BOOLEAN, NUMBER } = DATABASE_TYPES;
const { FILES } = DATABASE_TABLES;

const filesSchema = {
    tableName:FILES,
    properties:{
        id:{
            required:true,
            type:STRING,
            defaultValue:undefined,
        },
        fileSystemFilename:{
            required:true,
            type:STRING,
            defaultValue:undefined,
        },
        originalFileName:{
            required:true,
            type:STRING,
            defaultValue:undefined,
        },
    }
}

const filesController = new DBAdapter(filesSchema);

module.exports = { filesController }