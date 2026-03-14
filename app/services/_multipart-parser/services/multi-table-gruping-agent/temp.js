
const f_sch = {
            TABLE_NAME:{
                KEY:'tableName',
                TYPE:'KNOT',
                CONTENT_TYPE:'object',
                CONSTRUCTOR:Object,
                NESTED_SCHEMA:{
                    GROUP_ID:{
                        KEY:'groupId',
                        TYPE:'KNOT',
                        CONTENT_TYPE:'object',
                        CONSTRUCTOR:Object,
                        NESTED_SCHEMA:{
                            COLUMN_NAME:{
                                KEY:'columnName',
                                TYPE:'KNOT',
                                CONTENT_TYPE:'object',
                                CONSTRUCTOR:Object,
                                NESTED_SCHEMA:{
                                    DATA:{
                                        KEY:'fileBody',
                                        TYPE:'DATA',
                                        CONTENT_TYPE:'object',
                                        CONSTRUCTOR:Buffer,
                                        NESTED_SCHEMA:null,
                                    },
                                    MIME:{
                                        KEY:'fileMIME',
                                        TYPE:'DATA',
                                        CONTENT_TYPE:'stirng',
                                        CONSTRUCTOR:undefined,
                                        NESTED_SCHEMA:null,
                                    },
                                    TYPE:{
                                        KEY:'dataType',
                                        TYPE:'DATA',
                                        CONTENT_TYPE:'stirng',
                                        CONSTRUCTOR:undefined,
                                        NESTED_SCHEMA:null,
                                    },
                                    FILENAME:{
                                        KEY:'fileName',
                                        TYPE:'DATA',
                                        CONTENT_TYPE:'string',
                                        CONSTRUCTOR:undefined,
                                        NESTED_SCHEMA:null,
                                    },
                                }
                            }
                        }
                    }
                }
            } 
        }

function foo (schema, data, target) {

    return target;
}