const { extname } = require("node:path");
const database = require("../../../../services/database");

async function handleUpdatePlaylist(req, res) {

    const DBTables = database.getTables();

    // console.log({DBTables});
    const payload = [] ;
    res.writeHead(200 , 'ok' , {
        'content-type':'application/json'
    });
    
    for (const [tablename , files] of DBTables.entries()) {
        // console.log({id: tablename ,  file: files});

        if(tablename === 'file') {

            files.entries().forEach(([fileid , property]) => {

                // console.log({property});

                // start :: temp statements !!!!!

                const _title =  property.get('title').body;
                const _filename = property.get('*').filename;

                const title = _title ? _title.length ? _title.toString() : null : null ;
                const filename = _filename || null ;
                
                if(filename) {
                    
                    const ext = extname(filename) || null ;
    
                    if(ext) {

                        console.log('no extantion');
                        const payloadFilename = title || filename ;
                        
                        // end :: temp statemants
        
                        console.log({title , filename});
        
                        // if(title.body.length && body)
        
                        if(property.get('*').filename) {
        
                            console.log();
        
                            payload.push({
                                id:fileid ,
                                // filename:property.get('*').filename.toString('utf-8') ,
                                filename: payloadFilename  ,
        
                            });
                        }

                    }
    
                }
                
                console.log('no filename');


            });

        }
        
    }
    res.end(JSON.stringify({payload}));
    // res.end();
}

module.exports = handleUpdatePlaylist ;