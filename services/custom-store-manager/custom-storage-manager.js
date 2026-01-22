const { createReadStream, createWriteStream } = require('fs');
const { join } = require('path');
const { Readable } = require('stream');

require('fs');
class CustomStorageManager {

    add() {

    }

    upload(payload) {
        console.log('upload data: ' , {...payload});

        const {meta , filename , contentType , body} = payload ;

        const { ext:filenameExt , body:filenameBody} = this.#splitFilename(filename);

        const {title , description} = this.#parseMetaData(meta);
        
        console.log({title , description , filenameExt , filenameBody});


        if(filenameExt , title.length) {

            const filename = `${title.toString('utf-8').replace(/\s/g , '')}.${filenameExt}` ;

            this.#executeUpload(filename , body);

            return ;
        }


    }

    #executeUpload (filename , data) {

        const uploadPath = join('.' , this.#uploadPath , filename) ;

        console.log({filename , data});
;
        const readstream = Readable.from(data);
        const writestream = createWriteStream(uploadPath);
        readstream.pipe(writestream);
    }

    #parseMetaData (metaData) {
        if(!metaData) return null;

        const {title , description} = metaData ;

        return {
            title , 
            description ,
        }
    }

    #splitFilename (filename) {

        const extmatch = filename.match(/\.([\d\w]+)$/);

        const ext = extmatch ? extmatch[1] : null ; 
        const [body] = filename.split(/\.([\d\w]+)$/)
        // const [body , ext] = filename.split('.');

        return {
            body:body || null , 
            ext ,
        }
    }

    get() {

    }

    init() {

    }

    #uploadPath ;

    constructor ({uploadPath}) {
        console.log('call the constructor of the storage manager' , uploadPath);
        this.#uploadPath = uploadPath ;
    }
}

const storageManager = new CustomStorageManager({uploadPath:join('.' , 'upload-data')});

module.exports = storageManager;

