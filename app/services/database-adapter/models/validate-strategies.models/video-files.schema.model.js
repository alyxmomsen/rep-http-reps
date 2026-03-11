const { DATABASE_TYPES, DATABASE_TABLES, DBAdapter } = require("../db-adapter.model");

const { STRING, BOOLEAN, NUMBER } = DATABASE_TYPES;
const { VIDEO_FILES } = DATABASE_TABLES;

const videoFilesSchema = {
    tableName:VIDEO_FILES, // or maybe to title this field as "schemaName"
    properties:{
        id:{
            required:true,
            type:STRING,
            defaultValue:undefined,
            primary:true,
            autoIncrement:true,
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

/* technically that is Addapter pattern, but semanticlly is Controller */
/**
 * 
 */
const videoFilesController = new DBAdapter(videoFilesSchema);

module.exports = { videoFilesController }