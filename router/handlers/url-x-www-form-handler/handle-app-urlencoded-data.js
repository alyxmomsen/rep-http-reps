
async function handleAppUrlEncoded (req , res , dataBuffer) {

    console.log('call application x-www-form-urlencoded handler');
    const { url , method , params , queryParams } = req ;
    console.log({url , method  ,params , queryParams });
    res.end();
    return ;
}

module.exports = handleAppUrlEncoded ;