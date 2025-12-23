const launchFileScanner = require("../filescanner");

class IPCFileScanner {

    constructor () {

        const scanner = launchFileScanner ;


        process.on('message' , async (message) => {

            if(message.type === 'order::parse-directory') {

                const path = message.payload?.path ;

                if(path) {

                    const data = await scanner(message.payload.path , {
                        files : {
                            mimes : [
                                'mp3' , 'wav'
                            ]
                        }
                    });
    
                    process.send({type:'order::response' , payload:data});
                }

            }
        });
    }
}

new IPCFileScanner();

module.exports = IPCFileScanner ;