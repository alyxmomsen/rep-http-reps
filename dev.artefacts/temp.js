
class GroupAssembler {

    /**
     * 
     * 
     */
    groupsSortedByTableName () {

        const groups = {} ;

        for (const [_ , tableRow ] of this.#groups.entries()) {

            const row = {} ;
            const { tableName , columns } = tableRow ;

            for (const [ colName , colData ] of columns.entries()) {
                row[colName] = colData ;
            }

            const tableNameRow = groups[tableName] ;

            if(!tableNameRow) {
                groups[tableName] = [row] ;
                continue ;
            }

            tableNameRow.push(row);
        }

        return groups ;
    }

    gulpOnceColData ({groupId, tableName , colName , colValue , colContentType}) {
        
        const columndata = {
            value:colValue ,
            contentType:colContentType || this.#columnDefaulContentType ,
        }

        const groupById = this.#groups.get(groupId);
        if(!groupById) {
            this.#groups.set(groupId , {
                tableName , 
                columns: new Map([[
                    colName , columndata ,
                ]]) ,
            });
            return ;
        }

        const { columns } = groupById ;

        columns.set(colName , columndata);
    }

    #groups;
    #columnDefaulContentType ; 

    constructor () {
        this.#groups = new Map();
        this.#columnDefaulContentType = 'text/plain' ;
    }
}

module.exports = GroupAssembler ;