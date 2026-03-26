
const { randomBytes } = require("crypto");
const { fileDataSetFactory } = require("../../utils/factrories/file-data-set.factory");
const { DataTransformer } = require("../data-transformer/data-transfromer");
const { FILE_DATA_SET_SCHEMA } = require("../data-transformer/schemas/file-data-set.schema");
const { linkedFieldDataSetFactory: fieldDataSetFactory } = require("../../utils/factrories/linked-field-data-set.factory");
const { LINKED_FIELD_DATA_SET_SCHEMA } = require("../data-transformer/schemas/linked-field-data-set.schema");
const { regularFieldDataSetFactory } = require("../../utils/factrories/regular-field-data-set.factory");
const { REGULAR_FIELD_DATA_SET_SCHEMA } = require("../data-transformer/schemas/regular-field-data-set.schema");

class MultiTableGrouppingAgent {

    handleFormDataPartParsedData (data) {

        const { contentType, name, body, filename } = data ;

        if(!this.#validateData(data)) {
            console.log({data});
            throw new Error(`MultiTableGrouppingAgent: incorrect provided data`);
        }

        const { columnName, dataType, groupId, tableId } = multiTableProtocolParser(name);
        
        const tableName = tableIdResolver(tableId);

        // если что-то из этого существует, значит это "файл"
        if(filename || contentType) {

            // важные оба,- и filename, и contetn-type
            if(!filename) {
                throw new Error(`MultiTableGrouppingAgent: as "contentType" received then "filename" required too`);
            }

            if(!contentType) {
                throw new Error(`MultiTableGrouppingAgent: as "filename" received then "contentType" required too`);
            }
            
            /* автоматический линк-ид  dev.log.md: # 1*/
            const linkId = randomBytes(32).toString('hex');

            // ==============================================
            
            /* dev.log.md : 1.2 */
            /**
             * @description groupId рандомный (воизбежание мерджинга, 
             * так как внутри группы данные рабиты на свойства)
             * 
             */
            const fileDataSet = fileDataSetFactory({
                ...data, 
                linkId,
                tableName:'files',
                /* dev.log.md: 1.3  what random-id...*/
                groupId:linkId,
            });
            
            this.#dataTransformer.process(FILE_DATA_SET_SCHEMA, fileDataSet, this.#mergedGroups.files);
            
            // ==============================================
            
            // "группа" и "таблица" определяются данными из клиента
            // (исключением явяется хардкод свойства "dataType")
            // что бы иметь возможность объеденить текущее поле и колонки (свойства) (прописав в HTML документе) строк таблиц 
            // (которые уже смерджились data-transformer-ом или придут позже)
            const fieldDataSet = fieldDataSetFactory({
                body:linkId,
                columnName,
                dataType:'link',
                // -----------
                groupId,
                tableName,
            });
            
            
            this.#dataTransformer.process(LINKED_FIELD_DATA_SET_SCHEMA, fieldDataSet, this.#mergedGroups.fields);
            
            return ;
        } 
        
        const regularFieldDataSet = regularFieldDataSetFactory({
            body ,
            columnName, dataType, groupId, 
            tableName,
        });
        
        this.#dataTransformer.process(REGULAR_FIELD_DATA_SET_SCHEMA, regularFieldDataSet, this.#mergedGroups.fields);
        
    }

    getGroups () {
        return this.#mergedGroups;
    }

    /**
     * 
     * @param {{
     *  contentType:string|null;
     *  filename:string|null;
     *  name:string;
     *  body:Buffer<ArrayBuffer>;
     * }} data 
     */
    #validateData (data) {
        const validateSchema = {
            contentType:{
                required:true,
            }, 
            name:{
                required:true,
            }, 
            body:{
                
                required:true,
            },
            filename:{
                required:true,
            }
        }

        for (const [schemaKey, schemaValue] of Object.entries(validateSchema)) {
            if(data[schemaKey] === undefined && schemaValue.required === true) {
                console.log(`key ${schemaKey} required but not provided`);
                return false;
            }
        }

        return true;
    }

    #parseNameAttribute (data) {

        return {

        }
    }

    #mergedGroups;

    // deps

    /**
     * @type {DataTransformer}
     */
    #dataTransformer;

    /**
     * 
     * @param {{
     *  dataTransformer:DataTransformer
     * }} deps 
     */
    constructor (deps = {}) {

        const dataTransformer = deps.dataTransformer  || null;

        if(!dataTransformer) {
            throw new Error(`DataTransformer required but not provided`);
        }

        this.#dataTransformer = dataTransformer;

        this.#mergedGroups = {
            files:{},
            fields:{},
        }
    }
}

module.exports = { MultiTableGrouppingAgent };

// utils 


function multiTableProtocolParser (nameAttr) {

    // example
    // 058e.video-min.string

    const match = nameAttr.match(/([\d\w]{2})([\d\w]{2})\.([^\.]+)\.([^$;\s]+)/);

    if(!match) {
        throw new Error(`multitable protocol required but received anoter`);
    }

    const groupId = match[1];
    const tableId = match[2];
    const columnName = match[3];
    const dataType = match[4];

    return {
        groupId,
        tableId,
        columnName,
        dataType,
    }
}

function tableIdResolver (tableId) {

    const DbTables = {
        USERS:'users',
        FILES:'files',
        VIDEO_PLAYLIST:'video-playlist',
    }

    const map = {
        "25":DbTables.USERS,
        "8e":DbTables.FILES,
        "af":DbTables.VIDEO_PLAYLIST,
    }

    const tableName = map[tableId];

    if (!tableName) {
        throw new Error(`tableIdResolver: unknown table id`);
    }

    return tableName;
}