const {
    PropType: MapperSchemaPropType,
    PropType,
    MULTITABLE_DATA_SCHEMA: MY_TEST_SCHEMA,
    ValueType,
} = require('./schemas/multitable-data-schema');

class Mapper {
    process(schema, source, context) {
        for (const [k, v] of Object.entries(schema)) {
            const { property, value } = v;

            if (property === undefined || value === undefined) {
                throw new Error(`incorrect schema`.toUpperCase());
            }

            let newProperty = null;

            try {
                newProperty =
                    property.type === PropType.Dinamic
                        ? source[property.srcPath]
                        : property.staticKey;
            } catch (err) {
                console.log({ err });
                break;
            }

            if (context[newProperty] === undefined) {
                context[newProperty] =
                    value.type === ValueType.Branch
                        ? this.process(value.src.schema, source, {})
                        : source[value.src.path];
            } else {
                if (value.type === ValueType.Branch) {
                    const newValue = this.process(
                        value.src.schema,
                        source,
                        context[newProperty]
                    );

                    for (const [k_, v_] of Object.entries(newValue)) {
                        context[newProperty][k_] = v_;
                    }
                } else {
                    context[newProperty] = source[value.src.path];
                }
            }
        }

        return context;
    }

    constructor() {}
}

// module.exports = { Mapper };

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
