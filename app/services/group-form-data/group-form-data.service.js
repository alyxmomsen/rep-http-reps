
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

        const { CONTENT_TYPE  , VALUE } = CONSTANTS.COLUMN_DATA_KEYS

        const groups = {} ;

        for  (const [ _groupId , groupData ] of this.#groups.entries()) {
            const { tableName , columns } = groupData ;
            
            const tableRow = {} ;

            for (const [ columnName , columnData ] of columns.entries()) {
                
                if(!columnName) {
                    console.log('no column-name');
                    continue ;
                }

                const value = columnData[VALUE] ;
                const contentType = columnData[CONTENT_TYPE] ;

                if(!value && !contentType) {
                    console.log('no value of content-type');
                    continue ;
                }

                tableRow[columnName] = {value , contentType} ;
            }

            const tablenameGroup = groups[tableName] ;

            if(!tablenameGroup) {
                groups[tableName] = [tableRow] ;
                continue ;
            }

            tablenameGroup.push(tableRow) ;
        }

        return groups ;
    }

    /**
     * @param {{
     *  groupId:string;
     *  tableName:string;
     *  columnName:string;
     *  columnContentType:string;
     *  columnValue:Buffer<ArrayBuffer>; 
     * }} data 
     */
    pushParsedInputData (data) {

        const { groupId , tableName , columnName , columnValue , columnContentType } = data ;

        const columnData = {
            value:columnValue ,
            contentType: columnContentType || 'text/plain' ,
        }

        const groupsById =this.#groups.get(groupId);

        if(!groupsById) {
            this.#groups.set(groupId , {
                tableName , 
                columns: new Map([[
                    columnName , columnData
                ]]) ,
            });
            return ;
        }

        const { columns } = groupsById ;

        columns.set(columnName , columnData);
    }

    #groups;

    constructor () {
        this.#groups = new Map();
    }
}

module.exports = { GroupFormData , grouperStrategies , dataTypeValidator } ;

function factory () {

}

function strategy () {

}