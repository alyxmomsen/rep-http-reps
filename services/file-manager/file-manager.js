const { randomBytes } = require("node:crypto");
const { createWriteStream } = require("node:fs");
const { readFile } = require("node:fs/promises");
const { join, resolve } = require("node:path");
const { Readable } = require("node:stream");

class FileManager {
    /**
     * 
     * @param {Buffer<ArrayBuffer>} data 
     * @returns {Promise<{success:{filename:string}}|{error:{location:string;message:string;subjects:Object}}>}
     */
    async write (data) {

        return await new Promise((res , rej) => {

            const fileNewname = randomBytes(32).toString('hex');
    
            const rs = Readable.from(data);
            const ws = createWriteStream(join(this.#uploadDir , fileNewname));
    
            rs.on('end' , () => {
                res({
                    success:{
                        filename:fileNewname ,
                    }
                });
            });

            rs.on('error' , (e) => {
                rej({
                    error:{
                        location:'FileManager::write' ,
                        message:'fail during writing' ,
                        subjects:{
                            native:e ,
                            location:'FileManager::write' ,
                        }
                    } ,
                });
            });

            rs.pipe(ws);

        });


    }

    /**
     * 
     * @param {string} filename 
     * @returns {Promise<{success:{filename:string}}|{error:{location:string;message:string;subjects:Object}}>}
     */
    async read (filename) {
        try {
            const file = await readFile(join(this.#uploadDir , filename));
            return {
                success: {
                    file ,
                } ,
            }
        }
        catch (e) {
            return {
                error:{
                    message:'read file error' ,
                    location:'FileManager::read' ,
                    details:e ,
                } ,
            }
        }
    }

    async remove () {
        return {
            
        }
    }

    #uploadDir;

    constructor () {
        this.#uploadDir = resolve(join('.' , 'uploads'));
    }
}

const filemanager = new FileManager() ;

module.exports = { filemanager } ;