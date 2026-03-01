const { sendFallBack, errorFactory } = require("../../../../utils/error-factory");
const { findSeparatorIndexInBuffer } = require("../../../../utils/find-separator-index-in-buffer.util");
const { GroupFormData } = require("../../../group-form-data/group-form-data.service");

const CONSTANTS = {
    /* 
    тот самый ключ который сопровождает bundle 
    возвращаемый фабрикой contentTypeHandlerFactory
    он же используется здесь ниже для взятия значения из объекта payload
     */
    PAYLOAD_DATA_KEY:'boundaryRawData' ,
}

async function multipartHandler(req , res , payload) {

    console.log('multipart handler...' , {payload});
    
    const { PAYLOAD_DATA_KEY } = CONSTANTS ;

    const boundaryRawString = payload[PAYLOAD_DATA_KEY] || null ;

    const boundary = (boundaryRawString?.match(/boundary=(----[^;\s$]+)/))?.[1] || null;

    console.log({boundary , contentTypePayload: boundaryRawString});

    if(!boundary) {
        sendFallBack(res ,400 , 'multipartHandler' , 'no boundary given' , {boundary , payload , contentTypePayload: boundaryRawString});
        return ;
    }

    const formDataChunks = [] ;
    req.on('data' , (chunk) => {
        formDataChunks.push(chunk);
    }); 

    req.on('end' , () => {

        console.log('form processing end');
        
        const wholeFormDataBuffer = Buffer.concat(formDataChunks);
        const parts = splitFormData(wholeFormDataBuffer , Buffer.from(`--${boundary}`));
        const groupFormData = new GroupFormData();
        for (const part of parts) {
            try {
                const { 
                    body:formDataPartBody , headers:formDataPartHeadersRawData 
                } = splitFormDataPart(part);
                const formDataPartHeaders = parseFormDataPartHeaders(
                    formDataPartHeadersRawData.toString('utf-8')
                );
                const contentType = formDataPartHeaders['content-type'] || null ;
                const contentDisposition = formDataPartHeaders['content-disposition'] ;
                const { name: nameAttr , filename } = parseContentDisposition(contentDisposition);
                const { columnName , groupId , tableName } = parseNameAttr(nameAttr);

                groupFormData.pushParsedInputData({
                    groupId , tableName , columnName , 
                    columnValue:formDataPartBody , columnContentType:contentType , 
                });
            }
            catch (e) {
                // console.log({e});
            }
        }

        const assembledGroupsByTablename = groupFormData.getGroups();

        for (const [tableName , tableRows ] of Object.entries(assembledGroupsByTablename) ) {
            for (const tableRow of tableRows) {
                console.log({tableRow});
            }
        }


        res.end('hello world');
    });

}

module.exports = { multipartHandler , CONSTANTS }

/**
 * 
 * @param {string} nameAttr 
 */
function parseNameAttr (nameAttr) {

    const [ groupId , tableName , columnName ] = nameAttr.split('.') ;

    if(!groupId || !tableName || !columnName) {
        throw new Error (JSON.stringify(
            errorFactory(
                'parse name attr' ,
                'incorrect name attr' ,
                {nameAttr} ,
            )
        ));
    }

    return {
        groupId, tableName, columnName
    }
}


/**
 * 
 * @param {string} contentDisposition 
 * @returns {{name:string|null;filename:string|null}}
 */
function parseContentDisposition ( contentDisposition ) {

    const name = contentDisposition.match(/name="([^"]+)"/)?.[1] || null;
    const filename = contentDisposition.match(/filename="([^"]+)"/)?.[1] || null;

    return {
        name , 
        filename ,
    }
}

/**
 * 
 * @param {string} headersString 
 */
function parseFormDataPartHeaders (headersString) {

    const headers = {} ;

    const headersRows = headersString.split('\r\n');
    headersRows.forEach(headerRow => {
        const [key , value] = headerRow.split(": ");
        if(key && value) {
            const normalizedKey = key.toLocaleLowerCase() ;
            headers[normalizedKey] = value ;
        }
    });

    return headers ;

}

/**
 * 
 * @param {Buffer<ArrayBuffer>} formDataPart 
 */
function splitFormDataPart (formDataPart) {

    const separatorBuffer = Buffer.from('\r\n\r\n');

    const separatorIndex = findSeparatorIndexInBuffer(formDataPart , separatorBuffer);

    if(separatorIndex === -1) {
        throw new Error (JSON.stringify(
            errorFactory(
                'splitFormDataPart' ,
                'incorrect form data part' ,
                { formDataPart }
            )
        ))
    }

    /**
     * extract first part as Headers Part
     */
    const headers = formDataPart.subarray(0 , separatorIndex);

    let bodyBuffeEndIndex = formDataPart.length ;

    if(
        formDataPart[bodyBuffeEndIndex - 2] === 0x0d // "\r" esc
        && formDataPart[bodyBuffeEndIndex - 1] === 0x0a // "\n" esc
    ) {
        bodyBuffeEndIndex -= 2 // shift the index to left
    }

    const body = formDataPart.subarray(separatorIndex + separatorBuffer.length , bodyBuffeEndIndex);

    return {
        headers ,
        body ,
    }
}

/**
 * 
 * @param {Buffer<ArrayBuffer>} formData 
 * @param {Buffer<ArrayBuffer>} boundary 
 * @returns {Array<Buffer<ArrayBuffer>>}
 */
function splitFormData (formData , boundary) {

    const parts = [] ;
    let start = 0
    let index = 0 ;

    while ((index = findSeparatorIndexInBuffer(formData , boundary , start)) !== -1) {
        const part = formData.subarray(start , index) ;
        parts.push(part);
        start = index + boundary.length ;
        if(
            formData[start] === 0x0d // \r 
            && formData[start + 1] === 0x0a // \n
        ) start += 2 ;
    }

    parts.push(formData.subarray(start)); // rest part

    return parts ;
}
