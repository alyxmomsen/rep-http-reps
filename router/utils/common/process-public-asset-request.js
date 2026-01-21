const { readFile } = require("fs/promises");
const { join } = require("path");

async function processPublicAssetRequest(req , res , defaultpath) {
    
    const { params } = req;

    if (params === undefined) {

        if (defaultpath === undefined) {
            fallbackres(res);
            return;
        }
        
        try {
            
            const file = await readFile(defaultpath);
            res.end(file);
        }
        catch (e) {
            
            fallbackres(res);
        }

        return;
    }

    const { a: cat, b: subj } = params;
    
    if (cat === undefined || subj === undefined) { 

        if (defaultpath === undefined) {
            fallbackres(res);
            return;
        }

        try {
            
            const file = await readFile(defaultpath);
            res.end(file);
        }
        catch (e) {
            
            fallbackres(res);
        }
        return;
    }

    const resolve = {
        'css': {
            path: 'css',
            subj: {
                main: {
                    file:'main.css' ,
                }
            }
        },
        script: {
            path: 'scripts',
            subj: {
                main: {
                    file: 'main.js' ,
                }
            }
        }
    }

    const _path = resolve[cat]?.path || null;

    if (_path === null) {

        if (defaultpath === undefined) {
            fallbackres(res);
            return;
        }

        try {
            
            const file = await readFile(defaultpath);
            res.end(file);
        }
        catch (e) {
            
            fallbackres(res);
        }
        return;
    }

    const _file = resolve[cat]?.subj?.[subj]?.file || null;

    if (_file === null) {

        if (defaultpath === undefined) {
            fallbackres(res);
            return;
        }

        try {
            
            const file = await readFile(defaultpath);
            res.end(file);
        }
        catch (e) {
            
            fallbackres(res);
        }
        return;
    }

    try {
            
        const file = await readFile(join('.' , 'public' , _path , _file ));
        res.end(file);
    }
    catch (e) {
        
        try {
            
            const file = await readFile(defaultpath);
            res.end(file);
        }
        catch (e) {
            
            fallbackres(res);
        }
    }

}

module.exports = processPublicAssetRequest;


async function fallbackres (res) {
    res.writeHead(500);
    res.end();
}

