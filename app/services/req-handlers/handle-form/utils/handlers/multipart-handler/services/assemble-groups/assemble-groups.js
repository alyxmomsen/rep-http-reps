
const GROUP_ASSEMBLER_CONSTANTS = {
    args:{

    },
    pushOneColumn:{
            
    },
    fields:{
        GROUP_ID:'GROUP_ID',
        TABLE_NAME:'TABLE_NAME',
        COLUMN_NAME:'COLUMN_NAME',
        COLUMN_VALUE:'COLUMN_VALUE',
        COLUMN_CONTENT_TYPE:'COLUMN_CONTENT_TYPE',
    } ,
    
}

class GroupAssembler {

    /**
     * 
     * @param {{
     *  gropId:string;
     *  tableName:string;
     *  columnName:string;
     *  columnValue:Buffer<ArrayBuffer>;
     *  columnContentType:string;
     * }} data 
     */
    pushOneColumn(data) {
        const { 
            GROUP_ID , TABLE_NAME ,COLUMN_NAME, COLUMN_VALUE ,COLUMN_CONTENT_TYPE 
        } = GROUP_ASSEMBLER_CONSTANTS.fields ;
        const gropId = data[GROUP_ID];
        const tableName = data[TABLE_NAME];
        const columnName = data[COLUMN_NAME];
        const columnValue = data[COLUMN_VALUE];
        const columnContentType = data[COLUMN_CONTENT_TYPE];

        const colData = {
            value:columnValue ,
            contentType:columnContentType
        } ;

        const groupById = this.#groups.get(gropId);
        
        if(!groupById) {
            this.#groups.set(gropId , {
                tableName , 
                columns: new Map([[
                    columnName , colData
                ]]) ,
            });
            return ;
        }
        
        const { columns } = groupById ;

        columns.set(columnName  , colData);
    }

    /**
     * 
     * @returns {Object.<string,{COLUMN_VALUE:Buffer<ArrayBuffer>;COLUMN_CONTENT_TYPE:string}}
     */
    getRowsGropedByTableName () {
        const groups = {} ;

        for (const [groupId , groupData ] of this.#groups.entries()) {

            const { tableName , columns } = groupData ;

            const tableRow = {} ;

            for (const [ columnName , columnData ] of columns.entries()) {
                tableRow[columnName] = columnData ;
            }

            const tablenameGroup = groups[tableName] ;

            if(!tablenameGroup) {
                groups[tableName] = [tableRow] ;
                continue ;
            }

            tablenameGroup.push(tableRow);
        }

        return groups ;
    }
    
    #groups;

    constructor () {
        this.#groups = new Map();
    }
}

module.exports = {GroupAssembler , GROUP_ASSEMBLER_CONSTANTS} ;