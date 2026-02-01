function subjectTypeHandler (context , payload) {

    const {files , queue} = context ;
    const {contentType , filename , body , semantic} = payload ;
    const {type:semanticType , id:currentFileSemanticId , name , target} = semantic ;

    const newFileBundle = {
        contentType , filename ,
        body , semantic ,
    };

    queue.forEach(queueItem => {

        const { id:fileId , propertyName , properyValue , applied} = queueItem ;

        if(fileId === currentFileSemanticId && applied === false ) {

            newFileBundle[propertyName] = properyValue ;
            queueItem.applied = true ;
        }

    });

    files.set(currentFileSemanticId , newFileBundle);
}

module.exports = subjectTypeHandler ;