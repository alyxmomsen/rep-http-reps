function BTypeActionFactory(deps={}) {
    
    /**
     * 
     * @param {Object} payload 
     */
    const fn = async (payload = {}) => {

        // console.log(`\x1b[33maction/BAction: `, { payload }, `\x1b[0m`);
        
        const { reqFn, actionPayload, callStack, actions } = payload;
    
        // console.dir(actionPayload, {
        //     depth:10,
        // });
    
        // console.log(`\x1b[31maction/BAction: `, {actionPayload} , `\x1b[0m`);
    
        const { data, dataType } = actionPayload;
    
        return { data, dataType };
    }

    return fn;


}

module.exports = { BTypeActionFactory }