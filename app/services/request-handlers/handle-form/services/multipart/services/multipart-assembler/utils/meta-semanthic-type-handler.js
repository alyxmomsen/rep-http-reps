const { randomBytes } = require("node:crypto");

function metaTypeHandler (context) {

    const { files , queue , payload } = context ;

    if(!payload) {
        console.log('no payload: ' , {payload});
        return ;
    }

    const { body:newPropertyValueBuffer ,/* name:newPropertyName ,  , target:targetId */semantic } = payload ;

    const fileById = files.get(/* targetId */semantic.target);

    if(!fileById) {

        console.log('prepare new queue item...');

        const newQueueItem = {
            targetId:semantic.target ,
            newPropertyName:semantic.name ,
            newPropertyValue:newPropertyValueBuffer ,
            applied:false ,
        } ;

        queue.push(newQueueItem);

        console.log('queue new item is created...');
        return ;
    }

    fileById[/* newPropertyName */semantic.name] = newPropertyValueBuffer;
    console.log(`property ${/* newPropertyName */semantic.name} is applied`);

}

module.exports = metaTypeHandler ;