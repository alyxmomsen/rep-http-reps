const { randomBytes } = require('crypto');
const { createWriteStream } = require('fs');
const { stat, rm } = require('fs/promises');
const { resolve, join } = require('path');
const { Readable } = require('stream');
class FileManager {

    #uploadPath;

    async deleteFile (filePath) {



        const result = await rm(filePath);

    }

    async upload(buffer) {

        try {

            return await new Promise(async (res  , rej) => {
                const newFileName = randomBytes(32).toString('hex');
                const newFilePath = join(this.#uploadPath , newFileName);
    
                const rs = Readable.from(buffer);
        
                rs.on('end' , () => {
                    res({
                        status:0 ,
                        error:{} ,
                        success:{
                            message:'succefully' ,
                            payload:{
                                filename:newFileName ,
                            },
                        }
                    });
                });
        
                rs.on('error', (e) => {
                    rej({
                        status:1 ,
                        error:{
                            message:'readable stream error' ,
                            payload:e ,
                        } ,
                        success:{},
                    });
                });

                // const stats = await stat(newFilePath);
        
                const ws = createWriteStream(newFilePath);
                rs.pipe(ws);
            });
        }
        catch (e) {
            return e ;
        }

    }

    constructor () {
        this.#uploadPath = resolve(join('.' , 'uploads'));
    }
}

const filemanager = new FileManager() ;

module.exports = filemanager ;