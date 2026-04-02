const { randomBytes } = require("pg/lib/crypto/utils-legacy");
const { dataMapperFactory } = require("../../../app/services/_multipart-parser/services/data-mapper/v2/controller/data-mapper.controller");
const { DataMapper } = require("../../../app/services/_multipart-parser/services/data-mapper/v2/model/data-mapper.v2.model");
const { FILE_DATA_SET_SCHEMA, LINKED_FIELD_DATA_SET_SCHEMA, REGULAR_FIELD_DATA_SET } = require("../../../app/services/_multipart-parser/services/data-mapper/v2/model/schemas/dm.schema");
const { dataSetProcessorFactory } = require("../../../app/services/_multipart-parser/utils/mapper/controller/data-set-mapper.controller");
const { DataSetProcessor } = require("../../../app/services/_multipart-parser/utils/mapper/model/data-set-processor.model");
const { dataBase } = require("../../../app/services/database/controller/db.controller");


describe('data mapper v2' , () => {

    /**
     * @type {DataMapper}
     */
    let dataMapper;

    /**
     * @type {DataSetProcessor}
     */
    let dataSetProccessor;

    const Schema = {
        'File':FILE_DATA_SET_SCHEMA,
        'LinkedField':LINKED_FIELD_DATA_SET_SCHEMA,
        'RegularField':REGULAR_FIELD_DATA_SET,
    }

    /**
     * @type {Function}
     */
    let dataSetMaker;

    beforeEach(() => {

        dataMapper = dataMapperFactory();
        dataSetProccessor = dataSetProcessorFactory();

        dataSetMaker = setDefault({
            body:Buffer.from(`123-123-123-123`),
            tableName:'users',
            groupId:'01',
            columnName:'title',
            contentType: 'image/png',
            dataType:'string',
            filename:'some.name.png',
            linkId:'123-123-123-123'
        });
        
    });

    test('should smth' , async () => {

        const arr = [{
            file:{
                
            }
        }];


        /**
         * 
         * @param {Object} overrides 
         */
        const fn = (overrides={}) => {

            let context = {};
    
            const linkId = 'link-id-' + Date.now();
    
            /**
             * @type {import("../../../app/services/_multipart-parser/services/data-mapper/v2/model/data-mapper.v2.model").DataMapperIncommingDataSet}
             */
            const modFile = {
                linkId:linkId,
                groupId: randomBytes(32).toString('hex'),
                tableName: 'files',
            }
            
            /**
             * @type {import("../../../app/services/_multipart-parser/services/data-mapper/v2/model/data-mapper.v2.model").DataMapperIncommingDataSet}
             */
            const modLinkedField  = {
                body:linkId,
                tableName:'video-playlist',
                columnName:'video',
            }
    
            const fileDataSet = dataSetMaker({...modFile});
            const linkedFieldDataSet = dataSetMaker({...modLinkedField});
    
            /**
             * merge first time
             */
            context  = dataMapper.process(Schema.File, fileDataSet, context);
            /**
             * merge second time
             */
            context  = dataMapper.process(Schema.LinkedField, linkedFieldDataSet, context);
    
            /**
             * merge third time (regular data)
             */
            context  = dataMapper.process(Schema.RegularField, dataSetMaker({
                columnName:'description',
                tableName:'video-playlist',
                body:Buffer.from(`my description`),
            }), context);
            /**
             * merge third time (regular data)
             */
            context  = dataMapper.process(Schema.RegularField, dataSetMaker({
                columnName:'title',
                tableName:'video-playlist',
                body:Buffer.from(`my title`),
            }), context);
        }


        console.dir({context}, {
            depth:20,
        });

        await dataSetProcessorFactory().process(context, []);
        
        const videoPlaylistData = dataBase.readAll('video-playlist');
        const filessdbdata = dataBase.readAll('files');

        console.dir({
            videoPlaylistData,
            filessdbdata,
        }, {depth:20});

    }) ;
});




/**
 * @param {import("../../../app/services/_multipart-parser/services/data-mapper/v2/model/data-mapper.v2.model").DataMapperIncommingDataSet} [data={}] 
 * @returns {import("../../../app/services/_multipart-parser/services/data-mapper/v2/model/data-mapper.v2.model").DataMapperIncommingDataSet}
 */
function dataSetMaker (data = {}) {

    return {
        ...data
    }
}
/**
 * 
 * @param {import("../../../app/services/_multipart-parser/services/data-mapper/v2/model/data-mapper.v2.model").DataMapperIncommingDataSet} defaultDataSet 
 * @returns {(overrides:import("../../../app/services/_multipart-parser/services/data-mapper/v2/model/data-mapper.v2.model").DataMapperIncommingDataSet) => {}}
 */
function setDefault (defaultDataSet = {}) {
    /**
     * @param {import("../../../app/services/_multipart-parser/services/data-mapper/v2/model/data-mapper.v2.model").DataMapperIncommingDataSet} overrides
     */
    const fn =  (overrides = {}) => dataSetMaker({
        ...defaultDataSet,
        ...overrides,
    });
    
    return fn;
}