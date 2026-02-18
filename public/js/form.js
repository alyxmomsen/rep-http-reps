
// ------------------------------ main ------------------------------

window.addEventListener("DOMContentLoaded" , () => {

    (function() {

        const form = document.getElementById('form--main');
    
        form.addEventListener("submit" , async (e) => {
    
            const r = new RequestRouter('/api/handle-form' , 'post' , [async (res) => {console.log(await res.json())}] , [async (res , next) => {alert('mw')}]);
            
            e.preventDefault();
            
            const formdata = new FormData (form) ;
            
            await r.exec(formdata);
            
            // const {response  , error} = await RequestRouter.UseFetch('/api/handle-form' ,'post' ,formdata) ;
    
            // console.log({response:await response.json() , error});
    
        });
    })()


});

// ------------------------------------------------------------------