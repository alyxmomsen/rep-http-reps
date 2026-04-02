const { LinksBuffer } = require("../../../../app/services/_multipart-parser/utils/data-links-buffer/data-links-buffer.util");
const { BranchActionFactory } = require("../../../../app/services/_multipart-parser/utils/mapper/model/actions/branch-action/model/branch-action.model");
const { DBAdapter } = require("../../../../app/services/database-adapter/models/db-adapter.model");
const { FileManager } = require("../../../../app/services/filemanager.service.js/filemanager.service");
const { ResolveSuccessError } = require("../../../../app/utils/success-error-resolver/model/suc-err-res");

describe('branch action' , () => {

    /**
     * expect fields:
     * 
     * { reqFn, actionPayload, callStack, actions }
     * 
     * 
     */

    /**
     * @type {(payload:any) => Promise<any>}
     */
    let branchAction;

    /**
     * @type {LinksBuffer}
     */
    let linksBufferInstance;

    /**
     * @type {ResolveSuccessError}
     */
    let resolveSuccessError;

    /**
     * @type {FileManager}
     */
    let filemanager;

    /**
     * @type {Map<string,DBAdapter>}
     */
    let dbControllersRouter;

    let reqursiveMapper;
    let actionLeafPayload;
    let actions;
    /**
     * @type {Object[]}
     */
    let callStack;

    beforeEach(() => {

        resolveSuccessError = {
            addErrorResolver: jest.fn(),
            addNoSuccessResolver: jest.fn(),
            addSuccessResolver: jest.fn(),
            handle: jest.fn(),
        }

        linksBufferInstance = {
            push: jest.fn(),
            getAllLinks: jest.fn(),
            getLinkDataById: jest.fn(),
        }

        filemanager = {
            read:null,
            write:null,
        }

        dbControllersRouter = new Map();
        dbControllersRouter.set('files' , jest.fn());
        dbControllersRouter.set('video-playlist' , jest.fn());

        branchAction = BranchActionFactory({
            dbControllersRouter:dbControllersRouter,
            filemanager:filemanager,
            linksBufferInstance:linksBufferInstance,
            resolveSuccesError:resolveSuccessError,
        });

        reqursiveMapper = jest.fn();

        actionLeafPayload = {
            title: [
                'leaf', {
                    meta:{title:'title', value: {
                        data:'my title',
                        dataType:'string',
                    }},
                },
            ],
            description: [
                'leaf', {
                    meta:{title:'description', value: {
                        data:'my description',
                        dataType:'string',
                    }},
                },
            ],
        };

        actions = {};

        callStack = [{ propDescription:'tableName', propKey:'files'}, { propDescription:'groupId', propKey:'00'}]

    });

    test('shold throw error if received incorrect action payload', async () => {

        expect(async () => {
            await branchAction({ /* reqFn:reqursiveMapper, */ actionPayload: actionLeafPayload, callStack:callStack, actions:actions});
        }).rejects.toThrow(`branch action: incorrect payload data`);

    }) ;

    test('2', async () => {
        
        
        // expect(reqursiveMapper).toHaveBeenCalled();
        // expect(reqursiveMapper).toHaveBeenCalledTimes(1);
        expect(async () => {
            await branchAction({ reqFn:reqursiveMapper, actionPayload: actionLeafPayload, callStack:callStack, actions:actions});
        }).rejects.toThrow('branch action: reqursive function returned falsy value');

    }) ;
});