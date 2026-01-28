const { randomBytes } = require('crypto');
const uploadService = require('../upload-service/upload-service');

class Registy {

    async add(payload , uploadservice) {

        const {
            semantic, body,
            filename,contentType,
            title , description
        } = payload ;


        if(!filename) {
            console.log('filename is not given: ' ,{filename , payload});
            return ;
        }

        const newFilename = filename ;


        // check if the same is exist

        for (const [_ , bundle] of this.#items) {

            const _filename = bundle.filename ;

            console.log({_filename , filename});

            if(filename === _filename) {

                console.log(`\x1b[31mfile already exists as \x1b[33m${_filename}`);
                return ;
            }

        }

        // ------------------------------------------------

        const status = await uploadService.checkIfExist(newFilename);

        console.log({checkfilestatus:status});
        if(status === 1) return; 
        
        // ---------------------------------------------------

        const uploadstatus = await uploadService.uploadFile(newFilename , body);
        
        if(uploadstatus === 1) return ;

        // ---------------------------------------------------

        const registryItemBundle = {
            semantic ,
            filename , 
            contentType, 
            title: title || null ,
            description:description || null, 
        }

        this.#items.set(
            randomBytes(32).toString("hex") , 
            registryItemBundle ,
        );

        console.log({uploadstatus ,registryItemBundle });

    }

    #items;
    constructor () {
        this.#items = new Map();
    }
}

const registry = new Registy ;

module.exports = registry ;