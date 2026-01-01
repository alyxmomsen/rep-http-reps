const { readFile, readdir, stat } = require('fs/promises');
const { join } = require('path');

let isScanExecuting = null ;

process.on('message' , async (message) => {

    const {path , filter} = message ;

    console.log({path , filter});

    const result = await launchScan(path);

    const newArr = [] ;
    result.forEach(elem => elem.files.forEach(elem => {
        newArr.push(elem.filename);
    }));

    process.send({
        type:'data' , 
        // payload:['file 1' ,'file 2' , 'file 3'] ,
        payload:newArr ,
    });
    
});

async function launchScan (path , filter) {

    console.log('scanner getting launch');

    const regexFilter = new RegExp(`\.${filter}$`);

    const store = {

        scanProcesses:[] ,
        depth:0 ,
    }

    try {

        console.log('try try');

        const stats = stat(path);

        if((await stats).isDirectory() === false) {

            console.log('it is not directory');

            return;
        }

        console.log('readir launching');

        await _readDir(path , store);

        store.scanProcesses.forEach(process => {
            process.files.forEach(file => {
                


                if(regexFilter.test(file.filename)) {
                    
                    // console.log(file);
                }
            });
        });
    }
    catch (e) {
        console.log(e);
        return store.scanProcesses ;
    }

    return store.scanProcesses ;
}

async function _readDir (path , store) {

    console.log('scan dir: ' , path);
    const scanProcess = {
        status:'in-process' ,
        files:[] ,
    }
    
    store.scanProcesses.push(scanProcess);
    store.depth += 1 ;
    
    
    try {

        const fileslike = await readdir(path);

        for (const filelike of fileslike) {
            
            const newPath = join(path , filelike);
    
            const stats = stat(newPath) ;

            if((await stats).isDirectory() === true) {

                await _readDir(newPath , store);
                continue ;
            }

            scanProcess.files.push({
                filename:filelike ,
                path ,
            });

            // console.log(filelike);
        }
    }
    catch (e) {
        console.log('eeerrrorr:'  ,e);
        
    }

    scanProcess.status = 'done';
    store.depth -= 1 ;
    
}