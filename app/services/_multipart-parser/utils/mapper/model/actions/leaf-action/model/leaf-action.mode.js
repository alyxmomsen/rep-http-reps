function BTypeActionFactory(deps={}) {
    
    /**
     * 
     * @param {Object} payload
     * @returns {leaf:{data:any;dataType:string}, supply:Object} 
     */
    const fn = async (payload = {}) => {
   
        const { actionCaller, payloadToCaller:payloadToCaller, trace:parentTrace } = payload;
      
        const { data, dataType } = payloadToCaller;
    
        return { result: {data, dataType} }
    }

    return fn;


}

module.exports = { BTypeActionFactory }