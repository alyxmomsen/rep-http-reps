const _findIndex = require("../router/utils/find-index");

class CustomStoreManager {

    async #compileItem (databundle , behavior) {

        const bundle = await behavior(databundle);

        if(bundle === null) return ;

        console.log({bundle});

    }

    async gulp(databundle) {

        const item = await this.#compileItem(databundle , behavior);
    }

    #files;
    #items;

    constructor() {
        this.#files = {} ;
        this.#items = [];
    }
}

module.exports = CustomStoreManager;


async function behavior(dataBufferPart) {
    
    const bodySeparator = '\r\n\r\n';

    const separatorBuffer = Buffer.from(bodySeparator);

    const _index = await _findIndex(dataBufferPart , separatorBuffer);

    if(_index === -1) {
        console.log('incorrect part'.toUpperCase());
        return null ;
    }

    const headersPart = dataBufferPart.subarray(0 , _index) ;

    let bodyPartEndBufferIndex = dataBufferPart.length ;

    if(
        dataBufferPart[bodyPartEndBufferIndex - 2] === 0x0d 
        && dataBufferPart[bodyPartEndBufferIndex - 1] === 0x0a
    ) {
        bodyPartEndBufferIndex -= 2 ;
    }

    const bodyPart = dataBufferPart.subarray(
            _index + separatorBuffer.length , 
            bodyPartEndBufferIndex
        ) ;

    const headerPartString = headersPart.toString('utf-8');

    const dataHeaders = await parseHeadersPartString(headerPartString);

    const contentDispositionHeader = dataHeaders.conentDisposition ;

    const bundle  = {
        body:bodyPart ,
        contentType:dataHeaders.contentType ,
        contentDisposition:await parseContentDispositionHeader(contentDispositionHeader) ,

    }

    return bundle ;
}

async function parseContentDispositionHeader (contentDispHeader) {
    
    if(contentDispHeader === null) return null ;

    const name = contentDispHeader.match(/name="([^"]+)"/);
    const filename = contentDispHeader.match(/filename="([^"]+)"/);

    return {
        name:name ? name[1] : null ,
        filename:filename ? filename[1] : null ,
    }
}

async function parseHeadersPartString (headerPartString) {
    
    const rows = headerPartString.split('\r\n');
    const headers = {} ;
    rows.forEach((row) => {

        const [key , value] = row.split(': ');

        if(key && value) {
            headers[key.toLowerCase()] = value ;
        }

    });

    return {
        conentDisposition:headers['content-disposition'] || null ,
        contentType:headers['content-type'] || null ,
    }

}