/**
 * @module MultiTableGrouppingAgent
 * @description
 * Core aggregator for multipart form data processing. Transforms flat parsed form data
 * into a structured, relational hierarchy ready for database insertion.
 * 
 * Key responsibilities:
 * - Detects whether a form part is a file or regular field
 * - Parses the `name` attribute using the multitable protocol
 * - Creates unique link IDs for file metadata
 * - Routes data to appropriate schemas (files vs fields)
 * - Builds a mergeable structure for batch database operations
 * 
 * @example
 * const agent = new MultiTableGrouppingAgent({
 *   dataTransformer: new DataTransformer(),
 *   multiTableProtocolParser: customParser
 * });
 * 
 * agent.handleFormDataPartParsedData({
 *   name: '0025.name.string',
 *   body: Buffer.from('John Doe'),
 *   contentType: null,
 *   filename: null
 * });
 * 
 * const { files, fields } = agent.getGroups();
 * // fields: { users: { '0025': { name: { data: 'John Doe', type: 'string' } } } }
 */

const { randomBytes } = require("crypto");
const { DataMapper } = require("../data-mapper/v2/model/data-mapper.v2.model");
const { filemanager } = require("../../../filemanager.service.js/fmanager.controller");
const { PreMapper, FILES_SCHEMA, LINK_COLUMN_SCHEMA, REGULAR_COLUMN_SCHEMA } = require("../../../../utils/data-mapper/pre-mapper/pre-mapper.model");
const { defaultState: defaultStateDataSetFactory } = require("../../../../../__tests__/delopment/prematcher/utils/icoming-data-set.factory");

/**
 * @typedef {Object} ParsedFormDataPart
 * @property {string} name - Raw name attribute value from HTML input
 * @property {Buffer} body - File content or field value as Buffer
 * @property {string|null} contentType - MIME type (for files)
 * @property {string|null} filename - Original filename (for files)
 */

/**
 * @typedef {Object} MultiTableProtocolResult
 * @property {string} groupId - Group identifier (2-4 chars)
 * @property {string} tableId - Table code (2 chars)
 * @property {string} columnName - Target column name in database
 * @property {string} dataType - Data type hint ('string', 'number', 'link', etc.)
 */

/**
 * @typedef {Object} GroupedData
 * @property {Object} files - Aggregated file metadata, grouped by table
 * @property {Object} fields - Aggregated regular fields, grouped by table and groupId
 */

/**
 * Aggregates parsed multipart form data into a structured, relational format.
 * 
 * **How it works:**
 * 1. Validates incoming data structure
 * 2. Parses the `name` attribute using the multitable protocol
 * 3. Detects if the part is a file (has filename/contentType) or regular field
 * 4. For files: generates a unique link ID, creates metadata dataset, and creates a linked field
 * 5. For regular fields: creates a standard dataset
 * 6. Merges all data into the internal groups structure
 * 
 * **Separation of concerns:**
 * - `files` group: Stores file metadata (original filename, MIME type, body) in a dedicated table
 * - `fields` group: Stores regular fields and file links in target tables
 * 
 * This separation enables:
 * - Proper foreign key relationships
 * - Independent transaction handling
 * - Clean rollback on partial failures
 * 
 * @example
 * // Regular field processing
 * agent.handleFormDataPartParsedData({
 *   name: '0025.name.string',
 *   body: Buffer.from('John Doe'),
 *   contentType: null,
 *   filename: null
 * });
 * // Result: fields.users['0025'].name = { data: 'John Doe', type: 'string' }
 * 
 * @example
 * // File processing
 * agent.handleFormDataPartParsedData({
 *   name: '0025.avatar.string',
 *   body: Buffer.from('image data'),
 *   contentType: 'image/jpeg',
 *   filename: 'profile.jpg'
 * });
 * // Result:
 * // - files.files[linkId] = { originalFileName, mime, body, linkId }
 * // - fields.users['0025'].avatar = { data: linkId, type: 'link' }
 */
class MultiTableGrouppingAgent {

    /**
     * Main entry point for processing a single parsed form part.
     * 
     * **Processing flow:**
     * 1. Validation → ensures all required fields are present
     * 2. Protocol parsing → extracts groupId, tableId, columnName, dataType
     * 3. Table resolution → converts tableId to actual table name
     * 4. Branching logic → file vs regular field handling
     * 
     * @param {ParsedFormDataPart} data - Parsed form data from multipart parser
     * @throws {Error} If validation fails
     * @throws {Error} If file part missing filename or contentType
     * @throws {Error} If protocol parsing fails
     * @returns {void} Updates internal groups structure
     * 
     * @example
     * // Regular field
     * agent.handleFormDataPartParsedData({
     *   name: '0025.name.string',
     *   body: Buffer.from('John'),
     *   contentType: null,
     *   filename: null
     * });
     * 
     * @example
     * // File field
     * agent.handleFormDataPartParsedData({
     *   name: '0025.avatar.string',
     *   body: Buffer.from('...'),
     *   contentType: 'image/jpeg',
     *   filename: 'avatar.jpg'
     * });
     */
    async handleFormDataPartParsedData (data) {

        const { contentType, name, body, filename } = data;

        /**
         * Step 1: Validate incoming data
         * Ensures all required fields are present before processing
         */
        if (!this.#validateData(data)) {
            console.log({ data });
            throw new Error(`MultiTableGrouppingAgent: incorrect provided data`);
        }

        /**
         * Step 2: Parse multitable protocol from name attribute
         * Extracts structured routing information
         */
        const { columnName, dataType, groupId, tableId } = this.#multitableProtocolParser(name);

        /**
         * Step 3: Resolve tableId to actual database table name
         * Maps short codes to full table names (security through obscurity)
         */
        const tableName = tableIdResolver(tableId);

        /**
         * Step 4: Branch logic — file vs regular field
         * 
         * File detection criteria:
         * - Has either filename OR contentType (both must exist after validation)
         * - Filename indicates user uploaded a file
         * - ContentType indicates the file type
         */
        if (filename || contentType) {

            /**
             * Step 4a: File validation
             * Both filename AND contentType must be present for file processing
             */
            if (!filename) {
                throw new Error(`MultiTableGrouppingAgent: as "contentType" received then "filename" required too`);
            }

            if (!contentType) {
                throw new Error(`MultiTableGrouppingAgent: as "filename" received then "contentType" required too`);
            }
            
            const fileGroupId = randomBytes(32).toString("hex");
            const fileDataSet = defaultStateDataSetFactory({
                contentType,
                filename,
                groupId:fileGroupId,
                tableName:'files',
                body,
            })();

            const linkColumnDataSet = defaultStateDataSetFactory({
                body: {
                    tableName: 'files',
                    groupId:fileGroupId,
                    columnName: 'fileSystemFileName',
                },
                tableName,
                groupId,
                columnName,
            })();

            this.#mergedGroups = this.#dataTransformer.process(FILES_SCHEMA, fileDataSet, this.#mergedGroups );
            this.#mergedGroups = this.#dataTransformer.process(LINK_COLUMN_SCHEMA, linkColumnDataSet, this.#mergedGroups );

            // console.dir(context, {depth:10});
            // throw new Error();

            return ;
        } 
        
        const regularDataSet = defaultStateDataSetFactory({
            body,
            tableName,
            groupId,
            columnName,
        })();

        console.log('foo bar: 1');
        this.#mergedGroups = this.#dataTransformer.process(REGULAR_COLUMN_SCHEMA, regularDataSet, this.#mergedGroups);
        console.dir(this.#mergedGroups, {depth:10});
        console.log('foo bar: 2');
        

    }

    /**
     * Returns the aggregated groups after processing all form parts.
     * 
     * @returns {GroupedData} Object containing separate files and fields groups
     * 
     * @example
     * const { files, fields } = agent.getGroups();
     * 
     * // files structure:
     * // {
     * //   files: {
     * //     'abc123...': {
     * //       originalFileName: { data: 'photo.jpg', type: 'string' },
     * //       mime: { data: 'image/jpeg', type: 'string' },
     * //       body: { data: Buffer, type: 'binary' },
     * //       linkId: { data: 'abc123...', type: 'string' }
     * //     }
     * //   }
     * // }
     * 
     * // fields structure:
     * // {
     * //   users: {
     * //     '0025': {
     * //       name: { data: 'John', type: 'string' },
     * //       avatar: { data: 'abc123...', type: 'link' }
     * //     }
     * //   }
     * // }
     */
    getGroups () {
        return this.#mergedGroups;
    }

    /**
     * Validates that incoming data contains all required fields.
     * 
     * Required fields:
     * - `name` — must exist for all form parts
     * - `body` — must exist for all form parts
     * - `contentType` — can be null (for regular fields) but must exist
     * - `filename` — can be null (for regular fields) but must exist
     * 
     * This validation ensures downstream code doesn't crash on undefined values.
     * 
     * @param {ParsedFormDataPart} data - Parsed form data to validate
     * @returns {boolean} `true` if all required fields exist, `false` otherwise
     * 
     * @private
     */
    #validateData (data)     {
        const validateSchema = {
            contentType: { required: true },
            name: { required: true },
            body: { required: true },
            filename: { required: true }
        }

        for (const [schemaKey, schemaValue] of Object.entries(validateSchema)) {
            if (data[schemaKey] === undefined && schemaValue.required === true) {
                console.log(`key ${schemaKey} required but not provided`);
                return false;
            }
        }

        return true;
    }

    /**
     * Aggregated data structure containing all processed form parts.
     * 
     * Structure:
     * ```
     * {
     *   files: {            // File metadata group
     *     [groupId]: {      // Unique group ID (usually equals linkId)
     *       [fieldName]: { data: any, type: string }
     *     }
     *   },
     *   fields: {           // Regular fields and file references
     *     [tableName]: {    // Target database table
     *       [groupId]: {    // Group identifier (from protocol)
     *         [columnName]: { data: any, type: string }
     *       }
     *     }
     *   }
     * }
     * ```
     * 
     * @type {GroupedData}
     * @private
     */
    #mergedGroups;

    /**
     * DataTransformer instance for recursive structure building.
     * Transforms flat datasets into nested hierarchies based on schemas.
     * 
     * @type {DataMapper}
     * @private
     */
    #dataTransformer;

    /**
     * Parser function for the multitable protocol.
     * Extracts groupId, tableId, columnName, and dataType from name attribute.
     * 
     * @type {(data:string) => MultiTableProtocolResult}
     * @private
     */
    #multitableProtocolParser;

    #fileDataSetSchema;
    #regularFieldDataSetSchema;
    #linkedFieldDataSetSchema;

    #fileDataSetAdapter;
    #regularFieldDataSetAdapter;
    #linkedFieldDataSetAdapter;

    #files;
    #links;
    
    /**
     * Creates a new MultiTableGrouppingAgent instance.
     * 
     * @param {Object} deps - Dependency injection container
     * @param {DataMapper} deps.dataTransformer - Transformer for building hierarchical data
     * @param {(data:string) => MultiTableProtocolResult} deps.multiTableProtocolParser - Parser for multitable protocol
     * @param {Object} deps.fileDataSetSchema
     * @param {Object} deps.regularFieldDataSetSchema
     * @param {Object} deps.linkedFieldDataSetSchema
     * 
     * @param {Function} deps.fileDataSetAdapter
     * @param {Function} deps.regularFieldDataSetAdapter
     * @param {Function} deps.linkedFieldDataSetAdapter
     * 
     * @throws {Error} If required dependencies are missing
     * 
     * @example
     * const agent = new MultiTableGrouppingAgent({
     *   dataTransformer: new DataTransformer(),
     *   multiTableProtocolParser: (name) => ({
     *     groupId: name.slice(0, 4),
     *     tableId: name.slice(4, 6),
     *     columnName: name.slice(7, -7),
     *     dataType: 'string'
     *   })
     * });
     */
    constructor(deps = {}) {
        
        const files = [];
        const links = [];

        const dataTransformer = deps.dataTransformer || null;
        const multiTableProtocolParser = deps.multiTableProtocolParser || null;
        
        /* SCHEMAS */

        const fileDataSetSchema = deps.fileDataSetSchema || null;
        const regularFieldDataSetSchema = deps.regularFieldDataSetSchema || null;
        const linkedFieldDataSetSchema = deps.linkedFieldDataSetSchema || null;

        /* DATA-SET FACTORIES */

        const fileDataSetFactory = deps.fileDataSetAdapter || null;
        const regularFieldDataSetFactory = deps.regularFieldDataSetAdapter || null;
        const linkedFieldDataSetFactory = deps.linkedFieldDataSetAdapter || null;

        /* DEPS VALIDATIONS */

        if (!dataTransformer) {
            throw new Error(`DataTransformer required but not provided`);
        }

        /* ======================= */

        this.#fileDataSetSchema = fileDataSetSchema;
        this.#regularFieldDataSetSchema = regularFieldDataSetSchema;
        this.#linkedFieldDataSetSchema = linkedFieldDataSetSchema

        /* ----------------------- */

        this.#fileDataSetAdapter = fileDataSetFactory;
        this.#regularFieldDataSetAdapter = regularFieldDataSetFactory;
        this.#linkedFieldDataSetAdapter = linkedFieldDataSetFactory;

        /* ======================== */

        console.log(`\x1b[32mMultiTableGrouppingAgent: ✔ dataTransformer plugged`);
        
        if (!multiTableProtocolParser) {
            throw new Error(`multiTableProtocolParser required but not provided`)
        }

        console.log(`\x1b[32mMultiTableGrouppingAgent: ✔ multiTableProtocolParser plugged`);
        
        this.#dataTransformer = dataTransformer;
        this.#multitableProtocolParser = multiTableProtocolParser;

        this.#mergedGroups = {}
    }
}

module.exports = { MultiTableGrouppingAgent };

// ============================================================================
// Private Utilities
// ============================================================================

/**
 * Resolves a table ID code to the actual database table name.
 * 
 * This mapping provides a layer of indirection between frontend identifiers
 * and actual database table names, adding a minimal security layer.
 * 
 * **Mapping table:**
 * | Code | Table |
 * |------|-------|
 * | 25   | users |
 * | 8e   | files |
 * | af   | video-playlist |
 * 
 * @param {string} tableId - Two-character table code from protocol
 * @returns {string} Actual database table name
 * @throws {Error} If tableId is unknown
 * 
 * @private
 * 
 * @example
 * tableIdResolver('25') // returns 'users'
 * tableIdResolver('af') // returns 'video-playlist'
 */
function tableIdResolver (tableId) {

    const DbTables = {
        USERS: 'users',
        FILES: 'files',
        VIDEO_PLAYLIST: 'video-playlist',
    }

    const map = {
        "25": DbTables.USERS,
        "8e": DbTables.FILES,
        "af": DbTables.VIDEO_PLAYLIST,
    }

    const tableName = map[tableId];

    if (!tableName) {
        throw new Error(`tableIdResolver: unknown table id`);
    }

    return tableName;
}