/** 
 * pattern dependency injection
 * 
 */

/**
 * 
 * @param {{
 *  dep1:Function;
 *  dep2:Function;
 *  dep3:Function;
 * }} deps 
 * @returns 
 */
function foo (deps = {}) {

    const dep1 = deps.dep1;
    const dep2 = deps.dep2;
    const dep3 = deps.dep3;

    if(!dep1 || !dep2 || !dep3) {
        throw new Error('deps error');
    }

    return (next, payload) => {

        dep1();
        dep2();
        dep3();

        return;
    }
}

const mw = foo({
    dep1:() => {console.log(1)},
    dep2:() => {console.log(2)},
    dep3:() => {console.log(3)},
})();