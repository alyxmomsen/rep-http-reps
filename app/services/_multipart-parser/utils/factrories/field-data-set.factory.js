
function fieldDataSetFactory (data = {}) {

    const groupId = data.groupId;
    const tableName = data.tableName;
    const originalFileName = data.originalFileName;
    const mime = data.mime;
    
    if(!groupId || !tableName || !originalFileName || !mime) {
        throw new Error(`file-data factory: incorrect data received`);
    }

    return {
        groupId, tableName,
        originalFileName, mime,
    }
}

module.exports = {
    fieldDataSetFactory,
}