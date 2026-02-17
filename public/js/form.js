window.addEventListener('DOMContentLoaded' , () => {

    const form = document.getElementById('form--main');

    const formdata = new FormData(form) ;

    form.addEventListener('submit' , async (e) => {
        e.preventDefault();

        const { response , error } = await useFetch('/api/handle-form' , { method:'post' , body:formdata});

        console.log({response , error});

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