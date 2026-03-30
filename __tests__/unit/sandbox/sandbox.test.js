const { validator: executor, schema } = require("../../../app/services/_multipart-parser/utils/mapper/validate");

describe('sandbox', () => {

    /**
     * @type {Object}
     */
    let data;
    
    beforeEach(() => {
        data = {
            files: {
                files: {
                    action:['table','childs'],
                    '00': {
                        action: ['group','childs'],
                        originalFileName: {
                            action:'prop',
                        },
                        mime: {

                            data: 'smth-mime',
                            dataType:'string',
                        },
                        file: Buffer.from('123'),
                        linkId: {
                            data: 'linklinklikn',
                            dataType:'string',
                        },
                        
                    }
                }
            },
            fields: {
                users: {
                    '00': {
                        columnName:'title',
                        data:Buffer.from('123-title'),
                        dataType:'string',
                    }
                }
            },
        }
    });
    
    test('#1', () => {

        executor(data.files);  
        
    });
});