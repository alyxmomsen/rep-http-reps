
class GroupAssembler {

    getAllAssmbledGroups () {

        const groups = {} ;

        for (const [ _grId , groupBundle ] of this.#groups.entries()) {
            
            const { tableName , columns } = groupBundle ;

            const row = {} ;
            columns.entries().forEach(([colName , colBundle]) => {
                console.log({colName , colBundle});
                row[colName] = colBundle ;
            });

            const tableNameGroup = groups[tableName] ;

            if(!tableNameGroup) {
                groups[tableName] = [row] ;
                continue ;
            }

            tableNameGroup.push(row);
        }

        return groups ;
    }

    gulpOne ({groupId , tableName , colName  ,colValue , colContentType}) {

        // console.log({groupId , tableName , colName , colValue ,colContentType});

        const columnBundle = {
            name:colName ,
            value:colValue ,
            contentType:colContentType || this.#columnContentTypeDefaultValue ,
        } ;

        this.#updateGroup(groupId , tableName , columnBundle );

    }

    #updateGroup (groupId , tableName , columnBundle) {

        const { name:colName , value:colValue , contentType:colContentType } = columnBundle;

        const groupById = this.#groups.get(groupId);

        if(!groupById) {
            this.#groups.set(groupId , {
                tableName , 
                columns: new Map ([
                    [colName , {
                        colValue , 
                        colContentType ,
                    }]
                ]) ,
            });
            return ;
        }

        const { columns } = groupById;

        columns.set(colName , {
            colValue ,
            colContentType ,
        });
    }

    #groups ;
    #columnContentTypeDefaultValue;

    constructor () {
        this.#groups = new Map () ;
        this.#columnContentTypeDefaultValue = 'text/plain' ;
    }
}

module.exports = GroupAssembler ;