const database = require("../../../../../../services/database");
const FormDataCompiler = require("../../../../../../services/form-data-compiler");
const findIndexInBuffer = require("../../../../../../utils/find-index-in-buffer");
const nameAttrParser = require("./utils/name-attr-parser");

async function multipartTypeHandler(req ,res , payload) {
    
    const { contentTypeAttr } = payload ;

    const boundary = extractBoundary(contentTypeAttr);

    if(!boundary) {
        res.writeHead(400);
        res.end('no boundary');
        return;
    }

    const bufferDataParts = [] ;
    req.on('data' , (chunk) => {
        bufferDataParts.push(chunk);
    });

    req.on('end' , () => {

        const wholeBuffer = Buffer.concat(bufferDataParts);
        
        const formdataPartsArr = splitFormData(wholeBuffer , Buffer.from(boundary) );

        const formdatacompiler = new FormDataCompiler();

        for (const part of formdataPartsArr) {

            try {

                const { headersPart , bodyPart } = splitFormDataPart(part);

                const headers = parseHeaders(headersPart.toString('utf-8'));

                const contentType = headers['content-type'] || null ;
                const contentDisposition = headers['content-disposition'] || null ;

                if (!contentDisposition) {
                    throw new Error('no content-disposition in data-part header'.toUpperCase());

                }

                const { name:nameAttr , filename } = parseContentDisposition(contentDisposition);
                
                const semantic = nameAttrParser(nameAttr);

                formdatacompiler.gulpPart({contentType , body:bodyPart , filename , semantic});

            }
            catch (e) {
                console.log({e});
            }

        }

        const files = formdatacompiler.getFiles();

        for (const [key , group] of files.entries()) {

            const {tablename , fields} = group ;

            database.add(tablename , fields);
        }

        console.log('database get items:' , {database:database.getTables()});

        const databaseTables = database.getTables();

        const _files = [] ;
        const fileTable = databaseTables.get('file');
        for (const [key , item] of fileTable.entries()) {

            _files.push(item.get('title'));
            console.log({key , item});

        }

        res.end(JSON.stringify({foo:'bar' , payload:_files}));
        return ;

    });

}

module.exports = multipartTypeHandler ;

// utils


function parseContentDisposition (contentDisposition) {

    const namematch = contentDisposition.match(/name="([^"]+)"/);
    const filenamematch = contentDisposition.match(/filename="([^"]+)"/);

    return {
        name: namematch ? namematch[1] : null , 
        filename: filenamematch ? filenamematch[1] : null , 
    }
}

function parseHeaders (headersPartString) {

    const headersRows = headersPartString.split('\r\n');

    const headers = {} ;

    headersRows.forEach(row => {
        const [key , value] = row.split(': ');
        if(key && value) {
            headers[key.toLowerCase()] = value ;
        }
    });

    return headers ;
}

function splitFormDataPart (formdataPart) {

    const separatorBuffer = Buffer.from('\r\n\r\n');

    const separatorIndex = findIndexInBuffer(formdataPart , separatorBuffer);
    
    if(separatorIndex === -1) {
        throw new Error('incorrect data part'.toUpperCase());
    }

    const headersPart = formdataPart.subarray(0 , separatorIndex) ;
    let bodyEndBufferIndex = formdataPart.length ;
    if(formdataPart[bodyEndBufferIndex - 2] === 0x0d && formdataPart[bodyEndBufferIndex - 1] === 0x0a) {
        bodyEndBufferIndex -= 2 ;
    }
    const bodyPart = formdataPart.subarray(separatorIndex + separatorBuffer.length , bodyEndBufferIndex);

    return {
        headersPart , 
        bodyPart ,
    }

}

function splitFormData (buffer , boundary) {

    const parts = [] ;
    let start = 0 ;
    let index = 0 ;

    while ((index = findIndexInBuffer(buffer , boundary , start)) !== -1) {

        parts.push(buffer.subarray(start , index));
        start = index + boundary.length ;

        if(buffer[start] === 0x0d && buffer[start + 1] === 0x0a) {
            start += 2; 
        }
    }

    parts.push(buffer.subarray(start));

    return parts ;
}

function extractBoundary (contentTypeAttr) {
    const match = contentTypeAttr.match(/boundary=(----[^;\s$]+)/);
    return match ? `--${match[1]}` : null ;
}