const { randomBytes } = require("node:crypto");
const { createWriteStream } = require("node:fs");
const { readFile } = require("node:fs/promises");
const { join, resolve } = require("node:path");
const { Readable } = require("node:stream");

class FileManager {
    /**
     * 
     * @param {Buffer} data 
     * @returns {Promise<{status:number;success?:{filename:string};error?:{details:any}}>}
     */
    async write (data) {

        return await new Promise((res , rej) => {

            const fileNewname = randomBytes(32).toString('hex');
    
            const rs = Readable.from(data);
            const ws = createWriteStream(join(this.#uploadDir , fileNewname));
    
            rs.on('end' , () => {
                res({
                    status:0 ,
                    success:{
                        filename:fileNewname ,
                    }
                });
            });

            rs.on('error' , (e) => {
                rej({
                    status:1 ,
                    error:{
                        details:e ,
                    } ,
                });
            });

            rs.pipe(ws);

        });


    }

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
                    details:e ,
                } ,
            }
        }
    }

    async remove () {

    }

    #uploadDir;

    constructor () {
        this.#uploadDir = resolve(join('.' , 'uploads'));
    }
}

const filemanager = new FileManager() ;

module.exports = { filemanager } ;