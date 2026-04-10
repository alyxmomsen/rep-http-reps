/**
 *
 * @param {Map<string,Map<string,any>>} data
 */
function printDataUtil(data) {
    for (const [key_1, val_1] of data.entries()) {
        console.log({ key_1 });
        for (const [key_2, val_2] of val_1.entries()) {
            console.log({ key_2 });
            for (const [key_3, val_3] of val_2.entries()) {
                console.log({ key_3, val_3 });
            }
        }
    }
}

module.exports = { printDataUtil };
