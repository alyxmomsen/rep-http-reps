const { randomBytes } = require('crypto');
const filemanager = require('../upload-service/upload-service');
const { extname, join, basename ,  } = require('path');

class Registy {

    async getAllItems() {
        return this.#items;
    }

    async add(payload/* , filemanager */) {

        const { filename, contentType,  title, body } = payload;
    
        if (!body.length) {
            return;
        }

        if (!filename) {
            return;
        }

        const ext = extname(filename);
        
        if (ext.length <= 1) {

            return;
        }

        if (title.length) {

            const newFilename = title.toString() + ext;

            try {

                const { status: uploadStatus } = await filemanager.uploadFile(newFilename, body);
                
                const newId = randomBytes(32).toString("hex");
                const item = {
                    contentType,
                    originalFilename:filename,
                    filename:newFilename,
                }

                this.#items.set(newId , item);

                console.log({ uploadStatus });
                return;
            }
            catch (err) {

                console.log({err});

            }
            
        }
        
    }

    #items;

    constructor() {
        this.#items = new Map();
    }
}

const registry = new Registy ;

module.exports = registry ;