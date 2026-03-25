

class DataTransformer {

    process(schema, dataSet, context) {

        for (const [schemaKey, schemaModel] of Object.entries(schema)) {

            const newProperty = 
                schemaKey.startsWith('__') 
                    ? dataSet[schemaKey.replace('__', '')] 
                    : schemaKey;
            
            
            console.log({schemaKey, schemaModel, newProperty});
            
            const { children, value } = schemaModel;

            if(children) {

                console.log(`\x1b[31m` + 'children' + '\x1b[0m');
                
                if(context[newProperty] === undefined) {
                    const childContext = this.process(children, dataSet, {});
                    context[newProperty] = childContext;
                    console.log(`\x1b[33mchildContext:`, {childContext} , '\x1b[0m');
                }
                else {
                    const newValue = this.process(children, dataSet, context[newProperty]);
                    
                    for (const [k, v] of Object.entries(newValue)) {
                        console.log(`\x1b[33minner context:` + {k,v} + '\x1b[0m');
                        
                        context[newProperty][k] = v;
                    }


                }

            }
            else {
                context[newProperty] = 
                        value.key.startsWith('__') 
                            ? dataSet[value.key.replace('__', '')] 
                            : value.key;
            }

        }

        return context;
    }

    constructor () {

    }
}

module.exports = { DataTransformer }