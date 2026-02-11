
class GroupAssembler {

    getGroups () {
        return this.#groups ;
    }

    gulpOneGroupMemeber (payload) {

        const {contentType , filenameAttr , body , semantic} = payload ;
        
        if(!semantic) {
            throw new Error('\x1b[33mno semantic data'.toUpperCase());
        }

        const { groupId , tableName , tableItemFieldName } = semantic ;

        const tableItemData = [
            {
                tableItemFieldName ,
                itemData: {
                    body ,
                    contentType ,
                }
            } , 
        ] ;

        if(filenameAttr) {
            tableItemData.push({
                tableItemFieldName:'filename' ,
                itemData: {
                    body:filenameAttr ,
                    contentType:'text/plain' ,
                }
            });
        }

        tableItemData.forEach(item => {

            console.log({item});

            
            const { tableItemFieldName , itemData } = item ;
            
            // return ;
            this.#setGroup(
                groupId , {
                    tableName , tableItemData:item
                }
            );
        });
    }

    #setGroup(gropId , payload) {

        const { tableName , tableItemData:{
            tableItemFieldName , itemData: {
                body , /* filenameAttr , */ contentType
            }
        }} = payload ;

        const tableItemFieldData = {
            body , 
            contentType: contentType || 'text/plain' ,
        } ;

        if(!this.#groups.has(gropId)) {
            this.#groups.set(gropId , {
                tableName ,
                tableItemFields:new Map([
                    [tableItemFieldName , tableItemFieldData ] ,
                ]) ,
            });
            return ;
        }

        const groupById = this.#groups.get(gropId);

        const { tableItemFields } = groupById ;
    
        tableItemFields.set(tableItemFieldName , tableItemFieldData);
    }

    #groups;

    constructor () {
        this.#groups = new Map();
    }
}

module.exports = GroupAssembler ;