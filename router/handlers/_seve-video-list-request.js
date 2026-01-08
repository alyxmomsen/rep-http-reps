const _Registry = require("../../services/registry");

async function _serveVideoListRequest(req , res , registry) {

    console.log('serve video list request');
    
    if(registry instanceof _Registry === false) {

        console.log('registry is undefined: ');
        return
    } ;
    
    const _items = await registry.getAllItems();
    

    console.log({_items});

    const items = _items.map(item => {

        return {
            id:item.id , 
            filename:item.filename,
        }
    });

    res.end(JSON.stringify(items));

    return ;

}

module.exports = _serveVideoListRequest ;