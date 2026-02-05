const database = require("../../../../services/database");

async function handleUpdatePlaylist(req, res) {

    const DBTables = database.getTables();

    console.log({DBTables});
    const payload = [] ;
    res.writeHead(200 , 'ok' , {
        'content-type':'application/json'
    });
    for (const [tablename , files] of DBTables.entries()) {
        console.log({id: tablename ,  file: files});

        if(tablename === 'file') {

            files.entries().forEach(([fileid , property]) => {

                console.log({property});

                if(property.get('*').filename) {

                    payload.push({
                        id:fileid ,
                        filename:property.get('*').filename.toString('utf-8') ,
                    });
                }


            });

        }
        
    }
    res.end(JSON.stringify({payload}));
    // res.end();
}

module.exports = handleUpdatePlaylist ;