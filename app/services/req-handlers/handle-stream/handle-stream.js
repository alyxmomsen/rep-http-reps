
async function handleSteam (req , res) {
    
    const { headers , params } = req ;

    const { range } = headers ;
    if(!params) {
        res.writeHead(400);
        res.end(JSON.stringify({message:'no params'}));
        return ;
    }

    if(!range) {

        res.writeHead(400);
        res.end(JSON.stringify({message:'no range'}));
        return ;
    }


}