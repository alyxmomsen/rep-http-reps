const { randomBytes } = require("node:crypto");
const { join } = require("node:path");

class VideoManager {

    #items;

    async getRanddom() {

        const item = this.#items[Math.floor(Math.random() * this.#items.length)];

        return item;
    }

    constructor() {
        
        this.#items = [
            {
                id: randomBytes(32).toString('hex'),
                path:join('C:', 'Users', 'user', 'Videos', 'lacomiycusok.MP4') ,
            } ,
            {
                id: randomBytes(32).toString('hex'),
                path:join('C:', 'Users', 'user', 'Videos', 'sonic.mp4') ,
            } ,
            {
                id: randomBytes(32).toString('hex'),
                path:join('C:', 'Users', 'user', 'Videos', 'igriprestola.mp4') ,
            } ,
            {
                id: randomBytes(32).toString('hex'),
                path:join('C:', 'Users', 'user', 'Videos', 'iphone18pro.MP4') ,
            } ,
            {
                id: randomBytes(32).toString('hex'),
                path:join('C:', 'Users', 'user', 'Videos', '1g33JJ33roO5qbaw.mp4') ,
            } ,
        ];
    }
}

module.exports = VideoManager;