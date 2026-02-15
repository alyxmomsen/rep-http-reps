
class GroupAssembler {

    getAllAssembledGroups () {

        const groups = {} ;

        for (const [_ , group] of this.#groups.entries()) {

            const row = {} ;

            const { tableName , columns } = group ;

            columns.entries().forEach(([colname , colBundle]) => {
                row[colname] = colBundle ;
            });

            const groupByTableName = groups[tableName] ;

            if(!groupByTableName) {
                groups[tableName] = [row] ;
                continue ;
            }

            groupByTableName.push(row);
        }

        return groups ;
    }

    gulpOne ({groupId , tableName , colName , colValue , colContentType}) {

        const bundle = {
            group:{
                id:groupId ,
            } ,
            table:{
                name:tableName ,
            } ,
            column: {
                name:colName ,
                value:colValue ,
                contentType:colContentType || this.#colContentTypeDefault ,
            }
        }

        this.#updateGroup(bundle);
    }

    #updateGroup (bundle) {

        const { group , table , column } = bundle ;
        const { id:groupId } = group ;
        const { name:tableName } = table ;
        const { name:colName , value:colValue , contentType:colContentType } = column ;

        const groupById = this.#groups.get(groupId);

        if(!groupById) {
            this.#groups.set(groupId , {
                tableName ,
                columns: new Map([
                    [colName , {
                        value:colValue ,
                        contentType:colContentType ,
                    }]
                ]) ,
            });
            return ;
        }

        const { columns } = groupById ;

        columns.set(colName , {
            value:colValue ,
            contentType:colContentType ,
        });
    }

    #colContentTypeDefault;
    #groups;

    constructor () {
        this.#groups = new Map();
        this.#colContentTypeDefault = 'text/plain' ;
    }
}

module.exports = GroupAssembler ;