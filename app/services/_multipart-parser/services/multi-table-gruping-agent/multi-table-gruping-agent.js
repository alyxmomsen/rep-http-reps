
const { Mapper } = require("../../../../utils/mapper-2.0/mapper.2.0");
const { MULTITABLE_DATA_SCHEMA } = require("../../../../utils/mapper-2.0/schemas/multitable-data-schema");

const CONSTANTS = {
    COLUMN_DATA_KEYS:{
        VALUE:'value' ,
        CONTENT_TYPE:'contentType'
    }, 
    DATA_TYPE_KEYS:{
        STRING:'string' ,
        NUMBER:'number' ,
    }
}

const DbTables = {
    USERS:'users',
    VIDEO_FILES:'video-files',
    VIDEO_PLAYLIST:'video-playlist',
}

/* #warning #temp 
    temp locally solution whilst developing
    grupId -> tablename
*/
/**
 * schema для определения таблицы
 * в группу которой будут отправленны 
 * поступившие данные из аргумента "data"
 */
const DB_TABLES_MAP_SCHEMA = {
    "R":{
        "25":DbTables.USERS,
        "af":DbTables.VIDEO_PLAYLIST,
    },
    "F":{
        "8e":DbTables.VIDEO_FILES,
    }
}

const dataTypeSetMap = new Map();

const { DATA_TYPE_KEYS } = CONSTANTS ;

// data-type registration
dataTypeSetMap.set(DATA_TYPE_KEYS.STRING , 'string');
dataTypeSetMap.set(DATA_TYPE_KEYS.NUMBER , 'number');

/** #warning: unusable
 * 
 * @param {string} dataType 
 */
const dataTypeValidator = (dataType) => {

    const dt = dataTypeSetMap.get(dataType);
    if(!dt) throw new Error (`unregistered data type`) ;
    return dt ;
}

class MultiTableGrouppingAgent {

    handleFormDataPartParsedData (data) {

        console.log('handleFormDataPartParsedData: ', {data});

        const {
            body:fileBody, contentType:fileMIME, filename:fileName, name:nameAttr,
        } = data ;

        /**
         * парсим "name" attribute для дальнейшей маршрутизации данных по группам
         */
        const { groupId:groupCode, columnName, dataType } = this.#parseNameAttribute(nameAttr);

        /* tablename decoding
        * 
        * ожидаем строку вида "F=028e.thumb-nail[R=0025].string"
        * раскладываем на (F)(028e)(thumb-nail[R=0025])(string) 
        * где 
        *   - F = тип данных,- 'file'|'field'
        *   - 028e (02) - код группы, (8e) - код таблицы
        *   - thumb-nail[R=0025] - необработанное имя property в таблице, где
        *       - (thumb-nail)- именно имя property (колонка в таблице)
        *       - (R=0025)- идентификатор целевой таблицы и группы в этом же request
        *           это нужно для того что бы создавать отношения между данными таблиц
        *           например, этот код означает что 
        *           либо строка таблицы которая будет создана из группы (R=0025) будет ссылатся
        *           на строку таблицы собранную из группы (F=028e), это нужно для случаев
        *           когда из одной таблицы отправляются данные нескольких файлов для разных групп
        *   - string - тип данных который будет использован в БД
        */
        const groupCodeMatch = groupCode.match(/(\w)=([\w\d]{2})([\w\d]{2})/);
        
        if (groupCodeMatch === null) {
            throw new Error(`MultiTableGrouppingAgent: required protocol the Multitable bun given something other`) ;
        }

        const groupType = groupCodeMatch[1];
        const groupId = groupCodeMatch[2];
        const tableNameCode = groupCodeMatch[3];

        if(!tableNameCode || !groupId || !groupType) {
            throw new Error(`MultiTableGrouppingAgent: unknown group code: ${groupCode}`);
        }

        // #tip
        // F=8e02.filename.string

        console.log('parsed data:');
        console.log(`group type: ${groupType}, tablename code: ${tableNameCode}`);

        // resolving tablename by DB_TABLES_MAP_SCHEMA
        const tableName = tableNameResolver(DB_TABLES_MAP_SCHEMA, groupType, tableNameCode);

        if (tableName === null) {
            throw new Error('MultiTableGrouppingAgent: incorrect groupType or tableNameCode');
        }

        const incomingData = {
            groupId, tableName, columnName, dataType,   
            fileMIME, fileName, fileBody,
        }

        // transform flat data to multilevel object
        this.#mapper.process(MULTITABLE_DATA_SCHEMA, incomingData, this.#groups);
    }

    #parseNameAttribute (nameAttr) {

        /* protocol
            multitable://R=0025.last-name.string
        */

        const [ groupId, columnName, dataType ] = nameAttr.split('.') ;

        return {
            groupId, columnName, dataType,
        }
    }

    getGroups () {
        return this.#groups;
    }

    #groups;

    // ========== dependencies ========== 

    /**
     * @type {Mapper}
     */
    #mapper;

    /**
     * 
     * @param {{
     *  mapper:Mapper;
     * }} deps 
     */
    constructor (deps = {}) {

        const mapper = deps.mapper ;

        if(mapper && mapper instanceof Mapper === false) {
            throw new Error(`MultiTableGrouppingAgent: Mapper required, but not provided`);
        }

        this.#groups = {};
        this.#mapper = mapper;
    }
}

module.exports = { MultiTableGrouppingAgent , dataTypeValidator };

// utils 

/**
 * @description принимает схему распознавания имени таблицы
 *  последовательно сопоставляет значения ключей и значений свойств схемы с 
 *  groupType и tableNameCode. Возвращает имя таблицы в соответствии со схемой или NULL
 * @param {Object.<string,string>} schema 
 * @param {string} groupType 
 * @param {string} tableNameCode 
 * @returns {string|null}
 */
function tableNameResolver (schema, groupType, tableNameCode ) {
    for (const [schemaGroupType, schemaTablesMapping ] of Object.entries(schema)) {
        console.log(`data type: ${schemaGroupType}`);
        if(schemaGroupType !== groupType) continue;
        for (const [ tableCode, tableName ] of Object.entries(schemaTablesMapping)) {
            console.log(`table code: ${tableCode}; table name: ${tableName}`);
            if(tableNameCode === tableCode) {
                return tableName;
            }
        }
    }

    return null;
}
