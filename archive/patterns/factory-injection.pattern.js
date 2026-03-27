class MyClass {

    exec (data) {
        const { success, error } = this.#privateMethod(data);

        if(error) {
            console.log('error');
            return;
        }

        if(!success) {
            console.log('no success');
            return;
        }

        return success.length;
    }

    /**
     * 
     * @param {string} data 
     * @returns {
     *  success?:{length:number};
     *  error?:{message:string};
     * }
     */
    #privateMethod (data) {
        if(data === undefined) {
            return {
                error:{
                    message:'data required but not prvided',
                },
            }
        }

        return {
            success: {
                length:data.length,
            },
        }
    }

    constructor (deps = {}) {}
}

function factory () {
    return new MyClass();
}

/**
 * 
 * @param {() => MyClass} factory 
 */
function textFn (factory) {
    
    for (let i=0; i<1000; i++) {

        if(i > 998) {
            const myClass = factory();
            const result = myClass.exec('hellow world');
            console.log({result});
        }
    }
}

textFn(factory);