
const DATABASE_TYPES = {
    STRING:{
        typeId:'scalar',
        KEY:'string',
    },
    NUMBER:{
        typeId:'scalar',
        KEY:'number',
    },
    BOOLEAN:{
        typeId:'scalar',
        KEY:'boolean',
    },
};

// demo

const DB_TABLES_MODELS_NAMES = {
    VIDEO_FILES:'videoFiles',
    PLAYLIST:'playlist',
    PLAYLIST_AND_FILES:'playlistAndFiles',
}

const dbTablesModelsMap = new Map();

dbTablesModelsMap.set(DB_TABLES_MODELS_NAMES.VIDEO_FILES , {
    id:{
        type:DATABASE_TYPES.STRING
    },
    filesystemFilename:{
        type:DATABASE_TYPES.STRING,
    },
    originalFilename:{
        type:DATABASE_TYPES.STRING,
    },
    mime:{
        type:DATABASE_TYPES.STRING,
    },
});

dbTablesModelsMap.set(DB_TABLES_MODELS_NAMES.PLAYLIST , {
    id:{
        type:DATABASE_TYPES.STRING,
    },
    title:{
        type:DATABASE_TYPES.STRING,
    },
    description:{
        type:DATABASE_TYPES.STRING,
    }
});

module.exports = { dbTablesModelsMap, DB_TABLES_MODELS_NAMES, DATABASE_TYPES}