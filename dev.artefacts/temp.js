
class GroupAssembler {

    /**
     * 
     * @param {{groupId?:string;tableName?:string;colName?:string;colValue?:string;colContentType?:string}} data 
     * @returns {void}
     */
    gulpOneceColumnData (data) {

        const { groupId , tableName , colName , colValue , colContentType } = data ;

        const columnBundle = {
            value:colValue ,
            contentType:colContentType || 'text/plain' ,
        }

        const groupById = this.#groups.get(groupId);

        if(!groupById) {
            this.#groups.set(groupId , {
                tableName , 
                columns: new Map([[
                    colName , columnBundle
                ]]) ,
            }); 
            return ;
        }

        const { columns } = groupById ;

        columns.set(colName , columnBundle);
    }

    /**
     * 
     * @returns {Object.<string ,Object.<string,string>[]>}
     */
    getRowsGroupedByTableName () {
        const groups = {} ;

        for (const [ _groupId , group ] of this.#groups.entries()) {

            const row = {} ;
            const { tableName , columns } = group ;
            for (const [ colname , colData ] of columns) {
                row[colname] = colData ;
            }

            const tablenameGroups = groups[tableName] ;

            if(!tablenameGroups) {
                groups[tableName] = [row] ;
                continue ;
            }

            tablenameGroups.push(row);
        }

        return groups ;
    }

    #groups;

    constructor () {
        this.#groups = new Map();
    }
}
