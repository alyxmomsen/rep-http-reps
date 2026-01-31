const registry = require("../../../../../../services/registry/registry");

async function getMediaFilesMetaData( req , res) {

    console.log(`get media data handler..`);
    
    const items = await registry.getAllItems();
    
    console.log({items});

    const payload = {
        audio:[] ,
        video:[] ,
        images:[],
    } ;

    for (const [id , bundle] of items.entries()) {

        const resolve = {
            'video/x-matroska':(_payload) => {
                const {id: _id , filename} = _payload ;
                console.log('video payload resolve: ' , _payload);
                payload.video.push({id:_id , filename});
            } ,
            'image/jpeg':(_payload) => {
                console.log('image payload resolve: ' , _payload);
                const {id: _id , filename} = _payload ;
                payload.images.push({id:_id , filename});
            } ,
            'audio/mpeg':(_payload) => {
                console.log('AUDIO payload resolve: ' , _payload);
                const {id: _id , filename} = _payload ;
                payload.audio.push({id:_id , filename});
            } ,

        }

        const {contentType , filename , originalName } = bundle ;

        const handler = resolve[contentType];
        if(!handler) continue ;
        handler({id , filename});

        // console.log('get media: ' ,{contentType , filename , originalName});

        // console.log({ key, value: bundle });
    }

    console.log({payload});

    const message = 'media content response' ;

    res.end(JSON.stringify({ message , status:0 , payload:{...payload} }));
    
}

module.exports = getMediaFilesMetaData;