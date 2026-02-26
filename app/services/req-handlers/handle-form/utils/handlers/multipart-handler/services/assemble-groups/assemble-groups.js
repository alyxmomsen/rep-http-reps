
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
     *  GROUP_ID:string;
     *  TABLE_NAME:string;
     *  COLUMN_NAME:string;
     *  COLUMN_VALUE:Buffer<ArrayBuffer>;
     *  COLUMN_CONTENT_TYPE:string;
     * }} data 
     */
    pushOneColumn (data) {

        const { 
            GROUP_ID , TABLE_NAME , COLUMN_NAME , COLUMN_VALUE , COLUMN_CONTENT_TYPE 
        } = GROUP_ASSEMBLER_CONSTANTS.fields ;

        const groupId = data[GROUP_ID];
        const tableName = data[TABLE_NAME];
        const columnName = data[COLUMN_NAME];
        const columnValue = data[COLUMN_VALUE];
        const columnContentType = data[COLUMN_CONTENT_TYPE];

        const columnData = {
            value:columnValue ,
            contentType:columnContentType ,
        }

        const groupById = this.#groups.get(groupId);

        if(!groupById) {
            this.#groups.set(groupId , {
                tableName , 
                columns: new Map([[
                    columnName , columnData
                ]]) ,
            });
            return ;
        }

        const { columns } = groupById ;

        columns.set(columnName , columnData);
    }

    /**
     * @returns {Object.<string,{columnValue:Buffer<ArrayBuffer>;columnContentType:string}[]}
     */
    getRowsGropedByTableName () {
        const groups = {} ;

        for (const [ groupId , groupData ] of this.#groups.entries()) {

            const { tableName , columns } = groupData ;

            const tableRow = {} ;

            for (const [ columnName , columnData ] of columns) {
                tableRow[columnName] = columnData ;
            }

            const tableNameGroup = groups[tableName];

            if(!tableNameGroup) {
                groups[tableName] = [tableRow]
                continue ;
            }

            tableNameGroup.push(tableRow);
        }

        return groups ;
    }

    #groups;

    constructor () {
        this.#groups = new Map();
    }
}

module.exports = {GroupAssembler , GROUP_ASSEMBLER_CONSTANTS} ;