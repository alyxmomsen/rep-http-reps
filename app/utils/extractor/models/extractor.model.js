
class Extractor {

    on (key, handler) {

    }

    #handle

    extract (schema, incomingData) {

        const product = {};
        // const schema = this.#schema;

        for (const [schemaKey, schemaKeyModel] of Object.entries(schema)) {
            const { KEY, CONTENT_TYPE, TYPE, NESTED_SCHEMA, CONSTRUCTOR } = schemaKeyModel;



            if(TYPE === /* INTERNAL_TYPES.KEYS.KNOT */'KNOT') {
                if(NESTED_SCHEMA) {
                    product[KEY] = this.extract(NESTED_SCHEMA, incomingData);
                    continue;
                }

                throw new Error(`1: internal error whist creating the object`);
            }

            if(!incomingData[KEY]) {
                console.log('error: missing incoming data by key', {incomingData:incomingData[KEY] , KEY});
                throw new Error(`2: missing incoming data by key`);
            }

            if(typeof incomingData[KEY] !== CONTENT_TYPE) {
                console.log('error: incorrect content type', incomingData[KEY], {TYPE: CONTENT_TYPE, KEY, incomingData});
                throw new Error(`3: incorrect content type`);
            }

            product[KEY] = incomingData[KEY];
        }

        return product;
    }

    // #schema;

    constructor (schema) {
        // this.#schema = schema;
    }
}

module.exports = { Extractor }