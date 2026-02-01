function metaTypeHandler (context , payload) {

    const {files , queue} = context ;
    const {contentType , filename , body:targetItemNewPropertyValue , semantic} = payload ;
    const {type:semanticType , id:semanticId , name:targetFileNewPropertyName , target:targetId} = semantic ;

    const fileById = files.get(targetId);
    if(!fileById) {

        const newQueueItem = {
            id:targetId ,
            propertyName:targetFileNewPropertyName ,
            properyValue:targetItemNewPropertyValue ,
            applied:false,
        }

        queue.push(newQueueItem);
        return ;
    }

    fileById[targetFileNewPropertyName] = targetItemNewPropertyValue ;

    
}

module.exports = metaTypeHandler ;