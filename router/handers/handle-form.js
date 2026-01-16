const { createWriteStream } = require('fs');
const { join } = require('path');
async function handleForm(req ,res , storeAdapter) {
    
    const { headers } = req ;



    console.log('handle form');
    res.end('foobarbaz');
}



module.exports = handleForm ;