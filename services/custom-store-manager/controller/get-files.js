const storageManager = require("../custom-storage-manager");

async function getFilesFromStorage(params) {
    
    storageManager.get();
}

module.exports = getFilesFromStorage ;