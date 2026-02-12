const database = require("../../../../../../services/database/database");
const { addFile } = require("../../../../../../services/database/utils/database-controller");
const GroupAssembler = require("./services/assemble-groups/group-assembler");
const parseNameAttr = require("./services/parse-name-attr/parse-name-attr");
const parseHeadersPart = require("./utils/parse-part/parse-part");
const splitThePart = require("./utils/parse-part/utils/split-part");
const splitFormDataBufferByBoundary = require("./utils/split-form-data-buffer-by-boundary");
const logPrefix = '\x1b[33m' + 'handle multipart content:'.toUpperCase() + '\x1b[0m';
async function handleTheMultipartContentTypeData(req , res , payload) {

    const { contentTypeAttr } = payload;

    const _boundaryLike = extractBoundary(contentTypeAttr);

    if(!_boundaryLike) {
        res.writeHead(400);
        res.end('no boundary given');
        return ;
    }

    const boundary = _boundaryLike ;

    const formDataChunks = [];
    req.on("data" , (chunk) => {
        formDataChunks.push(chunk);
    });

    req.on('end' , () => {

        const wholeBuffer = Buffer.concat(formDataChunks);

        const formDataParts = splitFormDataBufferByBoundary(wholeBuffer , Buffer.from(`${boundary}`));
        
        const groupAssembler = new GroupAssembler();
        for (const formDataPart of formDataParts) {
            
            try {
                const {headers: formDataPartHeadersPart , body} = splitThePart(formDataPart);

                const { contentType , filenameAttr , nameAttr } = parseHeadersPart(formDataPartHeadersPart.toString('utf-8'));

                const { groupId , tableName  , tableItemFieldName } = parseNameAttr(nameAttr);

                groupAssembler.gulpOneGroupMember({
                    contentType , filenameAttr , body ,
                    semantic: {
                        groupId , tableItemFieldName , tableName
                    }
                });
            }
            catch(e) {
                console.log({e});
            }
        }

        
        // const groups = groupAssembler.getAllGroupsMap();

        const fileGroups = groupAssembler.getGroupsByTableName('files');
        // const userGroups = groupAssembler.getGroupsByTableName('users');

        for (const fileGroup of fileGroups) {

            const title = (fileGroup.get('title' , 'utf-8') || {}).body;
            const description = (fileGroup.get('description' , 'utf-8') || {}).body;
            const file = (fileGroup.get('file') || {});
            const filename = (fileGroup.get('filename' , 'utf-8') || {}).body;

            

            console.log({title , description , file});

            try {
    
                addFile({
                    title , description , 
                    filename , filepath , 
                    mime:file.contentType || null , 
                    originalFileName:filename ,
                });
            }
            catch(e) {
                console.log({e});
            }
            

        }
        
        // const file = (files && files.get('title' , 'utf-8') || {}) ;
        
        // console.log(`group name: ${_} table name: ${groupBundle.tableName}`);
        // groupBundle.groupItemFields.entries().forEach(([name , data]) => {
        //     console.log(`fieldname: ${name}` , {data});
        // });
            
        res.end();
        return ;
    });
}

module.exports = handleTheMultipartContentTypeData ;

// utils 

function databaseRouter (rawTablename) {

    // const 

}

function extractBoundary (contentTypeAttr) {
    const match = contentTypeAttr.match(/boundary=(----[^\/;\s$]+)/);
    return match ? `--${match[1]}` : null ;
}