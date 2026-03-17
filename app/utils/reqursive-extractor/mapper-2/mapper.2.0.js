const { PropType: MapperSchemaPropType, PropType } = require("./schemas/test-schema");

class Mapper {

    process(schema, data, context) {

        for (const [k, v] of Object.entries(schema)) {

            console.log('check', {k,v});
            const { keyPath, schema:nestedSchema, propType } = v;

            switch (propType) {

                case PropType.Dinamic:
                    
                    const propertyName = data[keyPath];

                    if(propertyName === undefined) {
                        console.log({propertyName,keyPath});
                        throw new Error(`invalid incoming data`);
                    }
                    
                    if(context[propertyName] === undefined) {

                        if(nestedSchema) {
                            context[propertyName] = this.process(nestedSchema, data, {}) ;
                            continue;
                        }

                        continue;
                    }
                
                    break;
                case PropType.Static:
                    //
                    break;
                
            }

            if(nestedSchema) {
                for (const [k_, v_] of this.process(nestedSchema, data, context[propertyName])) {
                    context[propertyName][k_] = v_;
                }
            }
        }

        return context ;
    }

    #schema;

    constructor (schema) {
        this.#schema = schema ;
    }
}

module.exports = { Mapper };

const reult = {
    'files':{
        'g1':{
            'title':{
                filename:'hello.txt',
                contentType:'video/mpeg4',
                data:'81723817238172398',
            },
            'description':{
                filename:'hello.txt',
                contentType:'video/mpeg4',
                data:'81723817238172398',
            },
        },
        'g2':{
            'title':{
                filename:'hello.txt',
                contentType:'video/mpeg4',
                data:'81723817238172398',
            },
            'description':{
                filename:'hello.txt',
                contentType:'video/mpeg4',
                data:'81723817238172398',
            },
        },
    },
    'users':{
        'g3':{
            'title':{
                filename:'hello.txt',
                contentType:'video/mpeg4',
                data:'81723817238172398',
            },
            'description':{
                filename:'hello.txt',
                contentType:'video/mpeg4',
                data:'81723817238172398',
            },
        },
        'g4':{
            'title':{
                filename:'hello.txt',
                contentType:'video/mpeg4',
                data:'81723817238172398',
            },
            'description':{
                filename:'hello.txt',
                contentType:'video/mpeg4',
                data:'81723817238172398',
            },
        },
    },
}