
/**
 * 
 * @param {{
 *  groupId:string;
 *  tableName:string;
 *  columnName:string;
 *  dataType:string;
 *  body:Buffer<ArrayBuffer>;
 * }} data 
 * @returns {{
 *  groupId:string;
 *  tableName:string;
 *  columnName:string;
 *  dataType:string;
 *  body:Buffer<ArrayBuffer>;
 * }}
 */
function regularFieldDataSetFactory (data = {}) {

    const groupId = data.groupId;
    const tableName = data.tableName;
    const columnName = data.columnName;
    const dataType = data.dataType;
    const body = data.body;
    
    if(!groupId || !tableName || !columnName || !dataType || !body) {
        throw new Error(`file-data factory: incorrect data received`);
    }

    return {
        groupId, tableName,
        columnName, dataType,
        body,
    }
}

module.exports = {
    regularFieldDataSetFactory,
}