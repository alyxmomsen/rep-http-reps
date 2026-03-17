
const { SCHEMA, constructorReqursive } = require("../../../../utils/reqursive-extractor/reqursive-extractor");

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
                "25":"users",
                "af":"video-playlist",
            },
            "F":{
                "8e":"video-files",
            }
        }

        
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
        console.log({groupCodeMatch, groupCode});

        const groupType = groupCodeMatch[1];
        const groupId = groupCodeMatch[2];
        const tableNameCode = groupCodeMatch[3];

        if(!tableNameCode || !groupId || !groupType) {
            throw new Error(`unknown group code: ${groupCode}`);
        }

        const tableName = DB_TABLES_MAP_SCHEMA[groupType]?.[tableNameCode];

        if (tableName === undefined) {
            throw new Error('incorrect groupType or tableNameCode');
        }

        const incomingData = {
            // nameAttr,
            fileMIME,
            fileName,
            fileBody,
            dataType,
            columnName,
            groupId,
            tableName,
        }

        console.log({incomingData});

        // Object-Relational Mapping
        constructorReqursive( SCHEMA, incomingData, this.#groups_ );
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

    __getGroups () {
        return this.#groups_;
    }

    #groups_;

    constructor () {
        this.#groups_ = {};
    }
}

module.exports = { MultiTableGrouppingAgent , dataTypeValidator };
