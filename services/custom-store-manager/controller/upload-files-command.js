const storageManager = require("../custom-storage-manager");

async function uploadFilesIntoStorage(params) {
    storageManager.add();
}

module.exports = uploadFilesIntoStorage ;