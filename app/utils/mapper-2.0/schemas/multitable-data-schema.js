
const PropType = {
    Dinamic:'dinamic',
    Static:'static',
}

const ValueType = {
    Leaf: 'leaf',
    Branch: 'branch',
}

const MY_TEST_SCHEMA = {
    tableName:{
        property:{
            type:PropType.Dinamic,
            staticKey:null,
            srcPath:'tableName',
        },
        value:{
            type:ValueType.Branch,
            src:{
                path:null,
                schema:{
                    groupId:{
                        property:{
                            type:PropType.Dinamic,
                            staticKey:null,
                            srcPath:'groupId',
                        },
                        value:{
                            type:ValueType.Branch,
                            src:{
                                path:null,
                                schema:{
                                    columnName:{
                                        property:{
                                            type:PropType.Dinamic,
                                            staticKey:null,
                                            srcPath:'columnName',
                                        },
                                        value:{
                                            type:ValueType.Branch,
                                            src:{
                                                path:null,
                                                schema:{
                                                    contentType:{
                                                        property:{
                                                            type:PropType.Static,
                                                            staticKey:'fileMIME',
                                                            srcPath:null,
                                                        },
                                                        value:{
                                                            type:ValueType.Leaf,
                                                            src:{
                                                                path:'fileMIME',
                                                                schema:null,
                                                            },
                                                        },
                                                    },
                                                    fileBody:{
                                                        property:{
                                                            type:PropType.Static,
                                                            staticKey:'fileBody',
                                                            srcPath:null,
                                                        },
                                                        value:{
                                                            type:ValueType.Leaf,
                                                            src:{
                                                                path:'fileBody',
                                                                schema:null,
                                                            },
                                                        },
                                                    },
                                                    dataType:{
                                                        property:{
                                                            type:PropType.Static,
                                                            staticKey:'dataType',
                                                            srcPath:null,
                                                        },
                                                        value:{
                                                            type:ValueType.Leaf,
                                                            src:{
                                                                path:'dataType',
                                                                schema:null,
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },

    },
}

module.exports = { MY_TEST_SCHEMA , PropType , ValueType };