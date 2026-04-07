const { randomBytes } = require("node:crypto");
const { createWriteStream, createReadStream } = require("node:fs");
const { readdir, stat, rm,  } = require("node:fs/promises");
const { resolve, join } = require("node:path");
const { Readable } = require("node:stream");

const CONSTANTS = {
    WRITE_SUCCESS_KEYS:{
        FILENAME:'filename' ,
    }
}

class FileManager {

    /**
     * 
     * @param {Buffer<ArrayBuffer>} fileData 
     * @returns {Promise<{
     *  success?:{filename:string}
     *  error?:{location:string;message:string;subjects:Object}
     * }>}
     */
    async write (fileData) {

        console.log('FileManager/write/argements: ', {fileData});

        return await new Promise((res , rej) => {

            const filename = randomBytes(32).toString("hex") ;

            const readStream = Readable.from(fileData);
            const writeStream = createWriteStream(join(this.#rootPath , filename));

            readStream.on("data" , () => {
                
            });

            readStream.on("end" , () => {
                console.log('Filemanager/on-end');
                res({
                    success:{
                        filename ,
                    }
                });
            });

            readStream.on("error" , (e) => {
                rej({
                    error:{
                        location:'FileManager::write' ,
                        message:'read stream error' ,
                        subjects:{error:e}
                    }
                });
            });

            writeStream.on("error" , (e) => {
                rej({
                    error:{
                        location:'FileManager::write' ,
                        message:'write stream error' ,
                        subjects:{error:e}
                    } ,
                });
            });

            readStream.pipe(writeStream)
        });
    }

    /**
     * 
     * @param {string} filname 
     * @returns {Promise<{
     *  success:{ReadStream}
     * }|{
     *  error:{location:string;message:string;subjects:Object}
     * }>}
     */
    async read (filname) {

        return await new Promise((res , rej) => {
            
            const readStream = createReadStream(join(this.#rootPath , filname));

            readStream.on("ready" , () => {
                console.log('ready');
                res({success:{
                    readStream,
                }});
            })

            readStream.on("error"  , (e) => {
                rej({
                    error:{
                        location:'FileManager::read' ,
                        message:'read stream error' ,
                        subjects:{error:e}
                    } ,
                });
            });

            readStream.on("data", () => {

            });

            
        });
    }

    async delete (filename) {

        const testFileFullPath = join(this.#rootPath, filename); 
        
        try {
            
            const fileStats = await stat(testFileFullPath);
            
            await rm(testFileFullPath);

            console.log(`FileManager/methods/delete: `, 'success');

        }
        catch (err) {



            console.log(`FileManager/errors/handled error: `, {err});
        }
        
        try {
            const checkedFileStat = await stat(testFileFullPath);
            
        }
        catch (err) {
            
            if(err?.code === 'ENOENT') {
                console.log(`file manager: file ${filename} successfully removed`);
                return;
            }

            console.log(`FileManager/check the removed file: `, {err});
        }


    }

    #rootPath;

    constructor () {
        this.#rootPath = resolve(join('.' , 'uploads')) ;
    }
}

// const filemanager = new FileManager () ;

module.exports = { CONSTANTS , FileManager } ;