
async function handleTextPlainData (req , res , dataBuffer) {

    console.log('call text-plain handler');
    const { url , method , params , queryParams } = req ;
    console.log({url , method  ,params , queryParams });
    res.end();
    return ;

}

module.exports = handleTextPlainData ;