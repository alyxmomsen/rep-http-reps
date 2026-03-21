const { findSeparatorIndexInBuffer } = require("../../../utils/find-separator-index-in-buffer.util");

module.exports = { parseFormDataPart }

/**
 * 
 * @param {Buffer<ArrayBuffer>} formDataPart 
 * @returns {{
 *  body:Buffer<ArrayBuffer>;
 *  contentType:string|null;
 *  filename:string|null;
 *  name:string;
 * }}
 */
function parseFormDataPart (formDataPart) {
    const { 
        body , headers:formDataPartHeadersRawData 
    } = splitFormDataPart(formDataPart);
    const formDataPartHeaders = parseFormDataPartHeaders(
        formDataPartHeadersRawData.toString('utf-8')
    );
    const contentType = formDataPartHeaders['content-type'] || null ;
    const contentDisposition = formDataPartHeaders['content-disposition'] || null ;
    if(!contentDisposition) {
        throw new Error(`parseFormDataPart: no content-disposition header`);
    }
    const { name: name , filename: filename } = parseContentDisposition(contentDisposition);
    
    return {
        body ,
        contentType ,
        filename: filename,
        name: name,
    }
}

/* local utils */

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
        throw new Error(`splitFormDataPart: incorrect form data part`);
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