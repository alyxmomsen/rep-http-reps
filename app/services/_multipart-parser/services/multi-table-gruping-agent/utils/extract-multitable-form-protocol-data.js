/**
 * @description ожидает строку вида "058e.video-min.string"
 * и возвращает \<groupId\>\<tableName\>.\<columnName\>.\<dataType\>
 * @param {string} nameAttr
 * @returns {{
 *  groupId:string;
 *  tableId:string;
 *  columnName:string;
 *  dataType:string;
 * }}
 */
function multiTableProtocolParser(nameAttr) {
    // example
    // 058e.video-min.string

    const match = nameAttr.match(
        /([\d\w]{2})([\d\w]{2})\.([^\.]+)\.([^$;\s]+)/
    );

    if (!match) {
        throw new Error(`multitable protocol required but received anoter`);
    }

    const groupId = match[1];
    const tableId = match[2];
    const columnName = match[3];
    const dataType = match[4];

    return {
        groupId,
        tableId,
        columnName,
        dataType,
    };
}

module.exports = { multiTableProtocolParser };
