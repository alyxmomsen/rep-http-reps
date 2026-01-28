const { createWriteStream } = require('fs');
const { stat } = require('fs/promises');
const { join } = require('path');
const { Readable } = require('stream');

require('fs');

class UploadService {


    async uploadFile (filename , body) {


        try {

            const resolve = await new Promise((res ,rej) => {
    
                const readStream = Readable.from(body);
                const writeStream = createWriteStream(join(this.#rootDir , filename));
                readStream.pipe(writeStream);
    
                let size = 0 ;
                readStream.on("data"  , async (chunk) => {
                    size += chunk.length ;
                });
    
                readStream.on("end" , async () => {
                    
                    console.log('succesfully uploaded!!' + ` size: ${size} ${filename}`);
                    res(0); // succesfully uploaded
                    
                });
     
            }) ;
        
            return resolve ;
            
        }
        catch(e) {
            console.log({e});
            return 1 // smt wrong
        }
    }

    async checkIfExist (filenameString) {

        const errors = {
            'ENOENT': () => {
                console.log('\x1b[32mfile is note exist\x1b[0m'.toString());
            } ,
        }

        try {
            const stats = await stat(join(this.#rootDir , filenameString));
            // console.log({stats});
            
        }
        catch (e) {

            const handler = errors[e.code] ;

            if(handler) handler();

            if(e.code === 'ENOENT') {
                return 0 ; // file is note exist
            }

            console.log({});
        }

        return 1 ; // file is exist

    }

    #rootDir;

    constructor () {
        this.#rootDir = join('.' , 'uploads');
    }
}

const uploadService = new UploadService ;

module.exports = uploadService ;