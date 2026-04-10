const { randomBytes } = require('node:crypto');

class NamesRegistry {
    // exactly sync
    /**
     *
     * @param {string} name
     * @returns {string}
     */
    registrate(newName) {
        for (const [id, name] of this.#registry.entries()) {
            if (newName === name) {
                throw new Error(`name ${newName} is already registered`);
            }
        }

        while (true) {
            const newId = randomBytes(32).toString('hex');

            if (this.#registry.has(newId)) {
                continue;
            }

            this.#registry.set(newId, newName);

            return newId;
        }
    }

    /**
     *
     * @param {string} id
     */
    getNameById(id) {
        const name = this.#registry.get(id);
        return name || null;
    }

    #registry;

    constructor() {
        this.#registry = new Map();
    }
}

const registry = new NamesRegistry();

module.exports = { registry };
