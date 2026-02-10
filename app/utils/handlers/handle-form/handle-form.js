const {} = require('');

async function handleForm(req, res) {
    
    const { headers } = req ;

    const contentType = headers['content-type'] ;


    

    res.end('foo bar');
}