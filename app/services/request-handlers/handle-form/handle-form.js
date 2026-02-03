const multipartHanldler = require("./services/multipart/multipatr");

async function handleForm (req , res) {
    
    const { headers } = req; 

    const contentTypeHeader = headers['content-type'];

    if(!contentTypeHeader) {
        res.writeHead(400);
        res.end();
    }

    const [contentType , contentTypeAttr] = contentTypeHeader.split('; ');

    console.log({contentType: contentTypeHeader});

    res.end(JSON.stringify({hello:'there'}));

    const factory = await contentTypeMatcherFactory(req ,res , {contentType});

    const matchers = [
        factory('multipart/form-data' , {contentTypeAttr} , multipartHanldler),
        factory('application/x-www-form-urlencoded' , {} , (req , res , payload) => {
            console.log('application/x-www-form-urlencoded' , {payload});
        }),
        factory('text/plain' , {} , (req , res , payload) => {
            console.log('text/plain' , {payload});
        }),
    ] ;

    for (const matcher of matchers) {
        const handler = matcher();
        if(!handler) continue ;
        handler();
    }

}

module.exports = handleForm ;

async function contentTypeMatcherFactory(req ,res , context) {

    const { contentType } = context ;
    
    return (testContentType , payload , handler) => {

        return () => {

            if(testContentType === contentType ) {
    
                return async () => {
                    
                    handler(req ,res , payload);
                }
            }
    
            return null;
        }
        
    }
}