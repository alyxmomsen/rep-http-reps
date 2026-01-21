const { randomBytes } = require("node:crypto");

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

module.exports = { contentTypeMatcherFactory ,factoryDecorator }