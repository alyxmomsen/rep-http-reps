const SCHEMA = {
    __tableName__:{ //  < data[__tableName[outerDataKey]] >
        type:'object',
        outerDataKey:'tableName',
        schema:{
            __groupId__:{ //  < data[__groupId[outerDataKey]] >
                type:'object',
                outerDataKey:'groupId',
                schema:{
                    __columnName:{ //  < __columnName[outerDataKey] >
                        type:'object',
                        outerDataKey:'columnName',
                        schema:{
                            fileName:{ //  < __fileName[outerDataKey] >
                                type:'string',
                                outerDataKey:'fileName',
                                schema:null,
                            },
                            fileMIME:{ //  < __fileMIME[outerDataKey] >
                                type:'string',
                                outerDataKey:'fileMIME',
                                schema:null,
                            },
                            fileBody:{ //  < __fileBody[outerDataKey] >
                                type:'string',
                                outerDataKey:'fileBody',
                                schema:null,
                            },
                        },
                    },
                },
            },
        },
    }, 
}

/**
 * 
 * @param {Object.<string,Object>} schema 
 * @param {Object.<string,any>} outerData 
 * @returns 
 */
const constructorReqursive = (schema, outerData, struct) => {

    // const struct = {};

    /* 
        const demo_struct = {
            'files':{
                'aa':{
                    'title':'title',
                    'description':'description',
                    'body':'body',
                }
            }
        }

    */
    
    for (const [propertykey, propertyvalue] of Object.entries(schema)) {
        
        const {type:dataType, schema, outerDataKey} = propertyvalue;

        if(dataType === 'object' && schema !== null) {

            if(schema === null) {
                throw new Error(`incorrect schema value: given ${schema}`);
            }

            // const nestedStruct = constructorReqursive(schema, outerData);

            // допустим, outerDataKey = 'tableName', тогда
            // - по значению outerData[outerDataKey] будет , например, "files" или "users"
            // - тогда: struct["files"] = < результат рекурсивного парсинга >, т.е , 
            //  например {title:'foo', description:'bar'}
            if(struct[outerData[outerDataKey]] === undefined) {
                struct[outerData[outerDataKey]] = constructorReqursive(schema, outerData, {});
                continue;
            }

            const nestedStruct = constructorReqursive(schema, outerData, struct[outerData[outerDataKey]]);
            /* 
                если в труктуре уже есть данные, то 
                перебираем ключи новой структуры и добавляем их по одному
            */
            for (const [nestedStructKey, nestedStructValue] of Object.entries(nestedStruct)) {
                console.log({nestedStructKey});
                struct[outerData[outerDataKey]][nestedStructKey] = nestedStructValue;
            }

            continue;
        }

        /* 
            в текущую структуру будет добавлен ключ из СХЕМЫ, например "title"  
            а значение из внешнего источника , например "my title"
        */
        struct[outerDataKey] = outerData[outerDataKey];


    }

    return struct;
}

module.exports = { constructorReqursive, SCHEMA }