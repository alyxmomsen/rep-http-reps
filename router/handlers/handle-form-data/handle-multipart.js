const { createWriteStream } = require('fs');
const { join } = require('path');
const { Readable } = require('stream');

async function handleMultipart (contentTypeHeaderData , formDataBuffer) {
    
    
    const match = /boundary=(?<boundary>----[^$\s;]+)/.exec(contentTypeHeaderData);
    
    if(match === null) {

        return 
    }

    const splitted  = await splitFormData(match.groups.boundary , formDataBuffer);
    
    splitted.forEach(part => {

        const {
            contentType ,
            filename ,
            inputname ,
            data ,
        } = part ;

        console.log(part);

        if(filename !== null && contentType !== null)  {
            saveFile(filename , data);
        }

    });

    return 

}

module.exports = handleMultipart ;


async function saveFile (filename , data , fallback = f => f) {

    try {
        
        const savingDir = join('.' , `${Date.now()}.${filename}`);
        
        const writeStriem = createWriteStream(savingDir , 'utf-8')
        const readStream = Readable.from(data);

        readStream.on('end' , () => {
            console.log('file uploaded');
        });

        readStream.pipe(writeStriem)

    }
    catch (e) {

        fallback(e)
    }
}

async function splitFormData (boundary  , formdata) {

    
    let data = '' ;
    
    if(formdata instanceof Buffer) {
        data = formdata.toString('utf-8');
    }
    else {
        data = formdata ;
    }

    // console.log(formdata , data);

    const startBoundary = `--${boundary}`;
    const endBoundary = `--${boundary}--\r\n`;
    const regularBoundary = `--${boundary}`;

    
    return data.replace(startBoundary , '').replace(endBoundary , '').split(regularBoundary).map((part) => {
        
        const [headersPart  , ...datapart] = part
            .replace(/^\r\n/ , '')
            .replace(/\r\n$/ , '')
            .split('\r\n\r\n');

        const headersrows = headersPart.split('\r\n');

        const headers = {} ;

        headersrows.forEach(row => {
            const [key , value] = row.split(': ');

            if(key !== undefined && value !== undefined) {
                headers[key.toLowerCase()] = value ;
            }
        });

        const dispositionData = parseDispHEader(headers['content-disposition']);
        const contentType =  parseContentTypeHeaderData(headers['content-type']);

        // console.log({part , contDispHeaderData , contentTypeHeaderData: contentType});

        
        // console.log({contDisp: contDispRow , contType: contTypeRow , headers: headersrows , datapart:datapart.join('\r\n\r\n')});

        return {
            contentType,
            filename:dispositionData?.filename ,
            inputname:dispositionData?.inputname ,
            data:datapart.join('\r\n\r\n'),
        }

    });


} 

function parseDispHEader (headerd) {

    if(headerd === undefined) return null ;

    const inputname = /name="(?<inputname>[^"]+)/.exec(headerd)?.groups.inputname ;
    const filename = /filename="(?<filename>[^"]+)/.exec(headerd)?.groups.filename ;

    return {
        filename:filename === undefined ? null : filename ,
        inputname: inputname === undefined ? null : inputname ,
    }
}

function parseContentTypeHeaderData (headerd) {

    if(headerd === undefined) return null ;

    const contentTYpe = /(?<inputname>[^\/]+\/[^;$\s]+)/.exec(headerd)?.groups.inputname ;
    return contentTYpe;
}


