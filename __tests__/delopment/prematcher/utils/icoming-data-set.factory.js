module.exports = { defaultState };

/**
 * @typedef {Object} IncomingDataSet
 * @property {Buffer<ArrayBuffer>} body
 * @property {string} filename
 * @property {string} contentType 
 * @property {string} tableName 
 * @property {string} groupId 
 * @property {string} columnName 
 */


/**
 * 
 * @param {Object} data 
 * @param {Buffer<ArrayBuffer>} data.body 
 * @param {string} data.filename
 * @param {string} data.contentType 
 * @param {string} data.tableName 
 * @param {string} data.groupId 
 * @param {string} data.columnName 
 * @returns {(overrides:IncomingDataSet) => {
 *  body:Buffer<ArrayBuffer>;
 *  filename:string;
 *  contentType:string;
 *  tableName:string;
 *  groupId:string;
 *  columnName:string;
 * }}
 */
function defaultState (data) {

    /**
     * 
     * @param {Object} overrides 
     * @param {Buffer<ArrayBuffer>} overrides.body 
     * @param {string} overrides.filename
     * @param {string} overrides.contentType 
     * @param {string} overrides.tableName 
     * @param {string} overrides.groupId 
     * @param {Object} overrides.columnName 
     * @returns {}
     */
    return (overrides) => ({...data, ...overrides});
}

