class GroupBundler {

    getAssembledGroups () {

        const groups = {} ;

        for (const [_ , groupAsTableRow] of this.#groups.entries()) {

            const { tableName , columns} = groupAsTableRow ;

            const row = {} ;
            for (const [ colName , colValue ] of columns) {
                // const { value , contentType } = colValue ;
                row[colName] = colValue ;
            }

            const groupByTableName = groups[tableName] ;
            
            if(!groupByTableName) {
                groups[tableName] = [row] ;
                continue ;
            }

            groupByTableName.push(row);
        }
        
        return groups ;
    }

    gulpOneColumnData({groupId , tableName , colName , colValue , colContentType}) {
        
        const column = {
            name:colName ,
            value:colValue ,
            contentType:colContentType || /* typeof colValue === 'string' &&  */this.#columnDefaultContentType ,
        }

        this.#updateTableRow(groupId  ,tableName , column);

    }

    #updateTableRow (groupId , tableName , column) {

        const { name , value , contentType } = column ;

        const groupByID = this.#groups.get(groupId);

        if(!groupByID) {
            this.#groups.set(groupId , {
                tableName ,
                columns:new Map([
                    [name , {
                        value , 
                        contentType ,
                    }]
                ]) ,
            });

            return ;
        }

        const { columns:row } = groupByID;

        row.set(name , {value , contentType});
    }

    #groups;
    #columnDefaultContentType ;

    constructor () {
        this.#groups = this.#groups = new Map()
        this.#columnDefaultContentType = 'text/plain' ;
    }
}

module.exports = GroupBundler ;