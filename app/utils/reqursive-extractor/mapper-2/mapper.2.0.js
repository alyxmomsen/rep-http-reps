const { PropType: MapperSchemaPropType, PropType, MY_TEST_SCHEMA, ValueType } = require("./schemas/test-schema");


const incomingDataGenerator = (index, columnName, groupId, tableName ) => {

    return {
        fileMIME:`fileMIME data-#${index}`,
        fileName:`fileName data-#${index}`,
        fileBody:`fileBody data-#${index}`,
        dataType:`dataType data-#${index}`,
        columnName:`${columnName}`,
        groupId:`${groupId}`,
        tableName:`${tableName}`,
    }
} 

const incomingData = [
    incomingDataGenerator(8,'description','dd'.toUpperCase(),'files'),
    incomingDataGenerator(3,'title','bb'.toUpperCase(),'users'),
    incomingDataGenerator(7,'title','dd'.toUpperCase(),'files'),
    incomingDataGenerator(6,'description','cc'.toUpperCase(),'files'),
    incomingDataGenerator(4,'description','bb'.toUpperCase(),'users'),
    incomingDataGenerator(1,'title','aa'.toUpperCase(),'users'),
    incomingDataGenerator(5,'title','cc'.toUpperCase(),'files'),
    incomingDataGenerator(2,'description','aa'.toUpperCase(),'users'),
];

class Mapper {

    process(schema, source, context) {


        console.log({schema, source, context});

        let iter = 0;

        for (const [k, v] of Object.entries(schema)) {

            iter++;
            // extract data from {v}
            const { property, value } = v;

            if(property === undefined || value === undefined) {
                throw new Error(`incorrect schema`.toUpperCase());
            }

            // init prop

            let newProp = null;
            try {
                newProp = property.type ===  PropType.Dinamic ? source[property.srcPath] : property.staticKey ;
            }
            catch (err) {
                console.log({err});
                break;
            }

            // log repoprt
            console.log({newProp});

            // mutation

            if(context[newProp] === undefined) {

                 // init value

                let newValue = null ;
                try {
                    console.log({iter});
                    newValue = 
                        value.type === ValueType.Branch 
                            ? this.process(value.src.schema, source, context[newProp]) 
                            : source[value.src.path];
                }
                catch (err) {
                    console.log({err})
                    break;
                }

                context[newProp] = newValue;
            }
            else {
                console.log(`\x1b[38;2;255;0;64m` + 'check start'.toUpperCase() + `\x1b[0m`);
                for (const [k_, v_] of Object.entries(newValue)) {
                    console.log({k_, v_});
                    context[newProp][k_] = v_
                }
                console.log(`\x1b[38;2;255;0;64m` + 'check end'.toUpperCase() + `\x1b[0m`);
            }
        }

        return context ;
    }

    #schema;

    constructor (schema) {
        this.#schema = schema ;
    }
}


const mapper = new Mapper(MY_TEST_SCHEMA);

const context = {};

incomingData.forEach(data => {
    console.log('data path trouth');
    mapper.process(MY_TEST_SCHEMA, data, context);
});

console.log('detail result: ');
for (const [k, v] of Object.entries(context)) {
    console.log(k,'\n\n');
    for (const [k__, v__] of Object.entries(v)) {
        console.log({k__, v__});
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
