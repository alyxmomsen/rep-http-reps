
// ------------------------------ main ------------------------------

window.addEventListener("DOMContentLoaded" , () => {

    (function() {

        // ----------- get html elems -----------
        
        const form = document.getElementById('form--main');
        const formSubmitStatus = document.getElementById('status--form-submit');
        
        // --------------------------------------
    
        const r = new RequestRouter(
            '/api/handle-form' , 'post' , 
            [
                async (res) => {
                    console.log(await res.json())
                } ,
            ] , 
            // [
            //     async (res , next) => {console.log(`mw 1`) ; next()},
            //     async (res , next) => {console.log(`mw 2`) ; next()},
            //     async (res , next) => {console.log(`mw 3`) ; next()},
            // ]
        );

        form.addEventListener("submit" , async (e) => {
            
            e.preventDefault();
            
            const formdata = new FormData (form) ;
            
            await r.exec(formdata);
            
            // const {response  , error} = await RequestRouter.UseFetch('/api/handle-form' ,'post' ,formdata) ;
    
            // console.log({response:await response.json() , error});
    
        });

    })()


});

// ------------------------------------------------------------------