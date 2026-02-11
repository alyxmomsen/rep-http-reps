
class GroupAssembler {

    getGroups () {
        return this.#groups ;
    }

    gulpOneGroupMember (payload) {

        const {
            contentType , filenameAttr , 
            semantic , body , 
        } = payload ;

        if(!semantic) {
            throw new Error('\x1b[33mno semantic data'.toUpperCase());
        }

        const { groupId , tableName , tableItemFieldName } = semantic ;

        const tableItemFields = [
            {
                tableName ,
                fieldName:tableItemFieldName ,
                fieldData: {
                    body ,
                    contentType:contentType || 'text/plain'
                } ,
            } ,
        ]

        if(filenameAttr) {
            tableItemFields.push({
                tableName,
                fieldName:'filename' ,
                fieldData:{
                    body:filenameAttr ,
                    contentType:'text/plain' ,
                }
            })
        }

        tableItemFields.forEach(itemField => {
            this.#setGroup(groupId  , itemField );
        });

    }

    #setGroup (groupId , payload) {

        const { tableName , fieldName , fieldData } = payload ;

        if(!this.#groups.has(groupId)) {
            this.#groups.set(groupId , {
                tableName , 
                tableItemFields:new Map([
                    [fieldName , fieldData]
                ]),
            })
        }

        const groupById = this.#groups.get(groupId);

        const { tableItemFields } = groupById ;

        tableItemFields.set(fieldName , fieldData);

    }
    
    #groups;

    constructor () {
        this.#groups = new Map;
    }
}

module.exports = GroupAssembler ;