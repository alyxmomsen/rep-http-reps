const { randomBytes } = require("crypto");
const { readFile } = require("fs/promises");
const { join } = require("path");

const fallbackresponse = (res ,message) => {
    
    console.log(message);
}

async function handleFormData(req , res) {
    
    const { headers } = req; 

    const contenTypeHeader = headers['content-type'];

    console.log({contenTypeHeader});

    if(contenTypeHeader === undefined) {
        fallbackresponse(res , 'no content-type header');
        return ;
    }

    const [contentTypeStr , ...attr] = contenTypeHeader.split('; ');

    console.log({contenTypeHeader , contentTypeStr , attr});
    
    const matcherFactory = await factoryDecorator(contentTypeStr);
    
    const matchers = [
        await matcherFactory(
            'multipart/form-data' , handleMultipartData , {contenTypeHeader}
        ) ,
        await matcherFactory('application/x-www-form-urlencoded' , (dataBuffer , payload) => {
            console.log(`application/x-www-form-urlencoded handler`);
        } , {}) ,
        await matcherFactory('text/plain' , (dataBuffer , payload) => {
            console.log(`text/plain handler`);
        } , {}) ,
    ];

    let totalSize = 0 ;
    let dataBufferChunks = [] ;
    req.on('data' , async (chunk) => {
        totalSize += chunk.length; 
        dataBufferChunks.push (chunk);
    });

    req.on('end' , async () => {

        
        const wholeBufferData = Buffer.concat(dataBufferChunks);

        
        for (const matcher of matchers) {
            const handlerLike = await matcher();

            console.log({handlerLike});

            if(handlerLike === null) continue ;
            const handler = handlerLike ;
            handler(wholeBufferData);
        }

        try {
            const file = await readFile(join('.' , 'view' , 'form.html'));
            res.end(file);
            return ;
        }
        catch (e) {
            console.log('handle form error' , {e});
            res.end('handle form error');
            return ;
        }
    });
}

module.exports = handleFormData ;

async function handleFormInputDataPart(dataBufferPart , behavior) {

    console.log(dataBufferPart);

    behavior();

}

async function _splitBuffer (buffer , separator) {
    
    const parts = [];
    let start = 0 ;
    let index = 0 ;

    while ((index = await _findIndex(buffer , separator , start)) !== -1) {
        
        const partBuffer = buffer.subarray(start , index);
        parts.push(partBuffer);
        start = index + separator.length ;
        if(buffer[start] === 0x0d && buffer[start + 1] === 0x0a) {
            start += 2 ;
        }
    }

    parts.push(buffer.subarray(start));

    return parts ;
}

async function _findIndex (buf , sep , start = 0) {
    
    for (let index = start ; index < buf.length - sep.length; index++) {
        let found = true ;
        for (let j = 0 ; j < sep.length; j++) {
            
            if(buf[index + j] !== sep[j]) {
                found = false;
                break ;
            }
        }
        if(found === true ) return index ;
    }

    return -1 ;
}


async function handleMultipartData(dataBuffer , payload) {

    const {contenTypeHeader}  = payload ;

    const boundaryMatch = contenTypeHeader.match(/boundary=(----[^$;\s]+)/);
    if(boundaryMatch === null) {
        console.log('no boundary');
        return ;
    }
    const boundaryString = `--${boundaryMatch[1]}` ;
    const boundaryBuffer = Buffer.from(boundaryString);
    
    console.log(`multipart handler`);


    console.log(`call multipart handler ${randomBytes(32).toString('hex')}`);
    const dataBufferParts = await _splitBuffer(dataBuffer , boundaryBuffer);
        
    for (const dataBufferPart of dataBufferParts) {

        await handleFormInputDataPart(dataBufferPart , async () => {console.log(`input data handler`)});
    }
}

const x = randomBytes(32).toString("hex") ;

async function factoryDecorator(headerContentTypeData) {
    console.log(`call global decorator... ${x}`);
    // decorated matcher factory 
    return async (contentTypeTemplate , handler , payload) => {
        console.log(`call factory ${x}`);
        // matcher factory wrapper
        return async () => {
            console.log(`call matcher ${x}`);
            return await contentTypeMatcherFactory(contentTypeTemplate , handler , headerContentTypeData , payload);
        }
    } ;
}

async function contentTypeMatcherFactory(contentTypeTemplate , handler , headerContentTypeData , payload) {

    console.log(`call matcher behavior...`);
    
    if(contentTypeTemplate === headerContentTypeData){
        
        return async (dataBuffer) => {

            await handler(dataBuffer , payload);
        }
    } 
    
    return null ;
    
}