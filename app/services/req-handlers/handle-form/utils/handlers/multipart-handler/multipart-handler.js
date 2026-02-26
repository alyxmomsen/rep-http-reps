const { IncomingMessage, ServerResponse } = require("node:http");
const { loggerFactory } = require("../../../../../../../utils/logger");

const { DBControllerFactory } = require("../../../../../../../services/database/controller/db-controller");
const { GROUP_ASSEMBLER_CONSTANTS, GroupAssembler } = require("./services/assemble-groups/assemble-groups");

const MULTIPART_HANDLER_CONSTANTS = {
    FILEMAXSIZE: 1024 * 1024 * 100 // 100 Mb
}

const log = loggerFactory('handle multipart data' , '-u');

/**
 * 
 * @param {IncomingMessage} req 
 * @param {ServerResponse} res 
 * @param {{boundaryRawStr?:string}} payload 
 */
async function handleMultipartData (req , res , payload) {
   
    const { boundaryRawStr } = payload ;

    if(!boundaryRawStr) {
        res.writeHead(400 , 'bad request' , {
            'content-type':'application/json' ,
        });
        res.end(JSON.stringify({
            message:'no boundary header' ,
        }));
        return ;
    }
    
    const boundary = boundaryRawStr.match(/boundary=(----[^\/]+)/);
    
    if(!boundary) {
        res.writeHead(400 , 'bad request' , {
            'content-type':'application/json' ,
        });
        res.end(JSON.stringify({
            message:'no form data boundary' ,
        }));
        return ;
    }

    const formDataBufferChunks = [] ;
    let incomingChunksTotalSize = 0 ;
    let hasSentResponse = false ;
    req.on("data"  , async (chunk) => {

        incomingChunksTotalSize += chunk.length ;

        if(
            incomingChunksTotalSize
            >= MULTIPART_HANDLER_CONSTANTS.FILEMAXSIZE
        ) {

            console.log('total: ' , incomingChunksTotalSize);

            // req.pause();
            
            // res.writeHead(413 , 'over limit file size' , {
            //     'content-type':'application/json' ,
            // });
            // res.end(JSON.stringify({
            //     message:'too large file' ,
            // }));

            // hasSentResponse = true ;
            
            // req.destroy();
            // console.log('destroyed');
            // return ;
        }

        formDataBufferChunks.push(chunk);
    })

    req.on("end" , async () => {

        if(hasSentResponse) {
            return ;
        }
        
        const wholeFormDataBuffer = Buffer.concat(formDataBufferChunks);

        const parts = splitFormDataBuffer(wholeFormDataBuffer , Buffer.from(`--${boundary[1]}`));

        const groupAssembler = new GroupAssembler();
        const { 
            GROUP_ID , TABLE_NAME , COLUMN_NAME , COLUMN_VALUE , COLUMN_CONTENT_TYPE 
        } = GROUP_ASSEMBLER_CONSTANTS.fields;

        for (const part of parts) {
            try {
                const { body:bodyPartBuffer , headers:headersPartBuffer } = splitFormDataPart(part);
                const headers = parseHeaders(headersPartBuffer.toString('utf-8'));
                const contentType = headers['content-type'] || null ;
                const contentDisposition = headers['content-disposition'] || null ;
                if(!contentDisposition) throw new Error(`no content-disposition header`);
                const { name:nameAttr , filename:filenameAttr } = parseContentDisposition(contentDisposition) ;
                if(!nameAttr) throw new Error (`no "name" attribute`);
                const  { groupId, tableName, columnName:colName } = parseNameAttr(nameAttr);
                // if file
                if(filenameAttr || contentType) {
                    groupAssembler.pushOneColumn({
                        [GROUP_ID]:groupId  ,
                        [TABLE_NAME]:tableName , 
                        [COLUMN_NAME]:'filename' ,
                        [COLUMN_VALUE]:filenameAttr ,
                        [COLUMN_CONTENT_TYPE]:'text/plain' ,
                        // content-type will be default as "text/plain"
                    });
                }
                // ------
                groupAssembler.pushOneColumn({
                    [GROUP_ID]:groupId , 
                    [TABLE_NAME]:tableName  ,
                    [COLUMN_NAME]:colName , 
                    [COLUMN_VALUE]:bodyPartBuffer , 
                    [COLUMN_CONTENT_TYPE]:contentType,
                });
            }
            catch(e) {
                console.log({e});
            }
        }

        const responsePayloadData = {
            files:{
                added:[]
            }
        } ;
        const rowsByTablename = groupAssembler.getRowsGropedByTableName();
        for (const [tableName , rows ] of Object.entries(rowsByTablename)) {
            for (const tableRow of rows) {
                try {
                    console.log({tableRow});
                    const controller = DBControllerFactory(tableName.toUpperCase());
                    const { error , success } = await controller.createRow(tableRow);
                    if(error) {
                        console.log({error});
                    }
                    const { id , row } = success ;
                    responsePayloadData.files.added.push({id , row});
                }
                catch (e){  
                    console.log({e});
                }
            }
        }

        res.writeHead(200);
        res.end(JSON.stringify({message:'transaction result' , payload:responsePayloadData}));
        return ;
    });

}

module.exports = handleMultipartData ;

/**
 * 
 * @param {string} nameAttr 
 */
function parseNameAttr (nameAttr) {

    const [ groupId , tableName , columnName ] = nameAttr.split('.');

    if(!groupId || !tableName || !columnName) {
        throw new Error (`incorrect "name" attribute data`);
    }

    return {
        groupId:groupId  ,
        tableName:tableName  ,
        columnName:columnName  ,
    }
}


/**
 * 
 * @param {string} contentDisposition 
 * @returns {{name:string|null;filename:string|null}}
 */
function parseContentDisposition (contentDisposition) {

    const nameMatch = contentDisposition.match(/name="([^"]+)"/);
    const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);

    return {
        name: (nameMatch && nameMatch[1]) || null  , 
        filename: (filenameMatch && filenameMatch[1]) || null ,
    }
}

/**
 * 
 * @param {string} formDataPartHeadersString 
 */
function parseHeaders (formDataPartHeadersString) {

    const headers = {} ;

    const separator = '\r\n' ;
    const rows = formDataPartHeadersString.split(separator) ;
    for (const row of rows) {
        const [key , value] = row.split(": ");
        if(!key || !value) {
            continue ;
        }
        headers[key.toLowerCase()] = value ;
    }

    return headers ;
}


/**
 * 
 * @param {Buffer<ArrayBuffer>} formDataPart 
 * @returns {{headers:Buffer<ArrayBuffer>;body:Buffer<ArrayBuffer>}}
 */
function splitFormDataPart (formDataPart) {

    const separatorBuffer = Buffer.from('\r\n\r\n');
    const separatorIndex = findSeparatorIndexInBuffer(formDataPart , separatorBuffer) ;

    if(separatorIndex === -1) {
        throw new Error(`incorrect form data part`.toUpperCase());
    }

    const headers = formDataPart.subarray(0 , separatorIndex)

    let bodyEndBufferIndex = formDataPart.length ;

    if(formDataPart[bodyEndBufferIndex - 2] === 0x0d && formDataPart[bodyEndBufferIndex - 1] === 0x0a ) {
        bodyEndBufferIndex -= 2;
    }

    const body = formDataPart.subarray(separatorIndex + separatorBuffer.length , bodyEndBufferIndex);

    return {
        headers,
        body,
    }
}


/**
 * 
 * @param {Buffer<ArrayBuffer>} data 
 * @param {Buffer<ArrayBuffer>} separator 
 * @returns {Buffer<ArrayBuffer>[]}
 */
function splitFormDataBuffer (data , separator) {

    const formDataBufferParts = [] ;

    let start = 0;
    let index = 0 ;

    while ((index = findSeparatorIndexInBuffer(data , separator , start)) !== -1) {

        const part = data.subarray(start , index)
        formDataBufferParts.push(part);
        start = index + separator.length ;

        if(data[start] === 0x0d && data[start + 1] === 0x0a) {
            start += 2 ;
        }
    }

    formDataBufferParts.push(data.subarray(start));

    return formDataBufferParts ;
}

function findSeparatorIndexInBuffer (data , separator , start = 0) {

    for (let index = start ; index < data.length - separator.length ; index++) {
        let found = true ;
        for (let j = 0 ; j < separator.length ; j++) {
            if(data[index + j] !== separator[j]) {
                found = false ;
                break;
            }
        }

        if(found === true) {
            return index ;
        }
    }

    return -1
}