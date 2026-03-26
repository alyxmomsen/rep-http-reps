const { dbControllersRouter } = require('../../../app/services/database-adapter/controller/db-adapter.controller');
const { DBAdapter } = require('../../../app/services/database-adapter/models/db-adapter.model');

require('http');


describe('data base', () => {


    /**
     * @type {DBAdapter}
     */
    let dbAdapter;

    beforeEach (() => {

        

    });


    test('', () => {

        // fileSystemFilename:{
        //     required:true,
        //     type:STRING,
        //     defaultValue:undefined,
        // },
        // originalFileName:{
        //     required:true,
        //     type:STRING,
        //     defaultValue:undefined,
        // },
        // mime:{
        //     required:true,
        //     type:STRING,
        //     defaultValue:undefined,
        // }

        dbAdapter = dbControllersRouter.get('files');

        expect(dbAdapter).toBeDefined();

        const {success, error} = dbAdapter.createOne({
            fileSystemFilename:'fs 123',
            originalFileName:'original 123',
            mime:'test/mime'
        });

        expect(success).toBeDefined();
        expect(success).toHaveProperty('row');
        expect(success['row']).toHaveProperty('mime');

        // dbAdapter.readOne();

        dbAdapter = dbControllersRouter.get('users');
        dbAdapter = dbControllersRouter.get('video-playlist');


    });

})