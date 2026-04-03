function BTypeActionFactory(deps={}) {
    
    /**
     * 
     * @param {Object} payload
     * @returns {leaf:{data:any;dataType:string}, supply:Object} 
     */
    const fn = async (payload = {}) => {
   
        const { reqFn, actionPayload, callStack, actions } = payload;
      
        const { data, dataType } = actionPayload;
    
        return {tree:{data, dataType}, supply:{}};
    }

    return fn;


}

module.exports = { BTypeActionFactory }