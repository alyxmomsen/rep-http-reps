/**
 *
 * @param {Object} deps
 * @param {(data:string) => ({groupId:string;tableId:string;columnName:string;dataType:string})} deps.ExtractMultiTableData
 * @returns {{groupId:string;tableId:string;columnName:string;dataType:string}}
 */
function MultiTableParser(deps = {}) {
    if (!deps.ExtractMultiTableData) {
        throw new Error(`deps.ExtractMultiTableData required`);
    }

    /**
     * @type {string} nameAttr
     */
    const fn = function (nameAttr) {
        //multitable://0025.title.string

        const match = nameAttr.match(/multitable:\/\/([^$]+)/);

        if (!match) {
            throw new Error(
                `MultiTableParser: multitable protocol is not detected`
            );
        }

        const ExtractedMultitableData = deps.ExtractMultiTableData(match[1]);

        return ExtractedMultitableData;
    };

    return fn;
}

module.exports = { MultiTableParser };
