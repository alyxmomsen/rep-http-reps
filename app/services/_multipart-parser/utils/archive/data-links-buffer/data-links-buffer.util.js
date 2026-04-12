class LinksBuffer {
    getAllLinks() {
        const links = this.#links;
        return links;
    }

    /**
     *
     * @param {string} linkId
     * @returns {{
     *  linkId:string,
     *  tableName:string,
     *  rowId:string,
     * }|null}
     */
    getLinkDataById(linkId) {
        for (const link of this.#links) {
            if (link.linkId === linkId) {
                return link;
            }
        }

        return null;
    }

    /**
     *
     * @param {{
     *  linkId:string,
     *  tableName:string,
     *  rowId:string,
     * }} data
     */
    push(data = {}) {
        if (!data || typeof data !== 'object') {
            console.log(`LinkBuffer: incorrect data`);
            throw new Error(`LinkBuffer: incorrect data`);
        }

        const schema = {
            linkId: 'string',
            rowId: 'string',
            tableName: 'string',
        };

        const result = {};

        for (const [key, type] of Object.entries(schema)) {
            if (!data[key]) {
                console.log(`LinkBuffer: property ${key} required`);
                throw new Error(
                    `LinkBuffer: property ${key} required, but not provided`
                );
            }

            if (typeof data[key] !== type) {
                console.log(
                    `LinkBuffer: property [${key}] must be <${type}>  type`
                );
                throw new Error(
                    `LinkBuffer: property ${key} must be ${type} type`
                );
            }

            result[key] = data[key];
        }

        this.#links.push(result);
    }

    /**
     * @type {{
     *  linkId:string,
     *  tableName:string,
     *  rowId:string,
     * }[]}
     */
    #links;

    constructor() {
        this.#links = [];
    }
}
