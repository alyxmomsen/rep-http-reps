
const grouperStrategies = new Map([['tableName' , f=>f]]);


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

/**
 * 
 * @param {string} dataType 
 */
const dataTypeValidator = (dataType) => {

    const dt = dataTypeSetMap.get(dataType);
    if(!dt) throw new Error (`unregistered data type`) ;
    return dt ;
}

class GroupFormData {

    /**
     * @param {() => Object} strategy 
     * @returns {Object.<string,any>}
     */
    getGroups (strategy) {

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
    pushPlainFileldData (data) {

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
    pushFileData (data) {

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

    constructor () {
        this.#groups = new Map();
    }
}

module.exports = { GroupFormData , grouperStrategies , dataTypeValidator } ;

