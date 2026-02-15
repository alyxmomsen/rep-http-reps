
class GroupAssembler {

    getAssemled () {
        const groups = {}

        for (const [groupId , groupBundle] of this.#groups.entries()) {

            const { tableName , columns } = groupBundle ;
    
            const rowColumns = {}
            
            columns.entries().forEach(([tablename , colBundle]) => {
                const { value , contentType } = colBundle ;
                rowColumns[tablename] = {
                    value ,
                    contentType ,
                }
            })
            
            const groupByTableName = groups[tableName];
    
            if(!groupByTableName) {
                groups[tableName] = [rowColumns] ;
                continue ;
            }
    
            groupByTableName.push(rowColumns);

        }
        
        return groups ;
    }

    gulpOne ({groupId  , tableName , colName , colValue , colContentType}) {

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
                contentType:colContentType || this.#columnDefaultContentType ,
            }
        }

        this.#updateGroup(bundle) ;

    }

    #updateGroup (bundle) {

        const { group , table , column } = bundle ;

        const { id:groupId } = group ;
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

    #groups;
    #columnDefaultContentType ;

    constructor () {
        this.#groups = new Map();
        this.#columnDefaultContentType = 'text/plain' ;
    }
}

module.exports = GroupAssembler ;