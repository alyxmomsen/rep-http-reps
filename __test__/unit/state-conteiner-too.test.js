const { DBAdapter, ValidatiionSchemas } = require("../../services/db-adapter/db-adapter.model");
const { FileManager } = require("../../services/file-manager/model/f-manager.model");
const { InMemoryDataBase } = require("../../services/in-memory-db/model/db.model");
const { LeafTryBehavior, LeafRollbackBehavior } = require("../../services/utit-of-work/v2/behaviors/leaf.behavior");
const { SecondTryBehavior, SecondRollbackBehavior } = require("../../services/utit-of-work/v2/behaviors/second.behavior");
const { MainTry, MainRollback } = require("../../services/utit-of-work/v2/behaviors/statecontroller.behavior");
const { StateControllerFactoryToo } = require("../../services/utit-of-work/v2/controller/statecontroller.controller");
const { StateControllerToo } = require("../../services/utit-of-work/v2/model/statecontroller.model");

describe ('state-container-too', () => {

    /**
     * @type {StateControllerToo}
     */
    let stateControllerToo;

    /**
     * @type {InMemoryDataBase}
     */
    let db;

    /**
     * @type {Map<string,StateControllerToo>}
     */
    let globalStateControllersPool;

    beforeEach (() => {

        db = new InMemoryDataBase();

        globalStateControllersPool = new Map();

        stateControllerToo = new StateControllerFactoryToo({
            tryBehavior:new MainTry({
                dBAdapter:new DBAdapter({
                    DataBase:db,
                    ValidationSchemas:ValidatiionSchemas,
                }),
                fileManager:new FileManager({
                    rootDir:'./uploads',
                }),
                globalStateControllersPool: globalStateControllersPool,
                stateControllerFactory:new StateControllerFactoryToo({
                    tryBehavior: new SecondTryBehavior({
                        globalStateControllersPool: globalStateControllersPool,
                        stateControllerFactory: new StateControllerFactoryToo({
                            tryBehavior: new LeafTryBehavior({
                                dBAdapter:new DBAdapter({
                                    DataBase:db,
                                    ValidationSchemas:ValidatiionSchemas,
                                }),
                                fileManager:new FileManager({
                                    rootDir:'./uploads',
                                }),
                                globalStateControllersPool:globalStateControllersPool,
                            }),
                            rollbackBehavior: new LeafRollbackBehavior(),
                        }),
                    }),
                    rollbackBehavior: new SecondRollbackBehavior(),

                })
            }),
            rollbackBehavior:new MainRollback({}),
        }).Instance();
    });

    test ('main', async () => {

        await stateControllerToo.try();

        const State = {
            data:stateControllerToo.getData(),
            status:stateControllerToo.getStatus(),
        }

        console.log({State});

        expect(1).toBe(1)
    });

})