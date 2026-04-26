const { InMemoryDataBase } = require("../model/db.model");

class InMemoryDBFactory {

    Instance() {
        return new InMemoryDataBase();
    }

    constructor() {
        
    }
}

const database = new InMemoryDBFactory().Instance()

module.exports = { InMemoryDBFactory, inMemoryDataBase:database }