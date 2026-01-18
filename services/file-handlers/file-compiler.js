const { kMaxLength } = require("buffer");
const _behavior = require("./file-compiler-behaviors");
const { Readable } = require("stream");
const { createWriteStream } = require("fs");
const { join } = require("path");

class FileManager {

    async upload() {

        const { files , queue } = await this.#compileFiles();
        // this.#executeUpload(files , queue);
        for (const [key , value] of Object.entries(files)) {
            console.log({key , value});
        }
    }

    async #executeUpload(files , queue) {

        for (const [key , bundle] of Object.entries(files)) {

            console.log({bundle});

            const body = bundle.body;

            if (!body.length) continue;
            
            const readstream = Readable.from(bundle.body);

            const extresolver = (contenttype) => {
                const mime = {
                    'audio/mpeg':'mp3',
                    'text/plain':'txt',
                    'video/mp4':'mp4',
                };
                return mime[contenttype] || null;
            }

            const ext = extresolver(bundle.contentType);
            // if(bundle.title && ext && )

            const path = join('.', 'upload');
            const prefix = `.${Date.now()}`;
            const filename = bundle.title && ext ? `${bundle.title}.${ext}` : bundle.filename || null;
            
            const fullpath = join(path , `${prefix}.${filename}`);

            const writeStream = createWriteStream(fullpath);

            readstream.pipe(writeStream);

            // console.log({ path, filename  , fullpath});
        }
    }

    async #compileFiles() {

        const files = {};
        const queue = [];
        
        for (let i = 0; i < this.#inputs.length; i++) {

            const inputBoundary = this.#inputs[i];

            console.log({inputBoundary});

            const type = inputBoundary.type;
            
            const resolvers = [
                await resolverFactory('file', (files ,inputBoundary) => {
                    fileCaseHandler(files , inputBoundary);
                }) ,
                await resolverFactory('caption', (files ,inputBoundary) => {
                    captionCaseHandler(files , inputBoundary);
                }) ,
                await resolverFactory('option', (files ,inputBoundary) => {
                    optionCaseHandler(files , inputBoundary);
                }) ,
            ]

            resolvers.forEach(resolver => {
                const handlerLike = resolver(type, inputBoundary);
                if (handlerLike !== null) handlerLike(files);
            });

            console.log({files});
        }

        return {
            files,
            queue ,
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
        
        const result = behavior(nameInputValue);
        
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

async function resolverFactory (type , handler) {
    
    return ( _type , inputBoundary) => {

        if (type === _type) {

            return (files) => {
                
                handler(files , inputBoundary );
            }
        }

        return null;
    }
}

async function fileCaseHandler (files , inputBoundary) {
    const targetId = inputBoundary.subjectId;
    const fileByTargetId = files[targetId] || {};

    if (fileByTargetId === undefined) {
        
        fileByTargetId =  {};
    }

    if (inputBoundary.body === undefined || !inputBoundary.body.length) return;

    for (const [key , value] of Object.entries(inputBoundary)) {

        if (key === 'type') continue;
        fileByTargetId[key] = value;
    }

    files[targetId] = fileByTargetId;
}

async function captionCaseHandler (params) {
    const targetId = inputBoundary.targetId;
    const fileByTargetId = files[targetId];
    
    if (fileByTargetId === undefined) return;

    if (fileByTargetId.captions === undefined) {
        fileByTargetId.captions = {};
    }

    const captions =  fileByTargetId.captions;

    captions[inputBoundary.subjectName] = inputBoundary.body;
}

async function optionCaseHandler (params) {
    const targetId = inputBoundary.targetId;
    const fileByTargetId = files[targetId];
    
    if (fileByTargetId === undefined) return;

    if (fileByTargetId.options === undefined) {
        fileByTargetId.options = {};
    }

    const options =  fileByTargetId.options;

    options[inputBoundary.subjectName] = inputBoundary.body;
}