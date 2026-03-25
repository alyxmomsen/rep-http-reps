
const REGULAR_FIELD_DATA_SET_SCHEMA = {

    __tableName:{
        value:null,
        children:{
            __groupId:{
                value:null,
                children:{
                    __columnName:{
                        value:null,
                        children:{
                            data:{
                                value:{
                                    key:'__body',
                                },
                                children:null,
                            },
                            dataType:{
                                value:{
                                    key:'__dataType',
                                },
                                children:null,
                            },
                        }
                    },
                },
            }
        }
    }
};

module.exports = { REGULAR_FIELD_DATA_SET_SCHEMA }