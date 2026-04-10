const SCHEMA = {
    __tableName__: {
        // <knot_id>
        type: 'object', // controller: если "object", то..
        inputDataKey: 'tableName', // <key> входящего объекта
        schema: {
            __groupId__: {
                // <knot_id>
                type: 'object',
                inputDataKey: 'groupId',
                schema: {
                    __columnName: {
                        // <knot_id>
                        type: 'object',
                        inputDataKey: 'columnName',
                        schema: {
                            fileName: {
                                // <knot_id>
                                type: 'string', // значение отличное от "object"
                                inputDataKey: 'fileName',
                                schema: null,
                            },
                            fileMIME: {
                                // <knot_id>
                                type: 'string',
                                inputDataKey: 'fileMIME',
                                schema: null,
                            },
                            fileBody: {
                                // <knot_id>
                                type: 'string',
                                inputDataKey: 'fileBody',
                                schema: null,
                            },
                        },
                    },
                },
            },
        },
    },
};

/* 

    работает с двумя кейсами

    case #1

    fileBody:{ //  < __fileBody[inputDataKey] >
        type:'string',
        inputDataKey:'fileBody',
        schema:null,
    },

    case #2

    fileMIME:{ //  < __fileMIME[inputDataKey] >
        type:'string',
        inputDataKey:'fileMIME',
        schema:null,
    },

*/

/* резуьтат работы
    
    const demo_result_struct = {
        // case #1 : schema[<knot_id>]['type] === 'object'
        // динамичный <property_key>, 
        // будет взято из входящего объекта по правилу:
        // schema[<knot_id>]['inputDataKey']
        'files':{ 
            // case #1
            'aa':{ 
                // case #2 : schema[<knot_id>]['type] !== 'object'
                // статичный <property_key>
                // извлекается из <schema> по правилу:
                // schema[<knot_id>]['inputDataKey']
                'title':'title',
                // case #2
                'description':'description',
                // case #2
                'body':'body',
            }
        }
    }
*/

const NodeTypes = {
    DINAMIC: 'dinamic',
    STATIC: 'static',
    LEAF: 'leaf',
};

/**
 * @description
 *  обновляет [mutableUpdateObject] на основании [inputData]
 *  в соответствии с правилами схемы [schema]
 * @param {Object.<string,Object>} schema
 *
 * @param {Object.<string,any>} inputData
 * @returns
 */
const constructorReqursive = (schema, inputData, mutableUpdateObject) => {
    for (const [knot_id, propertyvalue] of Object.entries(schema)) {
        // switch () {

        // }

        const { type: dataType, schema, inputDataKey } = propertyvalue;

        if (dataType === 'object' && schema !== null) {
            if (schema === null) {
                console.log(
                    `\x1b[38;2;255;128;32m` +
                        `incorrect schema, provided not inner-schema for the <knot_Id> ${knot_id}`.toUpperCase() +
                        '\x1b[0m'
                );
                throw new Error(
                    `code: incorrect schema, provided not inner-schema for the <knot_Id> ${knot_id}`
                );
            }

            if (inputData[inputDataKey] === undefined) {
                console.log(
                    `\x1b[38;2;255;128;32m` +
                        `invalid proveded object data property value`.toUpperCase() +
                        '\x1b[0m'
                );
                throw new Error(`code: 2`);
            }

            // допустим, inputDataKey = 'tableName', тогда
            // - по значению outerData[inputDataKey] будет , например, "files" или "users"
            // - тогда: struct["files"] = < результат рекурсивного парсинга >, т.е ,
            //  например {title:'foo', description:'bar'}
            if (mutableUpdateObject[inputData[inputDataKey]] === undefined) {
                mutableUpdateObject[inputData[inputDataKey]] =
                    constructorReqursive(schema, inputData, {});
                continue;
            }

            const nestedStruct = constructorReqursive(
                schema,
                inputData,
                mutableUpdateObject[inputData[inputDataKey]]
            );
            /* 
                если в <mutableUpdateObject> уже есть данные, то 
                перебираем ключи <nestedStruct> структуры добавляя их по-одному
            */
            for (const [nestedStructKey, nestedStructValue] of Object.entries(
                nestedStruct
            )) {
                console.log({ nestedStructKey });
                mutableUpdateObject[inputData[inputDataKey]][nestedStructKey] =
                    nestedStructValue;
            }

            continue;
        }

        /* 
            в текущую структуру будет добавлен ключ из текущей <schema>, например "title"  
            а значение будет взято из <inputData[inputDataKey]> , например "my title"
        */
        mutableUpdateObject[inputDataKey] = inputData[inputDataKey];
    }

    return mutableUpdateObject;
};

module.exports = { constructorReqursive, SCHEMA };
