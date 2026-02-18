
// ------------------------------ main ------------------------------

window.addEventListener("DOMContentLoaded" , () => {

    (function() {

        // -- grab html elems --
        
        const form = document.getElementById('form--main');
        const formSubmitStatus = document.getElementById('status--form-submit');
        
        // -- instance a submit handler -- 
    
        const submitHandler = new RequestRouter(
            '/api/handle-form' , 'post'
        );

        // -- config the submit handler --

        submitHandler.addHandlers(async (res) => {
            try {
                const jsonResponse = await res.json();
                const { } = jsonResponse ;
                formSubmitStatus.innerHTML = '<div class="clickable">uploaded!</div>'
                console.log({jsonResponse});

            }catch (e) {
                console.log({e});
            }
        });

        // ================================

        form.addEventListener("submit" , async (e) => {
            
            e.preventDefault();
            
            const formdata = new FormData (form) ;

            submitHandler.onBeforeRequestStarted(() => {
                formSubmitStatus.innerHTML = 'uploading...';
            });
            
            await submitHandler.exec(formdata);
            
    
        });

    })()


});

// ------------------------------------------------------------------