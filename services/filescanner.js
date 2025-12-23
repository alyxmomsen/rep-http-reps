
const {stat, Stats, readdir} = require("fs");
const { join } = require("path");

// const path = join('D:' , 'Documents') ;

// launchFileScanner(path , {
//     files : {
//         mimes : [
//             'mp3' , 'wav'
//         ]
//     }
// });

async function launchFileScanner (path , config = undefined) {

    const result = (await parseDirectory(path , config));


    if(!result) {
        return null ;
    }

    return result ;

}

module.exports = launchFileScanner;

async function parseDirectory (path , config = undefined) {

    const filesPool = {
        files:[] ,
        mp3:0 ,
        wav:0 ,
    } ;

    const stats = await getStats(path);

    if(stats instanceof Stats === false) {

        console.log(500);

        return null ;
    }

    if(stats.isDirectory() === true) {

        console.log(`parse directory : ${path}`);

        const files = await readDirUtil(path);

        if(files === null) {

            console.log('error');

            return ;
        }

        for (const file of files) {

            const stats = await getStats(join(path , file));

            if(stats === null) continue ;

            if(stats.isDirectory() === true) {

                const nestedFilesPool = await parseDirectory(join(path , file) , config) ;

                nestedFilesPool.files.forEach(elem => {

                    filesPool.files.push(elem)
                });

                filesPool.mp3 += nestedFilesPool.mp3 ;
                filesPool.wav += nestedFilesPool.wav ;

                
                // console.log(filesPool.mp3 , filesPool.wav);

                continue ;

            }

            
            if(/\.mp3$/.test(file)) {
                filesPool.files.push(file);
                filesPool.mp3++;
            }
            else if (/\.wav$/.test(file)) {
            
                filesPool.files.push(file);
                filesPool.wav++;
                
            }            
        }
        
        
    }
    

    // console.log(filesPool);
    return filesPool ;
}

async function readDirUtil (path) {

    try {

        const files = await new Promise ((res , rej) => {

            readdir(path , (e , files) => {
                if(e) rej(e);
                res(files);
            });
        });

        return files ;
    }
    catch (e) {

        return null ;
    }
}

async function getStats (path) {

    try {

        const stats = await new Promise((res , rej) => {
    
            stat(path  , (e , stats) => {
    
                if(e) rej(e);
                res(stats);
            });
    
        });

        return stats ;
    }
    catch(e) {

        console.log('error: ' , e);
        return null;
    }
}


