const multipartHanldler = require("./services/multipart/multipatr");

async function handleForm (req , res) {
    
    const { headers } = req; 

    const contentTypeHeader = headers['content-type'];

    if(!contentTypeHeader) {
        res.writeHead(400);
        res.end();
    }

    const [contentType , contentTypeAttr] = contentTypeHeader.split('; ');

    const factory = await contentTypeMatcherFactory({contentType});

    const matchers = [
        await factory('multipart/form-data' , {contentTypeAttr} , multipartHanldler),
        await factory('application/x-www-form-urlencoded' , {} , async (req , res , payload) => {
            console.log('application/x-www-form-urlencoded' , {payload});
        }),
        await factory('text/plain' , {} , async (req , res , payload) => {
            console.log('text/plain' , {payload});
        }),
    ] ;

    for (const matcher of matchers) {
        const handler = await matcher();
        if(!handler) continue ;
        await handler(req ,res);
        return ;
    }
}

module.exports = handleForm ;

async function contentTypeMatcherFactory(context) {

    const { contentType } = context ;
    
    return async (testContentType , payload , handler) => {

        return async () => {

            if(testContentType === contentType ) {
    
                return async (req , res) => {
                    
                    await handler(req ,res , payload);
                }
            }
    
            return null;
        }
        
    }
}