
function parseName (nameAttr) {

    const [groupId , tableName , tableItemFieldName ] = nameAttr.split('.');

    return {
        groupId , tableName ,
        tableItemFieldName ,
    } 
}


module.exports = parseName ;