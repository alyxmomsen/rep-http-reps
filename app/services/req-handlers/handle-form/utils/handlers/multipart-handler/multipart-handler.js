
const { IncomingMessage, ServerResponse } = require("node:http");
const { loggerFactory } = require("../../../../../../../utils/logger");
const GroupAssembler = require("./services/assemble-groups/assemble-groups");
const { DBControllerFactory } = require("../../../../../../../services/database/controller/dbcontr");

const log = loggerFactory('handle multipart data' , '-u');
/**
 * 
 * @param {IncomingMessage} req 
 * @param {ServerResponse} res 
 * @param {any} param2 
 */
async function handleMultipartData (req , res , payload) {
   
    const { boundaryRawStr } = payload ;

    const FILEMAXSIZE = 1024 * 1024 * 100 // 100 Mb

    if(!boundaryRawStr) {
        throw new Error(`no boundary header string`) ;
    }

    const boundaryHeaderMatch = boundaryRawStr.match(/boundary=(----[^\/]+)/);

    if(!boundaryHeaderMatch) {
        throw new Error(`no boundary provided`);
    }

    const formdataBufferChunks = [] ;
    let formDataChunkCapacity = 0 ;
    req.on("data"  , async (chunk) => {

        formDataChunkCapacity += chunk.length ;
        formdataBufferChunks.push(chunk);
    })

    req.on("end" , async () => {
        const groupAssembler = new GroupAssembler();
        console.log(`form data capacity ${formDataChunkCapacity}`);
        const wholeFormDataBuffer = Buffer.concat(formdataBufferChunks);

        const parts = splitFormDataBuffer(wholeFormDataBuffer , Buffer.from(`--${boundaryHeaderMatch[1]}`));
        for (const part of parts) {
            try {
                const { body:bodyPart , headers:headersPart } = splitFormDataBufferPart(part);
                const headers = parseHeaders(headersPart.toString('utf-8'));
                const contentDisposition = headers['content-disposition'] || null;
                const fileContentType = headers['content-type'] || null;
                if(!contentDisposition) {
                    throw new Error(`no content-disposition in formdata-part header segment`);
                }
                const { filename: fileName , name:nameAttr } = parseContentDisposition(contentDisposition);
                const { groupId , tableName , colName } = parseNameAttr(nameAttr);

                // grouping
                if(fileName) {
                    groupAssembler.gulpOneceColumnData({
                        groupId , tableName , colName:'filename' , 
                        colValue:fileName , colContentType:'text/plain' ,
                    });
                }
                
                groupAssembler.gulpOneceColumnData({
                    groupId , tableName , colName , colValue:bodyPart , colContentType:fileContentType
                });
                // --------
            }
            catch (e) {
                console.log({e});
            }
        }
        
        const groupsByTableName = groupAssembler.getRowsGroupedByTableName();

        const added = [] ;
        for (const [ tablename , rows ] of Object.entries(groupsByTableName)) {
            const normalizedTableName = tablename.toUpperCase();
            try {
                const dbController = DBControllerFactory(normalizedTableName) ;
                for (const row of rows) {
                    console.log({row});
                    const { error , success } = await dbController.createRow(row);
                    console.log('controller success response' , {error , success});
                    added.push({...success});
                }
            }
            catch (e) {
                console.log({e});
            }
        }

   
        res.end(JSON.stringify({payload:{
            files:{
                added ,
            }
        }}));
    });

}

module.exports = handleMultipartData ;

/**
 * 
 * @param {string} nameAttr
 * @returns {{groupId:string|null;tableName:string|null;colName:string|null;}} 
 */
function parseNameAttr (nameAttr) {

    const [ groupId , tableName , colName ] = nameAttr.split('.');

    if(!groupId || !tableName || !colName) {
        throw new Error(`incorrect name attribute`);
    }

    return {
        groupId:groupId || null ,
        tableName:tableName || null ,
        colName: colName || null ,
    }
}

/**
 * 
 * @param {string} contentDispositionHeaderString 
 * @returns {{name:string|null;filename:string|null}}
 */
function parseContentDisposition (contentDispositionHeaderString) {

    const namematch = contentDispositionHeaderString.match(/name="([^"]+)"/);
    const filenamematch = contentDispositionHeaderString.match(/filename="([^"]+)"/);

    return {
        name:namematch ? namematch[1] : null ,
        filename:filenamematch ? filenamematch[1] : null ,
    }
}

/**
 * 
 * @param {string} formDataHeadersString 
 * @returns {{Object.<string ,any>}}
 */
function parseHeaders (formDataHeadersString) {
    const headers = {} ;
    const headersRows = formDataHeadersString.split('\r\n') ;
    headersRows.forEach(headerRow => {
        const [key , value] = headerRow.split(": ");
        headers[key.toLowerCase()] = value ;
    });
    return headers ;
}

/**
 * 
 * @param {Buffer<ArrayBuffer>} formDataPart 
 * @returns {{headers:Buffer<ArrayBuffer>;body:Buffer<ArrayBuffer>}}
 */
function splitFormDataBufferPart (formDataPart) {

    const separatorBuffer = Buffer.from('\r\n\r\n');

    const separatorBufferIndex = findIndexInBufferBySeparator(formDataPart , separatorBuffer) ;

    if(separatorBufferIndex === -1) {
        throw new Error(`incorrect form-data part`);
    }

    const headers = formDataPart.subarray(0 , separatorBufferIndex);

    let bodyPartBufferEndIndex = formDataPart.length ;
    if(formDataPart[bodyPartBufferEndIndex - 2] === 0x0d && formDataPart[bodyPartBufferEndIndex - 1]) {
        bodyPartBufferEndIndex -= 2 ;
    }

    const body = formDataPart.subarray(
        separatorBufferIndex + separatorBuffer.length, 
        bodyPartBufferEndIndex
    );

    console.log(headers.toString('utf-8'));

    return {
        headers , 
        body ,
    }
}


/**
 * 
 * @param {Buffer<ArrayBuffer>} data 
 * @param {Buffer<ArrayBuffer>} boundary 
 * @returns {Buffer<ArrayBuffer>[]}
 */
function splitFormDataBuffer (data , boundary) {

    log('r'  , data , boundary.toString('utf-8'));

    const parts = [] ;
    let start = 0;
    let index = 0 ;

    while ((index = findIndexInBufferBySeparator(data , boundary , start)) !== -1) {
        const part = data.subarray(start , index) ;
        parts.push(part);
        start = index + boundary.length ;
        if(part[part.length - 2] === 0x0d && part[part.length - 1] === 0x0a) {
            start += 2 ;
        }
    }

    parts.push(data.subarray(start));

    return parts ;
}

/**
 * 
 * @param {Buffer<ArrayBuffer>} data 
 * @param {Buffer<ArrayBuffer>} separator 
 * @param {number} start 
 * @returns {number}
 */
function findIndexInBufferBySeparator (data , separator , start = 0) {
    
    for (let index = start ; index < data.length - separator.length ; index++) {
        let found = true ;
        for (let j = 0 ; j < separator.length ; j++) {
            if(data[index + j] !== separator[j]) {
                found = false ;
                break ;
            }
        }
        if(found === true) return index ;
    }
    return -1 ;
}