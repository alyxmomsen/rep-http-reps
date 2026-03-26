

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
 * @param {{
 *  auto:boolean;
 * }} flags
 * @returns 
 */
function fileDataSetFactory (data = {} , flags = {}) {

    // если этот флаг установлен, то
    // no provided required values will be replaced with default 
    const auto = flags.auto || false;

    // replace with default if the flag "auto" is "true"
    const groupId = data.groupId || (auto && 'df') || null;
    const tableName = data.tableName || (auto && 'default-table') || null;
    const filename = data.filename || (auto && 'unnamed.default');
    const contentType = data.contentType || (auto && 'unknown/default') || null;
    const linkId = data.linkId || (auto && 'default123') || null;
    const body = data.body || (auto && 'default-body') || null;
    
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