const filemanager = require('../filemanager/filemanager');

require('fs');
class Registry {

    async add (data) {
        console.log('call method "add"...' );

        const { 
            contentType ,filename ,
            body ,semantic ,
            title ,description ,
        } = data ;

        console.log({contentType , filename , body , title , description , filemanager:this.#filemanager});


        // compile new file name


        

        //

        const fileexiststatus = await filemanager.checkIfFileExist(filename);

        console.log({fileexiststatus});
        
        if (fileexiststatus) {
            return 1 ;
        }

        const uploadstatus = await filemanager.upload(filename , body);

        // if(uploadstatus) {
        //     return 2 ;
        // }

        return 0 ;

    }

    #filemanager;

    constructor (filemanager) {

        this.#filemanager = filemanager ;
    }
}

const registry = new Registry(filemanager);

module.exports = registry ;