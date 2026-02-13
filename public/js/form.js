window.addEventListener('DOMContentLoaded' , () => {

    const formHTML = document.getElementById('form--main');

    formHTML.onsubmit = async (ev) => {

        ev.preventDefault();

        const formdata = new FormData(formHTML);

        const fetchResult = await useFetch('/handle-form' , formdata);

        const {error , success} = fetchResult ;

        handleError(error);
        handleSuccess(success , smth);
    }

});


async function smth(response) {
    
    try {

        const jsondata = await response.json();
        console.log(jsondata);

        
    }
    catch (e) {
        console.log({e})
    }
}

async function handleSuccess(success , handler) {
    
    const { code , response } = success ;

    if(code === undefined) {
        console.log('no fetch response status code');
        return;
    }

    if(!response) {
        console.log('no payload');
        return ;
    }

    await handler(response);

}

async function handleError(error) {
    console.log({error});
    return ;
}

async function useFetch (url , body) {

    try {
        
        const response = await fetch (url , {method:'post' , body} ) ;
        return {
            success:{
                code:0 ,
                response ,
            } ,
            error:{} ,
        }
    }
    catch (e) {
        return {
            success:{} ,
            error:{
                details:e ,
            }
        }
    }


}