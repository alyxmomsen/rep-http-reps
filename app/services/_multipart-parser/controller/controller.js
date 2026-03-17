const { randomBytes } = require("node:crypto");
const { dbControllersRouter } = require("../../database-adapter/controller/db-adapter.controller");
const { dbControllerFactory } = require("../../database/controller/dbcontroller");
const { filemanager } = require("../../filemanager.service.js/filemanager.service");
const { MultipartFormdataHandler } = require("../models/multi-part-parser.model");
const { MultiTableGrouppingAgent } = require("../services/multi-table-gruping-agent/multi-table-gruping-agent");
const { extractProtocolName } = require("../services/name-attribute-parser/utlils/extract-protocol-name");
const { onDataEndMiddleware } = require("../models/on-data-end.middleware/on-data-end.mw");

const multipartFormHandler = new MultipartFormdataHandler();

const multiTableAgent = new MultiTableGrouppingAgent();

multipartFormHandler.addEventListener('dataPartParsed' , (payload) => {
    console.log(`\x1b[33mon form data part parsed\x1b[0m`, {payload});
});

// multipartFormHandler.onDataEndListeners(onDataEndMiddleware);

multipartFormHandler.onDataEndListeners(async (payload, next) => {



    const addedData = [];

    const compiledGroups = multiTableAgent.__getGroups();

    console.log({compiledGroups});

    return {success:compiledGroups}

    for (const [tableName, groups] of Object.entries(compiledGroups)) {
        console.log(`\x1b[38;2;255;128;255mtable name: ${tableName}\x1b[0m`, );
        for (const [groupId , columns] of Object.entries(groups)) {
            console.log(`\x1b[38;2;128;255;255mgroup id: : ${groupId}\x1b[0m`, );
            for (const [columnName, colData] of Object.entries(columns)) {
                console.log(`\x1b[38;2;0;255;128mcolumn name: ${columnName}\x1b[0m`);

                const { fileName , fileMIME, fileBody } = colData;

                const dbConrollerModelName = tableName;
                const dbAdapter = dbControllersRouter.get(dbConrollerModelName);

                if(fileName || fileMIME) {
                    console.log(fileName, fileBody);
                    try {
                        const { error, success } = await filemanager.write(fileBody);
                        if(error) {
                            throw new Error(`fmanager error`);
                        }

                        const { filename } = success;

                        const id = randomBytes(32).toString('hex');

                        const {error:dbAdapterError, success:dbAdapterSuccess} = dbAdapter.createOne({
                            fileSystemFilename:filename,
                            originalFileName:fileName,
                            mime:fileMIME,
                        });

                        if(dbAdapterError) {
                            
                        }

                        addedData.push({
                            id:dbAdapterSuccess.newRowIdHash,
                        });

                        console.log('data base adapter result', {dbAdapterSuccess, dbAdapterError});

                        
                    }
                    catch (e) {
                        console.log(`\x1b[38;2;255;64;0m` + 'mwrong table name'.toUpperCase() + `\x1b[0m`);
                        
                    }
                }
            }
        }
    }

    return await next({success:{addedData}})
});

multipartFormHandler.useMiddleware(async (payload, next) => {

    const {body, contentType, filename, name} = payload.data || {};

    const {protocolName, data:nameAttrValue} = extractProtocolName(name);

    console.log({protocolName, nameAttrValue, name});

    if(protocolName !== 'multitable') {
        return 'hello world';
    }

    return await next({body, contentType, filename, nameAttrValue});
});

multipartFormHandler.useMiddleware(async (payload, next) => {

    const {body, contentType, filename, nameAttrValue:name} = payload;

    multiTableAgent.handleFormDataPartParsedData({body, contentType, filename, name});

    return await next({});
});

module.exports = { multipartFormHandler }

