




// const Values = {
//     CHILDS:'__childs__',
// }

// const Validators = {
//     Buffer: (testValue) => {
//         if (testValue instanceof Buffer === false) {
//             throw new Error(`required Buffer`);
//         }
//     },
//     String: (testValue) => {
//         if (typeof testValue !== "string") {
//             throw new Error(`required string`);
//         }
//     },
// }

// const { CHILDS } = Values;

// const schema = {

//     files: [
//         childsAction,
//         {
//             __tableName: [
//                 childsAction,
//                 {
//                     __groupId: [
//                         childsAction,
//                         {
//                             originalFileName: [
//                                 finalAction,
//                                 {
//                                     validator:Validators.String,
//                                 },
//                             ],
//                             mime: [
//                                 finalAction,
//                                 {
//                                     validator:Validators.String,
//                                 },
//                             ],
//                             file: [
//                                 finalAction,
//                                 {
//                                     validator:Validators.String,
//                                 },
//                             ],

//                         }
//                     ]
//                 }
//             ]
//         }
//     ],
//     fields: [
//         childsAction,
//         {
//             __tableName: [
//                 childsAction,
//                 {
//                     __groupId: [
//                         childsAction,
//                         {
//                             columName: [
//                                 finalAction,
//                                 {
//                                     validator: Validators.String,
//                                 }
//                             ],
//                             data: [
//                                 finalAction,
//                                 {
//                                     validator: Validators.Buffer,
//                                 }
//                             ],
//                             dataType: [
//                                 finalAction,
//                                 {
//                                     validator: Validators.String,
//                                 }
//                             ],
//                         }
//                     ]
//                 }
//             ],
//         }
//     ],
// };

// /**
//  *
//  * @param {{payload:Object,cb:Function}} payload
//  */
// function childsAction(payload) {
//     const { payload: childs, cb: parseChilds, data, prop } = payload;
//     /**
//      *
//      * data example:
//      *
//      * {
//      *     'tableName':{
//      *         '00':{
//      *
//      *         }
//      *     }
//      *
//      * }
//      *
//      *
//      *
//      * '__' означает любая строка
//      */
//     if (prop.startsWith('__')) {
        
//     }

//     parseChilds(childs);
// }

// /**
//  *
//  * @param {Object} payload
//  */
// function finalAction(payload) {
//     const { payload: pl, cb:_, data} = payload;
//     const { validator } = pl;
//     validator(data);
// }

/**
 * 
 * @param {Object} data 
 * @param {any[]} parentCallStack 
 * @param {{
 *  a:Function;
 *  b:Function;
 * }} actions 
 * @throws {Error} if somthing 
 */
async function dataSetMapper(data, parentCallStack, actions) {
    
    // console.dir(data, {depth:10});

    console.log(`dataSetMapper: start`);
    // console.dir(data, {
    //     depth:10,
    // });

    const collection = {};
    
    for (const [propKey, config] of Object.entries(data)) {

        const currentIterationCallStack = [];

        const [actionName, actionPayload] = config;
        
        /**
         * @description
         * meta.title для трассировки 
         * 
         * @type {string}
         * 
         */
        const metaTitle = actionPayload?.meta?.title;

        /**
         * проверяем содержатся ли ожидаемые поля
         */
        if (!actionPayload || !actionPayload.meta || !actionPayload.value) {
            throw new Error(`dataSetMapper: actionPayload|actionPayload.meta|actionPayload.value required`);
        }

        // console.log(`dataSetMapper: `, { propKey, config, metaTitle });
        
        currentIterationCallStack.push({
            propKey: propKey,
            propDescription:metaTitle
        });
        
        // console.log(`dataSetMapper/show callstack: `, {callStack: parentCallStack});

        const action =
            (actionName === 'tableName' || actionName === 'groupId')
                ? actions.a : actions.b;
        
        
        if (!action) {
            throw new Error(`dataSetMapper: error: action is not received`);
        }

        const actionResult = await action({
            reqFn: dataSetMapper,
            actionPayload: actionPayload.value,
            callStack: [...parentCallStack, ...currentIterationCallStack],
            // callStack: [...parentCallStack, ...currentIterationCallStack],
            actions,
        });    

        for (const [k, v] of Object.entries(actionResult)) {
            collection[k, v]
        }

        // console.log({ actionResult });
        
        collection[metaTitle] = actionResult;
    }

    return collection;

}

/**
 * 
 * @param {Object} schema 
 * @param {Object} data 
 */
function mapper_(schema, data) {

    const dataKeys = Object.keys(data);
    const schemaKeys = Object.keys(schema);

    const validatedKeys = [];

    let schemaKey;
    while (schemaKey = schemaKeys.pop()) {
        console.log({ schemaKey });
        if (schemaKey.startsWith('__')) {
            
        }
        else {
            if (dataKeys.includes(schemaKey)) {
                console.log(data[schemaKey]);
            }
            else {
                throw new Error(`no key ${schemaKey} in the data`);
            }
        }
    }
    
    // for (const [prop, value] of Object.entries()) {

    //     // const Object.entries(schema);

    //     // const schemaProp = schema[prop]

    // }
}



// module.exports = { dataSetMapper: dataSetMapper, DataSetProcessor }
