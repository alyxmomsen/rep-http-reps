
class GroupAssembler {

    getAssembledGroups () {

        const groups = {} ;

        for (const [_ , groupBundle ] of this.#groups.entries()) {

            const { tableName , columns } = groupBundle ;

            const row = {} ;
            columns.entries().forEach(([colName , colBundle]) => {
                row[colName] = colBundle ;
            });

            const groupByTableName = groups[tableName] ;

            if(!groupByTableName) {
                groups[tableName] = [row] ;
                continue;
            }

            groupByTableName.push(row) ;
        }

        return groups ;
    }

    gulpOneColumnData ({groupId , tableName , colName , colValue , colContentType}) {

        const colBundle  = {
            table: {
                name:tableName ,
            } ,
            column: {
                name:colName ,
                value:colValue ,
                contentType:colContentType || this.#columnContentTypeDefaulValue ,
            }
        }

        this.#updateGroup(groupId , colBundle);
    }

    #updateGroup (groupId , bundle) {

        const { table , column } = bundle ;
        const { name:tableName } = table ;
        const { 
            name:colName , 
            value:colValue ,
            contentType:colContentType ,
        } = column ;

        const groupById = this.#groups.get(groupId);

        if(!groupById) {
            this.#groups.set(groupId , {
                tableName ,
                columns: new Map ([
                    [colName , {
                        value:colValue ,
                        contentType:colContentType ,
                    }]
                ]) ,
            }) ;
            return ;
        }

        const { columns } = groupById ;

        columns.set(colName , {
            value:colValue , contentType:colContentType ,
        });
    }

    #groups;
    #columnContentTypeDefaulValue ;

    constructor () {
        this.#groups = new Map();
        this.#columnContentTypeDefaulValue = 'text/plain' ;
    }
}

module.exports = GroupAssembler ;
