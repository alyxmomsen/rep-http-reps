
async function _behavior (nameInputString) {
    
    const [subj , target] = nameInputString.split('--');

    const [type, id, name] = subj.split('.');

    return {
        targetId: target || null,
        type,
        subjectId: id,
        subjectName:name ,
    }
}

module.exports = _behavior;