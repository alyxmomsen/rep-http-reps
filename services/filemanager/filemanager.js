const { createWriteStream } = require('fs');
const { stat } = require('fs/promises');
const { join } = require('path');
const { Readable } = require('stream');
class FileManager {

    async upload (filename , bodyBuffer) {

        const filepath = join(this.#uploadsRootDir , filename) ;

        try {
            const executeUploadStatus = await this.#executeUpload(filepath , bodyBuffer);

            console.log(`execute upload result: ` , {executeUploadStatus});
        }
        catch (e) {
            console.log('upload error: ' , {e});
        }
    }

    async checkIfFileExist (filename) {

        const fileTestPath = join(this.#uploadsRootDir , filename) ;

        try {
            const stats = await stat(fileTestPath);
            return 1 ;
        }
        catch (e) {
            return 0; 
        }

    }

    async #executeUpload (filepath , bodyBuffer) {

        console.log({filepath  ,bodyBuffer});

        return await new Promise((res , rej) => {

            const rstream = Readable.from(bodyBuffer);
            const wstream = createWriteStream(filepath);

            rstream.on('error' , () => {
                rej(1);
            });

            rstream.on('end' , () => {
                res(0);
            });
            
            rstream.pipe(wstream);
        });
    }

    #uploadsRootDir;

    constructor () {
        this.#uploadsRootDir = join('.' , 'uploads');
    }
}

const filemanager = new FileManager ();

module.exports = filemanager ;