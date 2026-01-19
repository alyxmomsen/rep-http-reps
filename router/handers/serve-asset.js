const { readFile } = require("fs/promises");

async function serveAsset(req ,res) {
    
    console.log('asset loading...');
    
    const { params } = req;
    console.log({params});

    try {
        const { type, id } = params;

        if(!type && !id) throw new Error('no type or ID')
        
        const ext = await _resolve(type);

        console.log('./public/' + type + '/' + id + ext);

        const file = await readFile('./public/' + type + '/' + id + ext);
        res.end(file);

    }
    catch (e) {

        res.end('smth went wrong' ,e);
    }
    
    async function _resolve(type) {
        const resolve = {
            'css': {
                ext: '.css',                    
            },
            'js': {
                ext: '.js',

            }
        }

        const resolver = resolve[type];

        if (resolver === undefined) throw new Error('smth');

        return resolver.ext;
    }
}

module.exports = serveAsset;