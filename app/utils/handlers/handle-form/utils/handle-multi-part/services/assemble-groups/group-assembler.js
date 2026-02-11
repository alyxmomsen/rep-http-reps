
class GroupAssembler {

    gulpOneGroupMember (payload) {

        const {
            contentType , filenameAttr , 
            semantic , body , 
        } = payload ;

        if(!semantic) {
            throw new Error('\x1b[33mno semantic data'.toUpperCase());
        }

    }
    
    #groups;

    constructor () {
        this.#groups = new Map;
    }
}

module.exports = GroupAssembler ;