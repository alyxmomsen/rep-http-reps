
function findIndexInBuffer (buffer , separator , start = 0) {

    for (let index = start ; index < buffer.length - separator.length ; index++) {
        let found = true; 
        for (let j = 0 ; j < separator.length ; j++) {
            if(buffer[index + j] !== separator[j]) {
                found = false ;
                break ;
            }
        }
        if(found === true) {
            return index ;
        }
    }

    return -1 ;
}

module.exports = findIndexInBuffer ;