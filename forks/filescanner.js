const { readFile, readdir, stat } = require('fs/promises');
const { join } = require('path');

process.on('message' , async (message) => {

    console.log('trueeeeee');
    
    if(message.type && message.type === "order") {
        
        
        const payload = message.payload;

        const ordername = payload.name ;
        const path = payload.path ;

        await launchScan(path);

    }

    console.log('message from father' , {message});
});

async function launchScan (path) {

    const store = {

        scanProcesses:[] ,
        depth:0 ,
    }

    try {

        const stats = stat(path);

        if((await stats).isDirectory() === false) {

            console.log('it is not directory');

            return;
        }

        await _readDir(path , store);

        store.scanProcesses.forEach(process => {
            process.files.forEach(file => {
                
                
                if(/\.mp3$/.test(file)) {
                    
                    console.log(file);
                }
            });
        });
    }
    catch (e) {

        return console.log(e);
    }
}

async function _readDir (path , store) {

    const scanProcess = {
        status:'in-process' ,
        files:[] ,
    }

    store.scanProcesses.push(scanProcess);
    store.depth += 1 ;

    console.log('scan dir: ' , path);
    
    try {

        const fileslike = await readdir(path);

        for (const filelike of fileslike) {
            
            const newPath = join(path , filelike);
    
            const stats = stat(newPath) ;

            if((await stats).isDirectory() === true) {

                
                await _readDir(newPath , store);
                continue ;
            }

            scanProcess.files.push(filelike);
            
        }
    }
    catch (e) {
        console.log('eeerrrorr:'  ,e);
        
    }

    scanProcess.status = 'done';
    store.depth -= 1 ;
    
}