const {
    LinksBuffer,
} = require('../../../app/services/_multipart-parser/utils/data-links-buffer/data-links-buffer.util');
const {
    dataSetProcessorFactory,
} = require('../../../app/services/_multipart-parser/utils/mapper/controller/data-set-mapper.controller');
const {
    DataSetProcessor,
} = require('../../../app/services/_multipart-parser/utils/mapper/model/data-set-processor.model');

describe('dataset processor', () => {
    /**
     * @type {DataSetProcessor}
     */
    let datasetProcessor;

    /**
     * @type {LinksBuffer}
     */
    let linksBuffer;

    beforeEach(() => {
        linksBuffer = {
            getAllLinks: jest.fn(),
            getLinkDataById: jest.fn(),
            push: jest.fn(),
        };

        datasetProcessor = new DataSetProcessor({
            linkBuffer: linksBuffer,
        });
    });

    test('1', () => {});
});
