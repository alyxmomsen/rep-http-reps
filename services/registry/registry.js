const { randomBytes } = require('crypto');
const filemanager = require('../upload-service/upload-service');
const { extname, join, basename} = require('path');

class Registy {

    async getAllItems() {
        return this.#items;
    }

    async add(payload/* , filemanager */) {

        const { filename , contentType , body , title } = payload;

        if (!body.length) {
            throw new Error('no body');
        }

        if (!filename) {
            throw new Error('filename is falsy');
        }

        const ext = extname(filename);

        if (!ext) {
            throw new Error('filename has no extansion');
        }

        if (title.length) {

            const newName = title.toString('utf-8') + ext;
            const { message , status } = await filemanager.uploadFile(newName , body);

            console.log('uploading by title' , {message , status});

            if (status) {
                return;
            }

            const newId = randomBytes(32).toString('hex');
        
            this.#items.set(newId, {
                contentType,
                filename,
                originalName: filename,
            });

            return;
        }

        const { message , status } = await filemanager.uploadFile(filename , body);
        console.log({status , message});
            
        if (status) return;

        const newId = randomBytes(32).toString('hex');
        
        this.#items.set(newId, {
            contentType,
            filename,
            originalName: filename,
        });
        

    }

    #items;

    constructor() {
        this.#items = new Map();
    }
}

const registry = new Registy ;

module.exports = registry ;