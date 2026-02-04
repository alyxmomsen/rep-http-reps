
function findIndexInBuffer (buffer , separator , start = 0) {
    console.log('call find index...' , start , buffer , separator.toString('utf-8'));

    for (let index = start ; index < buffer.length - separator.length ; index++) {
        let found = true ;
        for (let j = 0 ; j < separator.length ; j++) {
            if(buffer[index + j] !== separator[j]) {
                found = false ;
                break;
            }
        }

        if(found === true) {
            console.log({index});
            return index
        } ;
    }

    return -1 ;
}

module.exports = findIndexInBuffer ;