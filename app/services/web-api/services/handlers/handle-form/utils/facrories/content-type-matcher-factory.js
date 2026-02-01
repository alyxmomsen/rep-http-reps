
async function contentTypeMatcherFactory (contentTypeMatcherString , payload , handler) {
        console.log(`call matcher factory...`);
    return async (testContenTypeString) => {
        console.log(`call matcher...` , {testContenTypeString , contentTypeMatcherString});
        if(testContenTypeString === contentTypeMatcherString) {
            console.log(`match!! `);
            return async (formdata) => {
                console.log(`call handler wrappper ...`);
                
                await handler(formdata , payload);
            }
        }

        return null ;
    }
}

module.exports = contentTypeMatcherFactory ;