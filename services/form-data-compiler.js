
class FormDataCompiler {

    getFiles () {
        return this.#files ;
    }

    gulpPart(fieldData) {

        const {contentType , body , filename , semantic} = fieldData ;

        const {group , tablename , fieldname} = semantic ;

        if(!this.#files.has(group)) {

            this.#files.set(group , {
                tablename ,
                fields: new Map(),
            });
        }

        const groupFile = this.#files.get(group);

        groupFile.fields.set(fieldname , {
            body ,
            filename ,
            contentType ,
        });
    }

    #files;

    constructor () {
        this.#files = new Map();
    }
}

module.exports = FormDataCompiler ;