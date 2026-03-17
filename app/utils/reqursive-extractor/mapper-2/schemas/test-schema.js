
const PropType = {
    Dinamic:'dinamic',
    Static:'static',
}

const MY_TEST_SCHEMA = {
    tableName:{
        propType:PropType.Dinamic,
        keyPath:'tableName',
        schema:{
            groupId:{
                propType:PropType.Dinamic,
                keyPath:'groupId',
                schema:{
                    columnName:{
                        propType:PropType.Dinamic,
                        keyPath:'columnName',
                        schema:{
                            filename:{
                                propType:PropType.Static,
                                valuePath:'fileName',
                                schema:null,
                            },
                            contentType:{
                                propType:PropType.Static,
                                valuePath:'fileMIME',
                                schema:null,
                            },
                            body:{
                                propType:PropType.Static,
                                valuePath:'fileBody',
                                schema:null,
                            },
                            dataType:{
                                propType:PropType.Static,
                                valuePath:'dataType',
                                schema:null,
                            },
                        }
                    }
                }
            }
        },
    },
}

module.exports = { MY_TEST_SCHEMA , PropType };