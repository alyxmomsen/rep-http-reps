

/**
 * 
 * @param {{
 *  groupId:string;
 *  tableName:string;
 *  filename:string;
 *  contentType:string;
 *  linkId:string;
 *  body:Buffer<ArrayBuffer>;
 * }} data 
 * @returns 
 */
function fileDataSetFactory (data = {}) {

    const groupId = data.groupId;
    const tableName = data.tableName;
    const filename = data.filename;
    const contentType = data.contentType;
    const linkId = data.linkId;
    const body = data.body;
    
    if(!groupId || !tableName || !filename || !contentType || !linkId || !body) {
        throw new Error(`file-data factory: incorrect data received`);
    }

    return {
        groupId, 
        tableName,
        originalFileName:{data:filename,dataType:'string'}, 
        mime:{data:contentType,dataType:'string'}, 
        linkId:{data:linkId, dataType:'link'},
        body,
    }
}

module.exports = {
    fileDataSetFactory,
}