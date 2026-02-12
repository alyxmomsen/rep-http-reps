
class GroupAssembler {

    getAllGroupsMap () {

        return this.#groups ;
    }

    getGroupsByTableName (tableName/* {tableName , fields:[]} */) {

        // const _fields = {}

        const tableNameGroups = [] ;

        for (const [id , body] of this.#groups.entries()) {
            const { tableItemFields , tableName:_tableName } = body ;
            // const tableItemFields = body.tableItemFields ;
            
            if(tableName === _tableName) {

                // tableItemFields.entries().forEach(([name , data]) => {

                //     fields

                // });

                tableNameGroups.push(new SubGroup(tableItemFields));
                
                // return (fieldName , encoding) => {

                //     const body = (tableItemFields.get(fieldName) || {})?.body ;

                //     return (encoding && body) ? body.toString(encoding) : body ;

                // }
            }
        }

        return tableNameGroups ;
    }

    gulpOneGroupMember (payload) {

        const {
            contentType , filenameAttr , 
            semantic , body , 
        } = payload ;

        if(!semantic) {
            throw new Error('\x1b[33mno semantic data'.toUpperCase());
        }

        const contentTypeMap = {
            TEXTPLAIN:'text/plain',
        }
        
        const { groupId , tableName , tableItemFieldName } = semantic ;

        const tableItemFieldsBundles = [
            {
                tableName ,
                field:{
                    name:tableItemFieldName ,
                    data:{
                        body ,
                        contentType:contentType || contentTypeMap.TEXTPLAIN,
                    }
                },
            } ,
        ]

        if(filenameAttr) {
            tableItemFieldsBundles.push({
                tableName,
                field:{
                    name:'filename' ,
                    data:{
                        body:filenameAttr ,
                        contentType: contentTypeMap.TEXTPLAIN,
                    }
                },
            })
        }

        tableItemFieldsBundles.forEach(bundle => {
            this.#setGroup(groupId  , bundle );
        });

    }

    #setGroup (groupId , payload) {
        
        const { tableName , field } = payload ;

        if(!field || !tableName) {
            throw new Error("!field || !tableName");
        }

        const { name , data } = field ;

        const groupById = this.#groups.get(groupId);

        if(!groupById) {
            this.#groups.set(groupId , {
                tableName , 
                tableItemFields:new Map([
                    [name , data]
                ]),
            })
            return ;
        }

        const { tableItemFields } = groupById ;

        tableItemFields.set(name , data);

    }
    
    #groups;

    constructor () {
        this.#groups = new Map;
    }
}

module.exports = GroupAssembler ;

class SubGroup {

    get(fieldName , encoding) {

        const fieldByName = this.#tableItemsFieldsMap.get(fieldName) ;

        if(!fieldByName) {
            return null ;
        }

        // const body = (fieldByName || {}).body ;
        // const contentType = (fieldByName || {}).contentType ;

        const {contentType , body} = fieldByName ;

        return {
            body:(encoding && body) ? body.toString(encoding) : body ,
            contentType ,
        } ;
    }

    #tableItemsFieldsMap ;

    constructor (tableItemFieldsMap) {

        
        if(tableItemFieldsMap instanceof Map === false) throw new Error ('payload is not a Map')
            
        this.#tableItemsFieldsMap = tableItemFieldsMap
    }
}