const { database } = require("../../database/database");

const DATABASE_TYPES = {
    STRING:'string',
    NUMBER:'number',
    BOOLEAN:'boolean',
}

const DATABASE_TABLES = {
    FILES:'files',
    PLAYLIST:'video-playlist',
}

const { STRING, BOOLEAN, NUMBER } = DATABASE_TYPES;

const filesModel = {
    tableName:DATABASE_TABLES.FILES,
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

const playlistValidationModel = {
    tableName:DATABASE_TABLES.PLAYLIST,
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

class DBController {

    createOne(data) {

        const errors = {};
        const validatedData = {};
        const { properties, tableName } = this.#strategy;

        for (const [key, strategyPropertyModel] of Object.entries(properties)) {

            try {
                const providedPropValue = data[key];
                if(!providedPropValue) {
                    if(strategyPropertyModel.required) {
                        throw new Error(`required property; ${key} not provided`);
                    }
                    validatedData[key] = strategyPropertyModel.defaultValue;
                    continue;
                }
                validatedData[key] = providedPropValue ;
            }
            catch(err) {
                console.log({err});
                const [errorType, details] = err.message?.split(/;\s*/);
                errors[errorType] = details;
            }
        }

        database.createOne(tableName, validatedData);

    }

    readOne() {}
    readAllRows() {}

    /**
     * @type {{tableName:string;properties:Object.<string,{required:boolean;type:string;defaultValue:string|boolean|number}>}}
     */
    #strategy;
    #errors;

    /**
     * @param {{tableName:string;properties:Object.<string,{required:boolean;type:string;defaultValue:string|boolean|number}>}} strategy
     */
    constructor (strategy) {
        this.#strategy = strategy;
        this.#errors = new Map();
    }
}

const dbControllers = new Map();

const filesController = new DBController(filesModel);
const playlistController = new DBController();

dbControllers.set(DATABASE_TABLES.FILES , filesController);
dbControllers.set(DATABASE_TABLES.PLAYLIST , playlistValidationModel);

module.exports = {dbControllers, DATABASE_TABLES}