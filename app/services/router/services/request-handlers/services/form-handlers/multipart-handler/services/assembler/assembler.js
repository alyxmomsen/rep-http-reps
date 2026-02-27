
const MULTIPART_ASSEMBLER_CONSTANTS = {
    PORTION_DATA_KEYS:{
        GROUP_ID:'groupId',
        TABLE_NAME:'tableName',
        COLUMN_NAME:'columnName',
        COLUMN_VALUE:'columnValue',
        COLUMN_CONTENT_TYPE:'columnContentType' ,
    } , 
    COLUMN_DATA_KEYS:{
        VALUE:'value' ,
        CONTENT_TYPE:'contentType' ,
    }
}

class MultipartAssembler {

    getAssembledByTablenameGroups () {
        const groups = {} ;

        for (const [ _ , group ] of this.#groups.entries()) {

            const { tableName , columns } = group ;

            const row = {} ;

            for (const [ columnName , columnData ] of columns.entries()) {
                row[columnName] = columnData ;
            }

            const groupByTablename = groups[tableName];

            if(!groupByTablename) {
                groups[tableName] = [row] ;
                continue ;
            }

            groupByTablename.push(row);
        }

        return groups ;
    }

    /**
     * 
     * @param {{
     *  groupId:string;
     *  tableName:string;
     *  columnName:string;
     *  columnValue:Buffer<ArrayBuffer>;
     *  columnContentType:string;
     * }} data 
     */
    pushOne (data) {

        const { PORTION_DATA_KEYS:{
            GROUP_ID,
            TABLE_NAME,
            COLUMN_NAME,
            COLUMN_VALUE,
            COLUMN_CONTENT_TYPE,
        } , COLUMN_DATA_KEYS: {
            VALUE,CONTENT_TYPE
        }} = MULTIPART_ASSEMBLER_CONSTANTS

        const groupId = data[GROUP_ID];
        const tableName = data[TABLE_NAME];
        const columnName = data[COLUMN_NAME];
        const columnValue = data[COLUMN_VALUE];
        const columnContentType = data[COLUMN_CONTENT_TYPE];

        if(!groupId || !tableName || !columnName || !columnValue) {
            throw new Error(JSON.stringify({
                message:'incorrect portion data' ,
            }));
        }

        const columnData = {
            value:columnValue ,
            contentType:columnContentType || 'text/plain' ,
        }
    
        const groupById = this.#groups.get(groupId);

        if(!groupById) {
            this.#groups.set(groupId , {
                tableName , 
                columns: new Map([[
                    columnName , columnData ,
                ]]) ,
            });
            return ;
        }

        const { columns } = groupById ;

        columns.set(columnName , columnData);
    }

    #groups ;

    constructor () {
        this.#groups = new Map();
    }
}

module.exports = { MultipartAssembler , MULTIPART_ASSEMBLER_CONSTANTS } ;