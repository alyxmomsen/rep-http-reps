const { kMaxLength } = require("buffer");

class FileManager {

    async gulp(headersPartBuffer , bodyPartBuffer) {

        const headersPartString = headersPartBuffer.toString('utf-8');

        const bodyHeaders = await this.#compileHeaders(headersPartString);
        
        const contentDispositionHeader = bodyHeaders['content-disposition'];
        const contentTypeHeader = bodyHeaders['content-type'] || null;

        const headerAttributes = await this.#parseContentDisposition(contentDispositionHeader);

        const name = headerAttributes['name'] || null;
        const filename = headerAttributes['filename'] || null;

        const bundle = {
            name,
            filename ,
            contentType:contentTypeHeader ,
        }

        console.log({bundle});
        
    }

    async #parseContentDisposition(contentDispositionHeader) {
        console.log('parse disp');

        if (contentDispositionHeader === undefined) throw new Error();

        const parts = contentDispositionHeader.split('; ');

        const attributes = {};
        parts.forEach(elem => {
            const [key, value] = elem.split('=');

            if (key !== undefined && value !== undefined) {

                attributes[key.toLowerCase()] = value.replace(/^"/ , '').replace(/"$/ , '');
            }
        });

        return attributes;
    }
    
    async #compileHeaders(headersPartString) {
        
        const headers = {};
        
        const rows = headersPartString.split('\r\n');
        rows.forEach(row => {
            const [key, value] = row.split(': ');
            if (key !== undefined & value !== undefined) {
                
                headers[key.toLowerCase()] = value;
            }
        });
        
        return headers;
    }

    async handleFiles(files) {
        

    }

    #files;

    constructor() {

        this.#files = {};
    }
}

module.exports = FileManager;