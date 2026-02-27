const { IncomingMessage, ServerResponse } = require('http');
const { MultipartAssembler , MULTIPART_ASSEMBLER_CONSTANTS } = require('./services/assembler/assembler');
const { dataBaseControllerBehaviors } = require('../../../../../../database/model/behaviors');
const { DataBaseController } = require('../../../../../../database/controller/db-controller');

const CONSTANTS = {
    KEYS:{
        CONTENT_DISPOSITION:'content-disposition' ,
        CONTENT_TYPE:'content-type' ,
    }
}

const dbControllersCache = new Map();

/**
 * 
 * @param {IncomingMessage} req 
 * @param {ServerResponse} res 
 * @param {{ boundaryRawString:string }} payload 
 * @returns 
 */
async function handleMultipart(req , res , payload) {
    
    const { boundaryRawString } = payload ;

    if(!boundaryRawString) {
        return {
            error:{
                location:'handleMultipart fn' ,
                message:'no boundary raw string provided' ,
                subjects:{boundaryRawString} ,
            }
        }
    }

    console.log({boundaryRawString});

    const boundaryMatch = boundaryRawString.match(/boundary=(----[^\/;$\s]+)/);

    if(!boundaryMatch) {
        res.writeHead();
        res.end();
        return {
            error:{
                location:'handleMultipart fn' ,
                message:'no boundary' ,
                subjects:{boundaryRawString , boundaryMatch} ,
            } ,
        }
    }

    const requestFormDataChunks = [] ;
    let formDataSizeAccumulator = 0 ;
    req.on("data" , async (chunk) => {
        formDataSizeAccumulator += chunk.length ;
        // over size processing
        // ...
        // --------------------
        requestFormDataChunks.push(chunk);
    });

    req.on("end" , async () => {
        const multipartAssembler = new MultipartAssembler();
        const {PORTION_DATA_KEYS:{
            GROUP_ID,TABLE_NAME,COLUMN_NAME,COLUMN_VALUE,COLUMN_CONTENT_TYPE
        }} = MULTIPART_ASSEMBLER_CONSTANTS ;

        const formDataWholePermanentData = Buffer.concat(requestFormDataChunks);
        const parts = splitFormDataByBoundary(formDataWholePermanentData , Buffer.from(`--${boundaryMatch[1]}`));
        for (const part of parts) {
            try {
                const { body:bodyPartBuffer, headers:headersPartBuffer } = splitPart(part);
                const headers = parseHeaders(headersPartBuffer.toString('utf-8'));
                const contentDisposition = headers[CONSTANTS.KEYS.CONTENT_DISPOSITION] || null ;
                const contentType = headers[CONSTANTS.KEYS.CONTENT_TYPE] || null ;
                if (!contentDisposition) {
                    throw new Error(JSON.stringify({
                        location:'handleMultipart/on("end")' ,
                        message:'no content-disposition in form data part header' ,
                        subjects:{contentDisposition , contentType} ,
                    }))
                }
                const { name: nameAttr , filename: filenameAttr } = parseContentDisposition(contentDisposition);
                const { groupId , tableName , columnName } = parseNameAttr(nameAttr);
                // prepare data to the DataBase
                //the filename porvided case
                if(filenameAttr) {
                    multipartAssembler.pushOne({
                        [GROUP_ID]:groupId ,
                        [TABLE_NAME]:tableName ,
                        [COLUMN_NAME]:'filename' ,
                        [COLUMN_VALUE]:filenameAttr ,
                        [COLUMN_CONTENT_TYPE]:'text/plain' ,
                    });
                }
                // regular case
                multipartAssembler.pushOne({
                    [GROUP_ID]:groupId ,
                    [TABLE_NAME]:tableName ,
                    [COLUMN_NAME]:columnName ,
                    [COLUMN_VALUE]:bodyPartBuffer ,
                    [COLUMN_CONTENT_TYPE]:contentType ,
                });
            }
            catch (e) {
                console.log('\x1b[31m' ,{e:JSON.parse(e.message)} , '\x1b[0m');
            }
        }

        const assembledGroups = multipartAssembler.getAssembledByTablenameGroups();


        const dbresponse = [] ;
        for (const [tableName , tableRows] of Object.entries(assembledGroups)) {

            const dbControllerBehaviorStrategy = dataBaseControllerBehaviors.get(tableName);
            // const cached = dbControllersCache.get(dbControllerBehaviorStrategy);
            if(!dbControllerBehaviorStrategy) {
                console.log(`no strategy to < ${tableName} > table`);
                continue;
            }

            const dbController = new DataBaseController(dbControllerBehaviorStrategy);
            
            for (const row of tableRows) {
                const { success, error } = await dbController.createRow(tableName , row);
                if(error) {

                    continue ;
                }

                const { row:dbResponseRow } = success ;

                dbresponse.push(dbResponseRow);

            }
        }

        res.end(JSON.stringify({message:'' , boundaryRawString , boundaryMatch , dbresponse}));
    });

    return {
        success:{
            
        }
    } ;
}

module.exports = { handleMultipart } ;

/**
 * 
 * @param {string} nameAttr 
 */
function parseNameAttr (nameAttr) {
    const [ groupId , tableName , columnName ] = nameAttr.split('.');
    if(!groupId || !tableName || !columnName) {
        throw new Error(JSON.stringify({
            location:'handleMultipart/parseNameAttr' ,
            message:'incorrect a name attribute' ,
            subjects:{nameAttr} ,
        }));
    }
    return {
        groupId: groupId || null,
        tableName: tableName || null ,
        columnName: columnName || null ,
    }
}

/**
 * 
 * @param {string} contentDispositionString 
 */
function parseContentDisposition (contentDispositionString) {

    const nameMatch = contentDispositionString.match(/name="([^"]+)"/);
    const filenameMatch = contentDispositionString.match(/filename="([^"]+)"/);

    return {
        name: (nameMatch && nameMatch[1]) || null , 
        filename: (filenameMatch && filenameMatch[1]) || null ,
    }
}

/**
 * 
 * @param {string} formPartHeaders 
 * @returns 
 */
function parseHeaders (formPartHeaders) {

    const headers = {} ;

    const headersRows = formPartHeaders.split('\r\n');
    headersRows.forEach((row) => {
        const [key , value] = row.split(': ');
        if(key && value) {
            headers[key.toLocaleLowerCase()] = value ;
        }
    });

    return headers ;
}

/**
 * 
 * @param {Buffer<ArrayBuffer>} formDataPart 
 * @returns {{headers:Buffer<ArrayBuffer>;body:Buffer<ArrayBuffer>}}
 */
function splitPart (formDataPart) {

    const separatorBuffer = Buffer.from('\r\n\r\n');

    const separatorIndex = findSeparatorIndex(formDataPart , separatorBuffer);

    if(separatorIndex === -1) {
        throw new Error(JSON.stringify({
            location:'handleMultipart/splitPart',
            message:'incorrect form data part' , 
            subjects:{formDataPart}
        }));
    }

    const headers = formDataPart.subarray(0 , separatorIndex);

    let bodyBufferEndIndex = formDataPart.length ;

    if(formDataPart[bodyBufferEndIndex - 2] === 0x0d && formDataPart[bodyBufferEndIndex - 1] === 0x0a) {
        bodyBufferEndIndex -= 2 ;
    }

    const body = formDataPart.subarray(separatorIndex + separatorBuffer.length , bodyBufferEndIndex);

    return {
        headers ,
        body ,
    }
}

/**
 * 
 * @param {Buffer<ArrayBuffer>} formDataBuffer 
 * @param {Buffer<ArrayBuffer>} boundaryBuffer 
 * @returns {Buffer<ArrayBuffer>[]}
 */
function splitFormDataByBoundary (formDataBuffer , boundaryBuffer) {

    const parts = [] ;
    let start = 0 ;
    let index = 0 ;

    while ((index = findSeparatorIndex(formDataBuffer , boundaryBuffer , start)) !== -1) {
        const part = formDataBuffer.subarray(start , index);
        parts.push(part);
        start = index + boundaryBuffer.length ;
        if(formDataBuffer[start] === 0x0d && formDataBuffer[start + 1] === 0x0a) {
            start += 2 ;
        }
    }

    parts.push(formDataBuffer.subarray(start));

    return parts ;
}

/**
 * 
 * @param {Buffer<ArrayBuffer>} data 
 * @param {Buffer<ArrayBuffer>} separator 
 * @param {number} start 
 */
function findSeparatorIndex (data , separator  , start = 0) {

    for (let index = start ; index < data.length - separator.length; index++) {
        let found = true; 
        for (let j = 0 ; j < separator.length; j++) {
            if(data[index + j] !== separator[j]) {
                found = false ;
                break ;
            }
        }
        if(found === true) return index ;
    }

    return -1 ;
}
