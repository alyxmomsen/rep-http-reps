const { ResolveSuccessError } = require("../../../../../../../../utils/success-error-resolver/model/suc-err-res");
const { DBAdapter } = require("../../../../../../../database-adapter/models/db-adapter.model");
const { FileManager } = require("../../../../../../../filemanager.service.js/filemanager.service");
const { LinksBuffer } = require("../../../../../data-links-buffer/data-links-buffer.util");

/**
 * 
 * @param {{
 *  resolveSuccesError:ResolveSuccessError;
 *  filemanager:FileManager;
 *  dbControllersRouter:Map<string,DBAdapter>;
 *  linksBufferInstance:LinksBuffer;
 * }} deps 
 * @returns 
*/
function BranchActionFactory(deps = {}) {
    
    const resolveSuccessError = deps.resolveSuccesError || null;
    const filemanager = deps.filemanager || null;
    const dbControllersRouter = deps.dbControllersRouter || null;
    const linksBufferInstance = deps.linksBufferInstance || null;

    if(!dbControllersRouter) {

    }

    if(!linksBufferInstance) {
        throw new Error(`BranchActionFactory: LinksBuffer instance required`);
    }

    if (!resolveSuccessError || !filemanager) {
        throw new Error(`BranchActionFactory: ResolveSuccessError & filemanager are required`);
    }

    resolveSuccessError.addSuccessResolver(async (success, next) => {
        
        const { filename } = success;
    
        return await next(success);
    
    });
    
    resolveSuccessError.addSuccessResolver(async (payload, next) => {
        
        // return await next(success);
        return payload;
    
    });

    /**
     * 
     * @description
     * regFn: this action`s caller (Mapper)
     * callstack - содержит трассировку вызова рекурсивного коллера
     * 
     * @param {{
     *  reqFn:(data:Object, parentCallStack:Object[], actions:Object) => Promise<any>;
     *  actionPayload:Object;
     *  callStack:{propDescriptionPath:string[];propKeyPath:string[]};
     *  actions:Object.<string,Function>;
     * }} payload 
     * @returns 
     * @throws {Error} - branch action: incorrect payload data
     */
    const fn = async (payload = {}) => {

        // console.log(`\x1b[33maction/AAction: `, { payload }, `\x1b[0m`);
        
        const { reqFn, actionPayload, callStack } = payload;
        
        if(!reqFn || !actionPayload || !callStack) {
            console.log(`\x1b[33m`, payload , `\x1b[0m`);
            throw new Error(`branch action: incorrect payload data`);
        }
        
        // рекурсивно заходим дальше по ветке в сторону листьев
        // собираем данные 
        /**
         * @type {Object}
         */
        const branchResult = await reqFn(actionPayload, callStack);
    
        if(!branchResult) {
            throw new Error(`branch action: reqursive function returned falsy value`);
        }

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
            
            // console.log(`tablename/groupid:` , propKeyPath, branchResult);

            const tableName = propKeyPath[0];

            switch (tableName) {
                case 'files':
                    // console.log('\x1b[31m',`tableName: files`, branchResult, '\x1b[0m');

                    const originalFileName = branchResult.originalFileName;
                    const mime = branchResult.mime;
                    const file = branchResult.file;
                    const linkId = branchResult.linkId;

                    if(!originalFileName || !mime || !file || !linkId) {

                        throw new Error(`Branch action: reqursive caller must be return consistent data`);
                    }

                    const dbAdapter = dbControllersRouter.get(tableName);

                    const fmResult = await filemanager.write(file.data);

                    // console.log({fmResult});

                    const { filename } = fmResult.success;

                    const dbresponse = dbAdapter.createOne({
                        originalFileName, fileSystemFilename:filename, mime
                    });

                    /**
                     * success: {
                     *  newRowIdHash: '3cec970c907076f02e428d5f75ec66c12804fc484a16698c7edc4137d37e7f0d',
                     *  row: [Object]
                     * },
                     * error: {
                     *  // what
                     * }
                     * 
                     */
                    // console.log({dbresponse});

                    linksBufferInstance.push({
                        linkId:linkId.data,
                        rowId:dbresponse.success.newRowIdHash,
                        tableName:tableName,
                    });

                    break;
                case 'video-playlist': {

                    const dbDataSet = {} ;
    
                    for (const [propKey, propValue] of Object.entries(branchResult)) {
    
                        if(propValue.dataType === 'link') {
    
                            const result = linksBufferInstance.getLinkDataById(propValue.data);
    
                            if(!result) {
                                console.log(`\x1b[31mlinks buffer: no data by id ${propValue.data}\x1b[0m`);
                                throw new Error(`links buffer: no data by id ${propValue.data}`);
                            }
    
                            dbDataSet[propKey] = {
                                rowId:result.rowId,
                                tableName:result.tableName,
                            }
    
                            continue;
                        }
    
                        dbDataSet[propKey] = propValue.data instanceof Buffer ? propValue.data.toString('utf-8') : propValue.data;
                    }
    
                    console.log({dbDataSet});
    
                    const usersDBAdapter = dbControllersRouter.get('video-playlist');
    
                    usersDBAdapter.createOne(dbDataSet);
    
                    console.log('\x1b[31m',`tableName: users`, branchResult,'\x1b[0m');
                    break;
                }

                case 'users':

                    const dbDataSet = {} ;

                    for (const [propKey, propValue] of Object.entries(branchResult)) {

                        if(propValue.dataType === 'link') {

                            const result = linksBufferInstance.getLinkDataById(propValue.data);

                            if(!result) {
                                console.log(`\x1b[31mlinks buffer: no data by id ${propValue.data}\x1b[0m`);
                                throw new Error(`links buffer: no data by id ${propValue.data}`);
                            }

                            dbDataSet[propKey] = {
                                rowId:result.rowId,
                                tableName:result.tableName,
                            }

                            continue;
                        }

                        dbDataSet[propKey] = propValue.data instanceof Buffer ? propValue.data.toString('utf-8') : propValue.data;
                    }

                    console.log({dbDataSet});

                    const usersDBAdapter = dbControllersRouter.get('video-playlist');

                    usersDBAdapter.createOne(dbDataSet);

                    console.log('\x1b[31m',`tableName: users`, branchResult,'\x1b[0m');
                    break;

            }

        }
    
        return branchResult;
    };

    return fn;

}

module.exports = { BranchActionFactory: BranchActionFactory  }