const { dataBase } = require('../../../database/controller/db.controller');
const {
    DATABASE_TYPES,
    DATABASE_TABLES,
    DBAdapter,
} = require('../db-adapter.model');

const { STRING, BOOLEAN, NUMBER } = DATABASE_TYPES;
const { VIDEO_FILES } = DATABASE_TABLES;

const videoFilesSchema = {
    tableName: VIDEO_FILES, // or maybe to title this field as "schemaName"
    schema: {
        fileSystemFilename: {
            required: true,
            type: STRING,
            defaultValue: undefined,
        },
        originalFileName: {
            required: true,
            type: STRING,
            defaultValue: undefined,
        },
        mime: {
            required: true,
            type: STRING,
            defaultValue: undefined,
        },
    },
};

/* technically that is Addapter pattern, but semanticlly is Controller */
/**
 *
 */
const videoFilesController = new DBAdapter(videoFilesSchema, {
    dataBase: dataBase,
});

module.exports = { videoFilesController };
