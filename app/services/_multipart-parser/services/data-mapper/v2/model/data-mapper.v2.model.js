
/**
 * @typedef {Object} DataMapperIncommingDataSet
 * @property {string} contentType 
 * @property {Buffer<ArrayBuffer>} body 
 * @property {string} filename 
 * @property {string} dataType 
 * @property {string} columnName 
 * @property {string} tableName 
 * @property {string} groupId 
 * @property {string} [linkId] 
 */

const Actions = {
    /**
     * 
     * @param {{
     *  actionPayload:Object;
     *  reqursiveCallFn:(schema:Object,dataSet:Object,context:Object) => any;
     *  dataSet:Object;
     * }} payload 
     */
    'branch': (payload) => {
        console.log(`DataTransformer_2_0/Action/tableName/start`);
        const { actionPayload, reqursiveCallFn, dataSet, context } = payload;

        console.log({actionPayload, reqursiveCallFn, dataSet});

        const result = reqursiveCallFn(actionPayload, dataSet, context);
        
        console.log(`DataTransformer_2_0/Action/tableName/result`, {result});
        return result;
    },
    'leaf': (payload) => {
        
        const { actionPayload, reqursiveCallFn, dataSet } = payload;
        
        console.log('DataTransformer_2_0/Action/propertyRegular:', actionPayload, dataSet);

        const { data, dataType } = actionPayload;

        if (!data || !dataType) {
            throw new Error(`DataTransformer_2_0/Action/propertyRegular:both of dataType & data are required`);
        }
        
        return {
            data: data.startsWith('__') ? dataSet[data.replace('__', '')] : data,
            dataType: dataType.startsWith('__') ? dataSet[dataType.replace('__', '')] : dataType,
        };
    }, 
    // 'propertyFile': (payload) => {
        
    //     const { actionPayload, reqursiveCallFn, dataSet } = payload;
    //     // const result = reqursiveCallFn(actionPayload, dataSet, {});
    //     console.log('DataTransformer_2_0/Action/propertyFile:', actionPayload, dataSet);
    //     const { data, dataType } = actionPayload;
        
    //     if (!data || !dataType) {
    //         throw new Error(`DataTransformer_2_0/Action/propertyRegular:both of dataType & data are required`);
    //     }

    //     return {
    //         data: data.startsWith('__') ? dataSet[data.replace('__', '')] : data,
    //         dataType: dataType.startsWith('__') ? dataSet[dataType.replace('__', '')] : dataType,
    //     };
    // }, 
}

class DataMapper {

    /**
     * 
     * @param {Object} schema 
     * @param {DataMapperIncommingDataSet} dataSet 
     * @param {Object} context 
     * @returns 
     */
    process(schema, dataSet, context) {

        console.log(`DataTransformer_2_0/start: `, context, dataSet);

        const currentContext = context;

        for (const [schemaPropKey, schemaModel] of Object.entries(schema)) {

            const [actionName, actionPayload] = schemaModel;

            console.log('DataTransformer_2_0/iteration: ', {schema, dataSet, context});

            const parsedPropKey =
                schemaPropKey.startsWith('__')
                    ? this.#extractDataByKey(schemaPropKey.replace('__', ''),  dataSet)
                    : schemaPropKey;

            console.log('DataTransformer_2_0/parsed-key: ', parsedPropKey);
            

            if (!Actions[actionName]) {
                throw new Error(`DataTransformer_2_0/action-extracting: no action`)
            }

            const action = Actions[actionName];

            const actionResult = action({
                actionPayload,
                reqursiveCallFn: this.process.bind(this),
                dataSet,
                context: context[parsedPropKey]?.[1]?.value || {},
            });

            /**
             * 
             * 
             * 
             */
            const child = currentContext[parsedPropKey] || []
            const [innerAction, innerPayload] = child

            if (innerAction && innerPayload) {
                console.log('DataTransformer_2_0/trace-prop: (if)', parsedPropKey);
                // console.log(`\x1b[31mDataTransformer_2_0/dbug:\x1b[0m`, {actionName, actionResult, x:currentContext});
                for (const [k, v] of Object.entries(actionResult)) {
                    innerPayload.value[k] = v;
                }
                // currentContext[parsedPropKey] = innerPayload;
            }
            else {
                console.log('DataTransformer_2_0/trace-prop (else): ', parsedPropKey);

                // console.log(`\x1b[31mDataTransformer_2_0/dbug:\x1b[0m`, {actionName, actionResult, x:currentContext});

                currentContext[parsedPropKey] = [actionName, {
                    meta: {
                        title: schemaPropKey.startsWith('__') ? schemaPropKey.replace('__', '') : schemaPropKey,
                    }, value: actionResult
                }];
            }

            console.log('DataTransformer_2_0/action-result: ', {actionResult});
            
        }

        console.log(`DataTransformer_2_0/process-result: `, {currentContext});

        return currentContext;
    }

    #extractDataByKey(key, dataSet) {
        console.log(`DataTransformer_2_0/#extractDataByKey/dataSet: `, dataSet);
        const extractedDataByKey = dataSet[key];
        if (!extractedDataByKey) {
            throw new Error(`DataTransformer_2_0: value by key ${extractedDataByKey} is not received `)
        }
        return extractedDataByKey;
    }

    constructor () {

    }
}

module.exports = { DataMapper, Actions }


