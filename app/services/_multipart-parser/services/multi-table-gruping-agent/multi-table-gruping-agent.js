
const { Mapper } = require("../../../../utils/reqursive-extractor/mapper-2/mapper.2.0");
const { MY_TEST_SCHEMA } = require("../../../../utils/reqursive-extractor/mapper-2/schemas/test-schema");
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

        const { groupId:groupCode, columnName, dataType } = this.#parseNameAttribute(nameAttr);

        /* tablename decoding
        * 
        * 
        */
        const groupCodeMatch = groupCode.match(/(\w)=([\w\d]{2})([\w\d]{2})/);
        console.log({groupCodeMatch, groupCode});

        const groupType = groupCodeMatch[1];
        const groupId = groupCodeMatch[2];
        const tableNameCode = groupCodeMatch[3];

        if(!tableNameCode || !groupId || !groupType) {
            throw new Error(`unknown group code: ${groupCode}`);
        }

        const tableName = DB_TABLES_MAP_SCHEMA[groupType][tableNameCode];

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

        const mapper = new  Mapper();

        mapper.process(MY_TEST_SCHEMA, incomingData, this.#groups_);

        console.log({contenxt:this.#groups_});

        // constructorReqursive( SCHEMA, incomingData, this.#groups_ );

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
