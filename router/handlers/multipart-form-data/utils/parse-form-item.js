const parseContentDispositionHeader = require("./parse-content-disp-header");
const splitBuffer = require("./split-buffer.ref");

async function parseFormItem (dataBuffer) {
    
    const [headersPart , bodyPart] = await splitBuffer(dataBuffer , Buffer.from(`\r\n\r\n`));

    if(bodyPart === undefined) {
        throw new Error('incorrect data part'.toUpperCase());
    }

    // console.log({headersPart:headersPart.toString('utf-8') , bodyPart});

    const rows = await splitBuffer(headersPart , Buffer.from(`\r\n`));

    const headers  = {};
    rows.forEach(row => {
        const [key , value] = row.toString('utf-8').split(': ');
        if(key && value) {
            
            headers[key.toLowerCase()] = value;
        }
    });

    const contentDispositionHeader = headers['content-disposition'] || null ;
    const contentTypeHeader = headers['content-type'] || null ;

    const {nameAttribute:nameAttribute , filename} = await parseContentDispositionHeader(contentDispositionHeader);
    
    return {
        contentType:contentTypeHeader ,
        filename ,
        nameAttribute:nameAttribute ,
        body:bodyPart ,
    }

}

module.exports = parseFormItem ;