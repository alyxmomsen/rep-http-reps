




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


// /**
//  * @throws 
//  * nothing
//  * @param {Object} schema 
//  * @param {Object} data 
//  */
// function mapper (schema, data) {

//     const entries = Object.entries(schema)
//     for (const [prop, [action,payload]] of entries) {
//         console.log({ prop, action, payload });

//         action({payload, cb:mapper, data});
//     }
    

// }




/**
 * 
 * @description
 * initiator is that...
 * @param {Object} data 
 * @param {string[]} initiatorPropStack 
 * @param {{
 *  tableName: Function,
 *  groupId: Function,
 *  propertyRegular: Function,
 *  propertyFile: Function,
 * }} actions 
 * @returns 
 */
function dataSetMapper(data, initiatorPropStack, actions) {
    // console.log(`dataSetMapper/start:`, actions);
    const collections = [];
    const actionresult = [];
    for (const [prop, value] of Object.entries(data)) {

        console.log(`dataSetMapper: ${prop}` , initiatorPropStack);

        const [actionName, actionPayload] = value;

        // console.log(`dataSetMapper/iteration: `, prop, value);

        /**
         * @type {Function|undefined}
         */
        const action = actions[actionName];

        if (!action) {
            throw new Error(`dataSetMapper: action ${actionName} is not received`);
        }

        // console.log({prop, action, payload});
        const res = action({
            payload: actionPayload,
            cb: (data, initiatorPropStack) => dataSetMapper(data, initiatorPropStack, actions),
            prop,
            initiatorPropStack: initiatorPropStack
        });
        actionresult.push(res);
    }
    
    collections.push(actionresult);
    // console.log('\x1b[32dataSetMapper: ',{ actionresult, collections },'\x1b[0m');
    
    return collections;

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

module.exports = { dataSetMapper: dataSetMapper }

function colorizer() {

    /**
     * 
     * @param {string} data 
     * @returns {string}
     */
    const toUpperCase = (data) => data.toUpperCase()

    /**
     * 
     * @param {string|number} color 
     * @param {string} valueStr 
     * @param {boolean} uppercase 
     * @returns 
     */
    const fn = (color, valueStr, uppercase = false) => {
        
        return `x1b[${color}m` + uppercase ? toUpperCase(valueStr) : valueStr  + `x1b[0m`;
    }
    return fn;
}