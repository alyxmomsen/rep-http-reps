const { ResolveSuccessError } = require("../../../../../../../../utils/success-error-resolver/model/suc-err-res");
const { DBAdapter } = require("../../../../../../../database-adapter/models/db-adapter.model");
const { FileManager } = require("../../../../../../../filemanager.service.js/filemanager.service");

/**
 * 
 * @param {{
 *  resolveSuccesError:ResolveSuccessError;
 *  filemanager:FileManager;
 *  dbControllersRouter:Map<string,DBAdapter>
 * }} deps 
 * @returns 
*/
function ATypeActionFactory(deps = {}) {
    
    const resolveSuccessError = deps.resolveSuccesError;
    const filemanager = deps.filemanager;
    const dbControllersRouter = deps.dbControllersRouter;

    if (!resolveSuccessError || !filemanager) {
        throw new Error(`ResolveSuccessError & filemanager are required`);
    }

    
    resolveSuccessError.addSuccessResolver(async (success, next) => {
        console.log('ResolveSuccessError/onSuccess/mw1', { success, next });
        
        const { filename } = success;
    
        return await next(success);
    
    });
    
    resolveSuccessError.addSuccessResolver(async (payload, next) => {
        console.log('ResolveSuccessError/onSuccess/mw2', { payload, next });
        
        // return await next(success);
        return payload;
    
    });


    /**
     * 
     * "parentCallStack" structure:
     * [
     *     {
     *         
     *     
     *     }
     * 
     * ]
     * 
     * 
     * 
     * @description
     * regFn: this action`s caller (Mapper)
     * 
     * @param {{
     *  reqFn:(data:Object, parentCallStack:Object[], actions:Object) => Promise<any>;
     *  actionPayload:Object;
     *  callStack:{propDescriptionPath:string[];propKeyPath:string[]};
     *  actions:Object.<string,Function>;
     * }} payload 
     * @returns 
     */
    const fn = async (payload = {}) => {

        // console.log(`\x1b[33maction/AAction: `, { payload }, `\x1b[0m`);
        
        const { reqFn, actionPayload, callStack, actions } = payload;
        
        // console.log(`\x1b[33maction/AAction: `, {callStack:callStack.join('/')} , `\x1b[0m`);
    
        const branchResult = await reqFn(actionPayload, callStack, actions);

        /**
         * @type {string[]}
         */
        const propDescriptionPath = [];
        /**
         * @type {string[]}
         */
        const propKeyPath = [];

        callStack.forEach(elem => {
            const { propDescription, propKey } = elem;
            propDescriptionPath.push(propDescription);
            propKeyPath.push(propKey);
        });

        /**
         * handle route "tableName/groupId"
         * 
         */
        if (propDescriptionPath.join('/') === 'tableName/groupId') {
            
            console.log(`\x1b[33maction/BAction: `, { result: branchResult }, `\x1b[0m`);
            
            /**
             * @description 
             * обрабатываем полученные данные
             * 
             * originalFileName: { data: 'foo.txt', dataType: 'string' },
             * mime: { data: 'mime/foo', dataType: 'string' },
             * file: {
             *     data: <Buffer 31 32 33 2d 31 32 33 2d 31 32 33 2d 31 32 33>,
             *     dataType: 'buffer'
             * },
             * linkId: { data: '123-123-123-123', dataType: 'string' }
             * 
             * 
            */
            
            const { mime, linkId, file, originalFileName } = branchResult;
           
            if (!originalFileName || !mime || !file || !linkId) {
                throw new Error(`ATypeAction: required consistent data but not received`);
            }
            
            const filemanagerResult = await filemanager.write(file.data);

            const resolved = await resolveSuccessError.handle(filemanagerResult);

            console.log('\x1b[33m', { propKeyPath }, '\x1b[0m');
            
            /**
             * 
             * `the path structure`
             * 
             * - propkeyPath[0] - tableName
             * - propkeyPath[1] - groupId
             * 
             * @type {string}
             * 
             */
            const tableName = propKeyPath[0] // hardcode detected!! isn`t

            if (!tableName) {
                throw new Error(`ATypeAction: table name fetching error`);
            }
            
            /**
             * @type {DBAdapter}
            */
            const dbAdapter = dbControllersRouter.get(tableName);
           
            if (!dbAdapter) {
                throw new Error(`ATypeAction: dbAdapter fetching error`);
            }

            const dBDataSet = {

            }

            // 
            
            // console.log('ATypeAction/afterFileManager', { resolved }, { payload });

        }
    
        return branchResult;
    };

    return fn;

}

module.exports = { ATypeActionFactory  }