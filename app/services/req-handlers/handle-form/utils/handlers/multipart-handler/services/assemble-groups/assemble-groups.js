
class GroupAssembler {

    getAssembledGroups () {

        const groups = {} ;

        for (const [_ , { tableName , columns }] of this.#groups.entries()) {
            
            const row = {} ;
            for (const [colName , data ] of columns) {
                row[colName] = data ; 
            } 

            const groupsByTablename = groups[tableName] ;

            if(!groupsByTablename) {
                groups[tableName] = [row] ;
                continue ;
            }

            groupsByTablename.push(row) ;
        }

        return groups ;
    }

    gulpOne ({groupId , tableName , colName , colValue , colContentType}) {

        const column = {
            name:colName ,
            value:colValue , 
            contentType:colContentType || this.#colContentTypeDefaultValue ,
        }

        this.#updateGroup(groupId  ,tableName , column);

    }

    #groups ;
    #colContentTypeDefaultValue;

    #updateGroup (groupId , tableName , column) {

        const { name: colName , value: colValue , contentType: colContentType } = column ;

        const groupByGroupId = this.#groups.get(groupId);

        if(!groupByGroupId) {
            this.#groups.set(groupId , {
                tableName , 
                columns:new Map([
                    [colName , {
                        value: colValue , contentType: colContentType
                    }]
                ]) ,
            });
            return ;
        }

        const { columns } = groupByGroupId ;

        columns.set(colName , {
            value:colValue , contentType:colContentType ,
        });

    }
    
    constructor () {

        this.#groups = new Map();
        this.#colContentTypeDefaultValue = 'text/plain' ;
    }
}

module.exports = GroupAssembler ;