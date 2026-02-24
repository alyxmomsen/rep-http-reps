
class GroupAssembler {

    /**
     * 
     * @param {{
     *     groupId:string; 
     *     tableName:string; 
     *     colName:string; 
     *     colValue:any;
     *     colContentType:string; 
     * }} data 
     */
    addOneColumnData (data) {

        const { groupId , tableName , colName  ,colValue , colContentType } = data ;

        const columnBundle = {
            value:colValue ,
            contentType:colContentType || 'text/plain' ,
        }

        const groupById = this.#groups.get(groupId);

        if(!groupById) {
            this.#groups.set(groupId , {
                tableName , 
                columns: new Map([[
                    colName , columnBundle ,
                ]]) ,
            });
            return ;
        }

        const { columns } = groupById ;

        columns.set(colName , columnBundle);

    }

    /**
     * @returns {Object.<string,Object.<string,{value:Buffer<ArrayBuffer>,contentType:string}>>}
     */
    getRowsGropedByTableName () {

        
        const groups = {} ;
        
        for (const [id,group] of this.#groups.entries()) {
            const row = {} ;
            console.log({group});
            
            const { tableName , columns } = group ;
            for (const [colname , columnBundle] of columns.entries()) {
                row[colname] = columnBundle ;
            }

            const tablenameGroup = groups[tableName];
            if(!tablenameGroup) {
                groups[tableName] = [row];
                continue ;
            }
            tablenameGroup.push(row);
        }

        return groups ;
    }

    #groups;

    constructor () {
        this.#groups = new Map();
    }
}

module.exports = GroupAssembler ;