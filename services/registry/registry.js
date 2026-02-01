const { randomBytes } = require('crypto');
const filemanager = require('../filemanager/filemanager');

require('fs');
class Registry {

    async getAllFilesArray () {

        const files = [] ;

        for (const [id , bundle] of this.#files) {
            files.push({
                id ,
                ...bundle ,
            });
        }

        return files ;
    }

    async add (data) {
        console.log('call method "add"...' );

        const { 
            contentType ,filename ,
            body ,semantic ,
            title ,description ,
        } = data ;

        console.log({contentType , filename , body , title , description , filemanager:this.#filemanager});


        // compile new filename

        // compile new file bundle

        const newFileBundle = {
            contentType ,
            originalFileName:filename ,
            filename:filename ,
            title:title ? title.toString('utf-8') : null ,
            description: description ? description.toString('utf-8') : null ,
        }
        
        //

        const fileexiststatus = await filemanager.checkIfFileExist(filename);

        console.log({fileexiststatus});
        
        if (fileexiststatus) {
            return 1 ;
        }

        const uploadstatus = await filemanager.upload(filename , body);

        if(uploadstatus) {
            return 2 ;
        }


        const fileID = randomBytes(32).toString("hex");
        this.#files.set(fileID , newFileBundle);
        return 0 ;

    }

    #files;
    #filemanager;

    constructor (filemanager) {
        this.#files = new Map();
        this.#filemanager = filemanager ;
    }
}

const registry = new Registry(filemanager);

module.exports = registry ;