const { multiTableProtocolParser } = require("../../../app/services/_multipart-parser/services/multi-table-gruping-agent/utils/extract-multitable-form-protocol-data");

describe('multiTableProtocolParser', () => {

    beforeEach(() => {
        
    });

    test('#1', () => {
        const result = multiTableProtocolParser('058e.video-min.string');
        expect(result).toEqual({
            "columnName": "video-min",
            "dataType": "string",
            "groupId": "05",
            "tableId": "8e"
        });
    });
});
