const { kMaxLength } = require("buffer");
const _behavior = require("./file-compiler-behaviors");

class FileManager {

    async upload() {

        const files = {};
        const queue = [];
        
        for (let i = 0; i < this.#inputs.length; i++) {

            const item = this.#inputs[i];

            if (item.type === 'file') {
                
                if (files[item.subjectId] === undefined) {
                    
                    files[item.subjectId] = {
    
                    }
                }

                const file = files[item.subjectId];

                for (const [key , value] of Object.entries(item)) {
                    if (key === 'type') continue;

                    file[key] = value;
                }

                continue;
            }

            const file = files[item.targetId];

            if (file === undefined) {
                    
                queue.push(item);
                continue;
            }

            file[item.subjectName] = item.body || null;
            // file[item.subjectName] = item.subjectName || null;

            // for (const [key , value] of Object.entries(item)) {
            //     if (key === 'targetId') continue;
            //     if (key === 'type') continue;
            //     if (key === 'subjectId') continue;
            //     if (key === 'filename') continue;
            //     if (key === 'contentType') continue;

            //     file[key] = value;
            // }

            console.log(

                {inputs:this.#inputs[i] , files , queue}
            );


        }

    }

    async gulp(headersPartBuffer , bodyPartBuffer) {

        const headersPartString = headersPartBuffer.toString('utf-8');

        const bodyHeaders = await this.#compileHeaders(headersPartString);
        
        const contentDispositionHeader = bodyHeaders['content-disposition'];
        const contentTypeHeader = bodyHeaders['content-type'] || null;

        const headerAttributes = await this.#parseContentDisposition(contentDispositionHeader);

        const name = headerAttributes['name'] || null;
        const filename = headerAttributes['filename'] || null;

        const bundle = {
            ...(await this.#parseNameInutValue(name , _behavior)) ,
            filename ,
            contentType: contentTypeHeader,
            body:bodyPartBuffer ,
        }

        this.#inputs.push(bundle);
        
    }

    async #parseNameInutValue(nameInputValue , behavior) {
        
        const result =  behavior(nameInputValue);

        // console.log({ result });
        
        return result;
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

    #inputs;

    constructor() {

        this.#inputs = [];
    }
}

module.exports = FileManager;