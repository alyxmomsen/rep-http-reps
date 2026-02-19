const { createFile, createUser, readFileById, readFiles } = require("../../../../../../../services/database/controller/database-controller");
const dbController = require("../../../../../../../services/database/controller/db-controller");
const findIndexInBuffer = require("../../../../../../../utils/find-index-in-buffer");
const { loggerFactory } = require("../../../../../../../utils/logger");
const GroupAssembler = require("./services/assemble-groups/assemble-groups");
const parseName = require("./services/parse-name-input/parse-name");
const groupsprocessor = require("./services/rows-processor/rows-processor");
const splitFormDatPart = require("./utils/handle-part");

const log = loggerFactory('handle multipart data' , '-u');
async function handleMultipartData (req , res , {boundaryRawStr}) {
   

    console.log('multipart form data');

    if(!boundaryRawStr) {
        res.writeHead(400);
        res.end('no boundary header data');
        return ;
    }

    const boundary = extractBoundary(boundaryRawStr);

    if(!boundary) {
        fallback(res , 400 , 'no boundary' , 'no boundary');
        return ;
    }


    const bufferChunks = [] ;
    const MAXSIZE = 10_000_000 ;
    let sizeCounter = 0 ;
    req.on('data' , async (chunk) => {
        // log('def' , 'chunk' , chunk.length)
        // sizeCounter += chunk.length ;
        // if(sizeCounter >= MAXSIZE) {
        //     log('r' ,'too large file');
        //     fallback(res , 400 , 'too large file' , JSON.stringify({mes:'too large'}));
        //     // req.destroy();
        //     return ;
        // }


        bufferChunks.push(chunk);
    });

    req.on('end' , async () => {

        const wholebuffer = Buffer.concat(bufferChunks);

        const formDataParts = splitFormDataBuffer(wholebuffer , Buffer.from(boundary));

        const groupAssembler = new GroupAssembler();

        for (const formDataPart of formDataParts) {

            try {

                const { headers , body } = splitFormDatPart(formDataPart);

                const formDataPartHeaders = extractFormDataPartHeaders(headers.toString('utf-8'));
                
                const contentDisposition = formDataPartHeaders['content-disposition'] || null ;
                const contentType = formDataPartHeaders['content-type'] || null ;

                const { filename: filenameAttr , name: nameAttr } = parseContentDisposition(contentDisposition);

                const { groupId , tableName , tableItemFieldName } = parseName(nameAttr);

                //  ============== validate semantic ==============================
                
                if(!groupId || !tableName || !tableItemFieldName) {
                    log('r' , 'no valid semantic data')
                    continue;
                }

                // ==============================================================

                groupAssembler.gulpOne({
                    groupId , tableName , colName:tableItemFieldName ,
                    colContenttype:contentType , colValue:body ,
                });

                if(filenameAttr) {
                    groupAssembler.gulpOne({
                        groupId , tableName ,
                        colName:'filename' , colValue:filenameAttr ,
                        // colContentType will be default; 'text/plain'
                    })
                }
            }
            catch (e) {
                log('r' , 'split part error' , {e});
            }
        }

        // ------------------------------------------

        const groups = groupAssembler.getAssembledGroupsByTableName(); 

        for (const [tablename , tableRows] of Object.entries(groups)) {

            for (const row of tableRows) {
                console.log({row});
                dbController.setRow(tablename , row , res);
            }
            
            // tableRows.forEach(async (row) => {
            //     await groupsprocessor.execute(tablename , row , res);
            // });
        }

        console.log({groups});

        // res.writeHead(200);
        // res.end(JSON.stringify({
        //     status:{
        //         code:0 ,
        //     } ,
        //     success:{
        //         payload: {
        //             // addedFiles ,
        //         }
        //     }
        // }));
        res.sendResponseData(200 , 'ok');

    });
}

module.exports = handleMultipartData ;


function parseContentDisposition (contentDisposition) {

    const _name = contentDisposition.match(/name="([^"]+)"/);
    const _filename = contentDisposition.match(/filename="([^"]+)"/);

    return {    
        name: (_name && _name[1]) || null ,
        filename: (_filename && _filename[1]) || null ,
    }
}

function extractFormDataPartHeaders (headersString) {

    const separator = '\r\n' ;

    const headersRows = headersString.split(separator);

    const headers = {} ;
    headersRows.forEach(row => {
        const [key , value] = row.split(': ');
        if(key && value) {
            headers[key.toLowerCase()] = value ;
        }
    });

    return headers ;
}


function splitFormDataBuffer (formDataBuffer , boundaryBuffer) {

    const parts = [] ;

    let start = 0 ;
    let index = 0;

    while ((index = findIndexInBuffer(formDataBuffer , boundaryBuffer , start)) !== -1) {
        parts.push(formDataBuffer.subarray(start , index));
        start = index + boundaryBuffer.length ;
        if(formDataBuffer[start] === 0x0d && formDataBuffer[start + 1] === 0x0a) {
            start += 2 ;
        }
    }

    parts.push(formDataBuffer.subarray(start));

    return parts ;
}

function extractBoundary  (boundaryRawStr) {
    const match = boundaryRawStr.match(/boundary=(----[^\/\\$\s]+)/);

    return match && `--${match[1]}` ;
}

function fallback (res , statusCode , statusMessage = '' , resMessage = '') {

    res.writeHead(statusCode , statusMessage , );
    res.end(resMessage);
}

