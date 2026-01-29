const {} = require('fs');
async function metaTypeHandler(context , payload) {
    
    const { files , queue } = context ;
    const { filename , semantic , contentType , body:targetNewPropertyBody } = payload ;
    const { target:targetId , name: targetNewPropertyName } = semantic ;
    
    console.log({context , payload});

    if(!files) {
        throw new Error('!files'.toUpperCase());
        return ;
    }

    if(!targetId) {
        throw new Error(JSON.stringify({semantic}) + ' !targetId missing  '.toUpperCase());
        return ;
    }

    if(!targetNewPropertyBody) {
        throw new Error('!body'.toUpperCase());
        return ;
    }

    const fileById = files.get(targetId);

    if(!fileById) {
        
        const queueItem = {
            subjectId:targetId ,
            targetNewPropertyName , 
            targetNewPropertyBody ,
            done:false ,
        }

        queue.push(queueItem);
        return ;
    }

    fileById[targetNewPropertyName] = targetNewPropertyBody ;

}

module.exports = metaTypeHandler ;