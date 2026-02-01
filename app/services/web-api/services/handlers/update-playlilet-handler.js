const {} = require('fs');
const registry = require('../../../../../services/registry/registry');

async function updatePlaylist (req , res) {
    
    try {
        const files = await registry.getAllFilesArray();
        res.writeHead(200);
        res.end(JSON.stringify({payload:{files:files}}));
        return ;
    }
    catch (e) {
        console.log({e});
        res.writeHead(500);
        res.end();
    }
    
}

module.exports = updatePlaylist ;