const { randomBytes } = require("node:crypto");
const { createWriteStream, stat } = require("node:fs");
const { resolve, join } = require("node:path");
const { Readable } = require("node:stream");


class FSAdapter {

    #uploadDir;

    async upload (fileDataBuffer) {

        try {

            return await new Promise((res , rej) => {
    
                const randomname = randomBytes(32).toString('hex');
        
                const uploadPath = join(this.#uploadDir , randomname);

                const rs = Readable.from(fileDataBuffer);
                const ws = createWriteStream(uploadPath);
                
                rs.pipe(ws);
        
                rs.on('end' , () => {
                    res({
                        status:0,
                        message:'uploaded successfully' ,
                        uploadPath
                    });
                });
        
                rs.on('error' , () => {
                    rej({
                        status:1,
                        message:'smth wrong' ,
                        uploadPath:null ,
                    });
                });
            });

        }
        catch(e) {
            console.log({e});
            return {
                status:3 ,
                message:e ,
                uploadPath:null ,
            } ;
        }
    }

    constructor () {
        this.#uploadDir = resolve(join('.' , 'uploads'));
    }
}

const fsadapter = new FSAdapter ;

module.exports = fsadapter ;