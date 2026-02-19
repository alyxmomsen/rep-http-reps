
class GroupAssembler {

    getAssembledGroupsByTableName () {
        
        const groupsByTableName = {} ;

        for (const [groupId , groupData] of this.#groups) {

            const row = {} ;

            const { tableName , columns } = groupData ;

            for (const [colName , colData] of columns) {
                row[colName] = colData ; 
            }

            const groupByTablename = groupsByTableName[tableName];

            if(!groupByTablename) {
                groupsByTableName[tableName] = [row] ;
                continue ;
            }

            groupByTablename.push(row);

        }

        return groupsByTableName ;
    }

    gulpOne ({groupId , tableName , colName , colValue , colContenttype}) {

        const column = {
            colName ,
            data: {
                value:colValue ,
                contentType:colContenttype || this.#colContenttypeDefaultvalue ,
            }
        }

        this.#updateGroup(groupId , tableName , column);
    }

    #updateGroup(groupId , tableName , column) {

        const { colName  , data: colData } = column ;

        const groupByGroupId = this.#groups.get(groupId);
        
        if(!groupByGroupId) {
            this.#groups.set(groupId , {
                tableName , 
                columns:new Map([
                    [colName , {
                        ...colData ,
                    }]
                ]) ,
            });
            return ;
        }

        const { columns } = groupByGroupId ;

        columns.set(colName , {...colData});

    }

    #groups;
    #colContenttypeDefaultvalue ;

    constructor () {
        this.#groups = new Map();
        this.#colContenttypeDefaultvalue = 'text/plain' ;
    }
}

module.exports = GroupAssembler ;