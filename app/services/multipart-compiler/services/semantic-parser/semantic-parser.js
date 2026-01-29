
async function semanticParser(dispositionNameString) {

    const [subject , target] = dispositionNameString.split('--');
    
    if(subject.length === dispositionNameString.length) throw new Error('no disposition name semantic data'.toUpperCase());

    const [type , id , name ] = subject.split('.') ;

    return {
        type , id , name , target ,
    }

}

module.exports = semanticParser ;