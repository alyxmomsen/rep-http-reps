
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