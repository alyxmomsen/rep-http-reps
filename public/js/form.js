class Request_ {

    async execute(body) {

        const { response , error } = await useFetch(this.#url , {body , method:this.#method});

        if(error) {
            console.log({error});
            return ;
        }

        for (const handler of [...this.#handlers]) {
            await handler(response);
        }
    }

    #url ;
    #method ;
    #handlers ;
    #middleware ;

    constructor (url , {method , handlers = [] , middleware = []}) {
        this.#url = url ;
        this.#method = method ;
        this.#handlers = [...handlers] ;
        this.#middleware = [...middleware] ;
    }
}

window.addEventListener('DOMContentLoaded' , () => {


    const submitRequest = new Request_ ('/api/handle-form' , { 
        method:'post' , 
        handlers:[async (res) => {

            const json = await res.json();

            console.log({json});
        }] , 
        middleware:[] 
    }) ;
    // const request2 = new Request_ () ;
    // const request3 = new Request_ () ;

    const form = document.getElementById('form--main');

    const formdata = new FormData(form) ;

    form.addEventListener('submit' , async (e) => {
        e.preventDefault();

        await submitRequest.execute(formdata);
        // const { response , error } = await useFetch('/api/handle-form' , { method:'post' , body:formdata});

        // console.log({response , error});

    });

});


async function useFetch (url  , {method:_m = 'get' , body}) {

    const method = _m.toLowerCase();

    try {
        const response = await fetch(url , {
            method ,
            ...( method === 'get' ? {} : {body}) ,
        });

        return {
            response ,
        }
    }
    catch (e) {
        console.log({e});
        return {
            error: {
                details:e ,
            } ,
        }
    }

}