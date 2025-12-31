const { readFile } = require('fs/promises');

async function loadresponsefile (path , fb) {

    try {
        
        const file = await readFile(path , 'utf-8');

        return file ;
    }
    catch (e) {
        
        fb();
        console.log(e);
        return null ;
    }

    
}

module.exports = loadresponsefile ;