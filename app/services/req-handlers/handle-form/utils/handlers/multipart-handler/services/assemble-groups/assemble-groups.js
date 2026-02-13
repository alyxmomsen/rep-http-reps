const { loggerFactory } = require("../../../../../../../../../utils/logger");

const log = loggerFactory('assemble groups' , '-u');
class AssembleGroups {

    getAllAssembled () {
        return this.#groups ;
    }

    getTableItems (tablename) {

        const tableItems = [] ;

        for (const [_g , tableItem ] of this.#groups.entries()) {

            const { tableName , tableItemFields } = tableItem ;

            (tableName === tablename) && tableItems.push(new TableItem(tableItemFields));
        }
        
        return tableItems ;
    }
    
    gulpOneBundle (bundle) {

        log('def' , 'gulp one');

        const { contentType , filenameAttr , body , semantic } = bundle ;
        const { groupId , tableName , tableItemFieldName } = semantic ;

        if(!groupId || !tableName || !tableItemFieldName) {
            throw new Error('no semantic data'.toUpperCase());
        }

        const contentTypeMap = {
            TEXTPLAIN:'text/plain' ,
        }

        const tableItemFieldBundle = {
            tableName , 
            field: {
                name:tableItemFieldName , 
                data: {
                    body ,
                    contentType: contentType || contentTypeMap.TEXTPLAIN ,
                }
            }
        }
        
        const tableItemFileds = [
            tableItemFieldBundle
        ] ;

        if(filenameAttr) {
            tableItemFileds.push({
                tableName ,
                field: {
                    name: 'filename' ,
                    data: {
                        body:filenameAttr ,
                        contentType: contentTypeMap.TEXTPLAIN ,
                    }
                }
            });    
        }
        
        tableItemFileds.forEach(tableItemField => {

            this.#push(groupId , tableItemField );
        });
    }

    #push (groupId , tableItemField) {

        const { tableName , field } = tableItemField ;

        const { data , name } = field ;

        const groupById = this.#groups.get(groupId);

        if(!groupById) {
            log('y' , 'create one group: ' , groupId)
            this.#groups.set(groupId , {
                tableName , 
                tableItemFields:new Map([
                    [name , data]
                ]) ,
            });
            return ;
        }

        log('y' , 'update one');

        const { tableItemFields } = groupById ;

        tableItemFields.set(name , data);
    }

    #groups;

    constructor () {

        this.#groups = new Map();
    }
}

module.exports = AssembleGroups ;

class TableItem {

    get() {
        const fields = {} ;
        this.#tableItem.entries().forEach(([key , value ]) => {
            fields[key] = value ;
        });
        return fields ;
    }

    #tableItem;

    constructor (tableItem) {
        this.#tableItem = tableItem ;
    }

}