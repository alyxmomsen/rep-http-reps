
class GroupAssembler {

    getAllAssembledGroups () {

        const groups = {} ;

        for (const [_ , group] of this.#groups) {

            const row = {} ;
            const { tableName  , columns } = group ;
            for (const [colname , colData] of columns) {
                row[colname] = colData ;
            }
            
            const groupByTableName = groups[tableName] ;
            if(!groupByTableName) {
                groups[tableName] = [row];
                continue ;
            }

            groupByTableName.push(row);
        }

        return groups ;
    }

    gulpOne ({groupId  , tableName , colName , colValue , colContentType}) {

        const column = {
            name:colName ,
            value:colValue ,
            contentType:colContentType || this.#columnContentTypeDefaultValue ,
        }

        this.#updateGroup(groupId , tableName , column) ;

    }

    #updateGroup (groupId , tableName , column) {

        const { name: colName , value: colValue , contentType: colContentType } = column ;

        const groupById = this.#groups.get(groupId);

        if(!groupById) {
            this.#groups.set(groupId , {
                tableName ,
                columns:new Map([
                    [colName , {
                        value: colValue , 
                        contentType: colContentType ,
                    }]
                ]),
            });
            return ;
        }

        const { columns } = groupById ;

        columns.set(colName , {
            value: colValue , contentType: colContentType
        });

    }

    #columnContentTypeDefaultValue ;
    #groups;

    constructor () {
        this.#columnContentTypeDefaultValue = 'text/plain' ;
        this.#groups = new Map();
    }
}

module.exports = GroupAssembler ;