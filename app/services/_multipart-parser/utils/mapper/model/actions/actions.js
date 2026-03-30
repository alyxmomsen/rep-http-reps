const { dbControllersRouter } = require("../../../../../database-adapter/controller/db-adapter.controller");

const tableNameAction = (pl = {}) => {
    const { payload: child, cb: executor, prop, initiatorPropStack } = pl;
    // console.log('action-1a: table executor', {payload, executor});
    const result = executor(child, [...initiatorPropStack, prop]);
    // console.log('\x1b[33maction-1a exec res', prop, { executorResult:result }, '\x1b[0m');
    return {prop, actionName:'tableName' , initiatorPropStack};
};

/**
 * 
 * @param {{payload:any, cb:(data:Object, initiatorPropStack:string[]) => }} pl 
 * @returns 
*/
const groupIdAction = (pl = {}) => {
    // action-1b
    const { payload: child, cb: executor, prop, initiatorPropStack } = pl;
    // console.log('action-1b: group executor', {payload, executor});
    const mergedCallStack = [...initiatorPropStack, prop]
    const result = executor(child, [...initiatorPropStack, prop]);
    // console.log('\x1b[33mgropIdAction: ', prop, { executorResult: result,/*  stack: mergedCallStack */ }, '\x1b[0m');
    
    console.log(`dataSetMapper/Action/call-stack :`, mergedCallStack);

    const [tableName, groupId] = mergedCallStack;

    const dbAdapter = dbControllersRouter.get(tableName);

    const preparedObj = {};

    result.forEach(el => {
        el.forEach(propData => {
            // console.log({ propData });
            
            preparedObj[propData.prop] = propData.data;

        });
    });

    // console.log({preparedObj});
    

    if (dbAdapter) {
        // console.log('preparing data to processing: ', {result});
        // dbAdapter.readOne();
    }
    else {
        throw new Error(`no db adapter by ${tableName}`);
    }

    for (const stackItem of mergedCallStack) {
        // console.log('stack item: ', stackItem);
    }


    return { prop, actionName: 'groupId', initiatorPropStack };
};


const propRegularAction = (pl = {}) => {
    // action-2a
    const { payload, cb: _, prop, initiatorPropStack } = pl;
    // console.log('action-2a', { payload, _ });
    
    const { data, dataType } = payload
    
    return { prop, data, initiatorPropStack };
};


const propFileAction = (pl = {}) => {
    const { payload, cb: _, prop, initiatorPropStack } = pl;
    // console.log('action-2b', { payload, _ });
    // const { data, dataType } = payload;
    return { prop, data: payload, initiatorPropStack };
};

module.exports = { tableNameAction, groupIdAction, propRegularAction, propFileAction  }