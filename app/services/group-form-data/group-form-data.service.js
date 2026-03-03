
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
                groups[tableName] = {
                    files:tableFiles ,
                    rows:tableRows ,
                };
                continue ;
            }

            groupByTableName.files = tableFiles ;
            groupByTableName.rows = tableRows ;
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

        const groupById = this.#groups.get(groupId);

        if(!groupById) {
            this.#groups.set(groupId , {
                tableName , 
                files:[] ,
                tableColumns:new Map([[
                    columnName , {
                        dataType:columnDataType ,
                        data:columnValue ,
                    }
                ]]),
            });
            // console.log(`added column <${columnName}> in the group <${groupId}> for <${tableName}> table`);
            return ;
        }

        const { tableColumns } = groupById ;

        tableColumns.set(columnName , {
            dataType:columnDataType ,
            data:columnValue ,
        });

        // console.log(`added column <${columnName}> in the group <${groupId}> for <${tableName}> table`);
    }

    /**
     * 
     * @param {{
     *  groupId:string;
     *  tableName:string;
     *  mime:string;
     *  filename:string;
     *  fileData:Buffer<ArrayBuffer>;
     * }} data 
     */
    pushFileData (data) {

        // console.log({data});

        const { groupId , tableName , data:groupData } = data ;

        const { fileBody , mime , filename:fileName } = groupData ;


        const groupById = this.#groups.get(groupId);

        if(!groupById) {
            this.#groups.set(groupId , {
                tableName , 
                files:[{
                    mime , fileName , fileBody ,
                }] ,
                tableColumns: new Map() ,
            });
            return ;
        }

        const { files } = groupById ;

        files.push({mime , fileName , fileBody});
        // console.log(`added file in the group <${groupId}> for <${tableName}> table`);
    }

    #groups;

    constructor () {
        this.#groups = new Map();
    }
}

module.exports = { GroupFormData , grouperStrategies , dataTypeValidator } ;

