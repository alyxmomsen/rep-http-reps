const { createWriteStream } = require('fs');
const { stat } = require('fs/promises');
const { Readable } = require('stream');

class FSAdapter {

    async upload (filepath , body) {

        return await new Promise((res , rej) => {

            const rs = Readable.from(body);
            const ws = createWriteStream(filepath);
            rs.pipe(ws);

            rs.on('error' , (e) => {
                console.log({e});
                rej(1);
            });

            rs.on('end' , () => {

                console.log(`file ${filepath} succefully uploaded`);
                res(0);

            });
        });

    }

    async checkIfFileExist (filePath) {

        try {
            const stats = await stat(filePath);
            return 1 ;
        }
        catch (e) {
            console.log({e});
            return 0 ;
        }

    }

    constructor () {

    }
}

const fsadapter = new FSAdapter();

module.exports = fsadapter ;