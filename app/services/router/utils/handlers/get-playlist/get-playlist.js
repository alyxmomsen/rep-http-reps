const registry = require("../../../../../../services/registry/registry");

async function getPlaylist( req , res) {
    
    const videoFilesId = [];

    const items = await registry.getAllItems();
    
    console.log({items});

    for (const [key , value] of items.entries()) {
        console.log({ key, value });
        
        if (value.contentType === 'video/mp4') {
            videoFilesId.push(key);
        }
    }

    res.end(JSON.stringify({ playlist: videoFilesId }));
    
}

module.exports = getPlaylist;