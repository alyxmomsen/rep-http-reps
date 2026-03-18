const { PropType: MapperSchemaPropType, PropType, MULTITABLE_DATA_SCHEMA: MY_TEST_SCHEMA, ValueType } = require("./schemas/multitable-data-schema");

// testing solution
//
// const dataSetGenerator = (postfix, columnName, groupId, tableName, keyMod='hello' ) => {

//     return {
//         [`fileMIME`]:`fileMIME data-#${postfix}`,
//         [`fileName`]:`fileName data-#${postfix}`,
//         [`fileBody`]:`fileBody data-#${postfix}`,
//         [`dataType`]:`dataType data-#${postfix}`,
//         [`columnName`]:`${columnName}`,
//         [`groupId`]:`${groupId}`,
//         [`tableName`]:`${tableName}`,
//     }
// } 

// const incomingData = [
//     dataSetGenerator(8,'description','dd'.toUpperCase(),'files'),
//     dataSetGenerator(3,'title','bb'.toUpperCase(),'users'),
//     dataSetGenerator(33,'title','ee'.toUpperCase(),'files' , 'foobar`'),
//     dataSetGenerator(7,'title','dd'.toUpperCase(),'files'),
//     dataSetGenerator(6,'description','cc'.toUpperCase(),'files'),
//     dataSetGenerator(4,'description','bb'.toUpperCase(),'users'),
//     dataSetGenerator(1,'title','aa'.toUpperCase(),'users'),
//     dataSetGenerator(5,'title','cc'.toUpperCase(),'files'),
//     dataSetGenerator(5,'title','ee'.toUpperCase(),'files'),
//     dataSetGenerator(2,'description','aa'.toUpperCase(),'users'),
//     dataSetGenerator(5,'foo','dd'.toUpperCase(),'files'),
//     dataSetGenerator(2,'bar','bb'.toUpperCase(),'users'),
//     dataSetGenerator(5,'foo','dd'.toUpperCase(),'files'),
//     dataSetGenerator(2,'bar','dd'.toUpperCase(),'users'),
// ];

class Mapper {

    process(schema, source, context) {

        for (const [k, v] of Object.entries(schema)) {
            // extract data from {v}
            const { property, value } = v;

            if(property === undefined || value === undefined) {
                throw new Error(`incorrect schema`.toUpperCase());
            }

            /* property setting
                проперти можно устанавливать без опасения что-то сломать
            */
            let newProp = null;
            try {
                newProp = property.type ===  PropType.Dinamic ? source[property.srcPath] : property.staticKey ;
            }
            catch (err) {
                console.log({err});
                break;
            }

            /* context property setting
            проверяем если в переданом контексте такой проперти */
            if(context[newProp] === undefined) {

                context[newProp] = value.type === ValueType.Branch 
                    ? this.process(value.src.schema, source, {}) 
                    : source[value.src.path]
            }
            else {
                if(value.type === ValueType.Branch) {

                    const newValue = this.process(value.src.schema, source, context[newProp]) 

                    for (const [k_, v_] of Object.entries(newValue)) {
                        console.log({k_,v_});
                        context[newProp][k_] = v_
                    }
                }
                else {
                    context[newProp] = source[value.src.path] ;
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

// testing solution
//
// const mapper = new Mapper(MY_TEST_SCHEMA);

// const context = {};

// incomingData.forEach(data => {
//     console.log('data path trouth');
//     mapper.process(MY_TEST_SCHEMA, data, context);
// });

// console.log('detail result: ');
// for (const [k, v] of Object.entries(context)) {
//     console.log(k,'\n\n');
//     for (const [k__, v__] of Object.entries(v)) {
//         console.log({k__, v__});
//     }
// }


// expected result like
// const reult = {
//     'files':{
//         'g1':{
//             'title':{
//                 filename:'hello.txt',
//                 contentType:'video/mpeg4',
//                 data:'81723817238172398',
//             },
//             'description':{
//                 filename:'hello.txt',
//                 contentType:'video/mpeg4',
//                 data:'81723817238172398',
//             },
//         },
//         'g2':{
//             'title':{
//                 filename:'hello.txt',
//                 contentType:'video/mpeg4',
//                 data:'81723817238172398',
//             },
//             'description':{
//                 filename:'hello.txt',
//                 contentType:'video/mpeg4',
//                 data:'81723817238172398',
//             },
//         },
//     },
//     'users':{
//         'g3':{
//             'title':{
//                 filename:'hello.txt',
//                 contentType:'video/mpeg4',
//                 data:'81723817238172398',
//             },
//             'description':{
//                 filename:'hello.txt',
//                 contentType:'video/mpeg4',
//                 data:'81723817238172398',
//             },
//         },
//         'g4':{
//             'title':{
//                 filename:'hello.txt',
//                 contentType:'video/mpeg4',
//                 data:'81723817238172398',
//             },
//             'description':{
//                 filename:'hello.txt',
//                 contentType:'video/mpeg4',
//                 data:'81723817238172398',
//             },
//         },
//     },
// }
