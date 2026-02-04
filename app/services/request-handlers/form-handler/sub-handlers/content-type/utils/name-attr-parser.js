function nameAttrParser (nameAttr) {

    const [group , tablename , fieldname] = nameAttr.split('.') ;

    return {
        group , tablename , fieldname
    }
}

module.exports = nameAttrParser ;