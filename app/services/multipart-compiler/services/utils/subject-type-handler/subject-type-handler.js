async function subjectTypeHandler(context) {
    
    const {context:compilerContext , payload} = context ;

    const {files , queue} = compilerContext ;
    const {body , filename , semantic , contentType ,} = payload ;

    const {id , name  , type , target } = semantic ;
    
    const newBundle = {
        semantic , 
        body , filename , contentType ,
    } ;

    queue.forEach(queueItem => {

        const {bundle , id:_id} = queueItem ;

        const {name:_name , body:_body } = bundle ;

        if(_id === id) {

            newBundle[_name] = _body ;
            queueItem.done = true ;
        }
    });

    files.set(id , newBundle);

}

module.exports = subjectTypeHandler ;
