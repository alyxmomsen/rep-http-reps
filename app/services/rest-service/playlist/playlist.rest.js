const { IncomingMessage, ServerResponse } = require("node:http");
const { DATABASE_TYPES, DB_TABLES_MODELS_NAMES, dbTablesModelsMap } = require("../../database.service/model/data-base-types.model");
const { Readable } = require("node:stream");
const { createWriteStream } = require("node:fs");
const { resolve, join } = require("node:path");
const { randomBytes, sign } = require("node:crypto");
const { fileManager } = require("../../file-manager/file-manager");
const { readFile } = require("node:fs/promises");
const { contentTypeRouter , CONTENT_TYPES } = require("../../form-handler/controller/content-type.router.controller");

const { MULTIPART_FORMDATA } = CONTENT_TYPES;

class RestHandler {

    post (req, res) {

    }

    get (req, res) {

    }

    #endpoint;

    constructor (endpoint) {
        this.#endpoint = endpoint ;
    }
}

class PlaylistRestHandler extends RestHandler {

    /**
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     */
    async post(req, res) {

        const { headers } = req;
        /**
         * @type {string|undefined}
         */
        const contentTypeHeader = headers['content-type'];
        const [ contentType , contentTypePayload ] = contentTypeHeader?.split(/;[^\S]+/);

        if(contentType !== MULTIPART_FORMDATA) {
            res.writeHead(400, 'bad request');
            res.end(JSON.stringify({message:'wrong content-type'}));
            return;
        }

        const { success , error } = await contentTypeRouter.handle(req, res, contentType,  contentTypePayload);

        if(error) {
            res.end(JSON.stringify({error}));
            return;
        }
        
        const { fields: parsedInputs } = success;
        // console.log({success, error, fields});
        const groups = {};
        for (const oneInputParsedData of parsedInputs) {
            const { body, contentType, name, filename } = oneInputParsedData ;
            
            try {
                const { groupIndex , groupName , propertyName } = parseNameAttribute(name);
                const groupByIndex = groups[groupIndex]

                // file detected
                if(contentType || filename) {
                    if(!groupByIndex) {
                        groups[groupIndex] = {
                            groupName,
                            files:[{
                                propertyName ,
                                contentType ,
                                filename ,
                                body ,
                            }] ,
                            simpleData:{},
                        }
                        continue;
                    }

                    groupByIndex.files.push({
                        propertyName ,
                        contentType ,
                        filename ,
                        body ,
                    });
                    continue;
                }

                if(!groupByIndex) {
                    groups[groupIndex] = {
                        groupName,
                        files:[] ,
                        simpleData:{
                            [propertyName]:body,
                        }
                    }
                    continue;
                }

                groupByIndex.simpleData[propertyName] = body;
            }
            catch(err) {
                console.log({err});
            }
        }

        const { VIDEO_FILES, PLAYLIST } = DB_TABLES_MODELS_NAMES;
        const dbFileModel = dbTablesModelsMap.get(VIDEO_FILES);
        if(!dbFileModel) {
            throw new Error(`model ${VIDEO_FILES} is not exist`);
        }

        const dbPlaylistModel = dbTablesModelsMap.get(PLAYLIST);
        if(!dbPlaylistModel) {
            throw new Error(`model ${PLAYLIST} is not exist`);
        }

        for (const [groupId , group] of Object.entries(groups)) {

            /**
             * @type {Object.<string,any>[]}
             */
            const files = group['files'];
            /**
             * @type {Object.<string,string>}
             */
            const simpleDataRows = group['simpleData'];

            try {
    
                for (const file of files) {
    
                    const { body , propertyName , contentType , filename } = file ;
                    const { success:fsSuccess, error } = await fileManager.write(body);
                    const { filename:filesystemFilename } = fsSuccess ;

                    // propertyName ,
                    // contentType ,
                    // filename ,
                    // body ,

                    const filesTableDbRow = {
                        id:randomBytes(32).toString("hex"),
                        filesystemFilename ,
                        originalFilename:filename ,
                        mime:contentType,
                    }

                    let isValid = true;
                    for (const [propertyKey, propertyModel] of Object.entries(dbFileModel)) {

                        try {
                            const value = filesTableDbRow[propertyKey];
                            if(!value) {
                                throw new Error(`missing property: ${propertyKey}. given`);
                            }

                            const givenPropertyType = typeof value ;

                            const expectedPropertyType = propertyModel.type.KEY;

                            if(givenPropertyType !== expectedPropertyType) {
                                throw new Error(`incorrect propery type: expected ${expectedPropertyType} but given ${givenPropertyType}`);
                            }

                            console.log(`valid property of table ${VIDEO_FILES}; ${propertyKey}: ${value}`);
                        }
                        catch (e) {
                            console.log({e});
                            isValid = false;
                        }
                    }

                    if(isValid === false) {
                        throw new Error(`\x1b[31msome file data is not valid, and all group ${group.groupName} in not valid\x1b[0m`);
                    }
                }

                const { title, description } = simpleDataRows;
                const playlistTableRow = {
                    id:randomBytes(32).toString('hex'),
                    title:title.toString('utf-8') ,
                    description:description.toString('utf-8'),
                }
                
                let isValid = true;
                try {
                    for(const [modelPropertyName, propertyModel] of Object.entries(dbPlaylistModel)) {
                        const givenPropertyValue = playlistTableRow[modelPropertyName];
                        if(!givenPropertyValue || false) {
                            console.log(givenPropertyValue);
                            throw new Error(`property error: expected ${modelPropertyName} bun not given`);
                        }
                        const givenPropertyType = typeof givenPropertyValue;
                        const expectedType = propertyModel.type.KEY;
                        if(givenPropertyType !== expectedType) {
                            throw new Error(`type property error: expected ${expectedType}, but given ${givenPropertyType}`);
                        }
                        console.log(`valid property of table ${PLAYLIST}; ${modelPropertyName}: ${givenPropertyValue}`);
                    }
                }
                catch (e) {
                    console.log({e});
                    isValid = false;
                }

                if(isValid === false) {
                    throw new Error(`\x1b[31mincorect playlist entity, and all group is not valid\x1b[0m`);
                }
            }
            catch(e) {
                console.log({e});
            }
        }

        res.end(JSON.stringify({message:'foobar'}));
    }

    /**
     * 
     */
    async get (req, res) {

        const HTML_FORM_PATH = resolve(join('.', 'app', 'model', 'assets', 'html', 'form.html'));

        try {   
            const file = await readFile(HTML_FORM_PATH , {encoding:'utf-8'});
            res.writeHead(200, 'ok' , {
                "content-type":"text/html",
            });
            res.end(file);
        }
        catch(e) {
            console.log({e});
        }
    }

    constructor () {
        super('/api/video-playlist');
    }
}

const playlistRestHandler = new PlaylistRestHandler();

module.exports = { playlistRestHandler }

/**
 * 
 * @param {string} nameAttr 
 * @returns {{groupName:string;groupIndex:string;propertyName:string}}
 */
function parseNameAttribute (nameAttr) {
    const match = nameAttr.match(/^([\w\d]+)\[(\d+)\]\.(\w+)$/)
    const [,groupName,groupIndex,propertyName ] = match || [];
    if(!groupName || !groupIndex || !propertyName) {
        throw new Error(`incorrect name input data`);
    }
    return {
        groupName , groupIndex ,
        propertyName
    }
}