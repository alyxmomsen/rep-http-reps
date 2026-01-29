const {} = require('fs');
async function subjectTypeHandler(context , payload) {
    
    const { files , queue } = context ;
    const { filename , semantic , contentType , body } = payload ;
    const { id: semanticId } = semantic ;
    
    if(!files) {
        throw new Error('!files'.toUpperCase());
        return ;
    }

    if(!semanticId) {
        throw new Error('!semantic'.toUpperCase());
        return ;
    }

    if(!body) {
        throw new Error('!body'.toUpperCase());
        return ;
    }

    const newFile = {
        filename ,
        contentType ,
        body ,
        semantic ,
    }

    console.log('check queue...');
    queue.forEach(item => {

        const {
            subjectId: queueSubjectId ,
            targetNewPropertyName: subjectNewPropertyName , 
            targetNewPropertyBody: subjectNewPropertyBody ,
            done ,
        } = item ;

        if(queueSubjectId === semanticId && done === false) {
            console.log('apply queue property...');
            newFile[subjectNewPropertyName] = subjectNewPropertyBody ;
            item.done = true ;
        }

    });

    files.set(semanticId , newFile);

}

module.exports = subjectTypeHandler ;