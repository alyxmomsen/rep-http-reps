function ExtractMultiTableData(data) {
    const match = data.match(/^([\d\w]{2})([\d\w]{2})\.([\w\d]+)\.([\w\d]+)$/);

    if (!match) {
        throw new Error(
            `ExtractMultiTableData: incorrect multitable protocol data`
        );
    }

    const ExtractedMultitableData = {
        groupId: match[1],
        tableId: match[2],
        columnName: match[3],
        columnDataType: match[4],
    };

    return ExtractedMultitableData;
}

module.exports = { ExtractMultiTableData };
