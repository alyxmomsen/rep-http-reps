
const { dbController } = require("../../../../../../../services/database/controller/db-controller");
// const findIndexInBuffer = require("../../../../../../../utils/find-index-in-buffer");
const { loggerFactory } = require("../../../../../../../utils/logger");
const GroupAssembler = require("./services/assemble-groups/assemble-groups");
const parseName = require("./services/parse-name-input/parse-name");
const splitFormDatPart = require("./utils/handle-part");

const log = loggerFactory('handle multipart data' , '-u');
async function handleMultipartData (req , res , {boundaryRawStr}) {
   
    if(!boundaryRawStr) {
        return ;
    }

    const boundaryMatch = boundaryRawStr.match(/boundary=([^;\s$]+)/);

    if(!boundaryMatch) {
        return ;
    }

    const boundaryBuffer = Buffer.from(`--${boundaryMatch[1]}`) ;

    const formDataBufferChunks =  [];
    req.on('data' , (chunk) => {
        formDataBufferChunks.push(chunk);
    });

    req.on("end" , async () => {
        const wholebuffer = Buffer.concat(formDataBufferChunks);

        const formDataBufferParts = splitFormDataBuffer(wholebuffer , boundaryBuffer );
        const groupAssembler = new GroupAssembler();
        for (const formDataBufferPart of formDataBufferParts) {

            try {
                // start parsing ...
                const { headers:headersPartBuffer , body:bodyPartBuffer } = splitDataBufferPart(formDataBufferPart);
                const headers = extractHeaders(headersPartBuffer.toString('utf-8'));
                const contentDispositionHeader = headers['content-disposition'] || null ;
                const contentTypeHeader = headers['content-type'] || null ;
                const { filename , name:nameAttr } = parseContentDisposition(contentDispositionHeader);
                const { groupId , tableName , colName } = parseNameAttr(nameAttr);
                // ... end parsing

                groupAssembler.gulpOnceColData({
                    groupId , tableName , 
                    colName , colValue:bodyPartBuffer , colContenttype:contentTypeHeader
                });

                if(filename) groupAssembler.gulpOnceColData({
                    groupId , tableName , 
                    colName:'filename' , colValue:filename , colContenttype:'text/plain' , 
                })
            }
            catch (e) {
                console.log({e});
            }
        }

        const rowsByTablename = groupAssembler.groupsSortedByTableName();
        const addRowResults = [];
        for (const [tableName , rows] of Object.entries(rowsByTablename)) {
            for (const row of rows) {
                console.log({row});
                const { error , success } = await dbController.createRow(tableName.toUpperCase() , {row, res});
                if(error) {
                    continue ;
                }
                const { id , row:tableRow } = success ;
                addRowResults.push({id , row:tableRow});
            }
        }
        res.writeHead(200 , 'ok' , {
            "content-type":'application/json' ,
        });
        res.end(JSON.stringify({
            payload:{
                files:{
                    added:addRowResults ,
                }
            }
        }));
        // res.sendResponsePayloadData(200 ,'ok');
    });
    
}

module.exports = handleMultipartData ;

function parseNameAttr (nameAttr) {
    const [ groupId , tableName , colName ] = nameAttr.split('.') ;
    return {
        groupId:groupId || null , tableName:tableName || null , colName:colName || null
    }
}

function parseContentDisposition (contentDispositionHeaderString) {

    const namematch = contentDispositionHeaderString.match(/name="([^"]+)"/) ;
    const filenamematch = contentDispositionHeaderString.match(/filename="([^"]+)"/) ;

    return {
        name:(namematch && namematch[1]) || null , 
        filename:(filenamematch && filenamematch[1]) || null , 
    }
}

function extractHeaders (headerString) {

    const headers = {} ;

    const rawHeaders = headerString.split('\r\n');
    for (const rawHeader of rawHeaders) {
        const [key , value ] = rawHeader.split(': ');
        if(!key || !value) continue ;
        headers[key.toLowerCase()] = value ;
    }

    return headers ;
}

function splitDataBufferPart (formDataBufferPart) {

    const separatorBuffer = Buffer.from(`\r\n\r\n`);

    const separatorIndex = findIndexInBuffer(formDataBufferPart , separatorBuffer);
    
    if(separatorIndex === -1) {
        throw new Error('incorrect part data'.toUpperCase());
    }

    const headers = formDataBufferPart.subarray(0 , separatorIndex);

    let bodyBufferEndIndex = formDataBufferPart.length ;

    if(formDataBufferPart[bodyBufferEndIndex - 2] === 0x0d && formDataBufferPart[bodyBufferEndIndex -1] === 0x0a) {
        bodyBufferEndIndex -= 2 ;
    }

    const body = formDataBufferPart.subarray(separatorIndex + separatorBuffer.length , bodyBufferEndIndex);

    return {
        headers ,
        body ,
    }
}

function splitFormDataBuffer (formDataBuffer , boundaryBuffer) {

    const parts = [] ;
    let start = 0; 
    let index = 0 ;
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

function findIndexInBuffer (dataBufffer , separatorBuffer , start = 0) {

    for (let index = start ; index < dataBufffer.length - separatorBuffer.length ; index++) {
        let found = true ;
        for (let j = 0 ; j < separatorBuffer.length ; j++) {
            if(dataBufffer[index + j] !== separatorBuffer[j]) {
                found = false ;
                break;
            }
        }
        if(found === true) {
            return index ;
        }
    }
    return -1 ;
}