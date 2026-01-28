const { readFile } = require("fs/promises");
const { join } = require("path");

async function processPublicRequest(req, res) {

    const { params , queryParams } = req;
    const { type, id } = params;
    
    
    try {
        
        const { filepath } = await resolveParams(res , type , id);
        const _file = await readFile(filepath);
        res.end(_file);
        return;
    }
    catch (e) {
        console.log({ e });
        res.writeHead(500);
        return;
    }

    console.log('this string will never printed');
}

module.exports = processPublicRequest;

async function resolveParams(res , type, id) {
    
    const rootpath = join('.', 'public');
        
    const paramsResolve = {
        'css': {
            ext: '.css',
            path: join(rootpath , 'css'),
            file: {
                main: {
                    filename: 'main.css'
                },
                flex: {
                    filename: 'flex-box.css'
                },
                video: {
                    filename: 'video.css'
                }
                
            }
        },
        'javascript': {
            ext: '.js',
            path: join(rootpath , 'javascript'),
            file: {
                main: {
                    filename: 'main.js',
                },
                form: {
                    filename: 'form.js',
                }
            }
        }
    };
        
    
    const { ext, path, file } = paramsResolve[type];
    const { filename } = file[id];

    return {
        filepath: join(path , filename) ,
    }
};

async function sendResponse(res) {
    
    
    res.end();

}

async function setStatus(status) {
    
}