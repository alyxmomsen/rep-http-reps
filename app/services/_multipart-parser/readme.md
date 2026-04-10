## incoming flat structure:

```js
const data = {
    tableName: 'files',
    groupId: '00',
    columnName: 'vatar',
    dataType: 'string',
    fileName: 'original-filename.jpeg',
    contentType: 'video/matroska',
};
```

## process 1

### schemas

```js
const ActionName = {
    BRANCH: 'branch',
    LEAF: 'leaf',
};

const fileSchemaExample = {
    __tableName: [
        ActionName.BRANCH,
        {
            __groupId: [
                ActionName.BRANCH,
                {
                    originalFileName: [
                        ActionName.LEAF,
                        {
                            data: '__filename',
                            dataType: 'string',
                        },
                    ],
                    mime: [
                        ActionName.LEAF,
                        {
                            data: '__contentType',
                            dataType: 'string',
                        },
                    ],
                    file: [
                        ActionName.LEAF,
                        {
                            data: '__body',
                            dataType: 'Buffer',
                        },
                    ],
                    linkId: [
                        ActionName.LEAF,
                        {
                            data: '__linkId',
                            dataType: '',
                        },
                    ],
                },
            ],
        },
    ],
};
```

## result 1

```js

const transformedResult = {
    // tablename
    files:[

        ActionName.BRANCH,
        {
            meta:{title:'tableName'},
            value:

            }
        },

    ],
    // tablename
    users:[

        ActionName.Branch,
        {
            meta:{title:'tableName'},
            value:{},
        }
    ],

}

```
