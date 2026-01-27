async function metaTypeHandler(context) {

    const {context:compilerContext , payload} = context ;
    
    const {files , queue} = compilerContext ;
    const {body , filename , semantic , contentType ,} = payload ;

    // rename id to temporaryId
    const {id:temporaryId , name  , type , target:temporaryTargetId } = semantic ;
    
    console.log({semanticName:name});

    // console.log('subject type handler ... ' ,{files , queue  , body , filename , semantic , contentType});

    const fileById = files.get(temporaryTargetId);

    if(!fileById) {

        const newQueueItem = {
            id:temporaryTargetId ,
            bundle: {
                name:name , 
                body:body ,
            } ,
            done:false ,
        }

        console.log({newQueueItem});

        queue.push(newQueueItem);
        return ;
    }

    fileById[name] = body ;
}

module.exports = metaTypeHandler ;