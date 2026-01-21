async function _findIndex (buf , sep , start = 0) {
    
    for (let index = start ; index < buf.length - sep.length; index++) {
        let found = true ;
        for (let j = 0 ; j < sep.length; j++) {
            
            if(buf[index + j] !== sep[j]) {
                found = false;
                break ;
            }
        }
        if(found === true ) return index ;
    }

    return -1 ;
}

module.exports = _findIndex;