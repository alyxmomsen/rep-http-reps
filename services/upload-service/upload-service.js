const { createWriteStream, Stats, createReadStream, read } = require('fs');
const { stat } = require('fs/promises');
const { createConnection } = require('net');
const { join } = require('path');
const { Readable } = require('stream');

class FileManager {

    async uploadFile(filename, body) {

        return await  new Promise(async (res, rej) => {
            
            const testPath = join(this.#uploadDir, filename);
            const fileexiststatus = await this.#checkIfFileExists(testPath);

            if (fileexiststatus) {

                rej({status:1 , message:`file < ${filename} > is the same`});
                return;
            }
            
            const readstr = Readable.from(body);
            const writestr = createWriteStream(testPath);
            readstr.pipe(writestr);
            res({ status:0 , message:`file ${filename} uploaded`});
        });

        
    };

    async #checkIfFileExists(filepathLike) {

        try {
            const stats = await stat(filepathLike);

            return 1;
        }
        catch (err) {
            
            return 0;
        }
    }

    #uploadDir;

    constructor(path) {

        this.#uploadDir = path; 
    }
}


const filemanager = new FileManager(join('.' , 'uploads')); 
module.exports = filemanager ;