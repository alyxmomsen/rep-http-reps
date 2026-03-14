
const { Extractor } = require("../../../../utils/extractor/models/extractor.model");
const { FILE_DATA_SCHEMA, MULTITABLE_AGENT_OUT_DATA_SCHEMAS } = require("../../../../utils/extractor/schemas/schemas");
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

        console.log({incomingData});

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

    _getGroups(schema) {

        const tableNameGroups = {};
        
        const colorizedString = (string,r=255,g=255,b=255) => `\x1b[38;2;${r};${g};${b}m${string}\x1b[0m`;
        
        /* extractor instance */
        const extractor = new Extractor();

        for (const [groupKey, groupData] of this.#groups.entries()) {
            console.log(colorizedString(`group code: ${groupKey}`,255,128,0));
            const {tableName, files, tableColumns} = groupData;
            console.log(colorizedString(`tablename: ${tableName}`,0,255,255));

            /* preparing tablename data */

            if(tableNameGroups[tableName] === undefined) {
                tableNameGroups[tableName] = {
                    files:[],
                    columns:{},
                };
            }
            /**
             * @type {{files:Object[];columns:Object.<string,any>}}
             */
            const groupByTableName = tableNameGroups[tableName];

            /* ------------------------ */

            if(tableColumns.size) {
                console.log(colorizedString(`columns: `,128,64,0));
                for (const [rawColumnName, columnData] of tableColumns.entries()) {
                    console.log(colorizedString(`column name: ${rawColumnName}`));
                    console.log({columnData});
                    const columnNameLinks = rawColumnName.match(/\[(.+)\]/);
                    if(columnNameLinks) {}

                    const { columns } = groupByTableName ;
                    
                    columns[rawColumnName] = extractor.extract(MULTITABLE_AGENT_OUT_DATA_SCHEMAS.COLUMN, columnData);
                    // columns[rawColumnName] = extract(SCHEMAS.COLUMN, columnData);

                }
            }

            if(files.length) {
                console.log(colorizedString(`files: `,128,255,64));
                for (const file of files) {
                    console.log({file});
                    const { files } = groupByTableName ;
                    // files.push(extract(SCHEMAS.FILE, file))
                    files.push(extractor.extract(MULTITABLE_AGENT_OUT_DATA_SCHEMAS.FILE, file))
                }
            }
        }

        return tableNameGroups ;
    }

    /**
     * @param {() => Object} strategy 
     * @returns {Object.<string,{files:Object[];rows:Object.<string,string>}[]>}
     */
    getGroups (strategy) {

        /* #dev #notice
         * 
         * можно не сортировать по tablename, так как в коде группы уже закодирован tablename
         * 
         */

        const groups = {} ;

        for (const [ groupId , groupData ] of this.#groups.entries()) {

            const tableFiles = [] ;
            const tableRows = {} ;

            const { tableName , files: groupFiles , tableColumns } = groupData ;

            for (const fileData of groupFiles) {
                tableFiles.push(fileData);
            }

            for (const [ columnName , columnData ] of tableColumns.entries()) {
                tableRows[columnName] = columnData ;
            }

            const groupByTableName = groups[tableName] ;

            if(!groupByTableName) {
                groups[tableName] = [{
                    files:tableFiles ,
                    rows:tableRows ,
                }];
                continue ;
            }

            groupByTableName.push({
                files:tableFiles , rows:tableRows ,
            });
        }

        return groups ;
    }

    /**
     * 
     * @param {{
     *  groupId:string;
     *  tableName:string;
     *  columnName:string;
     *  columnDataType:string;
     *  columnValue:Buffer<ArrayBuffer>;
     * }} data 
     */
    #pushPlainFileldData (data) {

        // console.log({data});

        const { groupId , tableName ,  data:groupItemData } = data ;

        const { columnName , columnDataType , columnValue } = groupItemData ;

        /* represent "database table row" */
        const groupById = this.#groups.get(groupId); 

        /* represenet "table row column" */
        const tableColumnBundle = {
            dataType:columnDataType ,
            data:columnValue ,
        }

        /* creating new Group by group-id */
        if(!groupById) {
            this.#groups.set(groupId , 
                this.#groupFactory(
                    tableName , 
                    undefined , 
                    this.#FIELDBundleFactory(
                        columnName , 
                        columnDataType , 
                        columnValue
                    ) ,
                )
            );
            // console.log(`added column <${columnName}> in the group <${groupId}> for <${tableName}> table`);
            return ;
        }

        /* if group by the id is exist  */
        const { tableColumns } = groupById ;
        const { 
            columnName:colName , tableColumnBundle:colBundle 
        } = this.#FIELDBundleFactory(columnName , columnDataType , columnValue) ;
        tableColumns.set(colName, colBundle);

        // console.log(`added column <${columnName}> in the group <${groupId}> for <${tableName}> table`);
    }

    /**
     * 
     * @param {{
     *  groupId:string;
     *  tableName:string;
     *  data:{fileBody:Buffer<ArrayBuffer>;fileName:string;fileMIME:string};
     * }} data 
     */
    #pushFileData (data) {

        const { groupId , tableName , data:groupData} = data ;
        const { fileBody , fileMIME:mime , fileName , columnName } = groupData ;

        const groupById = this.#groups.get(groupId);
    
        if(!groupById) {
            this.#groups.set(
                groupId , 
                this.#groupFactory(
                    tableName , 
                    this.#FILEBundleFactory(mime , fileName , fileBody , columnName) ,
                    undefined ,
                )
            );
            return ;
        }

        const { files } = groupById ;

        files.push(this.#FILEBundleFactory(mime , fileName , fileBody , columnName));
        console.log(`added file in the group <${groupId}> for <${tableName}> table`);
    }

    /**
     * @param {string} columnName 
     * @param {string} dataType 
     * @param {string} data 
     * @returns {{columnName:string;tableColumnBundle:{dataType:string;data:string}}}
     */
    #FIELDBundleFactory (columnName ,dataType ,data) {

        const tableColumnBundle = { dataType , data }

        return {
            columnName , 
            tableColumnBundle ,
        }
    }


    #FILEBundleFactory (mime , fileName , fileBody , columnName) {
        return {
            mime , fileName , fileBody , columnName
        }
    }

    /**
     * 
     * @param {string} tableName 
     * @param {{mime:string;fileName:string;fileBody:Buffer<ArrayBuffer>}|undefined} [fileData] 
     * @param {{columnName:string;tableColumnBundle:{dataType:string;data:string}}|undefined} [tableColumnData] 
     * @returns 
     */
    #groupFactory (tableName , fileData , tableColumnData) {
        const { columnName , tableColumnBundle } = tableColumnData || {} ;
        return {
            tableName ,
            files:fileData ? [fileData] : [] ,
            tableColumns: tableColumnData ? new Map([[columnName , tableColumnBundle]]) : new Map() ,
        }
    }

    #groups;
    #groups_;

    constructor () {
        this.#groups = new Map();
        this.#groups_ = {};
    }
}

module.exports = { MultiTableGrouppingAgent , dataTypeValidator };
