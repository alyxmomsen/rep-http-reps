const { createWriteStream, Stats, createReadStream, read } = require('fs');
const { stat } = require('fs/promises');
const { createConnection } = require('net');
const { join } = require('path');
const { Readable } = require('stream');

class FileManager {

    async uploadFile(filename, bodyBuffer) {

        // console.log({ filename, body: bodyBuffer });
        
        const testFilePath = join(this.#uploadDir, filename);

        const { status } = await this.#checkIfFileExists(testFilePath);

        if (status) {

            return { status: 1, message: `file name already in use` };
        }

        const { status:uploadStatus , message:_message } = await this.#executeUpload(testFilePath, bodyBuffer);

        return { status: 0, message: `filename is probably uploaded` };
    };

    async #executeUpload(filePath, bodyBuffer) {
        
        return await new Promise((res , rej) => {

            const readstream = Readable.from(bodyBuffer);
            const writestream = createWriteStream(filePath);
    
            readstream.pipe(writestream);
    
            readstream.on('end', () => {
                res({status:0 , message:`file < ${filePath} > uploaded`});
            });
    
            readstream.on('error', () => {
                rej({status:1 , message:`file < ${filePath} > error`});
            });


        });
        

    }

    async #checkIfFileExists(filepath) {

        try {
            const stats = await stat(filepath);
            return {status:1 , message:`file < ${filepath} > is exists`};
        }
        catch (e) {

            return {status:0 ,message:`filename < ${filepath} > is vacantly`}
        }
        
    }

    #uploadDir;

    constructor(path) {

        this.#uploadDir = path; 
    }
}


const filemanager = new FileManager(join('.' , 'uploads')); 
module.exports = filemanager ;