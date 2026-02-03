const { randomBytes } = require("node:crypto");

function subjectTypeHandler (context) {

    const { files , queue , payload } = context ;

    if(!payload) {
        console.log('no payload: ' , {payload});
        return ;
    }

    const { /* id , name , */ contentType , body  , filename , semantic } = payload ;

    const newBundle = {
        /* semanticName:name , */
        semantic ,
        contentType ,
        body ,
        filename ,
    }

    queue.forEach(queueItem => {

        console.log({queueItem});

        if(queueItem.targetId === semantic.id && queueItem.applied === false) {

            newBundle[queueItem.newPropertyName] = queueItem.newPropertyValue ;
        }
    });

    files.set(semantic.id , newBundle);
}

module.exports = subjectTypeHandler ;