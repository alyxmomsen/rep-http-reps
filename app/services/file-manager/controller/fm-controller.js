const { randomBytes } = require("node:crypto");
const { createWriteStream, createReadStream, ReadStream } = require("node:fs");
const { stat } = require("node:fs/promises");
const { join } = require("node:path");
const { Readable } = require("node:stream");

class FileManager {

    /**
     * 
     * @param {Buffer<ArrayBuffer>} data 
     * @returns {Promise<{error:Object}|{success:Object}>}
     */
    async write (data) {

        const newfilename = randomBytes(32).toString('hex');

        try {
            const path = join(this.#rootDir , newfilename);

            return await new Promise((res , rej) => {

                const rs = Readable.from(data);
                const ws = createWriteStream(path);
                rs.on('error' , (e) => {
                    rej({
                        error:{
                            subjects:{error:e} ,
                        }
                    });
                })
    
                rs.on('end' , () => {
                    res({
                        success:{
                            filename:newfilename ,
                        }
                    });
                });

                rs.pipe(ws);
            }) ;


        }
        catch (e) {
            return {
                error:{
                    location:'FileManager::write' ,
                    message:'internal filemanager error' ,
                    subjects:{path , error:e} ,
                }
            }
        }
    }

    /**
     * 
     * @param {string} filname 
     * @returns {{success:{stream:ReadStream}}|{error:{message:string;subjects:Object;location:string}}}
     */
    async read (filname) {

        try {

            const rs = createReadStream(join(this.#rootDir , filname));

            return {
                success:{
                    stream:rs ,
                }
            }
        }
        catch (e) {
            return {
                error:{
                    message:'error' ,
                    subjects:{error:e}
                }
            }
        }

        
    }

    #rootDir;

    constructor () {
        this.#rootDir = join('.' , 'uploads') ;
    }
}

const filemanager = new FileManager();

module.exports = { filemanager }