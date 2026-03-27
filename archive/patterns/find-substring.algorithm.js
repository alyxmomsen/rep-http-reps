
/* #algorithm
    поиск подстроки в строке
*/

/**
 * 
 * @param {string} data 
 * @param {string} separator 
 * @param {number} start 
 */
function bar (data, separator, start = 0) {
    for (let index = start; index <= data.length - separator.length; index++) {
        let found = true;
        for (let j = 0; j< separator.length; j++) {
            if(data[index + j] !== separator[j]) {
                found = false;
                break;
            }
        }

        if(found === true) {
            return index;
        }
    }

    return -1;
}



const result = bar('hello', 'lo');

console.log({result});